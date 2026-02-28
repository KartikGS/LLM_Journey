import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import logger from '@/lib/otel/logger';
import { validateTelemetryToken } from '@/lib/otel/token';
import {
    safeMetric,
    getOtelProxyRequestsCounter,
    getOtelProxyRequestSizeHistogram,
    getOtelProxyUpstreamLatencyHistogram,
    getOtelProxyErrorsCounter,
} from '@/lib/otel/metrics';
import { parseHeaderString } from '@/lib/utils/parseHeaderString';
import { validateContentLength, readStreamWithLimit } from '@/lib/security/contentLength';

const MAX_BODY_SIZE = 1_000_000; // 1 MB
const CONTENT_LENGTH_REQUIRED = true
const UPSTREAM_TIMEOUT_MS = 5000;
const BODY_READ_TIMEOUT_MS = 2000;

export async function POST(req: NextRequest) {
    // 1. Token Validation
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('anon_session')?.value || 'unknown';
    const headerToken = req.headers.get('x-telemetry-token');

    if (!headerToken || !validateTelemetryToken(headerToken, sessionId)) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
        safeMetric(() => getOtelProxyRequestsCounter().add(1));

        const ct = req.headers.get('content-type') ?? '';
        if (!ct.includes('application/json')) {
            return new NextResponse('Unsupported Media Type', { status: 415 });
        }

        const validation = validateContentLength(req.headers.get('content-length'), CONTENT_LENGTH_REQUIRED, MAX_BODY_SIZE);
        if (!validation.valid) {
            if (validation.status === 413) {
                safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'payload_too_large' }));
                logger.warn({ contentLength: req.headers.get('content-length') }, 'OTEL proxy rejected oversized payload (from header)');
            }
            return new NextResponse(validation.error, { status: validation.status });
        }

        const contentLength = validation.length ?? 0;

        if (contentLength === 0) {
            safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'empty_payload' }));
            return new NextResponse('Empty payload', { status: 400 });
        }

        const endpoint = `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`;

        if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
            safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'misconfigured' }));
            logger.error('OTEL proxy: No OTLP endpoint configured');
            return new NextResponse('Service misconfigured', { status: 503 });
        }

        const extraHeaders = parseHeaderString(process.env.OTEL_EXPORTER_OTLP_HEADERS);

        const { body, error: streamError } = await readStreamWithLimit(req, MAX_BODY_SIZE, contentLength, BODY_READ_TIMEOUT_MS);
        if (streamError) {
            if (streamError.status === 413) {
                safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'payload_too_large' }));
                logger.warn('OTEL proxy rejected oversized payload (stream enforcement)');
            } else if (streamError.timeout) {
                safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'body_timeout' }));
            }
            return new NextResponse(streamError.message, { status: streamError.status });
        }

        if (body.length === 0) {
            return new NextResponse('Bad Request', { status: 400 });
        }

        safeMetric(() => getOtelProxyRequestSizeHistogram().record(body.byteLength, {
            route: '/api/otel/trace',
            content_type: req.headers.get('content-type') ?? 'unknown',
        }));

        const upstreamStart = performance.now();

        const upstreamResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': req.headers.get('content-type') ?? 'application/x-protobuf',
                ...extraHeaders,
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            body: body as any,
            signal: controller.signal,
        });

        const upstreamLatency = performance.now() - upstreamStart;
        safeMetric(() => getOtelProxyUpstreamLatencyHistogram().record(upstreamLatency, {
            route: '/api/otel/trace',
        }));

        if (!upstreamResponse.ok) {
            safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'upstream_error' }));
            return new NextResponse(null, { status: upstreamResponse.status });
        }

        return new NextResponse(null, { status: 202 });
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'upstream_timeout' }));
            logger.error('OTEL proxy: Upstream timeout');
            return new NextResponse(null, { status: 504 });
        }

        safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'connection_error' }));
        logger.error({ err }, 'OTEL proxy: Error forwarding traces');
        return new NextResponse(null, { status: 502 });
    } finally {
        clearTimeout(timeout);
    }

}
