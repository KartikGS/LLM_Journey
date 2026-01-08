export type MetricLabels = Record<string, string>;

export interface Counter {
    inc(labels?: MetricLabels, value?: number): void;
    // get(labels?: MetricLabels): number;
    // reset(): void;
}

export interface Gauge {
    set(labels: MetricLabels, value: number): void;
    inc(labels?: MetricLabels, value?: number): void;
    dec(labels?: MetricLabels, value?: number): void;
    // get(labels?: MetricLabels): number;
    // reset(): void;
}

export interface Histogram {
    observe(labels: MetricLabels, value: number): void;
    // get(labels?: MetricLabels): Array<{ le: string; count: number }>;
    // reset(): void;
}