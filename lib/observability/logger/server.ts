import 'server-only';
import { LogEntry, Logger, LogLevel, LogContext, ErrorDetails } from '@/types/logs';
import { config } from '@/lib/config';
import { shouldLog } from './shared/levels';
import { normalizeError } from './shared/errors';
import { createLogger } from './shared/logger-factory';

const AXIOM_API_TOKEN = process.env.AXIOM_API_TOKEN;
const AXIOM_DATASET = process.env.AXIOM_DATASET;
const AXIOM_URL = process.env.AXIOM_URL;

const isDevelopment = process.env.NODE_ENV !== 'production';

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
    if (!shouldLog(level, config.observability.clientLogLevel)) {
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
            void fetch(`${AXIOM_URL}/${AXIOM_DATASET}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${AXIOM_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([entry]),
            }).catch((err) => {
                if (isDevelopment) {
                    console.error('[LOGGER] Failed to send log to Axiom:', err);
                }

                if (!isDevelopment) {
                    fallbackConsole(level, message, error, context);
                }
            });
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

export const loggerServer = createLogger(logServer);
