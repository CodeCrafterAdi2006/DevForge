'use client';

import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import GlassCard from '@/components/ui/GlassCard';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { useMetricsStore } from '@/store/useMetricsStore';


function GithubIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
    );
}


interface AuthGateProps {
    children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    // Sync store data with session authentication state
    useEffect(() => {
        // 1. Check current active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // 2. Listen for auth state updates (login, logout, token refreshes)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (session) {
            // User logged in: Load data from database
            useTaskStore.getState().fetchTasks();
            useMetricsStore.getState().fetchMetrics();
        } else {
            // User logged out: Wipe local memory
            useTaskStore.getState().clearTasks();
            useMetricsStore.getState().clearMetrics();
        }
    }, [session]);

    const handleGitHubLogin = async () => {
        setAuthLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    // Redirects back to our current domain (localhost in dev)
                    redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in with GitHub:', error);
            setAuthLoading(false);
        }
    };

    // Premium loading screen to prevent "content flashing"
    if (loading) {
        return (
            <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center relative overflow-hidden">
                {/* Ambient background glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-[100px] animate-glow-drift" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-[100px] animate-glow-drift" />

                {/* Simple elegant pulsing text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="z-10 flex items-center gap-2"
                >
                    <Sparkles className="w-5 h-5 text-accent-blue" />
                    <span className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Forging Workspace...</span>
                </motion.div>
            </div>
        );
    }

    // If there is no active session, render the Luxury login screen
    if (!session) {
        return (
            <div className="min-h-screen bg-bg-base flex items-center justify-center relative overflow-hidden p-4">
                {/* Ambient Luxury Lighting System */}
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent-blue/5 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent-purple/5 rounded-full blur-[150px] pointer-events-none" />

                {/* Subtle dot matrix grid background */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.02]"
                    style={{
                        backgroundImage: 'radial-gradient(var(--color-accent-blue) 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-md z-10"
                >
                    <GlassCard className="relative p-8 text-center" glowColor="blue">
                        <div className="flex justify-center mb-6">
                            <div className="p-3 bg-accent-blue/10 border border-accent-blue/20 rounded-2xl">
                                <Sparkles className="w-8 h-8 text-accent-blue" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
                            Welcome to DevForge
                        </h1>
                        <p className="text-xs text-slate-400 leading-relaxed mb-8 max-w-[280px] mx-auto">
                            Your cinematic, personal productivity hub. Sign in to start forging.
                        </p>

                        <button
                            onClick={handleGitHubLogin}
                            disabled={authLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-bg-card to-bg-surface hover:from-accent-blue/15 hover:to-accent-blue/5 border border-border-translucent hover:border-accent-blue/30 rounded-xl font-semibold text-sm text-slate-200 hover:text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-luxury cursor-pointer disabled:opacity-50"
                        >
                            {authLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <GithubIcon className="w-5 h-5 text-white" />
                                    Continue with GitHub
                                </>
                            )}
                        </button>
                    </GlassCard>
                </motion.div>
            </div>
        );
    }

    // User is logged in! Render the app dashboard
    return <>{children}</>;
}
