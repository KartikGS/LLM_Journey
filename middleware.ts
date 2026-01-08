import { NextRequest, NextResponse } from "next/server";
import { trace, context } from '@opentelemetry/api';
import { extractTraceContext, injectTraceContext, getTraceIdFromHeaders } from "./lib/middleware/tracing";
import { SEMATTRS_HTTP_METHOD, SEMATTRS_HTTP_URL, SEMATTRS_HTTP_ROUTE, SEMATTRS_HTTP_STATUS_CODE } from '@opentelemetry/semantic-conventions';

export function middleware(request: NextRequest) {
    // Extract trace context from incoming request
    const extractedContext = extractTraceContext(request.headers);
    
    // Create a span for the request
    const tracer = trace.getTracer('llm-journey-middleware');
    
    return context.with(extractedContext, () => {
        const span = tracer.startSpan('http.request', {
            attributes: {
                [SEMATTRS_HTTP_METHOD]: request.method,
                [SEMATTRS_HTTP_URL]: request.url,
                [SEMATTRS_HTTP_ROUTE]: request.nextUrl.pathname,
            },
        });
        
        return context.with(trace.setSpan(context.active(), span), () => {
            // Extract request headers
            const requestHeaders = new Headers(request.headers);
            
            // Inject trace context into request headers for server-side correlation
            injectTraceContext(requestHeaders);
            
            // Also add trace ID for backward compatibility
            const traceId = span.spanContext().traceId;
            requestHeaders.set('x-trace-id', traceId);
            
            // Create response with request header
            const response = NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
            
            // Inject trace context into response headers
            injectTraceContext(response.headers);
            
            // Add trace ID to response headers for client-side correlation
            response.headers.set('x-trace-id', traceId);
            
            // Note: Span will be ended by the route handler or automatically by OpenTelemetry
            // We don't end it here to allow route handlers to add attributes
            
            return response;
        });
    });
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
