'use client'

import { useEffect } from 'react';
import { loggerClient } from "@/lib/utils/logger/client"

// Simple error fingerprinting for grouping similar errors
function getErrorFingerprint(error: Error): string {
    const key = `${error.name}:${error.message}`;
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        const char = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Create error fingerprint for grouping
        const fingerprint = getErrorFingerprint(error);
        
        // Get additional context
        const errorContext = {
            component: 'ErrorBoundary',
            errorName: error.name,
            errorMessage: error.message,
            errorDigest: error.digest,
            fingerprint,
            stack: error.stack,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        };

        loggerClient.error('Error boundary caught error', error, errorContext);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            {process.env.NODE_ENV === 'development' && error.message && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-2xl text-center">
                    {error.message}
                </p>
            )}
            <button
                onClick={reset}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Try again
            </button>
        </div>
    )
}