import 'server-only';
import { LogEntry, Logger, LogLevel } from '@/types/logs';

const AXIOM_API_TOKEN = process.env.AXIOM_API_TOKEN;
const AXIOM_DATASET = process.env.AXIOM_DATASET;
const AXIOM_URL = process.env.AXIOM_URL;

const isDevelopment = process.env.NODE_ENV === 'development';

function fallbackConsole(level: LogLevel, message: string, error?: unknown) {
    switch (level) {
        case 'error':
            console.error(message, error);
            break;
        case 'warn':
            console.warn(message);
            break;
        case 'info':
            console.log(message);
            break;
    }
}

function logServer(
    level: LogLevel,
    message: string,
    error?: unknown
) {
    if (isDevelopment || !AXIOM_API_TOKEN || !AXIOM_DATASET || !AXIOM_URL) {
        fallbackConsole(level, message, error);
        return;
    }

    const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        runtime: 'server',
        error: error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
            }
            : error,
    };

    fetch(`${AXIOM_URL}/${AXIOM_DATASET}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${AXIOM_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([entry]),
    }).catch(() => {
        fallbackConsole(level, message, error);
    });
}

export const loggerServer: Logger = {
    error(message: string, error?: unknown) {
        logServer('error', message, error);
    },
    warn(message: string) {
        logServer('warn', message);
    },
    info(message: string) {
        logServer('info', message);
    },
};
