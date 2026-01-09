import { config } from '@/lib/config';
import { Counter, Gauge, Histogram, MetricLabels } from '@/types/metrics';
import { metrics as otelMetrics, Meter } from '@opentelemetry/api';
import { MeterProvider as SDKMeterProvider } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const enabled = config.observability.metricsEnabled;
const prefix = config.observability.metricsPrefix ?? "llm_journey";

// Initialize meter provider if not already initialized
let meterProvider: SDKMeterProvider | null = null;
let meter: Meter | null = null;

function getMeter(): Meter {
    if (!meter) {
        if (!meterProvider) {
            const resource = resourceFromAttributes({
                [ATTR_SERVICE_NAME]: 'llm-journey',
                [ATTR_SERVICE_VERSION]: config.observability.version,
                'service.build.id': config.observability.buildId,
            });

            meterProvider = new SDKMeterProvider({
                resource,
            });

            // Set the global meter provider
            otelMetrics.setGlobalMeterProvider(meterProvider);
        }

        meter = otelMetrics.getMeter('llm-journey', config.observability.version);
    }

    return meter;
}

const getMetricName = (n: string) => `${prefix}_${n}`;
const toLabelSet = (l?: MetricLabels) => l ?? {};

class CounterImpl implements Counter {
    private counter: ReturnType<Meter['createCounter']>;

    constructor(name: string, help: string) {
        if (!enabled) {
            this.counter = null as any;
            return;
        }
        const m = getMeter();
        this.counter = m.createCounter(getMetricName(name), {
            description: help,
        });
    }

    inc(labels?: MetricLabels, value: number = 1): void {
        if (!enabled || !this.counter) return;
        this.counter.add(value, toLabelSet(labels));
    }
}

class GaugeImpl implements Gauge {
    private gauge: ReturnType<Meter['createObservableGauge']>;
    private currentValue: Map<string, number> = new Map();
    private callbackRegistered: boolean = false;

    constructor(name: string, help: string) {
        if (!enabled) {
            this.gauge = null as any;
            return;
        }
        const m = getMeter();
        this.gauge = m.createObservableGauge(getMetricName(name), {
            description: help,
        });
    }

    private ensureCallback(): void {
        if (this.callbackRegistered || !this.gauge) return;

        const m = getMeter();
        m.addBatchObservableCallback(
            (observableResult) => {
                for (const [key, value] of this.currentValue.entries()) {
                    const labels = this.parseKey(key);
                    observableResult.observe(this.gauge, value, labels);
                }
            },
            [this.gauge]
        );
        this.callbackRegistered = true;
    }

    private parseKey(key: string): MetricLabels {
        if (!key || key === 'default') return {};
        const labels: MetricLabels = {};
        const parts = key.split(',');
        for (const part of parts) {
            const [k, v] = part.split('=');
            if (k && v) {
                labels[k] = v;
            }
        }
        return labels;
    }

    private getKey(labels?: MetricLabels): string {
        if (!labels || Object.keys(labels).length === 0) return 'default';
        return Object.entries(labels)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join(',');
    }

    set(labels: MetricLabels, value: number): void {
        if (!enabled) return;
        this.ensureCallback();
        const key = this.getKey(labels);
        this.currentValue.set(key, value);
    }

    inc(labels?: MetricLabels, value: number = 1): void {
        if (!enabled) return;
        this.ensureCallback();
        const key = this.getKey(labels);
        const current = this.currentValue.get(key) || 0;
        this.currentValue.set(key, current + value);
    }

    dec(labels?: MetricLabels, value: number = 1): void {
        if (!enabled) return;
        this.ensureCallback();
        const key = this.getKey(labels);
        const current = this.currentValue.get(key) || 0;
        this.currentValue.set(key, Math.max(0, current - value));
    }
}

class HistogramImpl implements Histogram {
    private histogram: ReturnType<Meter['createHistogram']>;

