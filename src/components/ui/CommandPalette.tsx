'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Play,
    Pause,
    RotateCcw,
    Clock,
    LayoutDashboard,
    CheckSquare,
    Terminal,
    BookOpen,
    Folder,
    FileText,
    Calendar as CalendarIcon,
    Settings as SettingsIcon
} from 'lucide-react';
import { useTimerStore } from '@/store/useTimerStore';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onSectionChange: (section: string) => void;
}

interface CommandItem {
    id: string;
    title: string;
    description: string;
    category: 'Timer' | 'Navigation';
    icon: typeof Play;
    action: () => void;
}

export default function CommandPalette({ isOpen, onClose, onSectionChange }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const { startTimer, pauseTimer, resetTimer, toggleSessionType } = useTimerStore();

    // 1. List of executable command actions
    const commands: CommandItem[] = [
        {
            id: 'timer-start',
            title: 'Start Focus Session',
            description: 'Activate the Pomodoro work timer',
            category: 'Timer',
            icon: Play,
            action: () => {
                onSectionChange('dashboard');
                startTimer();
            }
        },
        {
            id: 'timer-pause',
            title: 'Pause Focus Session',
            description: 'Halt the active countdown',
            category: 'Timer',
            icon: Pause,
            action: () => pauseTimer()
        },
        {
            id: 'timer-reset',
            title: 'Reset Focus Session',
            description: 'Restore countdown duration settings',
            category: 'Timer',
            icon: RotateCcw,
            action: () => resetTimer()
        },
        {
            id: 'timer-toggle-mode',
            title: 'Toggle Work / Break Mode',
            description: 'Switch Pomodoro session duration',
            category: 'Timer',
            icon: Clock,
            action: () => toggleSessionType()
        },
        {
            id: 'nav-dashboard',
            title: 'Go to Dashboard',
            description: 'Open the main metrics and widget dashboard',
            category: 'Navigation',
            icon: LayoutDashboard,
            action: () => onSectionChange('dashboard')
        },
        {
            id: 'nav-tasks',
            title: 'Go to Tasks',
            description: 'Review and manage your daily checklist',
            category: 'Navigation',
            icon: CheckSquare,
            action: () => onSectionChange('tasks')
        },
        {
            id: 'nav-tracker',
            title: 'Go to Coding Tracker',
            description: 'Check active commits and LeetCode stats',
            category: 'Navigation',
            icon: Terminal,
            action: () => onSectionChange('coding')
        },
        {
            id: 'nav-learning',
            title: 'Go to Learning Tracker',
            description: 'View books and course resources progress',
            category: 'Navigation',
            icon: BookOpen,
            action: () => onSectionChange('learning')
        },
        {
            id: 'nav-projects',
            title: 'Go to Projects Board',
            description: 'Check repository boards and task cards',
            category: 'Navigation',
            icon: Folder,
            action: () => onSectionChange('projects')
        },
        {
            id: 'nav-notes',
            title: 'Go to Notes',
            description: 'Access markdown files and study materials',
            category: 'Navigation',
            icon: FileText,
            action: () => onSectionChange('notes')
        },
        {
            id: 'nav-calendar',
            title: 'Go to Calendar',
            description: 'View monthly schedules and deadlines',
            category: 'Navigation',
            icon: CalendarIcon,
            action: () => onSectionChange('calendar')
        },
        {
            id: 'nav-settings',
            title: 'Go to Settings',
            description: 'Modify workspace settings and preferences',
            category: 'Navigation',
            icon: SettingsIcon,
            action: () => onSectionChange('settings')
        }
    ];

    // 2. Filter commands by query matching
    const filteredCommands = commands.filter((cmd) =>
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
    );

    // Focus input automatically when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setSelectedIndex(0);
            setQuery('');
        }
    }, [isOpen]);

    // 3. Bind Keyboard navigation actions (Up, Down, Enter, Esc)
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    filteredCommands.length > 0 ? (prev + 1) % filteredCommands.length : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    filteredCommands.length > 0 ? (prev - 1 + filteredCommands.length) % filteredCommands.length : 0
                );
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">

                    {/* Frosted Backdrop Mask */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-bg-base/70 backdrop-blur-sm"
                    />

                    {/* Centered Raycast Glass Console */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        className="relative w-full max-w-lg bg-bg-surface/90 border border-border-translucent rounded-2xl shadow-luxury overflow-hidden flex flex-col max-h-[400px] z-10"
                    >
                        {/* Search Input Box */}
                        <div className="flex items-center gap-3 px-4 border-b border-border-translucent">
                            <Search className="w-4 h-4 text-slate-500 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Type a command or search sections..."
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                className="w-full bg-transparent text-white placeholder-slate-500 py-4 text-sm focus:outline-none"
                            />
                            <kbd className="text-[10px] font-mono bg-white/5 border border-border-translucent px-2 py-0.5 rounded text-slate-500 select-none">
                                ESC
                            </kbd>
                        </div>

                        {/* Commands List Scrollable Viewport */}
                        <div className="overflow-y-auto p-2 flex flex-col gap-1">
                            {filteredCommands.map((cmd, idx) => {
                                const Icon = cmd.icon;
                                const isSelected = idx === selectedIndex;

                                return (
                                    <button
                                        key={cmd.id}
                                        onClick={() => {
                                            cmd.action();
                                            onClose();
                                        }}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer w-full group ${isSelected
                                                ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                                                : 'bg-transparent text-slate-300 border border-transparent hover:bg-white/3'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`p-1.5 rounded-lg border transition-colors ${isSelected
                                                    ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue'
                                                    : 'bg-white/2 border-border-translucent text-slate-400 group-hover:text-slate-300'
                                                }`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-semibold text-white leading-tight">
                                                    {cmd.title}
                                                </div>
                                                <div className={`text-[10px] truncate mt-0.5 transition-colors ${isSelected ? 'text-accent-blue/70' : 'text-slate-500 group-hover:text-slate-400'
                                                    }`}>
                                                    {cmd.description}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex items-center">
                                            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${isSelected
                                                    ? 'text-accent-blue/80 border-accent-blue/20 bg-accent-blue/5'
                                                    : 'text-slate-500 border-border-translucent bg-white/2'
                                                }`}>
                                                {cmd.category}
                                            </span>
                                        </div>

                                    </button>
                                );
                            })}

                            {/* Empty Search Visual Feedback */}
                            {filteredCommands.length === 0 && (
                                <div className="text-center py-8 text-slate-500 text-xs font-medium">
                                    No matching commands found.
                                </div>
                            )}
                        </div>

                        {/* Bottom Keyboard Navigation Hints */}
                        <div className="px-4 py-2 bg-white/2 border-t border-border-translucent flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider select-none shrink-0">
                            <div className="flex gap-4">
                                <span>↑↓ navigate</span>
                                <span>↵ select</span>
                            </div>
                            <span>Raycast Console</span>
                        </div>

                    </motion.div>

                </div>
            )}
        </AnimatePresence>
    );
}
