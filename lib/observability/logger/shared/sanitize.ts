import { LogContext } from '@/types/logs';

const MAX_STRING_LENGTH = 300;
const MAX_KEYS = 25;
const MAX_DEPTH = 2;

const ALLOWED_CONTEXT_KEYS = new Set<string>([
    'userAgent',
    'url',
    'referrer',
    'language',
    'platform',
    'screenWidth',
    'screenHeight',
    'sessionId',
    'requestId',
    'feature',
    'component',
    'route',
    'action',
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return (
        typeof value === 'object' &&
        value !== null &&
        Object.getPrototypeOf(value) === Object.prototype
    );
}

function sanitizeValue(
    value: unknown,
    depth: number
): string | number | boolean | null | undefined | Record<string, unknown> {
    if (value == null) return value;

    if (typeof value === 'string') {
        return value.length > MAX_STRING_LENGTH
            ? value.slice(0, MAX_STRING_LENGTH) + '…'
            : value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }

    if (Array.isArray(value)) {
        // Arrays are dangerous for cardinality → stringify safely
        return `[array(${value.length})]`;
    }

    if (isPlainObject(value)) {
        if (depth >= MAX_DEPTH) {
            return '[object]';
        }

        const entries = Object.entries(value).slice(0, MAX_KEYS);
        const result: Record<string, unknown> = {};

        for (const [k, v] of entries) {
            result[k] = sanitizeValue(v, depth + 1);
        }

        return result;
    }

    // functions, symbols, bigint, etc.
    return String(value);
}

export function sanitizeContext(
    context: unknown
): LogContext | undefined {
    if (!isPlainObject(context)) return undefined;

    const entries = Object.entries(context)
        .filter(([key]) => ALLOWED_CONTEXT_KEYS.has(key))
        .slice(0, MAX_KEYS);

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of entries) {
        sanitized[key] = sanitizeValue(value, 0);
    }

    return sanitized;
}
