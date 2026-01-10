import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { trace } from '@opentelemetry/api';

type OtelState = 'uninitialized' | 'initialized';
let otelState: OtelState = 'uninitialized';

export function initOtel() {
    if (typeof window === 'undefined') return;
    if (otelState === 'initialized') return;

    const resource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'llm-journey-client',
        'service.version': process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
        'deployment.environment': process.env.NEXT_PUBLIC_ENV ?? 'development',
    });

    const exporter = new OTLPTraceExporter({
        url: process.env.NEXT_PUBLIC_OTEL_TRACE_ENDPOINT ?? '/api/otel/trace',
    });

    const spanProcessor = new BatchSpanProcessor(exporter, {
        maxQueueSize: 50,
        maxExportBatchSize: 10,
        scheduledDelayMillis: 500,
    });

    const provider = new WebTracerProvider({
        resource,
        spanProcessors: [spanProcessor],
    });

    provider.register();

    registerInstrumentations({
        instrumentations: [
            new DocumentLoadInstrumentation(),
            new UserInteractionInstrumentation(),
            new FetchInstrumentation({
                propagateTraceHeaderCorsUrls: [/^\/api\//],
            }),
        ],
    });

    window.addEventListener('beforeunload', () => {
        try {
            void provider.forceFlush();
        } catch { }
    });

    otelState = 'initialized';

    if (process.env.NODE_ENV === 'development') {
        console.debug('[otel] initialized');
    }
}

export function getTracer() {
    return trace.getTracer(
        'llm-journey-client',
        process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev'
    );
}
