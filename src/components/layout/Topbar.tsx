import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Bell, Sun } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface TopbarProps {
    onSearchClick: () => void;
}

export default function Topbar({ onSearchClick }: TopbarProps) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const displayName = user?.user_metadata?.full_name ||
                        user?.user_metadata?.name ||
                        user?.user_metadata?.preferred_username ||
                        user?.email?.split('@')[0] ||
                        'Developer';
    const avatarUrl = user?.user_metadata?.avatar_url;
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <header className="h-16 border-b border-border-translucent flex items-center justify-between px-8 bg-bg-base/40 backdrop-blur-md relative z-20">

            {/* Left Segment: Placeholder spacer to balance the layout */}
            <div className="w-10" />

            {/* Center Segment: Frosted Raycast-style Search Button */}
            <button
                onClick={onSearchClick}
                className="flex items-center justify-between gap-3 bg-white/3 hover:bg-white/5 border border-border-translucent hover:border-white/10 px-4 py-2.5 rounded-xl text-slate-400 w-96 cursor-pointer transition-all duration-300 group"
            >
                <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                        Search tasks, projects, notes...
                    </span>
                </div>
                <kbd className="text-[10px] font-mono bg-white/5 border border-border-translucent px-1.5 py-0.5 rounded text-slate-500 group-hover:text-slate-400 transition-colors">
                    ⌘K
                </kbd>
            </button>

            {/* Right Segment: Utility Panel */}
            <div className="flex items-center gap-4">

                {/* Theme Toggle Button (Static Dark Theme Indicator for now) */}
                <button className="p-2 bg-transparent hover:bg-white/3 border border-transparent hover:border-border-translucent rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer transition-all duration-300">
                    <Sun className="w-4 h-4" />
                </button>

                {/* Notifications Icon with Glowing Pulse Dot */}
                <button className="p-2 bg-transparent hover:bg-white/3 border border-transparent hover:border-border-translucent rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer transition-all duration-300 relative">
                    <Bell className="w-4 h-4" />
                    {/* Glowing Orange Notification Badge */}
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-orange shadow-[0_0_8px_var(--color-accent-orange)]" />
                </button>

                {/* User Mini Avatar Badge */}
                <div className="w-7 h-7 rounded-full bg-accent-purple/15 border border-accent-purple/25 flex items-center justify-center text-xs font-bold text-accent-purple shadow-[0_0_8px_-3px_var(--color-accent-purple)] select-none overflow-hidden">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={displayName}
                            width={28}
                            height={28}
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        initial
                    )}
                </div>

            </div>

        </header>
    );
}
