import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { trace } from '@opentelemetry/api';
import { redactUrl, SENSITIVE_HEADERS } from '../security/redaction';

type OtelState = 'uninitialized' | 'initialized';
let otelState: OtelState = 'uninitialized';

export function initOtel(token?: string) {
    if (typeof window === 'undefined') return;
    if (otelState === 'initialized') return;

    const resource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'llm-journey-client',
    });

    const exporter = new OTLPTraceExporter({
        url: '/api/otel/trace',
        headers: token ? { 'x-telemetry-token': token } : {},
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
                ignoreUrls: [/api\/otel\/trace/],
                propagateTraceHeaderCorsUrls: [/^\/api\//],
                applyCustomAttributesOnSpan: (span, request) => {
                    let url: string | undefined;
                    if (typeof request === 'string') {
                        url = request;
                    } else if (request && 'url' in request) {
                        url = (request as Request).url;
                    }

                    if (url) {
                        span.setAttribute('http.url', redactUrl(url, window.location.origin));
                    }

                    // Mask sensitive headers in span attributes if they were captured
                    // Note: FetchInstrumentation might not capture all headers by default,
                    // but we ensure any added attributes are safe.
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const attributes = (span as any).attributes;
                    if (attributes) {
                        for (const key in attributes) {
                            if (key.toLowerCase().includes('header') || key.toLowerCase().includes('cookie')) {
                                SENSITIVE_HEADERS.forEach(sensitive => {
                                    if (key.toLowerCase().includes(sensitive)) {
                                        span.setAttribute(key, '[REDACTED]');
                                    }
                                });
                            }
                        }
                    }
                },
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
        'llm-journey-client'
    );
}
