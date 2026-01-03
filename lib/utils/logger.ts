const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
    error: (message: string, error?: unknown) => {
        if (isDevelopment) {
            console.error(message, error);
        } else {
            // In production, send to your logging service (e.g., Sentry, LogRocket, etc.)
            // Example: logErrorToService(message, error);
        }
    },
    warn: (message: string) => {
        if (isDevelopment) {
            console.warn(message);
        }
    },
    info: (message: string) => {
        if (isDevelopment) {
            console.log(message);
        }
    },
};