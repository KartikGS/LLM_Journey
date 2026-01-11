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

// Pre-defined metrics for OTEL proxy
let otelProxyRequests: Counter | null = null;
let otelProxyRequestSize: Histogram | null = null;
let otelProxyUpstreamLatency: Histogram | null = null;
let otelProxyErrors: Counter | null = null;

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
