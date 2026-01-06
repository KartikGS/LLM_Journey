import { Logger, LogContext, LogLevel } from '@/types/logs';

export function createLogger(
    logFn: (
        level: LogLevel,
        message: string,
        error?: unknown,
        context?: LogContext
    ) => void | Promise<void>
): Logger {
    return {
        error(message, error, context) {
            logFn('error', message, error, context);
        },
        warn(message, context) {
            logFn('warn', message, undefined, context);
        },
        info(message, context) {
            logFn('info', message, undefined, context);
        },
        debug(message, context) {
            logFn('debug', message, undefined, context);
        },
    };
}
