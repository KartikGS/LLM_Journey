import { metrics, Meter, Counter, Histogram } from '@opentelemetry/api';

const SERVICE_NAME = 'llm-journey-server';

let meter: Meter | null = null;

/**
 * Returns a meter instance for server-side metrics.
 */
export function getMeter(): Meter {
    if (!meter) {
        meter = metrics.getMeter(SERVICE_NAME);
    }
    return meter;
}

/**
 * Helper to safely record metrics without crashing the request.
 */
export function safeMetric(fn: () => void) {
    try {
        fn();
    } catch (err) {
        console.error('Metric failure', err);
    }
}


// Pre-defined metrics for telemetry token
let telemetryTokenRequests: Counter | null = null;
let telemetryTokenErrors: Counter | null = null;

// Pre-defined metrics for OTEL proxy
let otelProxyRequests: Counter | null = null;
let otelProxyRequestSize: Histogram | null = null;
let otelProxyUpstreamLatency: Histogram | null = null;
let otelProxyErrors: Counter | null = null;

/**
 * Counter for total telemetry token requests
 */
export function getTelemetryTokenRequestsCounter(): Counter {
    if (!telemetryTokenRequests) {
        telemetryTokenRequests = getMeter().createCounter('telemetry_token.requests', {
            description: 'Total number of Telemetry Token requests',
            unit: '1',
        });
    }
    return telemetryTokenRequests;
}

/**
 * Counter for Telemetry token errors by type
 */
export function getTelemetryTokenErrorsCounter(): Counter {
    if (!telemetryTokenErrors) {
        telemetryTokenErrors = getMeter().createCounter('telemetry_token.errors', {
            description: 'Total number of Telemetry token errors',
            unit: '1',
        });
    }
    return telemetryTokenErrors;
}

/**
 * Counter for total OTEL proxy requests
 */
export function getOtelProxyRequestsCounter(): Counter {
    if (!otelProxyRequests) {
        otelProxyRequests = getMeter().createCounter('otel_proxy.requests', {
            description: 'Total number of OTEL proxy requests',
            unit: '1',
        });
    }
    return otelProxyRequests;
}

/**
 * Histogram for OTEL proxy request body sizes
 */
export function getOtelProxyRequestSizeHistogram(): Histogram {
    if (!otelProxyRequestSize) {
        otelProxyRequestSize = getMeter().createHistogram('otel_proxy.request_size', {
            description: 'Size of OTEL proxy request bodies in bytes',
            unit: 'bytes',
        });
    }
    return otelProxyRequestSize;
}

/**
 * Histogram for upstream response latency
 */
export function getOtelProxyUpstreamLatencyHistogram(): Histogram {
    if (!otelProxyUpstreamLatency) {
        otelProxyUpstreamLatency = getMeter().createHistogram('otel_proxy.upstream_latency', {
            description: 'Latency of upstream collector responses in milliseconds',
            unit: 'ms',
        });
    }
    return otelProxyUpstreamLatency;
}

/**
 * Counter for OTEL proxy errors by type
 */
export function getOtelProxyErrorsCounter(): Counter {
    if (!otelProxyErrors) {
        otelProxyErrors = getMeter().createCounter('otel_proxy.errors', {
            description: 'Total number of OTEL proxy errors',
            unit: '1',
        });
    }
    return otelProxyErrors;
}
