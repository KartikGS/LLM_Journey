'use client';

import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { config } from '@/lib/config';

let tracerProvider: WebTracerProvider | null = null;

export function initializeOpenTelemetryClient() {
    if (typeof window === 'undefined' || tracerProvider) {
        return; // Already initialized or not in browser
    }

    const resource = resourceFromAttributes({
        [SEMRESATTRS_SERVICE_NAME]: 'llm-journey',
        [SEMRESATTRS_SERVICE_VERSION]: config.observability.version,
        'service.build.id': config.observability.buildId,
        'deployment.environment': process.env.NODE_ENV || 'development',
    });

    tracerProvider = new WebTracerProvider({
        resource,
    });

    // Configure trace exporter if OTLP endpoint is available
    const otlpEndpoint = process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT;
    if (otlpEndpoint) {
        const traceExporter = new OTLPTraceExporter({
            url: otlpEndpoint,
        });
        tracerProvider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
    }

    tracerProvider.register();

    // Register instrumentations
    registerInstrumentations({
        instrumentations: [
            new FetchInstrumentation({
                enabled: true,
            }),
        ],
    });
}

export function getTracerProvider(): WebTracerProvider | null {
    return tracerProvider;
}

