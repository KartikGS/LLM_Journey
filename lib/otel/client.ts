import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

let isInitialized = false;

export function initOtel() {
    if (typeof window === 'undefined') return;
    if (isInitialized) return;

    const resource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'llm-journey-client',
    });

    const exporter = new OTLPTraceExporter({
        url: '/api/otel/trace',
    });

    const spanProcessor = new BatchSpanProcessor(exporter, {
        maxQueueSize: 100,
        maxExportBatchSize: 10,
        scheduledDelayMillis: 500,
    });

    const provider = new WebTracerProvider({
        resource,
        spanProcessors: [spanProcessor],
    });

    provider.register();

    // Browser-only instrumentation (NO registerInstrumentations)
    new DocumentLoadInstrumentation().enable();
    new UserInteractionInstrumentation().enable();
    new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [/^\/api\//],
    }).enable();

    window.addEventListener('beforeunload', () => {
        provider.forceFlush();
    });

    isInitialized = true;
    console.log('OpenTelemetry initialized');
}
