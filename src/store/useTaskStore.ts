import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
    createdAt: string;
}

interface TaskStore {
    tasks: Task[];
    addTask: (title: string, priority: 'high' | 'medium' | 'low') => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
}

// Default initial tasks matching the target dashboard UI mockup
const defaultTasks: Task[] = [
    {
        id: 'init-1',
        title: 'Solve 2 LeetCode problems',
        priority: 'high',
        completed: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'init-2',
        title: 'Complete React project UI',
        priority: 'high',
        completed: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'init-3',
        title: 'Finish Next.js dashboard',
        priority: 'high',
        completed: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'init-4',
        title: 'Read Chapter 4: System Design',
        priority: 'medium',
        completed: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'init-5',
        title: '30 mins of DSA Revision',
        priority: 'medium',
        completed: false,
        createdAt: new Date().toISOString()
    }
];

export const useTaskStore = create<TaskStore>()(
    persist(
        (set) => ({
            // Load default tasks if localStorage is fresh and empty
            tasks: defaultTasks,

            addTask: (title, priority) => set((state) => ({
                tasks: [
                    ...state.tasks,
                    {
                        id: Math.random().toString(36).substring(2, 9), // Simple browser-safe unique ID
                        title,
                        priority,
                        completed: false,
                        createdAt: new Date().toISOString()
                    }
                ]
            })),

            toggleTask: (id) => set((state) => ({
                tasks: state.tasks.map((task) =>
                    task.id === id ? { ...task, completed: !task.completed } : task
                )
            })),

            deleteTask: (id) => set((state) => ({
                tasks: state.tasks.filter((task) => task.id !== id)
            }))
        }),
        {
            name: 'devforge-tasks-storage', // Key used inside localStorage
        }
    )
);
