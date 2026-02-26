/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/adaptation/generate/route';

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
    getAdaptationGenerateRequestsCounter: () => ({ add: mockAdd }),
    getAdaptationGenerateFallbacksCounter: () => ({ add: mockAdd }),
}));

jest.mock('@/lib/otel/logger', () => ({
    __esModule: true,
    default: {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
    },
}));

// Exact fallback strings from the handoff spec — must not drift from route.ts.
const FALLBACK_TEXT = {
    'full-finetuning':
        'Full fine-tuning retrains all model weights on task-specific data, producing highly aligned behavior at the cost of significant compute. This is a deterministic fallback — the live fine-tuned model is not configured for this environment.',
    'lora-peft':
        'LoRA adapts a frozen base model with small rank-decomposed matrices, achieving specialization at a fraction of full fine-tune cost. This is a deterministic fallback — the LLaMAntino specialist model is not available in this environment.',
    'prompt-prefix':
        'Prompt steering prepends a fixed instruction to every query without touching model weights — fastest to iterate, least robust. Base models respond less predictably than instruct variants. This is a deterministic fallback — the base model endpoint is not configured.',
};

// System prompt string as specified in the handoff — verified in injection tests.
const ADAPTATION_SYSTEM_PROMPT =
    'You are a helpful assistant. Answer the following question clearly and concisely.\n\n';

