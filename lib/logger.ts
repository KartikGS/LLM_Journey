import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { context, trace } from '@opentelemetry/api';

const SERVICE_NAME = 'llm-journey-server';

/**
 * Get the OpenTelemetry logger instance.
 */
function getLogger() {
    return logs.getLogger(SERVICE_NAME);
}

type LogAttributes = Record<string, unknown>;

/**
 * Emit a log record with automatic trace context correlation.
 */
function emitLog(
    severityNumber: SeverityNumber,
    severityText: string,
    message: string,
    attributes?: LogAttributes
) {
    const logger = getLogger();
    const span = trace.getSpan(context.active());
    const spanContext = span?.spanContext();

    logger.emit({
        severityNumber,
        severityText,
        body: message,
        attributes: {
            ...attributes,
            ...(spanContext && {
                trace_id: spanContext.traceId,
                span_id: spanContext.spanId,
            }),
        },
    });

    // Also log to console for development visibility
    const logLevel = severityText.toLowerCase();
    const logFn = logLevel === 'error' ? console.error :
        logLevel === 'warn' ? console.warn :
            logLevel === 'debug' ? console.debug :
                console.info;

    if (attributes && Object.keys(attributes).length > 0) {
        logFn(`[${severityText}] ${message}`, attributes);
    } else {
        logFn(`[${severityText}] ${message}`);
    }
}

/**
 * Parse arguments to support both Pino-style (object, message) and simple (message) signatures.
 */
function parseArgs(
    attrsOrMessage: LogAttributes | string,
    maybeMessage?: string
): { message: string; attributes?: LogAttributes } {
    if (typeof attrsOrMessage === 'string') {
        return { message: attrsOrMessage };
    }
    return {
        message: maybeMessage ?? '',
        attributes: attrsOrMessage,
    };
}

/**
 * OpenTelemetry-based logger with trace correlation.
 * 
 * Supports both call signatures:
 * - logger.info('Simple message')
 * - logger.info({ key: 'value' }, 'Message with attributes')
 */
const logger = {
    debug(attrsOrMessage: LogAttributes | string, maybeMessage?: string) {
        const { message, attributes } = parseArgs(attrsOrMessage, maybeMessage);
        emitLog(SeverityNumber.DEBUG, 'DEBUG', message, attributes);
    },

    info(attrsOrMessage: LogAttributes | string, maybeMessage?: string) {
        const { message, attributes } = parseArgs(attrsOrMessage, maybeMessage);
        emitLog(SeverityNumber.INFO, 'INFO', message, attributes);
    },

    warn(attrsOrMessage: LogAttributes | string, maybeMessage?: string) {
        const { message, attributes } = parseArgs(attrsOrMessage, maybeMessage);
        emitLog(SeverityNumber.WARN, 'WARN', message, attributes);
    },

    error(attrsOrMessage: LogAttributes | string, maybeMessage?: string) {
        const { message, attributes } = parseArgs(attrsOrMessage, maybeMessage);
        emitLog(SeverityNumber.ERROR, 'ERROR', message, attributes);
    },
};

export default logger;
