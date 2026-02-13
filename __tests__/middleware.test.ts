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
        NextRequest: class {},
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
