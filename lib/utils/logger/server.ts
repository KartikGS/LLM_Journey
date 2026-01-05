import 'server-only';
import { LogEntry, Logger, LogLevel, LogContext, ErrorDetails } from '@/types/logs';
import { config } from '@/lib/config';

const AXIOM_API_TOKEN = process.env.AXIOM_API_TOKEN;
const AXIOM_DATASET = process.env.AXIOM_DATASET;
const AXIOM_URL = process.env.AXIOM_URL;

const isDevelopment = process.env.NODE_ENV === 'development';
const logLevelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

function shouldLog(level: LogLevel): boolean {
    const configuredLevel = config.observability.logLevel;
    return logLevelPriority[level] >= logLevelPriority[configuredLevel];
}

function normalizeError(error: unknown): ErrorDetails | unknown {
    if (error instanceof Error) {
        const errorDetails: ErrorDetails = {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };

        // Add code if available (e.g., from Node.js errors)
        if ('code' in error && error.code) {
            errorDetails.code = error.code as string | number;
        }

        // Add cause if available (Error.cause in newer Node.js)
        if ('cause' in error && error.cause) {
            errorDetails.cause = error.cause;
        }

        return errorDetails;
    }
    return error;
}

function fallbackConsole(level: LogLevel, message: string, error?: unknown, context?: LogContext) {
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    switch (level) {
        case 'error':
            console.error(`[${level.toUpperCase()}] ${message}${contextStr}`, error || '');
            break;
        case 'warn':
            console.warn(`[${level.toUpperCase()}] ${message}${contextStr}`, error || '');
            break;
        case 'info':
            console.log(`[${level.toUpperCase()}] ${message}${contextStr}`, error || '');
            break;
        case 'debug':
            console.debug(`[${level.toUpperCase()}] ${message}${contextStr}`, error || '');
            break;
    }
}

async function logServer(
    level: LogLevel,
    message: string,
    error?: unknown,
    context?: LogContext
) {
    if (!shouldLog(level)) {
        return;
    }

    const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        runtime: 'server',
        error: error ? normalizeError(error) : undefined,
        context,
        version: config.observability.version,
        buildId: config.observability.buildId,
    };

    // Always log to console in development
    if (isDevelopment) {
        fallbackConsole(level, message, error, context);
        return;
    }

    // Send to Axiom in production (or if explicitly configured)
    if (AXIOM_API_TOKEN && AXIOM_DATASET && AXIOM_URL) {
        try {
            const response = await fetch(`${AXIOM_URL}/${AXIOM_DATASET}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${AXIOM_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([entry]),
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                if (isDevelopment) {
                    console.error(`[LOGGER] Failed to send log to Axiom: ${response.status} ${errorText}`);
                }
                // Fallback to console if Axiom fails
                if (!isDevelopment) {
                    fallbackConsole(level, message, error, context);
                }
            }
        } catch (fetchError) {
            if (isDevelopment) {
                console.error('[LOGGER] Error sending log to Axiom:', fetchError);
            }
            // Fallback to console if fetch fails
            if (!isDevelopment) {
                fallbackConsole(level, message, error, context);
            }
        }
    } else if (!isDevelopment) {
        // Production but no Axiom config - use console
        fallbackConsole(level, message, error, context);
    }
}

export const loggerServer: Logger = {
    error(message: string, error?: unknown, context?: LogContext) {
        logServer('error', message, error, context);
    },
    warn(message: string, context?: LogContext) {
        logServer('warn', message, undefined, context);
    },
    info(message: string, context?: LogContext) {
        logServer('info', message, undefined, context);
    },
    debug(message: string, context?: LogContext) {
        logServer('debug', message, undefined, context);
    },
};
