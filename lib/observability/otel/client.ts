'use client';

import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor, SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { config } from '@/lib/config';
import type { SpanProcessor } from '@opentelemetry/sdk-trace-base';

let tracerProvider: WebTracerProvider | null = null;

export function initializeOpenTelemetryClient() {
    if (typeof window === 'undefined' || tracerProvider) {
        return;
    }

    const resource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'llm-journey',
        [ATTR_SERVICE_VERSION]: config.observability.version,
        'service.build.id': config.observability.buildId,
        'deployment.environment': process.env.NODE_ENV || 'development',
    });

    const spanProcessors: SpanProcessor[] = [];

    const otlpEndpoint =
        process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
        process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT;

    if (otlpEndpoint) {
        spanProcessors.push(
            new BatchSpanProcessor(
                new OTLPTraceExporter({ url: otlpEndpoint })
            )
        );
    }
    if (process.env.NODE_ENV === 'development') {
        spanProcessors.push(new SimpleSpanProcessor(new ConsoleSpanExporter()));
    }

    tracerProvider = new WebTracerProvider({
        resource,
        spanProcessors,
    });

    tracerProvider.register({
        contextManager: new ZoneContextManager(),
    });

    registerInstrumentations({
        instrumentations: [
            new FetchInstrumentation({
                enabled: true,
                ignoreUrls: [/\/_next\//],
            }),
        ],
    });
}

export function getTracerProvider() {
    return tracerProvider;
}
