import 'server-only';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const OTEL_EXPORTER_OTLP_ENDPOINT =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://otel-collector:4318';

const sdk = new NodeSDK({
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'llm-journey-server',
    }),

    traceExporter: new OTLPTraceExporter({
        url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
    }),

    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
        }),
    }),

    logRecordProcessor: new BatchLogRecordProcessor(
        new OTLPLogExporter({
            url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
        })
    ),

    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-winston': { enabled: false },
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
