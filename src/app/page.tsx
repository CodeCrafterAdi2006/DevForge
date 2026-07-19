'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import TodayFocusList from '@/components/dashboard/TodayFocusList';
import FocusTimer from '@/components/dashboard/FocusTimer';
import CommandPalette from '@/components/ui/CommandPalette';
import { useMetricsStore } from '@/store/useMetricsStore';
import AuthGate from '@/components/auth/AuthGate';
import { supabase } from '@/lib/supabase';


export default function Home() {
  // 1. Keep track of which sidebar tab is active
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    problemsSolvedTotal,
    problemsSolvedThisWeek,
    studyMinutesTotal,
    studyMinutesThisWeek,
    bestStreak,
    getCurrentStreak,
    logProblem
  } = useMetricsStore();

  const currentStreak = getCurrentStreak();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name ||
                     user.user_metadata?.name ||
                     user.user_metadata?.preferred_username ||
                     user.email?.split('@')[0] ||
                     'Developer';
        setUserName(name);
      }
    });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Keyboard shortcut listener to toggle command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AuthGate>
      <DashboardLayout
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onSearchClick={() => setIsCommandPaletteOpen(true)}
      >
        {/* 2. Dynamically swap content based on active tab */}

        {activeSection === 'dashboard' && (
          <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">

            {/* Header Greeting Segment */}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1.5">
                {getGreeting()}{mounted && userName ? `, ${userName}` : ''}. 👋
              </h1>
              <p className="text-slate-400 text-xs font-medium">
                You've made great progress today. <span className="text-accent-blue font-semibold">Keep forging.</span>
              </p>
            </div>

            {/* Upper Metrics Grid Row (5 cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 w-full">

              <GlassCard title="Problems Solved" glowColor="none" className="relative">
                {mounted && (
                  <button
                    onClick={() => logProblem(1)}
                    className="absolute top-4 right-4 px-2 py-0.5 bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/20 rounded text-[9px] font-bold text-accent-blue cursor-pointer transition-all duration-200"
                    title="Log a solved coding problem"
                  >
                    + Log
                  </button>
                )}
                <div className="text-2xl font-bold text-white mt-1">
                  {mounted ? problemsSolvedTotal : 312}
                </div>
                <div className="text-[10px] text-accent-green font-bold mt-1">
                  ↑ {mounted ? problemsSolvedThisWeek : 14} this week
                </div>
              </GlassCard>

              <GlassCard title="Study Hours" glowColor="none">
                <div className="text-2xl font-bold text-white mt-1">
                  {mounted ? (studyMinutesTotal / 60).toFixed(1) : '18.6'}h
                </div>
                <div className="text-[10px] text-accent-purple font-bold mt-1">
                  ↑ {mounted ? (studyMinutesThisWeek / 60).toFixed(1) : '3.2'}h this week
                </div>
              </GlassCard>

              <GlassCard title="Projects" glowColor="none">
                <div className="text-2xl font-bold text-white mt-1">7</div>
                <div className="text-[10px] text-accent-blue font-bold mt-1">2 in progress</div>
              </GlassCard>

              <GlassCard title="Current Streak" glowColor="none">
                <div className="text-2xl font-bold text-white mt-1">
                  {mounted ? `${currentStreak} Days` : '23 Days'}
                </div>
                <div className="text-[10px] text-accent-orange font-bold mt-1">
                  Best: {mounted ? `${bestStreak} days` : '46 days'}
                </div>
              </GlassCard>

              <GlassCard glowColor="none" className="flex items-center">
                <p className="text-xs italic text-slate-400 leading-relaxed">
                  "The best way to predict the future is to build it." <span className="text-slate-500 not-italic block mt-1">— Alan Kay</span>
                </p>
              </GlassCard>

            </div>

            {/* Master 3-Column Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">

              {/* Column 1: Today's Focus & Recent Activity */}
              <div className="flex flex-col gap-8">

                {/* Mounted Interactive Checklist */}
                <TodayFocusList />

                {/* Activity Feed Placeholder */}
                <GlassCard title="Recent Activity" glowColor="none">
                  <div className="py-12 text-center text-xs text-slate-500 font-medium">
                    Activity logs coming in Phase 1.3...
                  </div>
                </GlassCard>

              </div>

              {/* Column 2: Weekly Activity Charts & Active Projects */}
              <div className="flex flex-col gap-8">

                {/* Chart Placeholder */}
                <GlassCard title="Coding Activity" glowColor="none">
                  <div className="py-28 text-center text-xs text-slate-500 font-medium">
                    LeetCode & commits charts coming in Phase 1.4...
                  </div>
                </GlassCard>

                {/* Projects List Placeholder */}
                <GlassCard title="Projects" glowColor="none">
                  <div className="py-16 text-center text-xs text-slate-500 font-medium">
                    Active project boards coming in Phase 4.1...
                  </div>
                </GlassCard>

              </div>

              {/* Column 3: Pomodoro Focus Timer & Calendar */}
              <div className="flex flex-col gap-8">

                {/* Focus Timer Component */}
                <FocusTimer />

                {/* Calendar Planner Placeholder */}
                <GlassCard title="Calendar" glowColor="none">
                  <div className="py-16 text-center text-xs text-slate-500 font-medium">
                    Schedule visualizer coming in Phase 4.3...
                  </div>
                </GlassCard>

              </div>

            </div>

          </div>
        )}

        {/* Render placeholder for other sections */}
        {activeSection !== 'dashboard' && (
          <div className="flex items-center justify-center min-h-[400px] w-full max-w-5xl mx-auto">
            <GlassCard title={`${activeSection.toUpperCase()} PAGE`} glowColor="purple">
              <div className="text-center py-8">
                <p className="text-slate-300 mb-2">This section is currently under construction.</p>
                <p className="text-sm text-slate-500">Phase 1 shell navigation works successfully!</p>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Global Keyboard Command Palette Console Overlay */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onSectionChange={setActiveSection}
        />

      </DashboardLayout>
    </AuthGate>
  );
}
