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
        process.env = { ...originalEnv };
        delete process.env.FRONTIER_API_URL;
        delete process.env.FRONTIER_MODEL_ID;
        delete process.env.FRONTIER_API_KEY;
        delete process.env.FRONTIER_TIMEOUT_MS;
        delete process.env.FRONTIER_PROVIDER;
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
            modelId: 'unconfigured-frontier-base',
            assistantTuned: false,
            adaptation: 'none',
            note: 'Pretrained on internet-scale text; not assistant fine-tuned.',
        });
        expect(global.fetch).not.toHaveBeenCalled();
    });

    describe('HF Provider Path', () => {
        const HF_ENV = {
            FRONTIER_API_URL: 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B',
            FRONTIER_MODEL_ID: 'meta-llama/Meta-Llama-3-8B',
            FRONTIER_API_KEY: 'hf-secret-key',
            FRONTIER_PROVIDER: 'huggingface',
        };

        function setHfEnv() {
            Object.assign(process.env, HF_ENV);
        }

        it('should return live envelope when HF upstream succeeds', async () => {
            setHfEnv();

            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(
                    JSON.stringify([{ generated_text: 'HF output text' }]),
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
                    JSON.stringify([{ generated_text: 'HF output text' }]),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                )
            );

            const prompt = 'Explain why scale helps language models.';
            const req = createRequest({ prompt });
            await POST(req);

            const calledBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body as string);
            expect(calledBody).toEqual({
                inputs: prompt,
                parameters: { max_new_tokens: 256, temperature: 0.4 },
            });
            expect(calledBody).not.toHaveProperty('model');
            expect(calledBody).not.toHaveProperty('messages');
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
                    JSON.stringify([{ generated_text: '' }]),
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

        it('should return invalid_config fallback and not call fetch for unknown FRONTIER_PROVIDER', async () => {
            process.env.FRONTIER_API_URL = HF_ENV.FRONTIER_API_URL;
            process.env.FRONTIER_MODEL_ID = HF_ENV.FRONTIER_MODEL_ID;
            process.env.FRONTIER_API_KEY = HF_ENV.FRONTIER_API_KEY;
            process.env.FRONTIER_PROVIDER = 'unknown_provider';

            const req = createRequest({ prompt: 'Explain scaling.' });
            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.mode).toBe('fallback');
            expect(body.reason.code).toBe('invalid_config');
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });

    it('should return live envelope when upstream provider succeeds', async () => {
        process.env.FRONTIER_API_URL = 'https://provider.example/v1/chat/completions';
        process.env.FRONTIER_MODEL_ID = 'frontier-base-live';
        process.env.FRONTIER_API_KEY = 'secret-key';
        process.env.FRONTIER_TIMEOUT_MS = '5000';

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
                modelId: 'frontier-base-live',
                assistantTuned: false,
                adaptation: 'none',
                note: 'Pretrained on internet-scale text; not assistant fine-tuned.',
            },
        });

        expect(global.fetch).toHaveBeenCalledWith(
            'https://provider.example/v1/chat/completions',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    Authorization: 'Bearer secret-key',
                    'Content-Type': 'application/json',
                }),
            })
        );
    });
});
