import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
    from?: string;
    via?: string;
    to?: string;
}

export function GradientText({
    children,
    className,
    from = "from-gray-900 dark:from-white",
    via = "via-gray-800 dark:via-gray-100",
    to = "to-gray-900 dark:to-white"
}: GradientTextProps) {
    return (
        <span
            className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent box-decoration-clone",
                from,
                via,
                to,
                className
            )}
        >
            {children}
        </span>
    );
}
