import { ClientLogPayload, Logger, LogLevel } from "@/types/logs";

function logClient(
    level: LogLevel,
    message: string,
    error?: unknown
) {
    const entry: ClientLogPayload = {
        level,
        message,
        error: error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
            }
            : error,
    };

    fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    }).catch(() => { });
}

export const loggerClient: Logger = {
    error(message: string, error?: unknown) {
        logClient('error', message, error);
    },
    warn(message: string) {
        logClient('warn', message);
    },
    info(message: string) {
        logClient('info', message);
    },
};