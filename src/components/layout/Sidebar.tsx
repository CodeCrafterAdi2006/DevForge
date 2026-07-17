import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    CheckSquare,
    Terminal,
    BookOpen,
    Folder,
    FileText,
    Calendar,
    Settings,
    Flame,
    ChevronDown
} from "lucide-react";
import { useMetricsStore } from "@/store/useMetricsStore";
export interface NavItem {
    id: string;
    label: string;
    icon: typeof LayoutDashboard; // Accepts any Lucide icon component reference
    href: string;
}
interface SidebarProps {
    activeSection: string;
    onSectionChange: (sectionId: string) => void;
}
// Configured list of sidebar navigation options
const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '#' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, href: '#' },
    { id: 'coding', label: 'Coding Tracker', icon: Terminal, href: '#' },
    { id: 'learning', label: 'Learning', icon: BookOpen, href: '#' },
    { id: 'projects', label: 'Projects', icon: Folder, href: '#' },
    { id: 'notes', label: 'Notes', icon: FileText, href: '#' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, href: '#' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '#' },
];
export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
    const currentStreak = useMetricsStore((state) => state.getCurrentStreak());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <aside className="w-64 h-screen bg-bg-surface border-r border-border-translucent flex flex-col justify-between p-6 select-none">

            {/* Upper Segment: Brand & Navigation */}
            <div className="flex flex-col gap-8">

                {/* Brand Logomark */}
                <div className="flex items-center gap-3 px-2 py-1">
                    <div className="p-2 bg-accent-blue/15 border border-accent-blue/20 rounded-xl shadow-[0_0_15px_-3px_var(--color-accent-blue)]">
                        <Terminal className="w-5 h-5 text-accent-blue" />
                    </div>
                    <span className="text-lg font-bold tracking-wider text-white">DevForge</span>
                </div>
                {/* Navigation List */}
                <nav className="flex flex-col gap-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onSectionChange(item.id)}
                                className={`relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 w-full group ${isActive
                                        ? 'text-accent-blue bg-accent-blue/5'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/3'
                                    }`}
                            >
                                {/* Active Indicator Left Pill */}
                                {isActive && (
                                    <div className="absolute left-0 w-[3px] h-5 rounded-r-full bg-accent-blue shadow-[0_0_8px_var(--color-accent-blue)]" />
                                )}
                                {/* Nav Icon */}
                                <Icon className={`w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-105 ${isActive ? 'text-accent-blue' : 'text-slate-400 group-hover:text-slate-200'
                                    }`} />
                                {/* Nav Label */}
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
            {/* Lower Segment: Streak Widget & User Profile */}
            <div className="flex flex-col gap-4">

                {/* Streak Widget Card */}
                <div className="relative rounded-xl p-4 bg-gradient-to-b from-bg-card to-bg-surface border border-border-translucent shadow-luxury overflow-hidden">
                    {/* Subtle Ambient Orange Glow behind the flame */}
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-12 h-12 rounded-full bg-accent-orange/15 blur-lg pointer-events-none" />

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-accent-orange/10 border border-accent-orange/20 rounded-lg">
                            <Flame className="w-5 h-5 text-accent-orange animate-pulse" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Streak</div>
                            <div className="text-sm font-bold text-white">
                                {mounted ? `${currentStreak} Days` : '23 Days'}
                            </div>
                        </div>
                    </div>
                </div>
                {/* User Profile Snippet */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/3 cursor-pointer transition-all duration-300 group border border-transparent hover:border-border-translucent">
                    <div className="flex items-center gap-3">
                        {/* Styled Initials Avatar */}
                        <div className="relative w-9 h-9 rounded-full bg-accent-purple/15 border border-accent-purple/25 flex items-center justify-center text-xs font-bold text-accent-purple shadow-[0_0_10px_-3px_var(--color-accent-purple)]">
                            E
                            {/* Online Green Indicator Dot */}
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-accent-green border-[2px] border-bg-surface" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-white group-hover:text-accent-blue transition-colors duration-300">Eragon</div>
                            <div className="text-[10px] font-medium text-slate-500">View Profile</div>
                        </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors duration-300" />
                </div>
            </div>
        </aside>
    );
}