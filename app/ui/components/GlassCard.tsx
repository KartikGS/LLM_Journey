import React, { type HTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type GlassCardVariant = 'default' | 'hero' | 'interactive';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: GlassCardVariant;
    className?: string;
}

export function GlassCard({
    children,
    variant = 'default',
    className,
    ...props
}: GlassCardProps) {
    const baseStyles = "bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] relative overflow-hidden";

    const variantStyles = {
        default: "rounded-xl shadow-md shadow-black/5 dark:shadow-none",
        hero: "rounded-[2rem] shadow-2xl shadow-black/5 dark:shadow-2xl dark:shadow-black/40",
        interactive:
            "rounded-xl shadow-md shadow-black/5 dark:shadow-none cursor-pointer group transition-[border-color,box-shadow] duration-150 hover:border-black/[0.12] hover:shadow-lg hover:shadow-black/8 dark:hover:border-white/[0.15] dark:hover:shadow-black/20",
    };

    return (
        <div className={cn(baseStyles, variantStyles[variant], className)} {...props}>
            {children}
        </div>
    );
}
