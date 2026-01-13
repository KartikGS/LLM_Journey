import { NextRequest, NextResponse } from 'next/server';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';
import logger from '@/lib/otel/logger';
import { getTracer } from '@/lib/otel/tracing';
import {
    getOtelProxyRequestsCounter,
    getOtelProxyRequestSizeHistogram,
    getOtelProxyUpstreamLatencyHistogram,
    getOtelProxyErrorsCounter,
} from '@/lib/otel/metrics';

const MAX_BODY_SIZE = 1_000_000; // 1 MB
const FETCH_TIMEOUT_MS = 5000;

export async function POST(req: NextRequest) {
    const tracer = getTracer();

    return tracer.startActiveSpan(
        'otel_proxy.forward_traces',
        { kind: SpanKind.INTERNAL },
        async (span) => {
            const startTime = performance.now();
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

            try {
                getOtelProxyRequestsCounter().add(1);

                const contentLength = Number(req.headers.get('content-length') ?? 0);
                span.setAttribute('http.request.body.size', contentLength);

                if (contentLength > MAX_BODY_SIZE) {
                    getOtelProxyErrorsCounter().add(1, { error_type: 'payload_too_large' });
                    span.setStatus({ code: SpanStatusCode.ERROR, message: 'Payload too large' });
                    logger.warn({ contentLength }, 'OTEL proxy rejected oversized payload');
                    return new NextResponse('Payload too large', { status: 413 });
                }

                const endpoint =
                    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
                    `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`;

                if (!endpoint) {
                    getOtelProxyErrorsCounter().add(1, { error_type: 'misconfigured' });
                    span.setStatus({ code: SpanStatusCode.ERROR, message: 'No endpoint configured' });
                    logger.error('OTEL proxy: No OTLP endpoint configured');
                    return new NextResponse('Service misconfigured', { status: 503 });
                }

                const body = await req.arrayBuffer();

                getOtelProxyRequestSizeHistogram().record(body.byteLength, {
                    route: '/api/otel/trace',
                    content_type: req.headers.get('content-type') ?? 'unknown',
                });

                span.setAttribute('otel_proxy.body_size', body.byteLength);
                span.addEvent('forwarding_to_upstream');

                const upstreamStart = performance.now();

                const upstreamResponse = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': req.headers.get('content-type') ?? 'application/x-protobuf',
                    },
                    body,
                    signal: controller.signal,
                });

                const upstreamLatency = performance.now() - upstreamStart;
                getOtelProxyUpstreamLatencyHistogram().record(upstreamLatency, {
                    route: '/api/otel/trace',
                });

                span.setAttribute('otel_proxy.upstream_latency_ms', upstreamLatency);

                if (!upstreamResponse.ok) {
                    getOtelProxyErrorsCounter().add(1, { error_type: 'upstream_error' });
                    span.setStatus({
                        code: SpanStatusCode.ERROR,
                        message: `Upstream returned ${upstreamResponse.status}`,
                    });
                    return new NextResponse(null, { status: upstreamResponse.status });
                }

                span.setStatus({ code: SpanStatusCode.OK });
                span.addEvent('upstream_success');

                logger.info(
                    { latencyMs: performance.now() - startTime },
                    'OTEL proxy: Traces forwarded successfully'
                );

                return new NextResponse(null, { status: 202 });
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    getOtelProxyErrorsCounter().add(1, { error_type: 'timeout' });
                    span.setStatus({ code: SpanStatusCode.ERROR, message: 'Upstream timeout' });
                    logger.error('OTEL proxy: Upstream timeout');
                    return new NextResponse(null, { status: 504 });
                }

                span.recordException(err as Error);
                getOtelProxyErrorsCounter().add(1, { error_type: 'connection_error' });
                span.setStatus({ code: SpanStatusCode.ERROR });
                logger.error({ err }, 'OTEL proxy: Error forwarding traces');
                return new NextResponse(null, { status: 502 });
            } finally {
                clearTimeout(timeout);
                span.end();
            }
        }
    );

}
