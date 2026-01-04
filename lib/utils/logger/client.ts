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
    entry: ClientLogPayload;
    retries: number;
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
    if (!isOnline || logQueue.length === 0) {
        return;
    }

    const batch = logQueue.splice(0, config.observability.clientLogBatchSize);
    if (batch.length === 0) return;

    sendLogBatch(batch.map(q => q.entry));
    
    // Clear timer if queue is empty
    if (logQueue.length === 0 && batchTimer) {
        clearTimeout(batchTimer);
        batchTimer = null;
    }
}

async function sendLogBatch(entries: ClientLogPayload[]): Promise<void> {
    if (entries.length === 0) return;

    try {
        const response = await fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entries),
        });

        if (!response.ok) {
            throw new Error(`Log API returned ${response.status}`);
        }
    } catch (error) {
        // Re-queue failed logs for retry (up to retry limit)
        entries.forEach(entry => {
            const existing = logQueue.find(q => q.entry === entry);
            if (existing) {
                if (existing.retries < config.observability.clientLogRetryAttempts) {
                    existing.retries++;
                } else {
                    // Max retries reached, remove from queue
                    const index = logQueue.indexOf(existing);
                    if (index > -1) {
                        logQueue.splice(index, 1);
                    }
                    // Log to console as fallback
                    console.error('[LOGGER] Failed to send log after max retries:', entry);
                }
            }
        });
    }
}

async function sendLogWithRetry(
    entry: ClientLogPayload,
    retries: number = 0
): Promise<void> {
    if (!isOnline) {
        // Queue for later when online
        logQueue.push({ entry, retries: 0 });
        return;
    }

    if (config.observability.clientLogBatchingEnabled) {
        // Add to batch queue
        logQueue.push({ entry, retries: 0 });
        
        // Schedule batch flush
        if (!batchTimer) {
            batchTimer = setTimeout(() => {
                flushLogQueue();
            }, config.observability.clientLogBatchDelay);
        }
        
        // Flush immediately if batch is full
        if (logQueue.length >= config.observability.clientLogBatchSize) {
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
                    sendLogWithRetry(entry, retries + 1);
                }, config.observability.clientLogRetryDelay * (retries + 1));
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

    sendLogWithRetry(entry);
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

// Flush logs on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        flushClientLogs();
    });
    
    // Also flush on visibility change (page hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            flushClientLogs();
        }
    });
}