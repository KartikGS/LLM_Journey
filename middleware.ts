import { NextRequest, NextResponse } from "next/server";
import {
    getOrCreateTraceId,
    getTraceIdFromHeaders,
    TRACE_HEADER,
} from "./lib/middleware/tracing";

export function middleware(request: NextRequest) {
    // Get or create trace ID
    const existingTraceId = getTraceIdFromHeaders(request.headers);
    const traceId = getOrCreateTraceId(existingTraceId);

    // Extract request headers
    const requestHeaders = new Headers(request.headers);
    // Add trace ID to request headers for server-side correlation
    requestHeaders.set(TRACE_HEADER, traceId);

    // Create response with request header
    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
    // Add trace ID to response headers for client-side correlation
    response.headers.set(TRACE_HEADER, traceId);

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
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|onnx)).*)",
    ],
};
