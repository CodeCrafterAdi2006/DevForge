import { create } from 'zustand';

interface TimerStore {
    timeLeft: number;
    totalDuration: number;
    isRunning: boolean;
    isWorkSession: boolean;

    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    tick: () => void;
    toggleSessionType: () => void;
}

const WORK_DURATION = 25 * 60; // 1500 seconds
const BREAK_DURATION = 5 * 60;  // 300 seconds

// Synthesizes a premium browser-native beep sound using Web Audio API
const playNotificationSound = () => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // Pitch (A5 note)

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5); // Fade-out over 0.5 seconds

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.warn("Audio context not allowed yet by user interaction constraints.", e);
    }
};

export const useTimerStore = create<TimerStore>((set) => ({
    timeLeft: WORK_DURATION,
    totalDuration: WORK_DURATION,
    isRunning: false,
    isWorkSession: true,

    startTimer: () => set({ isRunning: true }),

    pauseTimer: () => set({ isRunning: false }),

    resetTimer: () => set((state) => ({
        timeLeft: state.isWorkSession ? WORK_DURATION : BREAK_DURATION,
        totalDuration: state.isWorkSession ? WORK_DURATION : BREAK_DURATION,
        isRunning: false
    })),

    tick: () => set((state) => {
        if (state.timeLeft <= 1) {
            // Timer finished!
            playNotificationSound();
            const nextIsWork = !state.isWorkSession;
            const nextDuration = nextIsWork ? WORK_DURATION : BREAK_DURATION;

            return {
                isWorkSession: nextIsWork,
                timeLeft: nextDuration,
                totalDuration: nextDuration,
                isRunning: false
            };
        }

        return {
            timeLeft: state.timeLeft - 1
        };
    }),

    toggleSessionType: () => set((state) => {
        const nextIsWork = !state.isWorkSession;
        const nextDuration = nextIsWork ? WORK_DURATION : BREAK_DURATION;

        return {
            isWorkSession: nextIsWork,
            timeLeft: nextDuration,
            totalDuration: nextDuration,
            isRunning: false
        };
    })
}));
