import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { parseHeaderString } from '../utils/parseHeaderString';
import { redactUrl, SENSITIVE_HEADERS } from '../security/redaction';

const OTEL_EXPORTER_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const headers = parseHeaderString(process.env.OTEL_EXPORTER_OTLP_HEADERS);

const sdk = new NodeSDK({
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'llm-journey-server',
    }),

    traceExporter: new OTLPTraceExporter({
        url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
        headers,
    }),

    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
            headers,
        }),
    }),

    logRecordProcessor: new BatchLogRecordProcessor(
        new OTLPLogExporter({
            url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
            headers,
        })
    ),

    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': { enabled: false }, // Reduce noise and prevent file path leaking if sensitive
            '@opentelemetry/instrumentation-winston': { enabled: false },
            '@opentelemetry/instrumentation-http': {
                ignoreIncomingRequestHook(req: { url?: string }) {
                    const url = req.url || '';
                    return url.includes('/api/otel/trace');
                },
                applyCustomAttributesOnSpan: (span) => {

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const attributes = (span as any).attributes;
                    if (attributes) {
                        if (attributes['http.url']) {
                            span.setAttribute('http.url', redactUrl(attributes['http.url'] as string, 'http://localhost'));
                        }
                        if (attributes['http.target']) {
                            span.setAttribute('http.target', redactUrl(attributes['http.target'] as string, 'http://localhost'));
                        }

                        // Redact sensitive headers
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
                }
            }
        }),
    ],
});

sdk.start();
console.log('OpenTelemetry initialized');

// Graceful shutdown
process.on('SIGTERM', async () => {
    await sdk.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await sdk.shutdown();
    process.exit(0);
});
