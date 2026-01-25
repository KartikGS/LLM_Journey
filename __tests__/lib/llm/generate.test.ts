import { generate } from "@/lib/llm/generateClient";
import type { ModelMeta } from "@/types/llm";
import { SpanStatusCode } from "@opentelemetry/api";

/* -------------------------------------------------------------------------- */
/*                                Test Mocks                                  */
/* -------------------------------------------------------------------------- */

// ---- sampling.ts ----
jest.mock("@/lib/llm/sampling", () => ({
  softmax: jest.fn(() => [0, 1, 0]), // always pick token 1
  sampleMultinomial: jest.fn(() => 1),
}));

// ---- OpenTelemetry ----
const mockSpan = {
  setAttribute: jest.fn(),
  addEvent: jest.fn(),
  recordException: jest.fn(),
  setStatus: jest.fn(),
  end: jest.fn(),
};

const mockTracer = {
  startActiveSpan: jest.fn((_name, _opts, fn) => fn(mockSpan)),
};

jest.mock("@/lib/otel/client", () => ({
  getTracer: () => mockTracer,
}));

// ---- onnxruntime-web ----
const mockRun = jest.fn();

jest.mock("onnxruntime-web", () => ({
    InferenceSession: {
      create: jest.fn(async () => ({
        run: mockRun,
      })),
    },
    Tensor: jest.fn((_type, _data, dims) => ({
      dims,
    })),
    env: { wasm: {} },
  }));  

/* -------------------------------------------------------------------------- */
/*                               Test Fixtures                                 */
/* -------------------------------------------------------------------------- */

const meta: ModelMeta = {
  block_size: 4,
  stoi: {
    a: 1,
    b: 2,
  },
  itos: {
    "0": "",
    "1": "a",
    "2": "b",
  },
};

/**
 * Creates fake logits shaped as:
 * [T, vocabSize] flattened
 */
function fakeLogits(T: number, vocabSize: number) {
  return new Float32Array(T * vocabSize).fill(0);
}

/* -------------------------------------------------------------------------- */
/*                                   Tests                                    */
/* -------------------------------------------------------------------------- */

describe("generate()", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockRun.mockImplementation(({ input_ids }) => {
      const T = input_ids.dims[1];
      const vocabSize = Object.keys(meta.itos).length;

      return {
        logits: {
          data: fakeLogits(T, vocabSize),
        },
      };
    });
  });

  it("generates maxNewTokens tokens deterministically", async () => {
    const text = await generate({
      meta,
      prompt: "a",
      maxNewTokens: 3,
    });

    // prompt "a" + 3 generated tokens ("a")
    expect(text).toBe("aaaa");
  });

  it("defaults to token 0 when prompt is empty", async () => {
    const text = await generate({
      meta,
      prompt: "",
      maxNewTokens: 2,
    });

    expect(text.length).toBe(2);
  });

  it("respects block_size context cropping", async () => {
    await generate({
      meta,
      prompt: "ababab", // length > block_size
      maxNewTokens: 1,
    });

    // last call should use block_size tokens
    const lastCall = mockRun.mock.calls.at(-1)?.[0];
    expect(lastCall.input_ids.dims[1]).toBe(meta.block_size);
  });

  it("emits correct OpenTelemetry attributes", async () => {
    await generate({
      meta,
      prompt: "ab",
      maxNewTokens: 2,
    });

    expect(mockTracer.startActiveSpan).toHaveBeenCalledWith(
      "llm.generate",
      expect.any(Object),
      expect.any(Function)
    );

    expect(mockSpan.setAttribute).toHaveBeenCalledWith(
      "llm.request.model",
      "bigram"
    );

    expect(mockSpan.setAttribute).toHaveBeenCalledWith(
      "llm.request.max_tokens",
      2
    );

    expect(mockSpan.setAttribute).toHaveBeenCalledWith(
      "llm.prompt_length",
      2
    );

    expect(mockSpan.setAttribute).toHaveBeenCalledWith(
      "llm.usage.completion_tokens",
      2
    );

    expect(mockSpan.addEvent).toHaveBeenCalledWith(
      "llm.generation.start"
    );

    expect(mockSpan.addEvent).toHaveBeenCalledWith(
      "llm.generation.complete"
    );

    expect(mockSpan.end).toHaveBeenCalled();
  });

  it("records error and sets span status on inference failure", async () => {
    mockRun.mockRejectedValueOnce(new Error("ONNX failure"));

    await expect(
      generate({
        meta,
        prompt: "a",
        maxNewTokens: 1,
      })
    ).rejects.toThrow("ONNX failure");

    expect(mockSpan.recordException).toHaveBeenCalled();
    expect(mockSpan.setStatus).toHaveBeenCalledWith({
      code: SpanStatusCode.ERROR,
    });
    expect(mockSpan.end).toHaveBeenCalled();
  });
});
