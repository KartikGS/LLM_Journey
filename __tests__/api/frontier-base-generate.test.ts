/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/frontier/base-generate/route';

const mockSpan = {
    setAttribute: jest.fn(),
    setStatus: jest.fn(),
    recordException: jest.fn(),
    end: jest.fn(),
};

const mockTracer = {
    startActiveSpan: jest.fn((_name, _options, callback) => callback(mockSpan)),
};

jest.mock('@/lib/otel/tracing', () => ({
    getTracer: jest.fn(() => mockTracer),
}));

// --- Metrics mock ---
const mockAdd = jest.fn();
jest.mock('@/lib/otel/metrics', () => ({
    safeMetric: (fn: () => void) => fn(),
    getFrontierGenerateRequestsCounter: () => ({ add: mockAdd }),
    getFrontierGenerateFallbacksCounter: () => ({ add: mockAdd }),
    getFrontierGenerateUpstreamLatencyHistogram: () => ({ record: jest.fn() }),
}));

jest.mock('@/lib/otel/logger', () => ({
    __esModule: true,
    default: {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
    },
}));

// ── SSE test helpers ──────────────────────────────────────────────────────────

/** Build a mock upstream SSE Response with the given data lines. */
function mockSseStreamResponse(lines: string[]): Response {
    const body = lines.join('\n') + '\n';
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode(body));
            controller.close();
        },
    });
    return new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
    });
}

