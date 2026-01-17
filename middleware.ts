import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory rate limiting (resets on redeploy).
 * This is intentional and acceptable for coarse abuse protection.
 */
const rateLimitMap = new Map<string, number[]>();

import { validateContentLength } from '@/lib/validations/contentLength';

const ONE_MINUTE = 60 * 1000;

/**
 * Per-route api configuration
 */
const API_CONFIG: Record<string, { rateLimit_windowMs: number; rateLimit_max: number; contentLengthRequired: boolean; maxBodySize: number }> = {
    '/api/telemetry-token': {
        rateLimit_windowMs: ONE_MINUTE,
        rateLimit_max: 10, // token minting is low-frequency
        contentLengthRequired: false, // no content passed in a get request
        maxBodySize: 1_000_000,
    },
    '/api/otel/trace': {
        rateLimit_windowMs: ONE_MINUTE,
        rateLimit_max: 30, // telemetry ingestion is higher volume
        contentLengthRequired: true, // content passed in a post request
        maxBodySize: 1_000_000, // 1 MB
    },
};

/**
 * Extract a stable client IP.
 * Used only for coarse abuse protection (not identity or auth).
 */
function getClientIp(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    return (
        (request as any).ip ??
        forwardedFor?.split(',')[0]?.trim() ??
        'unknown'
    );
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const config = API_CONFIG[pathname];

    // Only rate limit configured routes
    if (!config) {
        return NextResponse.next();
    }

    // 1. Strict Body Size Check
    const validation = validateContentLength(request.headers.get('content-length'), config.contentLengthRequired, config.maxBodySize);
    if (!validation.valid) {
        return new NextResponse(validation.error || 'Payload Too Large', { status: validation.status });
    }

    const ip = getClientIp(request);
    const now = Date.now();

    const timestamps = rateLimitMap.get(ip) ?? [];
    const recent = timestamps.filter(ts => now - ts < config.rateLimit_windowMs);

    if (recent.length >= config.rateLimit_max) {
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    recent.push(now);

    // Cleanup to prevent unbounded memory growth
    if (recent.length === 0) {
        rateLimitMap.delete(ip);
    } else {
        rateLimitMap.set(ip, recent);
    }

    return NextResponse.next();
}

/**
 * Explicitly declare which routes this middleware applies to.
 */
export const config = {
    matcher: [
        '/api/telemetry-token',
        '/api/otel/trace',
    ],
};
