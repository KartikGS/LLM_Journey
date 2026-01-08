import { NextResponse } from 'next/server';
import { metricsEndpoint } from '@/lib/observability/metrics';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { SEMATTRS_HTTP_METHOD, SEMATTRS_HTTP_URL, SEMATTRS_HTTP_STATUS_CODE } from '@opentelemetry/semantic-conventions';

export async function GET() {
    const tracer = trace.getTracer('llm-journey-api');
    const span = tracer.startSpan('api.metrics', {
        attributes: {
            [SEMATTRS_HTTP_METHOD]: 'GET',
        },
    });

    try {
        const metrics = await metricsEndpoint();
        span.setAttribute(SEMATTRS_HTTP_STATUS_CODE, 200);
        span.end();
        
        return new NextResponse(metrics, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Failed to retrieve metrics:', error);
        span.recordException(error instanceof Error ? error : new Error(String(error)));
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.setAttribute(SEMATTRS_HTTP_STATUS_CODE, 500);
        span.end();
        
        return NextResponse.json(
            { error: 'Failed to retrieve metrics' },
            { status: 500 }
        );
    }
}
