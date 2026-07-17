import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

    logProblem: (count?: number) => void;
    addStudyMinutes: (minutes: number) => void;
    syncTaskCompletion: (completedCount: number) => void;
    getCurrentStreak: () => number;
}

// Helpers to format local dates as YYYY-MM-DD strings
const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getTodayString = () => formatDateString(new Date());

// Pre-populates 23 consecutive days of mock developer activity ending yesterday
const generateMockLogs = (): DailyLog[] => {
    const logs: DailyLog[] = [];
    const tempDate = new Date();

    // Start the consecutive chain starting from yesterday
    tempDate.setDate(tempDate.getDate() - 1);

    for (let i = 0; i < 23; i++) {
        logs.push({
            date: formatDateString(tempDate),
            problemsLogged: Math.random() > 0.4 ? 2 : 0,
            tasksCompletedCount: Math.random() > 0.3 ? 3 : 1
        });
        // Move one calendar day backward
        tempDate.setDate(tempDate.getDate() - 1);
    }
    return logs;
};

export const useMetricsStore = create<MetricsStore>()(
    persist(
        (set, get) => {
            // Internal helper to check and update best streaks
            const checkBestStreak = () => {
                const current = get().getCurrentStreak();
                if (current > get().bestStreak) {
                    set({ bestStreak: current });
                }
            };

            const getOrCreateTodayLog = (logs: DailyLog[]) => {
                const todayStr = getTodayString();
                let log = logs.find((l) => l.date === todayStr);

                if (!log) {
                    log = { date: todayStr, problemsLogged: 0, tasksCompletedCount: 0 };
                    logs.unshift(log); // Add to the front of logs
                }
                return log;
            };

            return {
                problemsSolvedTotal: 312,
                problemsSolvedThisWeek: 14,
                studyMinutesTotal: 18.6 * 60, // 18.6 Hours in minutes
                studyMinutesThisWeek: 3.2 * 60, // 3.2 Hours in minutes
                dailyLogs: generateMockLogs(),
                bestStreak: 46,

                logProblem: (count = 1) => set((state) => {
                    const updatedLogs = [...state.dailyLogs];
                    const todayLog = getOrCreateTodayLog(updatedLogs);

                    todayLog.problemsLogged += count;

                    setTimeout(() => checkBestStreak(), 0); // Defer to let state write first

                    return {
                        dailyLogs: updatedLogs,
                        problemsSolvedTotal: state.problemsSolvedTotal + count,
                        problemsSolvedThisWeek: state.problemsSolvedThisWeek + count
                    };
                }),

                addStudyMinutes: (minutes) => set((state) => {
                    const updatedLogs = [...state.dailyLogs];
                    getOrCreateTodayLog(updatedLogs); // Ensures today log exists

                    return {
                        dailyLogs: updatedLogs,
                        studyMinutesTotal: state.studyMinutesTotal + minutes,
                        studyMinutesThisWeek: state.studyMinutesThisWeek + minutes
                    };
                }),

                syncTaskCompletion: (completedCount) => set((state) => {
                    const updatedLogs = [...state.dailyLogs];
                    const todayLog = getOrCreateTodayLog(updatedLogs);

                    todayLog.tasksCompletedCount = completedCount;

                    setTimeout(() => checkBestStreak(), 0); // Defer to let state write first

                    return {
                        dailyLogs: updatedLogs
                    };
                }),

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
                        // Check consecutive days backward
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
                        // Step 2: If inactive today, check yesterday to maintain current streak
                        checkDate.setDate(checkDate.getDate() - 1);
                        const yesterdayStr = formatDateString(checkDate);

                        if (isDateActive(yesterdayStr)) {
                            streak++;
                            // Check consecutive days backward
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
                }
            };
        },
        {
            name: 'devforge-metrics-storage', // key in localStorage
        }
    )
);
