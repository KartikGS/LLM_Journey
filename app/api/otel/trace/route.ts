import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';
import logger from '@/lib/otel/logger';
import { getTracer } from '@/lib/otel/tracing';
import { validateTelemetryToken } from '@/lib/otel/token';
import {
    getOtelProxyRequestsCounter,
    getOtelProxyRequestSizeHistogram,
    getOtelProxyUpstreamLatencyHistogram,
    getOtelProxyErrorsCounter,
} from '@/lib/otel/metrics';
import { parseHeaderString } from '@/lib/utils/parseHeaderString';

const MAX_BODY_SIZE = 1_000_000; // 1 MB
const UPSTREAM_TIMEOUT_MS = 5000;

export async function POST(req: NextRequest) {
    const tracer = getTracer();

    // 1. Token Validation
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('anon_session')?.value || 'unknown';
    const headerToken = req.headers.get('x-telemetry-token');

    if (!headerToken || !validateTelemetryToken(headerToken, sessionId)) {
        // logger.warn({ sessionId }, 'Unauthorized telemetry trace attempt');
        return new NextResponse('Unauthorized', { status: 401 });
    }

    return tracer.startActiveSpan(
        'otel_proxy.forward_traces',
        { kind: SpanKind.INTERNAL },
        async (span) => {
            const startTime = performance.now();
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

            try {
                getOtelProxyRequestsCounter().add(1);

                const ct = req.headers.get('content-type') ?? '';
                console.log(ct)
                if (!ct.includes('application/json')) {
                    return new NextResponse('Unsupported Media Type', { status: 415 });
                }


                const rawLen = req.headers.get('content-length');
                const contentLength = rawLen ? Number(rawLen) : 0;

                if (!Number.isFinite(contentLength)) {
                    return new NextResponse('Invalid Content-Length', { status: 400 });
                }
                span.setAttribute('http.request.body.size', contentLength);

                if (contentLength === 0) {
                    getOtelProxyErrorsCounter().add(1, { error_type: 'empty_payload' });
                    return new NextResponse('Empty payload', { status: 400 });
                }

                if (contentLength > MAX_BODY_SIZE) {
                    getOtelProxyErrorsCounter().add(1, { error_type: 'payload_too_large' });
                    span.setStatus({ code: SpanStatusCode.ERROR, message: 'Payload too large' });
                    logger.warn({ contentLength }, 'OTEL proxy rejected oversized payload (from header)');
                    return new NextResponse('Payload too large', { status: 413 });
                }

                const endpoint = `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`;

                if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
                    getOtelProxyErrorsCounter().add(1, { error_type: 'misconfigured' });
                    span.setStatus({ code: SpanStatusCode.ERROR, message: 'No endpoint configured' });
                    logger.error('OTEL proxy: No OTLP endpoint configured');
                    return new NextResponse('Service misconfigured', { status: 503 });
                }

                const extraHeaders = parseHeaderString(process.env.OTEL_EXPORTER_OTLP_HEADERS);

                let body: Uint8Array;
                const BODY_READ_TIMEOUT_MS = 2000; // Shorter timeout for body
                const bodyTimeout = setTimeout(() => {
                    req.body?.cancel();
                }, BODY_READ_TIMEOUT_MS);

                try {
                    // Strict stream reading to enforce MAX_BODY_SIZE
                    const reader = req.body?.getReader();
                    if (!reader) {
                        span.setStatus({ code: SpanStatusCode.ERROR });
                        span.addEvent('invalid_request_body');
                        return new NextResponse('Bad Request', { status: 400 });
                    }

                    let buffer: Uint8Array | null = null;
                    let offset = 0;

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            clearTimeout(bodyTimeout);
                            reader.releaseLock();
                            break;
                        }
                        if (offset + value.length > MAX_BODY_SIZE) {
                            clearTimeout(bodyTimeout);
                            reader.releaseLock();
                            await req.body?.cancel();
                            getOtelProxyErrorsCounter().add(1, { error_type: 'payload_too_large' });
                            span.setStatus({ code: SpanStatusCode.ERROR, message: 'Payload too large' });
                            logger.warn({ offset }, 'OTEL proxy rejected oversized payload (stream enforcement)');
                            return new NextResponse('Payload too large', { status: 413 });
                        }
                        if (!buffer) {
                            buffer = new Uint8Array(MAX_BODY_SIZE);
                        }
                        buffer.set(value, offset);
                        offset += value.length;
                    }

                    if (!buffer) {
                        span.setStatus({ code: SpanStatusCode.ERROR });
                        span.addEvent('invalid_request_body');
                        return new NextResponse('Bad Request', { status: 400 });
                    }
                    body = buffer.slice(0, offset);
                    clearTimeout(bodyTimeout);
                } catch {
                    clearTimeout(bodyTimeout);
                    span.setStatus({ code: SpanStatusCode.ERROR });
                    span.addEvent('invalid_request_body');
                    return new NextResponse('Bad Request', { status: 400 });
                }

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
                        ...extraHeaders,
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
