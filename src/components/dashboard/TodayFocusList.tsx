'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import TaskItem from './TaskItem';
import { useTaskStore } from '@/store/useTaskStore';
import { useMetricsStore } from '@/store/useMetricsStore';

export default function TodayFocusList() {
    // Next.js Hydration Guard (prevents mismatch between SSR HTML and browser localStorage)
    const [mounted, setMounted] = useState(false);

    // Local state for the inline Task Creator Form
    const [isAdding, setIsAdding] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

    // Pull actions and states directly from our Zustand store
    const { tasks, addTask, toggleTask, deleteTask } = useTaskStore();
    const syncTaskCompletion = useMetricsStore((state) => state.syncTaskCompletion);

    // Calculate dynamic progress metrics
    const totalCount = tasks.length;
    const completedCount = tasks.filter((t) => t.completed).length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync task completions to metrics store for streak calculations
    useEffect(() => {
        if (mounted) {
            syncTaskCompletion(completedCount);
        }
    }, [completedCount, mounted, syncTaskCompletion]);

    if (!mounted) {
        return (
            <GlassCard title="Today's Focus" glowColor="none">
                <div className="flex items-center justify-center py-12 text-slate-500 text-sm font-medium">
                    Loading layout tracker...
                </div>
            </GlassCard>
        );
    }

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;

        addTask(taskTitle.trim(), taskPriority);
        setTaskTitle('');
        setTaskPriority('medium');
        setIsAdding(false);
    };

    return (
        <GlassCard glowColor="blue" className="flex flex-col h-full justify-between">

            <div>
                {/* Header Row (Flexbox-aligned to prevent overlapping list items) */}
                <div className="flex items-center justify-between mb-5 select-none">
                    <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
                        Today's Focus
                    </h3>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all duration-300 cursor-pointer ${isAdding
                            ? 'text-accent-red bg-accent-red/10 border-accent-red/20 hover:bg-accent-red/15'
                            : 'text-slate-400 bg-white/2 border-border-translucent hover:text-slate-200 hover:border-white/10'
                            }`}
                    >
                        {isAdding ? (
                            <>
                                <X className="w-3.5 h-3.5" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Plus className="w-3.5 h-3.5" />
                                Add Task
                            </>
                        )}
                    </button>
                </div>

                {/* Dynamic Inline Creator Form */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleCreateTask}
                            className="overflow-hidden border border-border-translucent bg-white/1 p-3 rounded-xl mb-4 flex flex-col gap-3"
                        >
                            {/* Task Text Input */}
                            <input
                                type="text"
                                autoFocus
                                placeholder="What is your focus task?"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                className="w-full bg-white/2 border border-border-translucent rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue focus:bg-white/4 transition-all duration-300"
                            />

                            {/* Priority Select & Save Button row */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Priority:</span>
                                    <select
                                        value={taskPriority}
                                        onChange={(e) => setTaskPriority(e.target.value as any)}
                                        className="bg-bg-surface border border-border-translucent rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none cursor-pointer hover:border-white/10"
                                    >
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!taskTitle.trim()}
                                    className="px-3.5 py-1.5 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-50 text-bg-base text-xs font-bold rounded-lg cursor-pointer disabled:cursor-not-allowed transition-all"
                                >
                                    Create
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Checklist Viewport Area */}
                <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1 select-none">
                    <AnimatePresence initial={false}>
                        {tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={toggleTask}
                                onDelete={deleteTask}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Empty State visual fallback */}
                    {totalCount === 0 && (
                        <div className="text-center py-12 border border-dashed border-border-translucent rounded-xl bg-white/1">
                            <p className="text-slate-400 text-xs font-medium mb-1">No focus items scheduled.</p>
                            <p className="text-[10px] text-slate-500">Tap "+ Add Task" to schedule your sprint.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Bottom Metric Progress Bar Widget */}
            <div className="border-t border-border-translucent mt-6 pt-4">
                <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-slate-400 mb-2">
                    <span>{`${completedCount}/${totalCount} tasks completed`}</span>
                    <span className="text-accent-blue">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                    <div
                        style={{ width: `${progressPercent}%` }}
                        className="h-full bg-accent-blue shadow-[0_0_8px_var(--color-accent-blue)] rounded-full transition-all duration-500 ease-out"
                    />
                </div>
            </div>

        </GlassCard>
    );
}
