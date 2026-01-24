/**
 * @jest-environment node
 */
import { GET } from '@/app/api/telemetry-token/route';
import { NextRequest } from 'next/server';

// Mock dependencies (services)
jest.mock('@/lib/otel/token', () => ({
    generateTelemetryToken: jest.fn().mockReturnValue('mocked-token'),
}));

jest.mock('@/lib/otel/metrics', () => ({
    safeMetric: jest.fn((fn: () => void) => {
        try {
            fn();
        } catch {
            // swallow — same behavior as production
        }
    }),
    getTelemetryTokenRequestsCounter: jest.fn().mockReturnValue({
        add: jest.fn(),
    }),
}));


describe('Integration: Telemetry Token API', () => {
    it('should return a token and set anonymous session cookie if not present', async () => {
        // Note: In Node environment, we need to pass a full URL to NextRequest
        const req = new NextRequest('http://localhost/api/telemetry-token');

        const res = await GET(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({ token: 'mocked-token' });

        // Check if cookie was set
        const cookie = res.cookies.get('anon_session');
        expect(cookie).toBeDefined();
        expect(cookie?.value).toHaveLength(36); // standard UUID length
    });

    it('should reuse existing anonymous session cookie', async () => {
        const req = new NextRequest('http://localhost/api/telemetry-token');
        const existingUuid = '123e4567-e89b-12d3-a456-426614174000'; // valid uuid format just in case
        req.cookies.set('anon_session', existingUuid);

        const res = await GET(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({ token: 'mocked-token' });

        const cookie = res.cookies.get('anon_session');
        expect(cookie?.value).toBe(existingUuid);
    });

    it('failure case: should still return 200 even if metric recording fails', async () => {
        const { getTelemetryTokenRequestsCounter } = require('@/lib/otel/metrics');

        // Make add() throw once to simulate telemetry failure
        getTelemetryTokenRequestsCounter.mockReturnValueOnce({
            add: jest.fn(() => {
                throw new Error('Metric backend failure');
            }),
        });

        const req = new NextRequest('http://localhost/api/telemetry-token');

        const res = await GET(req);
        const body = await res.json();

        // API should still succeed
        expect(res.status).toBe(200);
        expect(body).toEqual({ token: 'mocked-token' });

        // Ensure metric counter was attempted
        expect(getTelemetryTokenRequestsCounter).toHaveBeenCalled();
    });

});
