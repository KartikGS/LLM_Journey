import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory rate limiting (resets on redeploy).
 * This is intentional and acceptable for coarse abuse protection.
 */
const rateLimitMap = new Map<string, number[]>();

const ONE_MINUTE = 60 * 1000;

/**
 * Per-route rate limit configuration
 */
const RATE_LIMITS: Record<string, { windowMs: number; max: number }> = {
    '/api/telemetry-token': {
        windowMs: ONE_MINUTE,
        max: 10, // token minting is low-frequency
    },
    '/api/otel/trace': {
        windowMs: ONE_MINUTE,
        max: 30, // telemetry ingestion is higher volume
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
    const config = RATE_LIMITS[pathname];

    // Only rate limit configured routes
    if (!config) {
        return NextResponse.next();
    }

    const ip = getClientIp(request);
    const now = Date.now();

    const timestamps = rateLimitMap.get(ip) ?? [];
    const recent = timestamps.filter(ts => now - ts < config.windowMs);

    if (recent.length >= config.max) {
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
