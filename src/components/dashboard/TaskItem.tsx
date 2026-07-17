import { motion } from 'framer-motion';
import { Trash2, Check } from 'lucide-react';
import { Task } from '@/store/useTaskStore';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
    // Theme styling configurations for active priority levels
    const priorityStyles = {
        high: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20 shadow-[0_0_12px_-5px_rgba(168,85,247,0.15)]',
        medium: 'text-accent-blue bg-accent-blue/10 border-accent-blue/20 shadow-[0_0_12px_-5px_rgba(59,130,246,0.15)]',
        low: 'text-slate-400 bg-slate-400/10 border-slate-400/20'
    };

    return (
        <motion.div
            layout // Animates other list items sliding into place during sorting or deletes
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="group flex items-center justify-between gap-4 p-3 bg-white/2 border border-border-translucent hover:bg-white/4 rounded-xl transition-all duration-300 w-full"
        >

            {/* Checkbox and Text Container */}
            <div className="flex items-center gap-3.5 flex-1 min-w-0">

                {/* Custom Checkbox Input */}
                <button
                    onClick={() => onToggle(task.id)}
                    className={`w-[18px] h-[18px] rounded-md border flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0 ${task.completed
                        ? 'bg-accent-blue border-accent-blue shadow-[0_0_8px_var(--color-accent-blue)]'
                        : 'border-slate-500 hover:border-slate-300'
                        }`}
                >
                    {task.completed && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                            {/* Thick custom check symbol colored inside the base dark blue canvas */}
                            <Check className="w-3.5 h-3.5 text-bg-base stroke-[3.5px]" />
                        </motion.div>
                    )}
                </button>

                {/* Task Title text */}
                <span
                    className={`text-sm font-medium transition-all duration-300 break-words select-none leading-snug ${task.completed
                        ? 'text-slate-500 line-through decoration-slate-600'
                        : 'text-slate-200 group-hover:text-white'
                        }`}
                >
                    {task.title}
                </span>

            </div>

            {/* Priorities and Actions Container */}
            <div className="flex items-center gap-3 shrink-0">

                {/* Badges */}
                <div className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all duration-300 ${task.completed
                    ? 'text-accent-green bg-accent-green/10 border-accent-green/20 shadow-[0_0_12px_-5px_rgba(34,197,94,0.15)]'
                    : priorityStyles[task.priority]
                    }`}>
                    {task.completed ? 'Done' : task.priority}
                </div>

                {/* Delete Task Row Action */}
                <button
                    onClick={() => onDelete(task.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-accent-red cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                    <Trash2 className="w-4 h-4" />
                </button>

            </div>

        </motion.div>
    );
}
