'use client';

import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { useTimerStore } from '@/store/useTimerStore';

export default function FocusTimer() {
  // Hydration guard to prevent SSR layout mismatch
  const [mounted, setMounted] = useState(false);
  
  const {
    timeLeft,
    totalDuration,
    isRunning,
    isWorkSession,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    toggleSessionType
  } = useTimerStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer Tick Trigger
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);

  if (!mounted) {
    return (
      <GlassCard title="Focus Timer" glowColor="none">
        <div className="flex items-center justify-center py-12 text-slate-500 text-sm font-medium">
          Loading timer layout...
        </div>
      </GlassCard>
    );
  }

  // MM:SS Time Formatter
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG circular properties
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // 314.159
  const strokeDashoffset = circumference - (timeLeft / totalDuration) * circumference;

  return (
    <GlassCard glowColor="none" className="flex flex-col h-full justify-between">
      
      {/* Top Header Row with Secondary Controls */}
      <div className="flex items-center justify-between mb-4 select-none">
        <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
          Focus Timer
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Reset Button */}
          <button
            onClick={resetTimer}
            className="p-1.5 rounded-lg bg-white/2 hover:bg-white/4 border border-border-translucent hover:border-white/10 text-slate-500 hover:text-slate-300 cursor-pointer transition-all duration-200"
            title="Reset timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Mode Selector Tabs (Work vs Break) */}
          <div className="flex bg-white/2 border border-border-translucent p-0.5 rounded-lg">
            <button
              onClick={() => !isWorkSession && toggleSessionType()}
              className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md cursor-pointer transition-all duration-300 ${
                isWorkSession 
                  ? 'bg-accent-blue text-bg-base shadow-[0_0_8px_var(--color-accent-blue)]' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Work
            </button>
            <button
              onClick={() => isWorkSession && toggleSessionType()}
              className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md cursor-pointer transition-all duration-300 ${
                !isWorkSession 
                  ? 'bg-accent-purple text-bg-base shadow-[0_0_8px_var(--color-accent-purple)]' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Break
            </button>
          </div>
        </div>
      </div>

      {/* Centered Circular HUD Timer Ring */}
      <div className="flex flex-col items-center justify-center flex-1 py-6 relative select-none">
        
        <div className="w-40 h-40 relative">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Circular Track */}
            <circle
              cx="60"
              cy="60"
              r="50"
              className="stroke-white/3 fill-none stroke-[3]"
            />
            {/* Neon halo background shadow (Compositor-friendly glow) */}
            <circle
              cx="60"
              cy="60"
              r="50"
              className={`${
                isWorkSession ? 'stroke-accent-blue' : 'stroke-accent-purple'
              } fill-none stroke-[3.5] opacity-35 blur-[1.5px] transition-all duration-300 ease-linear`}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
            {/* Active Foreground progress path */}
            <circle
              cx="60"
              cy="60"
              r="50"
              className={`${
                isWorkSession ? 'stroke-accent-blue' : 'stroke-accent-purple'
              } fill-none stroke-[3] transition-all duration-300 ease-linear`}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Time digits & central controls layered inside the SVG circle boundary */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold tracking-tight text-white leading-none">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mt-1 mb-2.5">
              {isWorkSession ? 'Start focusing' : 'Take a break'}
            </span>
            
            {/* Play/Pause Button inside circle */}
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className={`p-2 rounded-full border cursor-pointer transition-all duration-300 ${
                isRunning
                  ? 'bg-white/5 border-white/15 text-white hover:bg-white/10'
                  : isWorkSession
                    ? 'bg-accent-blue/15 border-accent-blue/20 text-accent-blue hover:bg-accent-blue/20 shadow-[0_0_15px_-3px_var(--color-accent-blue)]'
                    : 'bg-accent-purple/15 border-accent-purple/20 text-accent-purple hover:bg-accent-purple/20 shadow-[0_0_15px_-3px_var(--color-accent-purple)]'
              }`}
            >
              {isRunning ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>

      </div>

    </GlassCard>
  );
}
