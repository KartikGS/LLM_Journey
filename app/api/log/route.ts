import { NextRequest, NextResponse } from 'next/server';
import { loggerServer } from '@/lib/utils/logger/server';
import { ClientLogPayload } from '@/types/logs';
import { getTraceIdFromHeaders } from '@/lib/middleware/tracing';
import { metricsRegistry } from '@/lib/utils/metrics';
import { measureTime } from '@/lib/utils/metrics';

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
        const body = await req.json();
        const logs: ClientLogPayload[] = Array.isArray(body) ? body : [body];

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
        const duration = (Date.now() - startTime) / 1000; // Convert to seconds
        metricsRegistry.apiRequestDuration.observe({ endpoint: '/api/log', method: 'POST' }, duration);

        return NextResponse.json({ success: true, count: logs.length });
    } catch (error) {
        // Track error metrics
        metricsRegistry.apiErrors.inc({ endpoint: '/api/log', method: 'POST' });
        metricsRegistry.apiRequests.inc({ endpoint: '/api/log', method: 'POST', status: '500' });
        
        const duration = (Date.now() - startTime) / 1000;
        metricsRegistry.apiRequestDuration.observe({ endpoint: '/api/log', method: 'POST' }, duration);

        loggerServer.error('Failed to process log request', error, {
            url: req.url,
            method: req.method,
        });

        return NextResponse.json(
            { success: false, error: 'Failed to process logs' },
            { status: 500 }
        );
    }
}
