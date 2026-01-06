import { ErrorDetails } from '@/types/logs';

export function normalizeError(error: unknown): ErrorDetails | unknown {
    if (!(error instanceof Error)) {
        return error;
    }

    const details: ErrorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
    };

    if ('cause' in error && error.cause) {
        details.cause = error.cause;
    }

    if ('code' in error && error.code) {
        details.code = error.code as string | number;
    }

    return details;
}
