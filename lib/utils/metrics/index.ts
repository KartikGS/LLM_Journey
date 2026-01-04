import { config } from '@/lib/config';

export interface MetricLabels {
    [key: string]: string | number;
}

export interface Counter {
    inc(labels?: MetricLabels, value?: number): void;
    get(labels?: MetricLabels): number;
    reset(): void;
}

export interface Gauge {
    set(labels: MetricLabels, value: number): void;
    inc(labels?: MetricLabels, value?: number): void;
    dec(labels?: MetricLabels, value?: number): void;
    get(labels?: MetricLabels): number;
    reset(): void;
}

export interface Histogram {
    observe(labels: MetricLabels, value: number): void;
    get(labels?: MetricLabels): Array<{ le: string; count: number }>;
    reset(): void;
}

class CounterImpl implements Counter {
    private counts: Map<string, number> = new Map();

    private getKey(labels?: MetricLabels): string {
        if (!labels || Object.keys(labels).length === 0) {
            return '__default__';
        }
        return JSON.stringify(labels);
    }

    inc(labels?: MetricLabels, value: number = 1): void {
        if (!config.observability.metricsEnabled) return;
        
        const key = this.getKey(labels);
        const current = this.counts.get(key) || 0;
        this.counts.set(key, current + value);
    }

    get(labels?: MetricLabels): number {
        const key = this.getKey(labels);
        return this.counts.get(key) || 0;
    }

    reset(): void {
        this.counts.clear();
    }
}

class GaugeImpl implements Gauge {
    private values: Map<string, number> = new Map();

    private getKey(labels?: MetricLabels): string {
        if (!labels || Object.keys(labels).length === 0) {
            return '__default__';
        }
        return JSON.stringify(labels);
    }

    set(labels: MetricLabels, value: number): void {
        if (!config.observability.metricsEnabled) return;
        
        const key = this.getKey(labels);
        this.values.set(key, value);
    }

    inc(labels?: MetricLabels, value: number = 1): void {
        if (!config.observability.metricsEnabled) return;
        
        const key = this.getKey(labels);
        const current = this.values.get(key) || 0;
        this.values.set(key, current + value);
    }

    dec(labels?: MetricLabels, value: number = 1): void {
        if (!config.observability.metricsEnabled) return;
        
        const key = this.getKey(labels);
        const current = this.values.get(key) || 0;
        this.values.set(key, current - value);
    }

    get(labels?: MetricLabels): number {
        const key = this.getKey(labels);
        return this.values.get(key) || 0;
    }

    reset(): void {
        this.values.clear();
    }
}

class HistogramImpl implements Histogram {
    private buckets: number[] = [0.1, 0.5, 1, 5, 10, 30, 60, 300, 600, 3600]; // seconds
    private observations: Map<string, number[]> = new Map();

    private getKey(labels?: MetricLabels): string {
        if (!labels || Object.keys(labels).length === 0) {
            return '__default__';
        }
        return JSON.stringify(labels);
    }

    observe(labels: MetricLabels, value: number): void {
        if (!config.observability.metricsEnabled) return;
        
        const key = this.getKey(labels);
        const obs = this.observations.get(key) || [];
        obs.push(value);
        this.observations.set(key, obs);
    }

    get(labels?: MetricLabels): Array<{ le: string; count: number }> {
        const key = this.getKey(labels);
        const obs = this.observations.get(key) || [];
        
        const result = this.buckets.map(le => ({
            le: le.toString(),
            count: obs.filter(v => v <= le).length,
        }));
        
        // Add +Inf bucket
        result.push({
            le: '+Inf',
            count: obs.length,
        });
        
        return result;
    }

    reset(): void {
        this.observations.clear();
    }

    // Helper to calculate percentiles
    getPercentile(labels: MetricLabels, percentile: number): number {
        const key = this.getKey(labels);
        const obs = this.observations.get(key) || [];
        if (obs.length === 0) return 0;
        
        const sorted = [...obs].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)] || 0;
    }
}

// Global metrics storage
const metrics: Map<string, Counter | Gauge | Histogram> = new Map();

function createCounter(name: string): Counter {
    const counter = new CounterImpl();
    metrics.set(name, counter);
    return counter;
}

function createGauge(name: string): Gauge {
    const gauge = new GaugeImpl();
    metrics.set(name, gauge);
    return gauge;
}

function createHistogram(name: string): Histogram {
    const histogram = new HistogramImpl();
    metrics.set(name, histogram);
    return histogram;
}

function getMetric(name: string): Counter | Gauge | Histogram | undefined {
    return metrics.get(name);
}

// Predefined metrics
export const metricsRegistry = {
    // API metrics
    apiRequests: createCounter('api_requests_total'),
    apiRequestDuration: createHistogram('api_request_duration_seconds'),
    apiErrors: createCounter('api_errors_total'),
    
    // LLM metrics
    llmGenerations: createCounter('llm_generations_total'),
    llmGenerationDuration: createHistogram('llm_generation_duration_seconds'),
    llmTokensGenerated: createCounter('llm_tokens_generated_total'),
    llmTokensInput: createCounter('llm_tokens_input_total'),
    llmErrors: createCounter('llm_errors_total'),
    llmModelLoadTime: createHistogram('llm_model_load_duration_seconds'),
    
    // System metrics
    logEntries: createCounter('log_entries_total'),
    errorsTotal: createCounter('errors_total'),
};

// Helper function to measure execution time
export async function measureTime<T>(
    metric: Histogram,
    labels: MetricLabels,
    fn: () => Promise<T>
): Promise<T> {
    const start = Date.now();
    try {
        const result = await fn();
        const duration = (Date.now() - start) / 1000; // Convert to seconds
        metric.observe(labels, duration);
        return result;
    } catch (error) {
        const duration = (Date.now() - start) / 1000;
        metric.observe(labels, duration);
        throw error;
    }
}

// Helper function to measure synchronous execution time
export function measureTimeSync<T>(
    metric: Histogram,
    labels: MetricLabels,
    fn: () => T
): T {
    const start = Date.now();
    try {
        const result = fn();
        const duration = (Date.now() - start) / 1000; // Convert to seconds
        metric.observe(labels, duration);
        return result;
    } catch (error) {
        const duration = (Date.now() - start) / 1000;
        metric.observe(labels, duration);
        throw error;
    }
}

// Export metric registry access
export { metrics, getMetric, createCounter, createGauge, createHistogram };

