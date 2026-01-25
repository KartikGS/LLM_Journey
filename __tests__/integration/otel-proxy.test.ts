/**
 * @jest-environment node
 */
import { POST } from '@/app/api/otel/trace/route';
import { NextRequest } from 'next/server';

// ----------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------

// 1. Mock Next.js cookies
const mockCookies = {
    get: jest.fn(),
};
jest.mock('next/headers', () => ({
    cookies: jest.fn(() => Promise.resolve(mockCookies)),
}));

// 2. Mock OTEL Token Validation
jest.mock('@/lib/otel/token', () => ({
    validateTelemetryToken: jest.fn(),
}));

// 3. Mock OTEL Metrics
// We verify calls to these to ensure metrics are recorded
const mockRequestsCounter = { add: jest.fn() };
const mockErrorsCounter = { add: jest.fn() };
const mockRequestSizeHistogram = { record: jest.fn() };
const mockUpstreamLatencyHistogram = { record: jest.fn() };

jest.mock('@/lib/otel/metrics', () => ({
    getOtelProxyRequestsCounter: jest.fn(() => mockRequestsCounter),
    getOtelProxyErrorsCounter: jest.fn(() => mockErrorsCounter),
    getOtelProxyRequestSizeHistogram: jest.fn(() => mockRequestSizeHistogram),
    getOtelProxyUpstreamLatencyHistogram: jest.fn(() => mockUpstreamLatencyHistogram),
}));

// 4. Mock OTEL Tracing
// We verify that a span is started and status is set
const mockSpan = {
    setAttribute: jest.fn(),
    setStatus: jest.fn(),
    addEvent: jest.fn(),
    recordException: jest.fn(),
    end: jest.fn(),
    isRecording: jest.fn(() => true),
};

const mockTracer = {
    startActiveSpan: jest.fn((name, options, callback) => {
        // execute the callback immediately with the mock span
        return callback(mockSpan);
    }),
};

jest.mock('@/lib/otel/tracing', () => ({
    getTracer: jest.fn(() => mockTracer),
}));

// 5. Mock Logger to avoid console noise and verify error logging
jest.mock('@/lib/otel/logger', () => ({
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
}));


