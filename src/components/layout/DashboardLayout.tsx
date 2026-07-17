import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
    children: ReactNode;
    activeSection: string;
    onSectionChange: (section: string) => void;
    onSearchClick: () => void;
}

export default function DashboardLayout({
    children,
    activeSection,
    onSectionChange,
    onSearchClick
}: DashboardLayoutProps) {
    return (
        <div className="relative min-h-screen w-full flex overflow-hidden bg-bg-base">

            {/* 1. Subtle Neural-Grid Dot Matrix Background */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

            {/* 2. Drifting Background Ambient Light Blooms (GPU Optimized) */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent-blue/15 blur-[120px] pointer-events-none animate-glow-drift z-0" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-purple/15 blur-[150px] pointer-events-none animate-glow-drift [animation-delay:-10s] z-0" />

            {/* 3. Left Fixed Sidebar */}
            <Sidebar activeSection={activeSection} onSectionChange={onSectionChange} />

            {/* 4. Right Content Panel (Topbar + Scrollable Main Viewport) */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">

                {/* Top Header Bar */}
                <Topbar onSearchClick={onSearchClick} />

                {/* Scrollable Widget Surface */}
                <main className="flex-1 overflow-y-auto p-8 relative z-10">
                    {children}
                </main>

            </div>

        </div>
    );
}
