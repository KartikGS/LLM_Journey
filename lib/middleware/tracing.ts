/**
 * Tracing utilities for request correlation and context propagation
 */

export const TRACE_HEADER = 'x-trace-id';
export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Generate a unique trace/request ID
 */
export function generateTraceId(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Extract trace ID from headers, or generate a new one
 */
export function getOrCreateTraceId(traceId?: string | null): string {
    if (traceId) {
        return traceId;
    }
    return generateTraceId();
}

/**
 * Get trace ID from request headers
 */
export function getTraceIdFromHeaders(headers: Headers | Record<string, string>): string | null {
    if (headers instanceof Headers) {
        return headers.get(TRACE_HEADER) || headers.get(REQUEST_ID_HEADER);
    }
    const header = headers[TRACE_HEADER] || headers[REQUEST_ID_HEADER];
    return header || null;
}

