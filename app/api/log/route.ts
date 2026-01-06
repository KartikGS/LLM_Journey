import { NextRequest, NextResponse } from 'next/server';
import { loggerServer } from '@/lib/observability/logger/server';
import { ClientLogPayload } from '@/types/logs';
import { getTraceIdFromHeaders } from '@/lib/middleware/tracing';
import { metricsRegistry } from '@/lib/observability/metrics';
import { measureTime } from '@/lib/observability/metrics';

// export const runtime = 'edge';

export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        // Extract trace ID from request headers
        const traceId = getTraceIdFromHeaders(req.headers);

        // Get request metadata
        const requestMetadata = {
            url: req.url,
            method: req.method,
            userAgent: req.headers.get('user-agent') || undefined,
            referer: req.headers.get('referer') || undefined,
            ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        };

        // Parse request body - support both single log and batch
        let body: unknown;
        try {
            body = await req.json();
        } catch (e) {
            metricsRegistry.apiErrors.inc({ endpoint: '/api/log', reason: 'invalid_json' });
            loggerServer.warn('Invalid JSON in log request', { url: req.url });
            return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
        }


        const logs: ClientLogPayload[] = Array.isArray(body) ? body : [body];
        if (logs.length > 100) {
            return NextResponse.json(
                { success: false, error: 'Too many log entries' },
                { status: 413 }
            );
        }

        // Process each log entry
        for (const data of logs) {
            // Enhance context with request metadata and trace ID
            const enhancedContext = {
                ...data.context,
                requestId: traceId || data.context?.requestId,
                ...requestMetadata,
            };

            // Increment log counter
            metricsRegistry.logEntries.inc({ level: data.level });

            switch (data.level) {
                case 'error':
                    metricsRegistry.apiErrors.inc({ endpoint: '/api/log' });
                    loggerServer.error(data.message, data.error, enhancedContext);
                    break;
                case 'warn':
                    loggerServer.warn(data.message, enhancedContext);
                    break;
                case 'info':
                    loggerServer.info(data.message, enhancedContext);
                    break;
                case 'debug':
                    loggerServer.debug(data.message, enhancedContext);
                    break;
            }
        }

        // Track API metrics
        metricsRegistry.apiRequests.inc({ endpoint: '/api/log', method: 'POST', status: '200' });

        return NextResponse.json({ success: true, count: logs.length });
    } catch (error) {
        // Track error metrics
        metricsRegistry.apiErrors.inc({ endpoint: '/api/log', method: 'POST' });
        metricsRegistry.apiRequests.inc({ endpoint: '/api/log', method: 'POST', status: '500' });

        loggerServer.error('Failed to process log request', error, {
            url: req.url,
            method: req.method,
        });

        return NextResponse.json(
            { success: false, error: 'Failed to process logs' },
            { status: 500 }
        );
    } finally {
        const duration = (Date.now() - startTime) / 1000;
        metricsRegistry.apiRequestDuration.observe({ endpoint: '/api/log', method: 'POST' }, duration);
    }
}
