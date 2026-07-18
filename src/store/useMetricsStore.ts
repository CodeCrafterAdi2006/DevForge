import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface DailyLog {
    date: string; // YYYY-MM-DD
    problemsLogged: number;
    tasksCompletedCount: number;
}

interface MetricsStore {
    problemsSolvedTotal: number;
    problemsSolvedThisWeek: number;
    studyMinutesTotal: number;
    studyMinutesThisWeek: number;
    dailyLogs: DailyLog[];
    bestStreak: number;
    loading: boolean;

    fetchMetrics: () => Promise<void>;
    logProblem: (count?: number) => Promise<void>;
    addStudyMinutes: (minutes: number) => Promise<void>;
    syncTaskCompletion: (completedCount: number) => Promise<void>;
    getCurrentStreak: () => number;
    clearMetrics: () => void;
}

// Helpers to format local dates as YYYY-MM-DD strings
const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getTodayString = () => formatDateString(new Date());

export const useMetricsStore = create<MetricsStore>((set, get) => {
    // Internal helper to check and update best streaks
    const checkBestStreak = async () => {
        const current = get().getCurrentStreak();
        if (current > get().bestStreak) {
            set({ bestStreak: current });
            try {
                await supabase
                    .from('metrics')
                    .update({ best_streak: current })
                    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
            } catch (err) {
                console.error('Failed to sync best streak to Supabase:', err);
            }
        }
    };

    const getOrCreateTodayLog = (logs: DailyLog[]) => {
        const todayStr = getTodayString();
        let log = logs.find((l) => l.date === todayStr);

        if (!log) {
            log = { date: todayStr, problemsLogged: 0, tasksCompletedCount: 0 };
            logs.unshift(log); // Add to front of logs
        }
        return log;
    };

    return {
        problemsSolvedTotal: 0,
        problemsSolvedThisWeek: 0,
        studyMinutesTotal: 0,
        studyMinutesThisWeek: 0,
        dailyLogs: [],
        bestStreak: 0,
        loading: false,

        // Fetches metrics and daily logs from Supabase
        fetchMetrics: async () => {
            set({ loading: true });
            try {
                const userRes = await supabase.auth.getUser();
                const userId = userRes.data.user?.id;
                if (!userId) throw new Error('No authenticated user found');

                // 1. Fetch main metrics row
                const { data: metricsData, error: metricsError } = await supabase
                    .from('metrics')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (metricsError && metricsError.code !== 'PGRST116') throw metricsError;

                // 2. Fetch daily logs
                const { data: logsData, error: logsError } = await supabase
                    .from('daily_logs')
                    .select('*')
                    .eq('user_id', userId)
                    .order('date', { ascending: false });

                if (logsError) throw logsError;

                // Map data from database column conventions to frontend model keys
                const dailyLogs: DailyLog[] = (logsData || []).map((l: any) => ({
                    date: l.date,
                    problemsLogged: l.problems_logged,
                    tasksCompletedCount: l.tasks_completed_count,
                }));

                set({
                    problemsSolvedTotal: metricsData?.problems_solved_total || 0,
                    problemsSolvedThisWeek: metricsData?.problems_solved_this_week || 0,
                    studyMinutesTotal: metricsData?.study_minutes_total || 0,
                    studyMinutesThisWeek: metricsData?.study_minutes_this_week || 0,
                    bestStreak: metricsData?.best_streak || 0,
                    dailyLogs,
                    loading: false,
                });
            } catch (error) {
                console.error('Error fetching metrics from Supabase:', error);
                set({ loading: false });
            }
        },

        // Logs a solved problem optimistically, updating totals and daily log
        logProblem: async (count = 1) => {
            const state = get();
            const originalTotal = state.problemsSolvedTotal;
            const originalThisWeek = state.problemsSolvedThisWeek;
            const originalLogs = JSON.parse(JSON.stringify(state.dailyLogs)); // Deep copy

            const updatedLogs = [...state.dailyLogs];
            const todayLog = getOrCreateTodayLog(updatedLogs);
            todayLog.problemsLogged += count;

            const nextTotal = originalTotal + count;
            const nextThisWeek = originalThisWeek + count;

            // 1. Optimistic Update local state
            set({
                dailyLogs: updatedLogs,
                problemsSolvedTotal: nextTotal,
                problemsSolvedThisWeek: nextThisWeek
            });

            try {
                const userRes = await supabase.auth.getUser();
                const userId = userRes.data.user?.id;
                if (!userId) throw new Error('Unauthenticated user');

                // 2. Update global metrics in background
                const { error: metricsError } = await supabase
                    .from('metrics')
                    .update({
                        problems_solved_total: nextTotal,
                        problems_solved_this_week: nextThisWeek
                    })
                    .eq('user_id', userId);

                if (metricsError) throw metricsError;

                // 3. Upsert daily log in background
                const { error: logError } = await supabase
                    .from('daily_logs')
                    .upsert({
                        user_id: userId,
                        date: todayLog.date,
                        problems_logged: todayLog.problemsLogged,
                        tasks_completed_count: todayLog.tasksCompletedCount
                    }, { onConflict: 'user_id,date' });

                if (logError) throw logError;

                setTimeout(() => checkBestStreak(), 0);
            } catch (error) {
                console.error('Failed to log problem to database, reverting:', error);
                // Revert on failure
                set({
                    dailyLogs: originalLogs,
                    problemsSolvedTotal: originalTotal,
                    problemsSolvedThisWeek: originalThisWeek
                });
            }
        },

        // Adds study hours/minutes in background, upserting todays date row
        addStudyMinutes: async (minutes) => {
            const state = get();
            const originalTotal = state.studyMinutesTotal;
            const originalThisWeek = state.studyMinutesThisWeek;
            const originalLogs = JSON.parse(JSON.stringify(state.dailyLogs));

            const updatedLogs = [...state.dailyLogs];
            const todayLog = getOrCreateTodayLog(updatedLogs);

            const nextTotal = originalTotal + minutes;
            const nextThisWeek = originalThisWeek + minutes;

            // 1. Optimistic Update
            set({
                dailyLogs: updatedLogs,
                studyMinutesTotal: nextTotal,
                studyMinutesThisWeek: nextThisWeek
            });

            try {
                const userRes = await supabase.auth.getUser();
                const userId = userRes.data.user?.id;
                if (!userId) throw new Error('Unauthenticated user');

                // 2. Update global metrics
                const { error: metricsError } = await supabase
                    .from('metrics')
                    .update({
                        study_minutes_total: nextTotal,
                        study_minutes_this_week: nextThisWeek
                    })
                    .eq('user_id', userId);

                if (metricsError) throw metricsError;

                // 3. Upsert daily log
                const { error: logError } = await supabase
                    .from('daily_logs')
                    .upsert({
                        user_id: userId,
                        date: todayLog.date,
                        problems_logged: todayLog.problemsLogged,
                        tasks_completed_count: todayLog.tasksCompletedCount
                    }, { onConflict: 'user_id,date' });

                if (logError) throw logError;
            } catch (error) {
                console.error('Failed to save study minutes to database, reverting:', error);
                set({
                    dailyLogs: originalLogs,
                    studyMinutesTotal: originalTotal,
                    studyMinutesThisWeek: originalThisWeek
                });
            }
        },

        // Syncs checklist completed count with daily log
        syncTaskCompletion: async (completedCount) => {
            const state = get();
            const originalLogs = JSON.parse(JSON.stringify(state.dailyLogs));

            const updatedLogs = [...state.dailyLogs];
            const todayLog = getOrCreateTodayLog(updatedLogs);
            todayLog.tasksCompletedCount = completedCount;

            // 1. Optimistic Update
            set({ dailyLogs: updatedLogs });

            try {
                const userRes = await supabase.auth.getUser();
                const userId = userRes.data.user?.id;
                if (!userId) throw new Error('Unauthenticated user');

                // 2. Upsert daily log
                const { error: logError } = await supabase
                    .from('daily_logs')
                    .upsert({
                        user_id: userId,
                        date: todayLog.date,
                        problems_logged: todayLog.problemsLogged,
                        tasks_completed_count: completedCount
                    }, { onConflict: 'user_id,date' });

                if (logError) throw logError;

                setTimeout(() => checkBestStreak(), 0);
            } catch (error) {
                console.error('Failed to sync checklist completions, reverting:', error);
                set({ dailyLogs: originalLogs });
            }
        },

        getCurrentStreak: () => {
            const logs = get().dailyLogs;
            let streak = 0;
            let checkDate = new Date();

            const isDateActive = (dateStr: string) => {
                const log = logs.find((l) => l.date === dateStr);
                return log ? (log.problemsLogged > 0 || log.tasksCompletedCount > 0) : false;
            };

            // Step 1: Check Today
            const todayStr = getTodayString();
            if (isDateActive(todayStr)) {
                streak++;
                while (true) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    const prevStr = formatDateString(checkDate);
                    if (isDateActive(prevStr)) {
                        streak++;
                    } else {
                        break;
                    }
                }
            } else {
                // Step 2: Fallback check on Yesterday
                checkDate.setDate(checkDate.getDate() - 1);
                const yesterdayStr = formatDateString(checkDate);

                if (isDateActive(yesterdayStr)) {
                    streak++;
                    while (true) {
                        checkDate.setDate(checkDate.getDate() - 1);
                        const prevStr = formatDateString(checkDate);
                        if (isDateActive(prevStr)) {
                            streak++;
                        } else {
                            break;
                        }
                    }
                }
            }
            return streak;
        },

        clearMetrics: () => set({
            problemsSolvedTotal: 0,
            problemsSolvedThisWeek: 0,
            studyMinutesTotal: 0,
            studyMinutesThisWeek: 0,
            dailyLogs: [],
            bestStreak: 0,
        }),
    };
});