    constructor(name: string, help: string, buckets: number[]) {
        if (!enabled) {
            this.histogram = null as any;
            return;
        }
        const m = getMeter();
        this.histogram = m.createHistogram(getMetricName(name), {
            description: help,
        });
    }

    observe(labels: MetricLabels, value: number): void {
        if (!enabled || !this.histogram) return;
        this.histogram.record(value, toLabelSet(labels));
    }
}

// Global metrics storage for compatibility
const defined = new Set<string>();

function define<T>(name: string, factory: () => T): T {
    if (defined.has(name)) {
        throw new Error(`Metric '${name}' already defined`);
    }
    defined.add(name);

    if (!enabled) {
        // Return a no-op metric matching the interface
        return {
            inc() { },
            observe() { },
            set() { },
            dec() { },
        } as unknown as T;
    }

    return factory();
}

// Predefined metrics
export const metrics = {
    // API metrics
    apiRequests: define(
        "api_requests_total",
        () => new CounterImpl("api_requests_total", "Total number of API requests")
    ),
    apiRequestDuration: define(
        "api_request_duration_seconds",
        () => new HistogramImpl(
            "api_request_duration_seconds",
            "API request duration in seconds",
            [0.1, 0.5, 1, 5, 10, 30, 60]
        )
    ),
    apiErrors: define(
        "api_errors_total",
        () => new CounterImpl("api_errors_total", "Total number of API errors")
    ),

    // LLM metrics
    llmGenerations: define(
        "llm_generations_total",
        () => new CounterImpl("llm_generations_total", "Total number of LLM generations")
    ),
    llmGenerationDuration: define(
        "llm_generation_duration_seconds",
        () => new HistogramImpl(
            "llm_generation_duration_seconds",
            "LLM generation duration in seconds",
            [0.1, 0.5, 1, 5, 10, 30, 60, 300, 600]
        )
    ),
    llmTokensGenerated: define(
        "llm_tokens_generated_total",
        () => new CounterImpl("llm_tokens_generated_total", "LLM tokens generated")
    ),
    llmTokensInput: define(
        "llm_tokens_input_total",
        () => new CounterImpl("llm_tokens_input_total", "Total number of input tokens to LLM")
    ),
    llmErrors: define(
        "llm_errors_total",
        () => new CounterImpl("llm_errors_total", "Total number of LLM errors")
    ),
    llmModelLoadTime: define(
        "llm_model_load_duration_seconds",
        () => new HistogramImpl(
            "llm_model_load_duration_seconds",
            "LLM model loading duration in seconds",
            [0.1, 0.5, 1, 5, 10, 30, 60]
        )
    ),

    // System metrics
    logEntries: define(
        "log_entries_total",
        () => new CounterImpl("log_entries_total", "Total number of log entries")
    ),
    errorsTotal: define(
        "errors_total",
        () => new CounterImpl("errors_total", "Total number of errors")
    ),
};

export async function measureTime<T>(
    metric: Histogram,
    labels: MetricLabels,
    fn: () => Promise<T>
): Promise<T> {
    const start = process.hrtime.bigint();
    try {
        return await fn();
    } finally {
        const duration =
            Number(process.hrtime.bigint() - start) / 1e9;
        metric.observe(labels, duration);
    }
}

export async function measureTimeSync<T>(
    metric: Histogram,
    labels: MetricLabels,
    fn: () => T
): Promise<T> {
    const start = process.hrtime.bigint();
    try {
        return fn();
    } finally {
        const duration =
            Number(process.hrtime.bigint() - start) / 1e9;
        metric.observe(labels, duration);
    }
}

// Export function to get metrics in Prometheus format (for backward compatibility)
// Note: This requires a Prometheus exporter if you want Prometheus format
export async function metricsEndpoint(): Promise<string> {
    // For now, return empty string or implement Prometheus exporter if needed
    // OpenTelemetry metrics are exported via OTLP, not Prometheus format
    return '# OpenTelemetry metrics are exported via OTLP endpoint\n# Use /metrics endpoint only if Prometheus exporter is configured\n';
}
