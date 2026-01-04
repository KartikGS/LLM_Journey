/**
 * Tracing utilities for request correlation and context propagation
 */

export const TRACE_HEADER = 'x-trace-id';
export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Generate a unique trace/request ID
 */
export function generateTraceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
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

