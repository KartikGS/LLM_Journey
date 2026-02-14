import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, generateNonce } from '@/lib/middleware/utils';

/**
 * In-memory rate limiting (resets on redeploy).
 * This is intentional and acceptable for coarse abuse protection.
 */
const rateLimitMap = new Map<string, number[]>();

import { validateContentLength } from '@/lib/security/contentLength';

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

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Prepare Nonce and Headers
    const nonce = generateNonce();
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);

    // 2. CSP Definition (using the nonce)
    // - strict-dynamic: trust scripts loaded by nonced scripts. Removed as it is not supported by nextjs yet
    // - wasm-unsafe-eval: permit WASM (ONNX) without full eval()
    // - unsafe-eval: REQUIRED for Next.js in development mode (HMR, Source Maps)
    // - self: fallback for legacy browsers
    const isProd = process.env.NODE_ENV === 'production';
    const isE2E = process.env.E2E === 'true';
    const isDev = process.env.NODE_ENV === 'development';

    const scriptSrc = `
        'self' 
        'nonce-${nonce}'
        'wasm-unsafe-eval'
        ${isDev ? "'unsafe-eval'" : ""}
    `.replace(/\s{2,}/g, ' ').trim();

    const styleSrc = isDev
        ? "'self' 'unsafe-inline'"
        : `'self' 'nonce-${nonce}'`;

    const cspHeader = `
        default-src 'self';
        script-src ${scriptSrc};
        style-src ${styleSrc};
        img-src 'self' blob: data: https:;
        font-src 'self' data:;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        connect-src 'self' https:;
        ${isProd && !isE2E ? 'upgrade-insecure-requests;' : ''}
    `.replace(/\s{2,}/g, ' ').trim();

    // 3. Rate Limiting Logic
    const apiConfig = API_CONFIG[pathname];
    if (apiConfig) {
        // Strict Body Size Check
        const validation = validateContentLength(request.headers.get('content-length'), apiConfig.contentLengthRequired, apiConfig.maxBodySize);
        if (!validation.valid) {
            return new NextResponse(validation.error || 'Payload Too Large', { status: validation.status });
        }

        const ip = getClientIp(request);
        const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'unknown'; // 'unknown' is fallback in getClientIp

        // Rate Limiting Bypass for Localhost/E2E
        if (!isE2E && !isLocalhost) {
            const now = Date.now();
            const timestamps = rateLimitMap.get(ip) ?? [];
            const recent = timestamps.filter(ts => now - ts < apiConfig.rateLimit_windowMs);

            if (recent.length >= apiConfig.rateLimit_max) {
                return new NextResponse('Too Many Requests', { status: 429 });
            }

            rateLimitMap.set(ip, [...recent, now]);
        }
    }

    // 4. Construct Response
    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // 5. Inject CSP for HTML requests only
    const acceptHeader = request.headers.get('accept');
    if (acceptHeader?.includes('text/html')) {
        response.headers.set('Content-Security-Policy', cspHeader);

        // Add HSTS header conditionally
        if (isProd && !isE2E) {
            response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
        }
    }

    return response;
}

/**
 * Match all request paths except for static assets and internal Next.js paths.
 */
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
