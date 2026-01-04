export type LogLevel = 'error' | 'warn' | 'info';

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    env?: string;
    runtime: 'browser' | 'server';
    error?: unknown;
}

export type ClientLogPayload = {
    level: LogLevel;
    message: string;
    error?: unknown;
};

export type Logger = {
    info(message: string): void;
    warn(message: string): void;
    error(message: string, error?: unknown): void;
};