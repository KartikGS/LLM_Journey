const isDevelopment = process.env.NODE_ENV === 'development';

// Detect if we're in the browser
const isBrowser = typeof window !== 'undefined';

// Axiom configuration (server-side only)
const AXIOM_API_TOKEN = process.env.AXIOM_API_TOKEN;
const AXIOM_DATASET = process.env.AXIOM_DATASET;
const AXIOM_URL = process.env.AXIOM_URL;

type LogLevel = 'error' | 'warn' | 'info';

function fallbackConsole(
    level: LogLevel,
    message: string,
    error?: unknown
) {
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

/**
 * Send logs to Axiom via API route (browser) or directly (server)
 * Fire-and-forget to avoid blocking the main thread
 */
function sendToAxiom(level: LogLevel, message: string, error?: unknown) {
    const logEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        runtime: isBrowser ? 'browser' : 'server',
        error: error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
            }
            : error,
    };

    if (isBrowser) {
        // In browser: send to API route (which has the token)
        fetch('/api/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logEntry),
        }).catch((err) => {
            console.error('Failed to send log:', err);
        });
    } else {
        // Server-side: send directly to Axiom
        if (!AXIOM_API_TOKEN || !AXIOM_DATASET || !AXIOM_URL) {
            fallbackConsole(level, message, error);
            return;
        }

        fetch(`${AXIOM_URL}/${AXIOM_DATASET}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AXIOM_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([logEntry]),
        }).catch((err) => {
            console.error('Failed to send log to Axiom:', err);
        });
    }
}

export const logger = {
    error: (message: string, error?: unknown) => {
        if (isDevelopment) {
            console.error(message, error);
        } else {
            sendToAxiom('error', message, error);
            console.error(message, error);
        }
    },
    warn: (message: string) => {
        if (isDevelopment) {
            console.warn(message);
        } else {
            sendToAxiom('warn', message);
            console.warn(message);
        }
    },
    info: (message: string) => {
        if (isDevelopment) {
            console.log(message);
        } else {
            sendToAxiom('info', message);
            console.log(message);
        }
    },
};