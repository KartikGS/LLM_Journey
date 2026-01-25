import { generate } from '@/lib/llm/generateClient';
import { ModelMeta } from '@/types/llm';
import { SpanStatusCode } from '@opentelemetry/api';

// --- Mocks ---

// Mock onnxruntime-web
// We need to mock both the default export and named exports if used.
// Based on generateClient.ts, it does: import type * as OrtType from "onnxruntime-web";
// and dynamic import: await import("onnxruntime-web");
jest.mock('onnxruntime-web', () => {
    const mockSession = {
        run: jest.fn(),
    };
    return {
        InferenceSession: {
            create: jest.fn().mockResolvedValue(mockSession),
        },
        Tensor: jest.fn().mockImplementation((type, data, dims) => ({
            data,
            dims,
        })),
        env: {
            wasm: {
                numThreads: 1,
                simd: true,
            },
        },
    };
});

// Mock OTEL
const mockSpan = {
    setAttribute: jest.fn(),
    addEvent: jest.fn(),
    recordException: jest.fn(),
    setStatus: jest.fn(),
    end: jest.fn(),
};

jest.mock('@/lib/otel/client', () => ({
    getTracer: jest.fn().mockReturnValue({
        startActiveSpan: jest.fn((name, options, callback) => callback(mockSpan)),
    }),
}));

// Mock sampling to be deterministic
jest.mock('@/lib/llm/sampling', () => ({
    softmax: jest.fn((logits) => logits), // Pass through for simplicity
    sampleMultinomial: jest.fn(() => 42), // Always return token 42
}));

describe('Integration: LLM Orchestration (generateClient)', () => {
    const mockMeta: ModelMeta = {
        block_size: 32, // Important for cropping logic
        stoi: { 'a': 1, 'b': 2 },
        itos: { '1': 'a', '2': 'b', '42': 'x' },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should orchestrate session creation, tokenization, inference loop, and telemetry', async () => {
        const ort = require('onnxruntime-web');
        const sessionMock = await ort.InferenceSession.create();

        // Setup mock return for session.run
        // generateClient expects outputs.logits.data as Float32Array
        // vocab_size is 100.
        // It slices based on T * vocabSize.
        // We need to ensure we return enough data.
        // If maxNewTokens is 1, loop runs once.
        // input prompt "a" -> idx=[1]. T=1.
        // We need at least 1 * 100 floats.
        const mockLogits = new Float32Array(100 * 32).fill(0.1);
        sessionMock.run.mockResolvedValue({
            logits: { data: mockLogits },
        });

        const result = await generate({
            meta: mockMeta,
            prompt: 'a',
            maxNewTokens: 2,
        });

        // 1. Session Creation (only once ideally, but here mocked global)
        expect(ort.InferenceSession.create).toHaveBeenCalledWith(
            "/models/bigram.onnx",
            expect.objectContaining({ executionProviders: ["wasm"] })
        );

        // 2. Telemetry
        expect(mockSpan.setAttribute).toHaveBeenCalledWith('llm.request.model', 'bigram');
        expect(mockSpan.addEvent).toHaveBeenCalledWith('llm.generation.start');

        // 3. Inference Loop
        // ran 2 times
        expect(sessionMock.run).toHaveBeenCalledTimes(2);

        // 4. Output validation
        // sampling mock returns 42 ('x').
        // "a" (input) + "x" + "x" -> "xx" should be the generated part?
        // generateClient returns `idx.map(...)`.
        // Wait, generateClient implementation:
        // idx starts with prompt.
        // loop pushes new tokens.
        // returns generatedText = idx.map...
        // so it returns PROMPT + GENERATED.

        expect(result).toBe('axx');

        expect(mockSpan.setAttribute).toHaveBeenCalledWith('llm.usage.completion_tokens', 2);
    });

    it('should handle inference errors and record them in telemetry', async () => {
        const ort = require('onnxruntime-web');
        const sessionMock = await ort.InferenceSession.create();

        sessionMock.run.mockRejectedValue(new Error('ONNX Runtime Error'));

        await expect(generate({
            meta: mockMeta,
            prompt: 'a',
            maxNewTokens: 1,
        })).rejects.toThrow('ONNX Runtime Error');

        expect(mockSpan.recordException).toHaveBeenCalledWith(expect.any(Error));
        expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.ERROR });
        expect(mockSpan.end).toHaveBeenCalled();
    });
});
