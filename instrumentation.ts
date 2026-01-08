export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { initializeOpenTelemetry } = await import('./lib/observability/otel/server');
        initializeOpenTelemetry();
    }
}

