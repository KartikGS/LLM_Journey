import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateTraceId, getTraceIdFromHeaders, TRACE_HEADER } from './lib/middleware/tracing';

export function middleware(request: NextRequest) {
    // Get or create trace ID
    const existingTraceId = getTraceIdFromHeaders(request.headers);
    const traceId = getOrCreateTraceId(existingTraceId);

    // Create response with trace ID header
    const response = NextResponse.next();

    // Add trace ID to response headers for client-side correlation
    response.headers.set(TRACE_HEADER, traceId);

    // Also add to request headers for server-side access
    request.headers.set(TRACE_HEADER, traceId);

    return response;
}

// Configure which routes to run middleware on
export const config = {
    // Match all routes except static files and API routes that don't need tracing
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files (images, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|onnx)).*)',
    ],
};

