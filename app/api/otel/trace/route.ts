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
import { validateContentLength, readStreamWithLimit } from '@/lib/validations/contentLength';

const MAX_BODY_SIZE = 1_000_000; // 1 MB
const CONTENT_LENGTH_REQUIRED = true
const UPSTREAM_TIMEOUT_MS = 5000;
const BODY_READ_TIMEOUT_MS = 2000;

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
                if (!ct.includes('application/json')) {
                    return new NextResponse('Unsupported Media Type', { status: 415 });
                }


                const validation = validateContentLength(req.headers.get('content-length'), CONTENT_LENGTH_REQUIRED, MAX_BODY_SIZE);
                if (!validation.valid) {
                    if (validation.status === 413) {
                        getOtelProxyErrorsCounter().add(1, { error_type: 'payload_too_large' });
                        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Payload too large' });
                        logger.warn({ contentLength: req.headers.get('content-length') }, 'OTEL proxy rejected oversized payload (from header)');
                    }
                    return new NextResponse(validation.error, { status: validation.status });
                }

                const contentLength = validation.length ?? 0;
                span.setAttribute('http.request.body.size', contentLength);

                if (contentLength === 0) {
                    getOtelProxyErrorsCounter().add(1, { error_type: 'empty_payload' });
                    return new NextResponse('Empty payload', { status: 400 });
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
                const { body: streamBody, error: streamError } = await readStreamWithLimit(req, MAX_BODY_SIZE, contentLength, BODY_READ_TIMEOUT_MS);
                if (streamError) {
                    if (streamError.status === 413) {
                        getOtelProxyErrorsCounter().add(1, { error_type: 'payload_too_large' });
                        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Payload too large' });
                        logger.warn('OTEL proxy rejected oversized payload (stream enforcement)');
                    }
                    else if (streamError.timeout) {
                        span.setAttribute('otel_proxy.body_timeout', true);
                        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Body read timeout' });
                        getOtelProxyErrorsCounter().add(1, { error_type: 'body_timeout' });
                    } else {
                        span.setStatus({ code: SpanStatusCode.ERROR });
                        span.addEvent('invalid_request_body');
                    }
                    return new NextResponse(streamError.message, { status: streamError.status });
                }

                if (streamBody.length === 0) {
                    span.setStatus({ code: SpanStatusCode.ERROR });
                    span.addEvent('invalid_request_body');
                    return new NextResponse('Bad Request', { status: 400 });
                }
                body = streamBody;

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
                    body: body as any,
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
                    getOtelProxyErrorsCounter().add(1, { error_type: 'upstream_timeout' });
                    span.setAttribute('otel_proxy.upstream_timeout', true);
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