describe('Integration: Adaptation Generate API', () => {
    const originalEnv = process.env;
    const originalFetch = global.fetch;

    const ADAPTATION_API_URL = 'https://router.huggingface.co/featherless-ai/v1/chat/completions';
    const FRONTIER_API_KEY = 'test-api-key';
    const MODEL_IDS = {
        'full-finetuning': 'meta-llama/Meta-Llama-3-8B-Instruct',
        'lora-peft': 'swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA',
        'prompt-prefix': 'meta-llama/Meta-Llama-3-8B',
    };

    function createRequest(body: unknown) {
        return new NextRequest('http://localhost/api/adaptation/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    }

    function setConfigEnv(strategy: 'full-finetuning' | 'lora-peft' | 'prompt-prefix') {
        process.env.FRONTIER_API_KEY = FRONTIER_API_KEY;
        // Satisfy TypeScript — strategy parameter used for documentation clarity only here
        void strategy;
    }

    function mockLiveResponse(content: string) {
        (global.fetch as jest.Mock).mockResolvedValueOnce(
            new Response(
                JSON.stringify({ choices: [{ message: { content } }] }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            )
        );
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

    // ── Request Validation ────────────────────────────────────────────────────

    it('should return 400 invalid_prompt for empty prompt', async () => {
        const req = createRequest({ prompt: '   ', strategy: 'full-finetuning' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.error.code).toBe('invalid_prompt');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return 400 invalid_prompt for prompt exceeding 2000 chars', async () => {
        const req = createRequest({ prompt: 'a'.repeat(2001), strategy: 'lora-peft' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.error.code).toBe('invalid_prompt');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return 400 invalid_strategy for unknown strategy', async () => {
        const req = createRequest({ prompt: 'Explain LoRA.', strategy: 'unknown-strategy' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.error.code).toBe('invalid_strategy');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    // ── Missing Config — per strategy ────────────────────────────────────────

    it('should return fallback with missing_config for full-finetuning when env vars absent', async () => {
        const req = createRequest({ prompt: 'What is fine-tuning?', strategy: 'full-finetuning' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('fallback');
        expect(body.reason.code).toBe('missing_config');
        expect(body.output).toBe(FALLBACK_TEXT['full-finetuning']);
        expect(body.metadata.strategy).toBe('full-finetuning');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return fallback with missing_config for lora-peft when env vars absent', async () => {
        const req = createRequest({ prompt: 'What is LoRA?', strategy: 'lora-peft' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('fallback');
        expect(body.reason.code).toBe('missing_config');
        expect(body.output).toBe(FALLBACK_TEXT['lora-peft']);
        expect(body.metadata.strategy).toBe('lora-peft');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return fallback with missing_config for prompt-prefix when env vars absent', async () => {
        const req = createRequest({ prompt: 'What is prompt steering?', strategy: 'prompt-prefix' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('fallback');
        expect(body.reason.code).toBe('missing_config');
        expect(body.output).toBe(FALLBACK_TEXT['prompt-prefix']);
        expect(body.metadata.strategy).toBe('prompt-prefix');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    // ── Live Response — per strategy ─────────────────────────────────────────

    it('should return live mode response for full-finetuning when configured', async () => {
        setConfigEnv('full-finetuning');
        mockLiveResponse('Fine-tuning output');

        const req = createRequest({ prompt: 'Explain fine-tuning.', strategy: 'full-finetuning' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('live');
        expect(body.output).toBe('Fine-tuning output');
        expect(body.metadata.strategy).toBe('full-finetuning');
        expect(body.metadata.modelId).toBe(MODEL_IDS['full-finetuning']);
    });

    it('should return live mode response for lora-peft when configured', async () => {
        setConfigEnv('lora-peft');
        mockLiveResponse('LoRA output');

        const req = createRequest({ prompt: 'Explain LoRA.', strategy: 'lora-peft' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('live');
        expect(body.output).toBe('LoRA output');
        expect(body.metadata.strategy).toBe('lora-peft');
        expect(body.metadata.modelId).toBe(MODEL_IDS['lora-peft']);
    });

    it('should return live mode response for prompt-prefix when configured', async () => {
        setConfigEnv('prompt-prefix');
        mockLiveResponse('Prompt prefix output');

        const req = createRequest({ prompt: 'Explain prompt steering.', strategy: 'prompt-prefix' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('live');
        expect(body.output).toBe('Prompt prefix output');
        expect(body.metadata.strategy).toBe('prompt-prefix');
        expect(body.metadata.modelId).toBe(MODEL_IDS['prompt-prefix']);
    });

    it('should cap live output at ADAPTATION_OUTPUT_MAX_CHARS characters', async () => {
        setConfigEnv('full-finetuning');
        mockLiveResponse('This response is longer than ten characters');

        let isolatedPOST: typeof POST;
        jest.isolateModules(() => {
            jest.mock('@/lib/config/generation', () => ({
                ADAPTATION_GENERATION_CONFIG: {
                    apiUrl: 'https://router.huggingface.co/featherless-ai/v1/chat/completions',
                    timeoutMs: 8000,
                    outputMaxChars: 10,
                    models: {
                        'full-finetuning': 'meta-llama/Meta-Llama-3-8B-Instruct',
                        'lora-peft': 'swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA',
                        'prompt-prefix': 'meta-llama/Meta-Llama-3-8B',
                    },
                },
            }));
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            isolatedPOST = require('@/app/api/adaptation/generate/route').POST;
        });

        const req = createRequest({ prompt: 'Test cap.', strategy: 'full-finetuning' });
        const res = await isolatedPOST!(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('live');
        expect(body.output).toBe('This respo');
        expect(body.output.length).toBe(10);
    });

    // ── System Prompt Injection ───────────────────────────────────────────────

    it('should include system message as first message for prompt-prefix strategy', async () => {
        setConfigEnv('prompt-prefix');
        mockLiveResponse('Output with system prompt');

        const prompt = 'What is a language model?';
        const req = createRequest({ prompt, strategy: 'prompt-prefix' });
        await POST(req);

        const calledBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body as string);
        expect(calledBody.messages[0]).toEqual({
            role: 'system',
            content: ADAPTATION_SYSTEM_PROMPT,
        });
        expect(calledBody.messages[1]).toEqual({ role: 'user', content: prompt });
        expect(calledBody.messages).toHaveLength(2);
    });

    it('should NOT include system message for full-finetuning strategy', async () => {
        setConfigEnv('full-finetuning');
        mockLiveResponse('Output without system prompt');

        const prompt = 'What is fine-tuning?';
        const req = createRequest({ prompt, strategy: 'full-finetuning' });
        await POST(req);

        const calledBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body as string);
        expect(calledBody.messages).toHaveLength(1);
        expect(calledBody.messages[0].role).toBe('user');
        const hasSystemMessage = calledBody.messages.some(
            (m: { role: string }) => m.role === 'system'
        );
        expect(hasSystemMessage).toBe(false);
    });

    // ── Correct Model Routing — per strategy ─────────────────────────────────

    it('should route to full-finetuning model ID', async () => {
        setConfigEnv('full-finetuning');
        mockLiveResponse('output');

        const req = createRequest({ prompt: 'Test prompt', strategy: 'full-finetuning' });
        await POST(req);

        const calledBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body as string);
        expect(calledBody.model).toBe(MODEL_IDS['full-finetuning']);
    });

    it('should route to lora-peft model ID', async () => {
        setConfigEnv('lora-peft');
        mockLiveResponse('output');

        const req = createRequest({ prompt: 'Test prompt', strategy: 'lora-peft' });
        await POST(req);

        const calledBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body as string);
        expect(calledBody.model).toBe(MODEL_IDS['lora-peft']);
    });

    it('should route to prompt-prefix model ID', async () => {
        setConfigEnv('prompt-prefix');
        mockLiveResponse('output');

        const req = createRequest({ prompt: 'Test prompt', strategy: 'prompt-prefix' });
        await POST(req);

        const calledBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body as string);
        expect(calledBody.model).toBe(MODEL_IDS['prompt-prefix']);
    });

    // ── Upstream Error Handling ───────────────────────────────────────────────

    it('should return fallback with quota_limited when upstream returns 429', async () => {
        setConfigEnv('full-finetuning');
        (global.fetch as jest.Mock).mockResolvedValueOnce(
            new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429 })
        );

        const req = createRequest({ prompt: 'Explain fine-tuning.', strategy: 'full-finetuning' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('fallback');
        expect(body.reason.code).toBe('quota_limited');
    });

    it('should return fallback with upstream_auth when upstream returns 401', async () => {
        setConfigEnv('full-finetuning');
        (global.fetch as jest.Mock).mockResolvedValueOnce(
            new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        );

        const req = createRequest({ prompt: 'Explain fine-tuning.', strategy: 'full-finetuning' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('fallback');
        expect(body.reason.code).toBe('upstream_auth');
    });

    it('should return fallback with upstream_error when upstream returns 503', async () => {
        setConfigEnv('full-finetuning');
        (global.fetch as jest.Mock).mockResolvedValueOnce(
            new Response(JSON.stringify({ error: 'Service unavailable' }), { status: 503 })
        );

        const req = createRequest({ prompt: 'Explain fine-tuning.', strategy: 'full-finetuning' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('fallback');
        expect(body.reason.code).toBe('upstream_error');
    });

    it('should return fallback with timeout when fetch is aborted', async () => {
        setConfigEnv('full-finetuning');
        (global.fetch as jest.Mock).mockRejectedValueOnce(
            Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
        );

        const req = createRequest({ prompt: 'Explain fine-tuning.', strategy: 'full-finetuning' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('fallback');
        expect(body.reason.code).toBe('timeout');
    });

    it('should return fallback with empty_provider_output when provider returns empty content', async () => {
        setConfigEnv('full-finetuning');
        (global.fetch as jest.Mock).mockResolvedValueOnce(
            new Response(
                JSON.stringify({ choices: [{ message: { content: '' } }] }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            )
        );

        const req = createRequest({ prompt: 'Explain fine-tuning.', strategy: 'full-finetuning' });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.mode).toBe('fallback');
        expect(body.reason.code).toBe('empty_provider_output');
    });

    // ── Strategy-Specific Fallback Text ──────────────────────────────────────

    it('should return exact fallback text for full-finetuning strategy', async () => {
        const req = createRequest({ prompt: 'Explain fine-tuning.', strategy: 'full-finetuning' });
        const res = await POST(req);
        const body = await res.json();

        expect(body.output).toBe(FALLBACK_TEXT['full-finetuning']);
    });

    it('should return exact fallback text for lora-peft strategy', async () => {
        const req = createRequest({ prompt: 'Explain LoRA.', strategy: 'lora-peft' });
        const res = await POST(req);
        const body = await res.json();

        expect(body.output).toBe(FALLBACK_TEXT['lora-peft']);
    });

    it('should return exact fallback text for prompt-prefix strategy', async () => {
        const req = createRequest({ prompt: 'Explain prompt steering.', strategy: 'prompt-prefix' });
        const res = await POST(req);
        const body = await res.json();

        expect(body.output).toBe(FALLBACK_TEXT['prompt-prefix']);
    });

    describe('Metrics and Security', () => {
        const VALID_ENV = {
            FRONTIER_API_KEY: 'sk-secret-key',
        };

        it('increments adaptation_generate.requests counter on every POST', async () => {
            const req = createRequest({ prompt: 'test', strategy: 'full-finetuning' });
            await POST(req);
            expect(mockAdd).toHaveBeenCalledWith(1);
        });

        it('increments adaptation_generate.fallbacks with reason_code missing_config when not configured', async () => {
            const req = createRequest({ prompt: 'test', strategy: 'full-finetuning' });
            await POST(req);
            expect(mockAdd).toHaveBeenCalledWith(1, { reason_code: 'missing_config' });
        });

        it('increments adaptation_generate.fallbacks with reason_code timeout on AbortError', async () => {
            Object.assign(process.env, VALID_ENV);
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                Object.assign(new Error('aborted'), { name: 'AbortError' })
            );

            const req = createRequest({ prompt: 'test', strategy: 'full-finetuning' });
            await POST(req);
            expect(mockAdd).toHaveBeenCalledWith(1, { reason_code: 'timeout' });
        });

        it('increments adaptation_generate.fallbacks with reason_code upstream_auth on upstream 401', async () => {
            Object.assign(process.env, VALID_ENV);
            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(JSON.stringify({ error: 'Auth failed' }), { status: 401 })
            );

            const req = createRequest({ prompt: 'test', strategy: 'full-finetuning' });
            await POST(req);
            expect(mockAdd).toHaveBeenCalledWith(1, { reason_code: 'upstream_auth' });
        });

        it('does not call fallbacks counter on a successful live response', async () => {
            Object.assign(process.env, VALID_ENV);
            mockLiveResponse('Success');

            const req = createRequest({ prompt: 'test', strategy: 'full-finetuning' });
            await POST(req);

            const fallbackCalls = mockAdd.mock.calls.filter(call => call[1] && call[1].reason_code);
            expect(fallbackCalls.length).toBe(0);
        });

        it('does not expose FRONTIER_API_KEY in the response body on any fallback path', async () => {
            Object.assign(process.env, VALID_ENV);
            (global.fetch as jest.Mock).mockResolvedValueOnce(
                new Response(JSON.stringify({ error: 'Error' }), { status: 500 })
            );

            const req = createRequest({ prompt: 'test', strategy: 'full-finetuning' });
            const res = await POST(req);
            const body = await res.json();
            expect(JSON.stringify(body)).not.toContain('sk-secret-key');
        });

        it('does not expose ADAPTATION_SYSTEM_PROMPT content in the response body', async () => {
            Object.assign(process.env, VALID_ENV);
            mockLiveResponse('Success');

            const req = createRequest({ prompt: 'test', strategy: 'prompt-prefix' });
            const res = await POST(req);
            const body = await res.json();
            // ADAPTATION_SYSTEM_PROMPT content: 'You are a helpful assistant'
            expect(JSON.stringify(body)).not.toContain('You are a helpful assistant');
        });

        it('does not set ADAPTATION_SYSTEM_PROMPT content as a span attribute', async () => {
            Object.assign(process.env, VALID_ENV);
            mockLiveResponse('Success');

            const req = createRequest({ prompt: 'test', strategy: 'prompt-prefix' });
            await POST(req);

            mockSpan.setAttribute.mock.calls.forEach(call => {
                const value = call[1];
                if (typeof value === 'string') {
                    expect(value).not.toContain('You are a helpful assistant');
                }
            });
        });
    });
});
