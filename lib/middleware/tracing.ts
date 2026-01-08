/**
 * Tracing utilities using OpenTelemetry
 */

import { trace, context, propagation, SpanStatusCode } from '@opentelemetry/api';

export const TRACE_HEADER = 'x-trace-id';
export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Get the current trace ID from the active span
 */
export function getCurrentTraceId(): string | undefined {
    const span = trace.getActiveSpan();
    if (!span) return undefined;
    
    const spanContext = span.spanContext();
    return spanContext.traceId;
}

/**
 * Get the current span ID
 */
export function getCurrentSpanId(): string | undefined {
    const span = trace.getActiveSpan();
    if (!span) return undefined;
    
    const spanContext = span.spanContext();
    return spanContext.spanId;
}

/**
 * Extract trace context from headers (W3C Trace Context)
 */
export function extractTraceContext(headers: Headers | Record<string, string>): any {
    const carrier: Record<string, string> = {};
    
    if (headers instanceof Headers) {
        headers.forEach((value, key) => {
            carrier[key.toLowerCase()] = value;
        });
    } else {
        Object.entries(headers).forEach(([key, value]) => {
            carrier[key.toLowerCase()] = value;
        });
    }
    
    return propagation.extract(context.active(), carrier);
}

/**
 * Inject trace context into headers (W3C Trace Context)
 */
export function injectTraceContext(headers: Headers | Record<string, string>): void {
    const carrier: Record<string, string> = {};
    propagation.inject(context.active(), carrier);
    
    if (headers instanceof Headers) {
        Object.entries(carrier).forEach(([key, value]) => {
            headers.set(key, value);
        });
    } else {
        Object.entries(carrier).forEach(([key, value]) => {
            headers[key] = value;
        });
    }
}

/**
 * Get trace ID from headers (for backward compatibility)
 */
export function getTraceIdFromHeaders(headers: Headers | Record<string, string>): string | null {
    if (headers instanceof Headers) {
        // Try W3C Trace Context first
        const traceParent = headers.get('traceparent');
        if (traceParent) {
            // Extract trace ID from traceparent (format: version-traceid-spanid-flags)
            const parts = traceParent.split('-');
            if (parts.length >= 2) {
                return parts[1];
            }
        }
        // Fallback to custom headers
        return headers.get(TRACE_HEADER) || headers.get(REQUEST_ID_HEADER);
    }
    
    // Try W3C Trace Context first
    const traceParent = headers['traceparent'] || headers['Traceparent'];
    if (traceParent) {
        const parts = String(traceParent).split('-');
        if (parts.length >= 2) {
            return parts[1];
        }
    }
    
    // Fallback to custom headers
    return headers[TRACE_HEADER] || headers[REQUEST_ID_HEADER] || null;
}

/**
 * Generate a unique trace/request ID (for backward compatibility)
 */
export function generateTraceId(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Extract trace ID from headers, or generate a new one (for backward compatibility)
 */
export function getOrCreateTraceId(traceId?: string | null): string {
    if (traceId) {
        return traceId;
    }
    return generateTraceId();
}
