import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Task {
    id: string; // Represents UUID from Supabase
    title: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
    createdAt: string;
}

interface TaskStore {
    tasks: Task[];
    loading: boolean;
    fetchTasks: () => Promise<void>;
    addTask: (title: string, priority: 'high' | 'medium' | 'low') => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    clearTasks: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
    tasks: [],
    loading: false,

    // Fetches all tasks belonging to the currently logged in user
    // Fetches all tasks belonging to the currently logged in user
    fetchTasks: async () => {
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Clean slate detected! Seed interactive onboarding tasks.
            if (!data || data.length === 0) {
                const { data: sessionData } = await supabase.auth.getSession();
                const userId = sessionData.session?.user.id;
                
                if (!userId) return;

                const onboardingTasks = [
                    { user_id: userId, title: '👋 Welcome to DevForge! Set your primary focus for today', priority: 'high' },
                    { user_id: userId, title: '💻 Log a solved coding problem using the "+ Log" button above', priority: 'medium' },
                    { user_id: userId, title: '⏱️ Try starting a 25-minute Pomodoro study session', priority: 'low' }
                ];

                const { data: seededData, error: seedError } = await supabase
                    .from('tasks')
                    .insert(onboardingTasks)
                    .select();

                if (seedError) throw seedError;

                const mappedTasks: Task[] = (seededData || []).map((t: any) => ({
                    id: t.id,
                    title: t.title,
                    priority: t.priority as 'high' | 'medium' | 'low',
                    completed: t.completed,
                    createdAt: t.created_at,
                }));

                set({ tasks: mappedTasks, loading: false });
                return;
            }

            const mappedTasks: Task[] = (data || []).map((t: any) => ({
                id: t.id,
                title: t.title,
                priority: t.priority as 'high' | 'medium' | 'low',
                completed: t.completed,
                createdAt: t.created_at,
            }));

            set({ tasks: mappedTasks, loading: false });
        } catch (error: any) {
            console.error('Error fetching tasks from Supabase:', error?.message || error);
            set({ loading: false });
        }
    },


    // Adds a task using optimistic UI updates
    addTask: async (title, priority) => {
        const tempId = Math.random().toString(36).substring(2, 9);
        const newTask: Task = {
            id: tempId,
            title,
            priority,
            completed: false,
            createdAt: new Date().toISOString(),
        };

        // 1. Optimistic Update (Render local change immediately)
        set((state) => ({ tasks: [...state.tasks, newTask] }));

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData.session?.user.id;
            
            if (!userId) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('tasks')
                .insert([{ user_id: userId, title, priority }])
                .select();

            if (error) throw error;

            // 2. Update local temporary ID with official PostgreSQL UUID
            if (data && data[0]) {
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === tempId
                            ? { ...t, id: data[0].id, createdAt: data[0].created_at }
                            : t
                    ),
                }));
            }
        } catch (error: any) {
            console.error('Failed to save task to Supabase:', error?.message || error);
            // 3. Revert state on failure
            set((state) => ({ tasks: state.tasks.filter((t) => t.id !== tempId) }));
        }
    },

    // Toggles task state optimistically, reverting on network failure
    toggleTask: async (id) => {
        const currentTask = get().tasks.find((t) => t.id === id);
        if (!currentTask) return;

        const nextCompleted = !currentTask.completed;

        // 1. Optimistic Update
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, completed: nextCompleted } : t
            ),
        }));

        try {
            const { error } = await supabase
                .from('tasks')
                .update({ completed: nextCompleted })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Failed to toggle task in Supabase:', error);
            // 2. Revert state on failure
            set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === id ? { ...t, completed: !nextCompleted } : t
                ),
            }));
        }
    },

    // Deletes task optimistically, reverting on failure
    deleteTask: async (id) => {
        const deletedTask = get().tasks.find((t) => t.id === id);
        if (!deletedTask) return;

        // 1. Optimistic Delete
        set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
        }));

        try {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Failed to delete task from Supabase:', error);
            // 2. Revert state on failure
            set((state) => ({ tasks: [...state.tasks, deletedTask] }));
        }
    },

    clearTasks: () => set({ tasks: [] }),
}));
