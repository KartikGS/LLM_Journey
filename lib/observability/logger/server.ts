import 'server-only';
import { LogEntry, Logger, LogLevel, LogContext, ErrorDetails } from '@/types/logs';
import { config } from '@/lib/config';
import { shouldLog } from './shared/levels';
import { normalizeError } from './shared/errors';
import { createLogger } from './shared/logger-factory';
import { getLoggerProvider } from '../otel/server';

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

function getOpenTelemetrySeverity(level: LogLevel): number {
    switch (level) {
        case 'error':
            return 17; // SEVERITY_NUMBER_ERROR
        case 'warn':
            return 13; // SEVERITY_NUMBER_WARN
        case 'info':
            return 9; // SEVERITY_NUMBER_INFO
        case 'debug':
            return 5; // SEVERITY_NUMBER_DEBUG
        default:
            return 9;
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
        runtime: context?.runtime ? context.runtime : 'server',
        error: error ? normalizeError(error) : undefined,
        context,
        version: config.observability.version,
        buildId: config.observability.buildId,
    };

    // Log to OpenTelemetry
    try {
        const loggerProvider = getLoggerProvider();
        if (loggerProvider) {
            const logger = loggerProvider.getLogger('llm-journey');
            
            logger.emit({
                severityNumber: getOpenTelemetrySeverity(level),
                severityText: level.toUpperCase(),
                body: message,
                attributes: {
                    'log.level': level,
                    'log.message': message,
                    'service.version': config.observability.version,
                    'service.build.id': config.observability.buildId,
                    'deployment.environment': process.env.NODE_ENV || 'development',
                    ...(error ? {
                        'error': true,
                        'error.name': error instanceof Error ? error.name : 'Unknown',
                        'error.message': error instanceof Error ? error.message : String(error),
                        'error.stack': error instanceof Error ? error.stack : undefined,
                    } : {}),
                    ...(context ? Object.fromEntries(
                        Object.entries(context).map(([k, v]) => [`log.context.${k}`, v])
                    ) : {}),
                },
            });
        }
    } catch (otelError) {
        // Silently fail OpenTelemetry logging, fall back to other methods
        if (isDevelopment) {
            console.error('[LOGGER] Failed to log to OpenTelemetry:', otelError);
        }
    }

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
