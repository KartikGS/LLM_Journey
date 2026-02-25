import { generateNonce, getClientIp } from '@/lib/middleware/utils';

jest.mock('next/server', () => {
    class MockNextResponse {
        status: number;
        headers: Headers;

        constructor(_body?: unknown, init?: { status?: number }) {
            this.status = init?.status ?? 200;
            this.headers = new Headers();
        }

        static next() {
            return new MockNextResponse(undefined, { status: 200 });
        }
    }

    return {
        NextResponse: MockNextResponse,
        NextRequest: class { },
    };
});

describe('generateNonce', () => {
    it('returns a base64-encoded string', () => {
        const nonce = generateNonce();
        expect(typeof nonce).toBe('string');
        expect(nonce.length).toBeGreaterThan(10);
    });

    it('generates different values on each call', () => {
        const a = generateNonce();
        const b = generateNonce();
        expect(a).not.toBe(b);
    });
});

describe('getClientIp', () => {
    function mockRequest(headers: Record<string, string>, ip?: string) {
        return {
            headers: new Headers(headers),
            ip,
        } as any;
    }

    it('returns request.ip if present', () => {
        const req = mockRequest({}, '1.2.3.4');
        expect(getClientIp(req)).toBe('1.2.3.4');
    });

    it('falls back to x-forwarded-for', () => {
        const req = mockRequest({
            'x-forwarded-for': '5.6.7.8, 9.10.11.12',
        });
        expect(getClientIp(req)).toBe('5.6.7.8');
    });

    it('returns "unknown" if no IP is available', () => {
        const req = mockRequest({});
        expect(getClientIp(req)).toBe('unknown');
    });
});

describe('middleware rate limiting', () => {
    let middleware: (request: any) => { status: number };
    const originalE2E = process.env.E2E;

    beforeEach(async () => {
        jest.resetModules();
        ({ middleware } = await import('@/middleware'));
    });

    function createApiRequest(ip: string): any {
        return {
            nextUrl: { pathname: '/api/telemetry-token' },
            headers: new Headers({
                'x-forwarded-for': ip,
                accept: 'application/json',
            }),
            ip,
        };
    }

    afterEach(() => {
        jest.restoreAllMocks();

        if (originalE2E === undefined) {
            delete process.env.E2E;
            return;
        }
        process.env.E2E = originalE2E;
    });

    it('allows requests under the configured threshold', () => {
        process.env.E2E = 'false';

        for (let i = 0; i < 10; i += 1) {
            const response = middleware(createApiRequest('203.0.113.10'));
            expect(response.status).not.toBe(429);
        }
    });

    it('returns 429 when requests exceed threshold', () => {
        process.env.E2E = 'false';
        jest.spyOn(Date, 'now').mockReturnValue(1_000);

        for (let i = 0; i < 10; i += 1) {
            const response = middleware(createApiRequest('203.0.113.20'));
            expect(response.status).not.toBe(429);
        }

        const blockedResponse = middleware(createApiRequest('203.0.113.20'));
        expect(blockedResponse.status).toBe(429);
    });

    it('prunes expired timestamps and allows requests after the rate-limit window', () => {
        process.env.E2E = 'false';
        const nowSpy = jest.spyOn(Date, 'now');

        nowSpy.mockReturnValue(0);
        for (let i = 0; i < 10; i += 1) {
            const response = middleware(createApiRequest('203.0.113.40'));
            expect(response.status).not.toBe(429);
        }

        const blockedResponse = middleware(createApiRequest('203.0.113.40'));
        expect(blockedResponse.status).toBe(429);

        nowSpy.mockReturnValue(60_001);
        const postWindowResponse = middleware(createApiRequest('203.0.113.40'));
        expect(postWindowResponse.status).not.toBe(429);
    });

    it('bypasses rate limit for localhost traffic', () => {
        process.env.E2E = 'false';

        for (let i = 0; i < 15; i += 1) {
            const response = middleware(createApiRequest('127.0.0.1'));
            expect(response.status).not.toBe(429);
        }
    });

    it('bypasses rate limit when E2E mode is enabled', () => {
        process.env.E2E = 'true';

        for (let i = 0; i < 15; i += 1) {
            const response = middleware(createApiRequest('203.0.113.30'));
            expect(response.status).not.toBe(429);
        }
    });
});

describe('middleware generation routes controls', () => {
    let middleware: (request: any) => { status: number };
    const originalE2E = process.env.E2E;

    beforeEach(async () => {
        jest.resetModules();
        ({ middleware } = await import('@/middleware'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
        if (originalE2E === undefined) {
            delete process.env.E2E;
            return;
        }
        process.env.E2E = originalE2E;
    });

    function createGenRequest(pathname: string, ip: string, contentLength?: number): any {
        const headers: Record<string, string> = {
            'x-forwarded-for': ip,
            accept: 'application/json',
        };
        if (contentLength !== undefined) {
            headers['content-length'] = contentLength.toString();
        }
        return {
            nextUrl: { pathname },
            headers: new Headers(headers),
            ip,
        };
    }

    const genRoutes = ['/api/frontier/base-generate', '/api/adaptation/generate'];

    genRoutes.forEach((route) => {
        describe(`route: ${route}`, () => {
            it(`allows request N=20 and blocks request N+1=21 for ${route}`, () => {
                process.env.E2E = 'false';
                const ip = '203.0.113.100';
                for (let i = 0; i < 20; i += 1) {
                    const response = middleware(createGenRequest(route, ip));
                    expect(response.status).not.toBe(429);
                }
                const blockedResponse = middleware(createGenRequest(route, ip));
                expect(blockedResponse.status).toBe(429);
            });

            it(`bypasses rate limit for localhost IPs on ${route}`, () => {
                process.env.E2E = 'false';
                for (let i = 0; i < 25; i += 1) {
                    const response = middleware(createGenRequest(route, '127.0.0.1'));
                    expect(response.status).not.toBe(429);
                }
            });

            it(`bypasses rate limit when E2E=true on ${route}`, () => {
                process.env.E2E = 'true';
                for (let i = 0; i < 25; i += 1) {
                    const response = middleware(createGenRequest(route, '203.0.113.101'));
                    expect(response.status).not.toBe(429);
                }
            });
        });
    });

    it('resets rate limit after window expires for generation routes', () => {
        process.env.E2E = 'false';
        const route = genRoutes[0];
        const ip = '203.0.113.102';
        const nowSpy = jest.spyOn(Date, 'now');

        nowSpy.mockReturnValue(0);
        for (let i = 0; i < 20; i += 1) {
            const response = middleware(createGenRequest(route, ip));
            expect(response.status).not.toBe(429);
        }
        expect(middleware(createGenRequest(route, ip)).status).toBe(429);

        nowSpy.mockReturnValue(60_001);
        expect(middleware(createGenRequest(route, ip)).status).not.toBe(429);
    });

    it('passes a body of exactly 8192 bytes for /api/adaptation/generate', () => {
        const response = middleware(createGenRequest('/api/adaptation/generate', '203.0.113.103', 8192));
        expect(response.status).not.toBe(413);
    });

    it('rejects a body of 8193 bytes for /api/adaptation/generate', () => {
        const response = middleware(createGenRequest('/api/adaptation/generate', '203.0.113.104', 8193));
        expect(response.status).toBe(413);
    });

    it('passes when content-length header is absent for /api/frontier/base-generate', () => {
        const response = middleware(createGenRequest('/api/frontier/base-generate', '203.0.113.105'));
        expect(response.status).not.toBe(413);
    });
});
