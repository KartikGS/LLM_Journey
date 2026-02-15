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
