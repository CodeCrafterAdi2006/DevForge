import { ReactNode } from 'react';

export interface GlassCardProps {
    children: ReactNode;
    title?: string;
    className?: string;
    glowColor?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'gold' | 'none';
    animatedBorder?: boolean;
    onClick?: () => void;
}

export default function GlassCard({
    children,
    title,
    className = '',
    glowColor = 'none',
    animatedBorder = false,
    onClick
}: GlassCardProps) {
    const glowClasses = {
        blue: 'bg-accent-blue/20 blur-2xl',
        purple: 'bg-accent-purple/20 blur-2xl',
        green: 'bg-accent-green/20 blur-2xl',
        orange: 'bg-accent-orange/20 blur-2xl',
        red: 'bg-accent-red/20 blur-2xl',
        gold: 'bg-accent-gold/20 blur-2xl',
        none: ''
    };
    // Base wrapper styles for layout & mouse hover states if card is interactive
    const isInteractive = !!onClick;
    const hoverClasses = isInteractive ? 'hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] cursor-pointer transition-all duration-300' : '';

    return (
        <div
            onClick={onClick}
            // Added 'group' class to let child elements react to parent hover states
            className={`relative rounded-2xl p-[1px] h-full isolate group ${hoverClasses} ${className}`}
        >
            {/* 1. Outer Border: Animated (Rotating Conic Gradient) or Static Translucent */}
            <div
                className="absolute inset-0 rounded-2xl pointer-events-none -z-10 transition-all duration-300 overflow-hidden"
            >
                {animatedBorder ? (
                    /* A giant rotating square centered behind the card, clipped to a 1px border mask */
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] h-[250%] aspect-square bg-[conic-gradient(from_0deg,var(--color-accent-blue),var(--color-accent-purple),var(--color-accent-blue))] animate-[spin_8s_linear_infinite]" />
                ) : (
                    <div className="absolute inset-0 bg-border-translucent group-hover:bg-white/15" />
                )}
            </div>

            {/* 2. Ambient Underglow / Backlight Bloom */}
            {/* Added opacity controls, scaling, and transitions so the underglow "breathes" on hover */}
            {glowColor !== 'none' && (
                <div className={`absolute inset-0 rounded-2xl pointer-events-none -z-20 opacity-60 scale-95 group-hover:scale-102 group-hover:opacity-100 transition-all duration-500 ${glowClasses[glowColor]}`} />
            )}

            {/* 3. Inner Content Card */}
            <div className="relative rounded-[15px] bg-gradient-to-b from-bg-surface to-bg-card p-6 h-full w-full overflow-hidden shadow-luxury">

                {/* 4. Specular Top Highlight (Simulates physical light reflection) */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                {/* Card Title Header */}
                {title && (
                    <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4 pointer-events-none">
                        {title}
                    </h3>
                )}

                {/* Nested Content */}
                <div className="relative z-10 h-full">
                    {children}
                </div>
            </div>
        </div>
    );

}