import { NextRequest, NextResponse } from 'next/server';
import { loggerServer } from '@/lib/observability/logger/server';
import { ClientLogPayload } from '@/types/logs';
import { getTraceIdFromHeaders } from '@/lib/middleware/tracing';
import { metrics } from '@/lib/observability/metrics';
import { sanitizeContext } from '@/lib/observability/logger/shared/sanitize';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { SEMATTRS_HTTP_METHOD, SEMATTRS_HTTP_URL, SEMATTRS_HTTP_STATUS_CODE } from '@opentelemetry/semantic-conventions';

// export const runtime = 'edge';

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    const tracer = trace.getTracer('llm-journey-api');
    const span = tracer.startSpan('api.log', {
        attributes: {
            [SEMATTRS_HTTP_METHOD]: 'POST',
            [SEMATTRS_HTTP_URL]: req.url,
        },
    });

    try {
        // Extract trace ID from request headers
        const traceId = getTraceIdFromHeaders(req.headers);

        // Get request metadata
        const requestMetadata = {
            ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        };

        // Parse request body - support both single log and batch
        let body: unknown;
        try {
            body = await req.json();
        } catch (e) {
            metrics.apiErrors.inc({ endpoint: '/api/log', reason: 'invalid_json' });
            loggerServer.warn('Invalid JSON in log request', { url: req.url });
            span.setStatus({ code: SpanStatusCode.ERROR, message: 'Invalid JSON' });
            span.setAttribute(SEMATTRS_HTTP_STATUS_CODE, 400);
            span.end();
            return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
        }


        const logs: ClientLogPayload[] = Array.isArray(body) ? body : [body];
        if (logs.length > 100) {
            span.setStatus({ code: SpanStatusCode.ERROR, message: 'Too many log entries' });
            span.setAttribute(SEMATTRS_HTTP_STATUS_CODE, 413);
            span.end();
            return NextResponse.json(
                { success: false, error: 'Too many log entries' },
                { status: 413 }
            );
        }

        // Process each log entry
        for (const data of logs) {
            // Enhance context with request metadata and trace ID
            const enhancedContext = {
                runtime: 'client' as 'client' | 'server',
                client: sanitizeContext(data.context),
                server: {
                    traceId: traceId,
                    ...requestMetadata,
                },
            };

            // Increment log counter
            metrics.logEntries.inc({ level: data.level });

            switch (data.level) {
                case 'error':
                    metrics.apiErrors.inc({ endpoint: '/api/log' });
                    loggerServer.error(data.message, data.error, enhancedContext);
                    span.addEvent('log.error', {
                        'log.message': data.message,
                        'log.level': 'error',
                    });
                    break;
                case 'warn':
                    loggerServer.warn(data.message, enhancedContext);
                    span.addEvent('log.warn', {
                        'log.message': data.message,
                        'log.level': 'warn',
                    });
                    break;
                case 'info':
                    loggerServer.info(data.message, enhancedContext);
                    span.addEvent('log.info', {
                        'log.message': data.message,
                        'log.level': 'info',
                    });
                    break;
                case 'debug':
                    loggerServer.debug(data.message, enhancedContext);
                    span.addEvent('log.debug', {
                        'log.message': data.message,
                        'log.level': 'debug',
                    });
                    break;
            }
        }

        // Track API metrics
        metrics.apiRequests.inc({ endpoint: '/api/log', method: 'POST', status: '200' });
        span.setAttribute(SEMATTRS_HTTP_STATUS_CODE, 200);
        span.setAttribute('log.count', logs.length);
        span.end();

        return NextResponse.json({ success: true, count: logs.length });
    } catch (error) {
        // Track error metrics
        metrics.apiErrors.inc({ endpoint: '/api/log', method: 'POST' });
        metrics.apiRequests.inc({ endpoint: '/api/log', method: 'POST', status: '500' });

        loggerServer.error('Failed to process log request', error, {
            url: req.url,
            method: req.method,
        });

        span.recordException(error instanceof Error ? error : new Error(String(error)));
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Failed to process logs' });
        span.setAttribute(SEMATTRS_HTTP_STATUS_CODE, 500);
        span.end();

        return NextResponse.json(
            { success: false, error: 'Failed to process logs' },
            { status: 500 }
        );
    } finally {
        const duration = (Date.now() - startTime) / 1000;
        metrics.apiRequestDuration.observe({ endpoint: '/api/log', method: 'POST' }, duration);
    }
}
