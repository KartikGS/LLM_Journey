export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogContext {
    requestId?: string;
    userId?: string;
    sessionId?: string;
    component?: string;
    metadata?: Record<string, unknown>;
    url?: string;
    method?: string;
    userAgent?: string;
    [key: string]: unknown;
}

export interface ErrorDetails {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
    cause?: unknown;
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    env?: string;
    runtime: 'browser' | 'server';
    error?: ErrorDetails | unknown;
    context?: LogContext;
    version?: string;
    buildId?: string;
}

export type ClientLogPayload = {
    level: LogLevel;
    message: string;
    error?: ErrorDetails | unknown;
    context?: LogContext;
};

export type Logger = {
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, error?: unknown, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
};