'use client';

import { useEffect } from 'react';

/**
 * Module-level singleton promise.
 * Ensures OTEL is initialized exactly once,
 * even under React 18 Strict Mode remounts.
 */
let otelInitPromise: Promise<void> | null = null;

async function ensureOtelInitialized(): Promise<void> {
    if (otelInitPromise) {
        return otelInitPromise;
    }

    otelInitPromise = (async () => {
        const response = await fetch('/api/telemetry-token');

        if (!response.ok) {
            throw new Error(`Telemetry token fetch failed: ${response.status}`);
        }

        const { token } = await response.json();

        if (!token) {
            throw new Error('Telemetry token missing from response');
        }

        const { initOtel } = await import('../lib/otel/client');
        initOtel(token);
    })();

    return otelInitPromise;
}

/**
 * Bootstraps OpenTelemetry once for the entire app.
 * Telemetry is best-effort: failure disables it explicitly.
 */
export function OtelInitializer({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        ensureOtelInitialized().catch((error) => {
            // Telemetry is intentionally best-effort.
            // Failure should not impact application behavior.
            console.warn('[otel] telemetry disabled:', error);
        });
    }, []);

    return <>{children}</>;
}
