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
}));

jest.mock('@/lib/otel/logger', () => ({
    __esModule: true,
    default: {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
    },
}));

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

        it('should return live envelope when HF upstream succeeds', async () => {
            setHfEnv();

            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ choices: [{ text: 'HF output text' }] }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                )
            );

            const req = createRequest({ prompt: 'Explain why scale helps language models.' });
            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.mode).toBe('live');
            expect(body.output).toBe('HF output text');
        });

        it('should send HF request body format (inputs + parameters)', async () => {
            setHfEnv();

            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ choices: [{ text: 'HF output text' }] }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                )
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
            });
            expect(calledBody).not.toHaveProperty('inputs');
            expect(calledBody).not.toHaveProperty('parameters');
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

        it('should return empty_provider_output fallback when HF generated_text is empty', async () => {
            setHfEnv();

            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ choices: [{ text: '' }] }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                )
            );

            const req = createRequest({ prompt: 'Explain scaling.' });
            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.mode).toBe('fallback');
            expect(body.reason.code).toBe('empty_provider_output');
        });


    });

    it('should return live envelope when upstream provider succeeds', async () => {
        process.env.FRONTIER_API_KEY = 'secret-key';

        (global.fetch as jest.Mock).mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    choices: [
                        {
                            message: {
                                content: 'Live provider output',
                            },
                        },
                    ],
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
        expect(body).toEqual({
            mode: 'live',
            output: 'Live provider output',
            metadata: {
                label: 'Frontier Base Model',
                modelId: 'meta-llama/Meta-Llama-3-8B',
                assistantTuned: false,
                adaptation: 'none',
                note: 'Pretrained on internet-scale text; not assistant fine-tuned.',
            },
        });

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

            // Should be called at least once for requests counter
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

        it('does not call fallbacks counter on a successful live response', async () => {
            Object.assign(process.env, HF_ENV);
            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ choices: [{ text: 'success' }] }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                )
            );

            const req = createRequest({ prompt: 'test prompt' });
            await POST(req);

            // mockAdd should be called for requests counter (1), but not for fallbacks
            // Check that no call has a reason_code
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
                new Response(
                    JSON.stringify({ choices: [{ text: 'success' }] }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                )
            );

            const req = createRequest({ prompt: 'test prompt' });
            await POST(req);

            mockSpan.setAttribute.mock.calls.forEach(call => {
                const value = call[1];
                if (typeof value === 'string') {
                    expect(value).not.toContain('sk-secret-frontier-key');
                }
            });
        });
    });
});
