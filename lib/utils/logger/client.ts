'use client';

import { ClientLogPayload, Logger, LogLevel, LogContext, ErrorDetails } from "@/types/logs";
import { config } from "@/lib/config";

const logLevelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

function shouldLog(level: LogLevel): boolean {
    const configuredLevel = config.observability.clientLogLevel;
    return logLevelPriority[level] >= logLevelPriority[configuredLevel];
}

// Generate or retrieve session ID
function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    const key = '__llm_journey_session_id__';
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
        sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        sessionStorage.setItem(key, sessionId);
    }
    return sessionId;
}

// Generate request ID for current request
function generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

function normalizeError(error: unknown): ErrorDetails | unknown {
    if (error instanceof Error) {
        const errorDetails: ErrorDetails = {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };

        if ('cause' in error && error.cause) {
            errorDetails.cause = error.cause;
        }

        return errorDetails;
    }
    return error;
}

function getBrowserContext(): LogContext {
    if (typeof window === 'undefined') {
        return {};
    }

    return {
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer || undefined,
        language: navigator.language,
        platform: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
    };
}

// Log queue for batching
interface QueuedLog {
    requestId: string;
    entry: ClientLogPayload;
    retries: number;
    inFlight: boolean;
}

let logQueue: QueuedLog[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;
let isOnline = true;

if (typeof window !== 'undefined') {
    isOnline = navigator.onLine;
    window.addEventListener('online', () => {
        isOnline = true;
        flushLogQueue();
    });
    window.addEventListener('offline', () => {
        isOnline = false;
    });
}

function flushLogQueue() {
    if (!isOnline || logQueue.length === 0) return;

    const batch = logQueue
        .filter(q => !q.inFlight)
        .slice(0, config.observability.clientLogBatchSize);

    if (batch.length === 0) return;

    batch.forEach(q => q.inFlight = true);
    sendLogBatch(batch);
}

async function sendLogBatch(batch: QueuedLog[]): Promise<void> {
    try {
        const response = await fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batch.map(b => b.entry)),
        });

        if (!response.ok) {
            throw new Error(`Log API returned ${response.status}`);
        }

        // remove successful entries
        logQueue = logQueue.filter(q => !batch.some(b => b.requestId === q.requestId));

        // cleanup timer
        if (logQueue.length === 0 && batchTimer) {
            clearTimeout(batchTimer);
            batchTimer = null;
        }

    } catch (error) {
        batch.forEach(q => {
            q.inFlight = false;
            q.retries++;

            if (q.retries >= config.observability.clientLogRetryAttempts) {
                logQueue = logQueue.filter(item => item.requestId !== q.requestId);
                console.error('[LOGGER] Failed to send log after max retries:', q.entry);
            }
        });
        if (!batchTimer && logQueue.some(q => !q.inFlight)) {
            batchTimer = setTimeout(flushLogQueue, config.observability.clientLogRetryDelay);
        }
    }
}

async function sendLogWithRetry(
    requestId: string,
    entry: ClientLogPayload,
    retries: number = 0
): Promise<void> {
    if (!isOnline) {
        // Queue for later when online
        if (!logQueue.some(q => q.requestId === requestId)) {
            if (logQueue.length >= config.observability.clientMaxQueueSize) {
                logQueue.shift(); // drop oldest
            }
            logQueue.push({ requestId, entry, retries: 0, inFlight: false });
        }
        return;
    }

    if (config.observability.clientLogBatchingEnabled) {
        // Add to batch queue
        if (!logQueue.some(q => q.requestId === requestId)) {
            if (logQueue.length >= config.observability.clientMaxQueueSize) {
                logQueue.shift(); // drop oldest
            }
            logQueue.push({ requestId, entry, retries: 0, inFlight: false });
        }

        // Schedule batch flush
        if (!batchTimer) {
            batchTimer = setTimeout(() => {
                flushLogQueue();
            }, config.observability.clientLogBatchDelay);
        }

        // Flush immediately if batch is full
        const readyCount = logQueue.filter(q => !q.inFlight).length;
        if (readyCount >= config.observability.clientLogBatchSize) {
            if (batchTimer) {
                clearTimeout(batchTimer);
                batchTimer = null;
            }
            flushLogQueue();
        }
    } else {
        // Send immediately without batching
        try {
            const response = await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([entry]),
            });

            if (!response.ok) {
                throw new Error(`Log API returned ${response.status}`);
            }
        } catch (error) {
            if (retries < config.observability.clientLogRetryAttempts) {
                // Retry after delay
                setTimeout(() => {
                    sendLogWithRetry(requestId, entry, retries + 1);
                }, config.observability.clientLogRetryDelay * Math.pow(2, retries));
            } else {
                console.error('[LOGGER] Failed to send log after max retries:', entry);
            }
        }
    }
}

function logClient(
    level: LogLevel,
    message: string,
    error?: unknown,
    context?: LogContext
) {
    if (!shouldLog(level)) {
        return;
    }

    const browserContext = getBrowserContext();
    const sessionId = getSessionId();
    const requestId = generateRequestId();

    const entry: ClientLogPayload = {
        level,
        message,
        error: error ? normalizeError(error) : undefined,
        context: {
            ...browserContext,
            ...context,
            sessionId,
            requestId,
        },
    };

    sendLogWithRetry(requestId, entry);
}

export const loggerClient: Logger = {
    error(message: string, error?: unknown, context?: LogContext) {
        logClient('error', message, error, context);
    },
    warn(message: string, context?: LogContext) {
        logClient('warn', message, undefined, context);
    },
    info(message: string, context?: LogContext) {
        logClient('info', message, undefined, context);
    },
    debug(message: string, context?: LogContext) {
        logClient('debug', message, undefined, context);
    },
};

// Export function to manually flush logs (useful for page unload)
export function flushClientLogs() {
    if (batchTimer) {
        clearTimeout(batchTimer);
        batchTimer = null;
    }
    flushLogQueue();
}

function sendLogBatchBeacon(batch: QueuedLog[]) {
    if (!navigator.sendBeacon) return false;

    const payload = JSON.stringify(batch.map(b => b.entry));
    return navigator.sendBeacon('/api/log', payload);
}

export function flushClientLogsUsingBeacon() {
    if (batchTimer) {
        clearTimeout(batchTimer);
        batchTimer = null;
    }

    if (logQueue.length === 0) return;

    const batch = logQueue
        .filter(q => !q.inFlight)
        .slice(0, config.observability.clientLogBatchSize);

    if (batch.length === 0) return;

    batch.forEach(q => q.inFlight = true);

    const sent = sendLogBatchBeacon(batch);

    if (sent) {
        logQueue = logQueue.filter(
            q => !batch.some(b => b.requestId === q.requestId)
        );
    } else {
        sendLogBatch(batch);
    }
}

// Flush logs on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        flushClientLogsUsingBeacon();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            flushClientLogsUsingBeacon();
        }
    });
}
