import 'server-only';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { config } from '@/lib/config';

let sdk: NodeSDK | null = null;
let loggerProvider: LoggerProvider | null = null;

export function initializeOpenTelemetry() {
    if (sdk) {
        return; // Already initialized
    }

    const resource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'llm-journey',
        [ATTR_SERVICE_VERSION]: config.observability.version,
        'service.build.id': config.observability.buildId,
        'deployment.environment': process.env.NODE_ENV || 'development',
    });

    // Initialize logger provider
    loggerProvider = new LoggerProvider({
        resource,
    });

    // Configure log exporter if OTLP endpoint is available
    const otlpLogEndpoint = process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    if (otlpLogEndpoint) {
        const logExporter = new OTLPLogExporter({
            url: otlpLogEndpoint,
        });
        loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter));
    }

    // Initialize SDK
    sdk = new NodeSDK({
        resource,
        traceExporter: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT
            ? new OTLPTraceExporter({
                url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
            })
            : undefined,
        spanProcessor: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT
            ? new BatchSpanProcessor(
                new OTLPTraceExporter({
                    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
                })
            )
            : undefined,
        metricReader: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT
            ? new PeriodicExportingMetricReader({
                exporter: new OTLPMetricExporter({
                    url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
                }),
                exportIntervalMillis: 60000, // Export every 60 seconds
            })
            : undefined,
        instrumentations: [
            getNodeAutoInstrumentations({
                '@opentelemetry/instrumentation-http': {
                    enabled: true,
                },
            }),
        ],
    });

    sdk.start();
}

export function getLoggerProvider(): LoggerProvider | null {
    return loggerProvider;
}

export function shutdownOpenTelemetry(): Promise<void> {
    return new Promise((resolve) => {
        if (sdk) {
            sdk.shutdown().then(() => {
                if (loggerProvider) {
                    loggerProvider.shutdown().then(() => resolve()).catch(() => resolve());
                } else {
                    resolve();
                }
            }).catch(() => {
                if (loggerProvider) {
                    loggerProvider.shutdown().then(() => resolve()).catch(() => resolve());
                } else {
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}

