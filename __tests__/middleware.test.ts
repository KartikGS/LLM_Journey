import { NextRequest } from 'next/server';
import { generateNonce, getClientIp } from '@/lib/middleware/utils';

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
        } as unknown as NextRequest;
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