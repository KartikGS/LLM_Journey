import { trace, Tracer } from '@opentelemetry/api';

const SERVICE_NAME = 'llm-journey-server';

/**
 * Returns a tracer instance for server-side tracing.
 * Use this to create custom spans for business logic.
 */
export function getTracer(): Tracer {
    return trace.getTracer(SERVICE_NAME);
}
