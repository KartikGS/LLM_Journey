import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { parseHeaderString } from '../utils/parseHeaderString';
import { redactUrl } from '../security/redaction';

const OTEL_EXPORTER_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const headers = parseHeaderString(process.env.OTEL_EXPORTER_OTLP_HEADERS);
let sdkStarted = false;

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
        new HttpInstrumentation({
            headersToSpanAttributes: {
                client: {
                    requestHeaders: [],
                    responseHeaders: [],
                },
                server: {
                    requestHeaders: [],
                    responseHeaders: [],
                },
            },

            ignoreIncomingRequestHook(req) {
                return req.url?.includes('/api/otel/trace') ?? false;
            },

            requestHook: (span, request) => {
                if ('url' in request && typeof request.url === 'string') {
                    span.setAttribute(
                        'http.url',
                        redactUrl(
                            request.url,
                            process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost'
                        )
                    );
                }
            },
        }),
    ],

});

if (!sdkStarted) {
    sdk.start();
    sdkStarted = true;
}
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
