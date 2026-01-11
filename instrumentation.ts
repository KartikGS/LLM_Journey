let otelInitialized = false;

export async function register() {
    if (otelInitialized) return;

    if (process.env.NEXT_RUNTIME !== 'nodejs') {
        return;
    }

    try {
        await import('./lib/otel/server');
        otelInitialized = true;
    } catch (err) {
        console.error('Failed to initialize OpenTelemetry', err);
    }
}
