'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type GlassCardVariant = 'default' | 'hero' | 'interactive';

interface GlassCardProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    variant?: GlassCardVariant;
    className?: string;
    as?: React.ElementType; // Allow polymorphic rendering (e.g., 'section', 'article')
}

export function GlassCard({
    children,
    variant = 'default',
    className,
    as: Component = motion.div,
    ...props
}: GlassCardProps) {
    // Base styles for all glass cards
    const baseStyles = "bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] relative overflow-hidden";

    // Variant-specific styles
    const variantStyles = {
        default: "rounded-xl shadow-md shadow-black/5 dark:shadow-none",
        hero: "rounded-[2rem] shadow-2xl shadow-black/5 dark:shadow-2xl dark:shadow-black/40",
        interactive: "rounded-xl shadow-md shadow-black/5 dark:shadow-none cursor-pointer transition-colors duration-300 group",
    };

    // Interaction animation props (only for interactive variant)
    // CRITICAL: No scale/translate to prevent "shaky screen"
    const interactiveProps = variant === 'interactive' ? {
        whileHover: {
            borderColor: 'rgba(0,0,0,0.12)', // border-emphasis (light)
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)', // shadow-card-hover (light)
        },
        transition: { duration: 0.15 } // duration-fast
    } : {};

    // For dark mode specific interactive styles, we use className group-hover because framer-motion doesn't easily support dark: modifiers in variants
    const interactiveDarkClasses = variant === 'interactive'
        ? "dark:hover:border-white/[0.15] dark:hover:shadow-black/20"
        : "";

    return (
        <Component
            className={cn(baseStyles, variantStyles[variant], interactiveDarkClasses, className)}
            {...interactiveProps}
            {...props}
        >
            {/* Gradient Border Glow for Hero - kept internal/optional if needed, 
          but usually the plan implies the glow interacts with the card.
          For 'interactive', we can add a subtle internal glow or rely on the border.
      */}
            {children}
        </Component>
    );
}
