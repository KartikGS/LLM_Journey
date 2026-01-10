import { NextRequest, NextResponse } from 'next/server';

const MAX_BODY_SIZE = 1_000_000; // 1 MB
const FETCH_TIMEOUT_MS = 5000;

export async function POST(req: NextRequest) {
    const contentLength = Number(req.headers.get('content-length') ?? 0);

    if (contentLength > MAX_BODY_SIZE) {
        return new NextResponse('Payload too large', { status: 413 });
    }

    const endpoint =
        process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

    if (!endpoint) {
        console.error('[OTEL Proxy] No OTLP endpoint configured');
        return new NextResponse('Service misconfigured', { status: 503 });
    }

    let body: ArrayBuffer;
    try {
        body = await req.arrayBuffer();
    } catch {
        return new NextResponse('Invalid request body', { status: 400 });
    }

    // Log metadata only
    console.log('[OTEL Proxy] Forwarding traces', {
        size: body.byteLength,
        time: new Date().toISOString(),
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
        const upstreamResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                // Preserve OTLP headers
                'Content-Type': req.headers.get('content-type') ?? 'application/x-protobuf',
                ...(req.headers.get('content-encoding')
                    ? { 'Content-Encoding': req.headers.get('content-encoding')! }
                    : {}),

                // Optional: inject auth to collector
                ...(process.env.OTEL_EXPORTER_OTLP_HEADERS
                    ? { Authorization: process.env.OTEL_EXPORTER_OTLP_HEADERS }
                    : {}),
            },
            body,
            signal: controller.signal,
        });

        if (!upstreamResponse.ok) {
            console.error(
                `[OTEL Proxy] Collector responded ${upstreamResponse.status}`
            );
            return new NextResponse(null, { status: upstreamResponse.status });
        }

        return new NextResponse(null, { status: 202 });
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            console.error('[OTEL Proxy] Upstream timeout');
            return new NextResponse(null, { status: 504 });
        }

        console.error('[OTEL Proxy] Error forwarding traces', err);
        return new NextResponse(null, { status: 502 });
    } finally {
        clearTimeout(timeout);
    }
}