/** Parse SSE events from a response body text string. */
async function parseSseResponse(res: Response): Promise<Array<{ event: string; data: unknown }>> {
    const text = await res.text();
    const events: Array<{ event: string; data: unknown }> = [];
    const chunks = text.split('\n\n').filter((c) => c.trim() !== '');
    for (const chunk of chunks) {
        const lines = chunk.split('\n');
        let eventType = '';
        let dataStr = '';
        for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            if (line.startsWith('data: ')) dataStr = line.slice(6).trim();
        }
        if (eventType) {
            try {
                events.push({ event: eventType, data: JSON.parse(dataStr) });
            } catch {
                events.push({ event: eventType, data: dataStr });
            }
        }
    }
    return events;
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Integration: Frontier Base Generate API', () => {
    const originalEnv = process.env;
    const originalFetch = global.fetch;

    function createRequest(body: unknown) {
        return new NextRequest('http://localhost/api/frontier/base-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    }

    beforeEach(() => {
        jest.clearAllMocks();
        mockAdd.mockClear();
        process.env = { ...originalEnv };
        delete process.env.FRONTIER_API_KEY;
        global.fetch = jest.fn();
    });

    afterAll(() => {
        process.env = originalEnv;
        global.fetch = originalFetch;
    });

    it('should return 400 with controlled error payload for invalid prompt', async () => {
        const req = createRequest({ prompt: '   ' });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body).toEqual({
            error: {
                code: 'invalid_prompt',
                message: 'prompt must be a non-empty string up to 2000 characters.',
            },
        });
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return fallback envelope when provider config is missing', async () => {
        const req = createRequest({ prompt: 'Explain scaling in one sentence.' });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('fallback');
        expect(body.reason).toEqual({
            code: 'missing_config',
            message: 'Frontier provider is not configured. Showing deterministic fallback output.',
        });
        expect(typeof body.output).toBe('string');
        expect(body.output.length).toBeGreaterThan(0);
        expect(body.metadata).toEqual({
            label: 'Frontier Base Model',
            modelId: 'meta-llama/Meta-Llama-3-8B',
            assistantTuned: false,
            adaptation: 'none',
            note: 'Pretrained on internet-scale text; not assistant fine-tuned.',
        });
        expect(global.fetch).not.toHaveBeenCalled();
    });

    describe('HF Provider Path', () => {
        const HF_ENV = {
            FRONTIER_API_KEY: 'hf-secret-key',
        };

        function setHfEnv() {
            Object.assign(process.env, HF_ENV);
        }

        it('should return text/event-stream response with typed SSE events for live streaming path', async () => {
            setHfEnv();

            const sseLines = [
                'data: {"id":"1","choices":[{"text":" hello","finish_reason":null}]}',
                'data: {"id":"2","choices":[{"text":" world","finish_reason":null}]}',
                'data: [DONE]',
            ];
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockSseStreamResponse(sseLines));

            const req = createRequest({ prompt: 'Explain scaling.' });
            const res = await POST(req);

            expect(res.headers.get('content-type')).toContain('text/event-stream');

            const events = await parseSseResponse(res);
            const eventTypes = events.map((e) => e.event);
            expect(eventTypes).toContain('start');
            expect(eventTypes).toContain('token');
            expect(eventTypes).toContain('done');

            const startEvent = events.find((e) => e.event === 'start');
            expect(startEvent?.data).toMatchObject({
                mode: 'live',
                metadata: expect.objectContaining({ label: 'Frontier Base Model' }),
            });

            const tokenEvents = events.filter((e) => e.event === 'token');
            expect(tokenEvents).toHaveLength(2);
            expect((tokenEvents[0].data as Record<string, unknown>).text).toBe(' hello');
            expect((tokenEvents[1].data as Record<string, unknown>).text).toBe(' world');
        });

        it('should include stream:true in HF request body', async () => {
            setHfEnv();

            (global.fetch as jest.Mock).mockResolvedValueOnce(
                mockSseStreamResponse(['data: [DONE]'])
            );

            const prompt = 'Explain why scale helps language models.';
            const req = createRequest({ prompt });
            await POST(req);

            const calledBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body as string);
            expect(calledBody).toEqual({
                model: 'meta-llama/Meta-Llama-3-8B',
                prompt,
                max_tokens: 256,
                temperature: 0.4,
                stream: true,
            });
            expect(calledBody).not.toHaveProperty('inputs');
            expect(calledBody).not.toHaveProperty('parameters');
        });

        it('should close stream at output cap (4000 chars)', async () => {
            setHfEnv();

            // Two tokens: first fills 3500 chars, second adds 600 — total exceeds 4000
            const bigToken = 'a'.repeat(3500);
            const smallToken = 'b'.repeat(600);
            const sseLines = [
                `data: {"id":"1","choices":[{"text":"${bigToken}","finish_reason":null}]}`,
                `data: {"id":"2","choices":[{"text":"${smallToken}","finish_reason":null}]}`,
                'data: [DONE]',
            ];
            (global.fetch as jest.Mock).mockResolvedValueOnce(mockSseStreamResponse(sseLines));

            const req = createRequest({ prompt: 'Test cap.' });
            const res = await POST(req);

            expect(res.headers.get('content-type')).toContain('text/event-stream');

            const events = await parseSseResponse(res);
            const tokenEvents = events.filter((e) => e.event === 'token');
            const doneEvents = events.filter((e) => e.event === 'done');

            // Both tokens emitted (cap hit after second), then done
            expect(tokenEvents).toHaveLength(2);
            expect(doneEvents).toHaveLength(1);
            // No extra events after done
            expect(events[events.length - 1].event).toBe('done');
        });

        it('should emit event:error and increment fallbacks counter on mid-stream AbortError', async () => {
            setHfEnv();

            const encoder = new TextEncoder();
            let callCount = 0;
            const abortStream = new ReadableStream({
                pull(controller) {
                    callCount += 1;
                    if (callCount === 1) {
                        controller.enqueue(
                            encoder.encode('data: {"id":"1","choices":[{"text":" hi","finish_reason":null}]}\n')
                        );
                    } else {
                        const err = new Error('The operation was aborted');
                        err.name = 'AbortError';
                        controller.error(err);
                    }
                },
            });
            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(abortStream, {
                    status: 200,
                    headers: { 'Content-Type': 'text/event-stream' },
                })
            );

            const req = createRequest({ prompt: 'Mid-stream abort test.' });
            const res = await POST(req);

            expect(res.headers.get('content-type')).toContain('text/event-stream');

            const events = await parseSseResponse(res);
            const errorEvent = events.find((e) => e.event === 'error');
            expect(errorEvent).toBeDefined();
            expect((errorEvent?.data as Record<string, unknown>).code).toBe('timeout');

            // Fallback counter incremented for mid-stream error
            const fallbackCalls = mockAdd.mock.calls.filter((call) => call[1] && call[1].reason_code);
            expect(fallbackCalls.length).toBeGreaterThan(0);
        });

        it('should return invalid_provider_response fallback when upstream returns application/json on OK', async () => {
            setHfEnv();

            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ choices: [{ text: 'some output' }] }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                )
            );

            const req = createRequest({ prompt: 'Explain scaling.' });
            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.mode).toBe('fallback');
            expect(body.reason.code).toBe('invalid_provider_response');
        });

        it('should return upstream_auth fallback when HF returns 401', async () => {
            setHfEnv();

            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
            );

            const req = createRequest({ prompt: 'Explain scaling.' });
            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.mode).toBe('fallback');
            expect(body.reason.code).toBe('upstream_auth');
        });

        it('should return quota_limited fallback when HF returns 429', async () => {
            setHfEnv();

            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429 })
            );

            const req = createRequest({ prompt: 'Explain scaling.' });
            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.mode).toBe('fallback');
            expect(body.reason.code).toBe('quota_limited');
        });

        it('should return upstream_error fallback when HF returns 503', async () => {
            setHfEnv();

            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ error: 'Model is loading', estimated_time: 20.0 }),
                    { status: 503 }
                )
            );

            const req = createRequest({ prompt: 'Explain scaling.' });
            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.mode).toBe('fallback');
            expect(body.reason.code).toBe('upstream_error');
        });
    });

    it('should return invalid_provider_response fallback when upstream returns non-SSE content-type on OK', async () => {
        process.env.FRONTIER_API_KEY = 'secret-key';

        (global.fetch as jest.Mock).mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    choices: [{ message: { content: 'Live provider output' } }],
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            )
        );

        const req = createRequest({ prompt: 'Explain why scale helps language models.' });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('fallback');
        expect(body.reason.code).toBe('invalid_provider_response');

        expect(global.fetch).toHaveBeenCalledWith(
            'https://router.huggingface.co/featherless-ai/v1/completions',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    Authorization: 'Bearer secret-key',
                    'Content-Type': 'application/json',
                }),
            })
        );
    });

    describe('Metrics and Security', () => {
        const HF_ENV = {
            FRONTIER_API_KEY: 'sk-secret-frontier-key',
        };

        it('increments frontier_generate.requests counter on every POST', async () => {
            const req = createRequest({ prompt: 'test prompt' });
            await POST(req);

            expect(mockAdd).toHaveBeenCalledWith(1);
        });

        it('increments frontier_generate.fallbacks with reason_code missing_config when not configured', async () => {
            const req = createRequest({ prompt: 'test prompt' });
            await POST(req);

            expect(mockAdd).toHaveBeenCalledWith(1, { reason_code: 'missing_config' });
        });

        it('increments frontier_generate.fallbacks with reason_code timeout on AbortError', async () => {
            Object.assign(process.env, HF_ENV);
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                Object.assign(new Error('aborted'), { name: 'AbortError' })
            );

            const req = createRequest({ prompt: 'test prompt' });
            await POST(req);

            expect(mockAdd).toHaveBeenCalledWith(1, { reason_code: 'timeout' });
        });

        it('increments frontier_generate.fallbacks with reason_code quota_limited on upstream 429', async () => {
            Object.assign(process.env, HF_ENV);
            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429 })
            );

            const req = createRequest({ prompt: 'test prompt' });
            await POST(req);

            expect(mockAdd).toHaveBeenCalledWith(1, { reason_code: 'quota_limited' });
        });

        it('does not call fallbacks counter on a successful live streaming response', async () => {
            Object.assign(process.env, HF_ENV);
            (global.fetch as jest.Mock).mockResolvedValueOnce(
                mockSseStreamResponse([
                    'data: {"id":"1","choices":[{"text":" success","finish_reason":null}]}',
                    'data: [DONE]',
                ])
            );

            const req = createRequest({ prompt: 'test prompt' });
            const res = await POST(req);
            // Consume the stream to trigger onDone callback
            await res.text();

            const fallbackCalls = mockAdd.mock.calls.filter(call => call[1] && call[1].reason_code);
            expect(fallbackCalls.length).toBe(0);
        });

        it('does not expose FRONTIER_API_KEY in the response body on any fallback path', async () => {
            Object.assign(process.env, HF_ENV);
            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(JSON.stringify({ error: 'Upstream Error' }), { status: 500 })
            );

            const req = createRequest({ prompt: 'test prompt' });
            const res = await POST(req);
            const body = await res.json();
            const bodyString = JSON.stringify(body);

            expect(bodyString).not.toContain('sk-secret-frontier-key');
        });

        it('does not set FRONTIER_API_KEY as a span attribute', async () => {
            Object.assign(process.env, HF_ENV);
            (global.fetch as jest.Mock).mockResolvedValueOnce(
                mockSseStreamResponse([
                    'data: {"id":"1","choices":[{"text":" success","finish_reason":null}]}',
                    'data: [DONE]',
                ])
            );

            const req = createRequest({ prompt: 'test prompt' });
            const res = await POST(req);
            await res.text();

            mockSpan.setAttribute.mock.calls.forEach(call => {
                const value = call[1];
                if (typeof value === 'string') {
                    expect(value).not.toContain('sk-secret-frontier-key');
                }
            });
        });
    });

    describe('Body Size Enforcement', () => {
        function createOversizedStreamRequest(url: string): NextRequest {
            const payload = 'x'.repeat(8200); // > 8192 bytes
            const stream = new ReadableStream<Uint8Array>({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode(payload));
                    controller.close();
                },
            });
            return new NextRequest(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // No Content-Length header — intentional
                body: stream,
                duplex: 'half',
            });
        }

        it('returns 413 for body exceeding 8192 bytes with no Content-Length header', async () => {
            const req = createOversizedStreamRequest('http://localhost/api/frontier/base-generate');
            const res = await POST(req);
            expect(res.status).toBe(413);
        });
    });
});