describe('Integration: OTEL Trace Proxy', () => {

    // Dependencies to be mocked/controlled per test
    const { validateTelemetryToken } = require('@/lib/otel/token');

    // Helper to create valid request
    const createRequest = (
        body: any = {},
        headers: Record<string, string> = {}
    ) => {
        const url = 'http://localhost/api/otel/trace';
        const bodyStr = JSON.stringify(body);
        return new NextRequest(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-telemetry-token': 'valid-token',
                'Content-Length': String(Buffer.byteLength(bodyStr)),
                ...headers,
            },
            body: bodyStr,
        });
    };

    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset Environment
        process.env = { ...originalEnv };
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://upstream-collector:4318';
        process.env.OTEL_EXPORTER_OTLP_HEADERS = 'x-api-key=secret';

        // Reset Fetch
        global.fetch = jest.fn();

        // Default: Token is valid
        (validateTelemetryToken as jest.Mock).mockReturnValue(true);

        // Default: Cookie session
        mockCookies.get.mockReturnValue({ value: 'test-session-id' });
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('1. Happy Path', () => {
        it('should forward valid trace request to upstream collector', async () => {
            const tracePayload = { resourceSpans: [] };
            (global.fetch as jest.Mock).mockResolvedValue(new Response(null, { status: 200 }));

            const req = createRequest(tracePayload);
            const res = await POST(req);

            // 1. Proxy Response
            expect(res.status).toBe(202);

            // 2. Upstream Interaction
            expect(global.fetch).toHaveBeenCalledTimes(1);
            const [url, options] = (global.fetch as jest.Mock).mock.calls[0];

            expect(url).toBe('http://upstream-collector:4318/v1/traces');
            expect(options.method).toBe('POST');
            expect(options.headers['Content-Type']).toContain('application/json');
            expect(options.headers['x-api-key']).toBe('secret'); // from env

            // Verify body is passed through
            // Note: Request body reading in Node environment can be tricky to inspect directly in mock if it's a stream,
            // but since we pass it to fetch, we can check what fetch received.
            // However, NextRequest body handling in test environment might differ slightly.
            // The implementation casts body to 'any' and passes it to fetch.
            // Let's verify payload integrity in a dedicated test if exact body match is complex here.

            // 3. Metrics
            expect(mockRequestsCounter.add).toHaveBeenCalledWith(1);
            expect(mockErrorsCounter.add).not.toHaveBeenCalled();
            expect(mockRequestSizeHistogram.record).toHaveBeenCalled();
            expect(mockUpstreamLatencyHistogram.record).toHaveBeenCalled();

            // 4. Tracing
            expect(mockTracer.startActiveSpan).toHaveBeenCalledWith(
                'otel_proxy.forward_traces',
                expect.anything(),
                expect.any(Function)
            );
            expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: 1 }); // OK
            expect(mockSpan.end).toHaveBeenCalled();
        });
    });

    describe('2. Authentication & Validation', () => {
        it('should return 401 when token is missing', async () => {
            const req = new NextRequest('http://localhost/api/otel/trace', {
                method: 'POST',
                // No headers
            });
            const res = await POST(req);

            expect(res.status).toBe(401);
            expect(global.fetch).not.toHaveBeenCalled();
            expect(mockTracer.startActiveSpan).not.toHaveBeenCalled(); // Should exit before span start
        });

        it('should return 401 when token is invalid', async () => {
            (validateTelemetryToken as jest.Mock).mockReturnValue(false);

            const req = createRequest({});
            const res = await POST(req);

            expect(res.status).toBe(401);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should return 415 for invalid content-type', async () => {
            const req = new NextRequest('http://localhost/api/otel/trace', {
                method: 'POST',
                headers: {
                    'x-telemetry-token': 'valid-token',
                    'Content-Type': 'text/plain',
                },
                body: 'payload',
            });

            const res = await POST(req);
            expect(res.status).toBe(415);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should return 413 when content-length header exceeds limit', async () => {
            const req = createRequest({}, { 'Content-Length': '1000001' }); // > 1MB

            const res = await POST(req);

            expect(res.status).toBe(413);
            expect(global.fetch).not.toHaveBeenCalled();
            expect(mockErrorsCounter.add).toHaveBeenCalledWith(1, { error_type: 'payload_too_large' });
            expect(mockSpan.setStatus).toHaveBeenCalledWith(expect.objectContaining({ code: 2 })); // ERROR
        });

        it('should return 400 when body is empty', async () => {
            // Mocking an empty body stream via Content-Length 0 check in implementation
            const req = createRequest({}, { 'Content-Length': '0' });

            const res = await POST(req);

            expect(res.status).toBe(400);
            expect(mockErrorsCounter.add).toHaveBeenCalledWith(1, { error_type: 'empty_payload' });
        });
    });

    describe('3. Collector Failure Handling', () => {
        it('should handle upstream 500 error', async () => {
            (global.fetch as jest.Mock).mockResolvedValue(new Response('Internal Error', { status: 500 }));

            const req = createRequest({});
            const res = await POST(req);

            expect(res.status).toBe(500);

            expect(mockErrorsCounter.add).toHaveBeenCalledWith(1, { error_type: 'upstream_error' });
            expect(mockSpan.setStatus).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: 2, // ERROR
                    message: 'Upstream returned 500'
                })
            );
        });

        it('should handle network connection error', async () => {
            (global.fetch as jest.Mock).mockRejectedValue(new Error('Network Error'));

            const req = createRequest({});
            const res = await POST(req);

            expect(res.status).toBe(502);
            expect(mockErrorsCounter.add).toHaveBeenCalledWith(1, { error_type: 'connection_error' });
            expect(mockSpan.recordException).toHaveBeenCalled();
        });

        it('should handle upstream timeout', async () => {
            // Simulate AbortError which is used for timeouts
            const abortError = new Error('The operation was aborted');
            abortError.name = 'AbortError';

            (global.fetch as jest.Mock).mockRejectedValue(abortError);

            const req = createRequest({});
            const res = await POST(req);

            expect(res.status).toBe(504);
            expect(mockErrorsCounter.add).toHaveBeenCalledWith(1, { error_type: 'upstream_timeout' });
        });
    });

    describe('4. Payload Integrity', () => {
        it('should forward payload body exactly as received', async () => {
            const complexPayload = {
                resourceSpans: [{
                    resource: { attributes: [{ key: 'service.name', value: { stringValue: 'test' } }] },
                    scopeSpans: []
                }]
            };

            (global.fetch as jest.Mock).mockResolvedValue(new Response(null, { status: 200 }));

            const req = createRequest(complexPayload);
            const res = await POST(req);

            expect(res.status).toBe(202);

            // Inspect what was passed to fetch
            const [_, options] = (global.fetch as jest.Mock).mock.calls[0];

            // The implementation reads the stream and passes it. 
            // In mock environment we passed a JSON stringified body to NextRequest.
            // NextRequest processing in the implementation uses readStreamWithLimit.
            // We need to verify that 'options.body' contains the binary representation of our payload.

            const sentBody = options.body;
            expect(sentBody).toBeDefined();

            // Since we know the implementation reads into Uint8Array
            const decoder = new TextDecoder();
            const sentString = decoder.decode(sentBody);
            const sentJson = JSON.parse(sentString);

            expect(sentJson).toEqual(complexPayload);
        });
    });
});
