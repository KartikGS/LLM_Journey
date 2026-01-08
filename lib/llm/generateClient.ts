import { ModelMeta } from "@/types/llm";
import { softmax, sampleMultinomial } from "./sampling";
import type * as OrtType from "onnxruntime-web";
import { metrics } from "@/lib/observability/metrics";
import { trace, SpanStatusCode } from '@opentelemetry/api';

let session: OrtType.InferenceSession | null = null;
let ort: typeof OrtType | null = null;
let modelLoadStartTime: number | null = null;

async function getOrt(): Promise<typeof OrtType> {
  if (!ort) {
    ort = await import("onnxruntime-web");
    // Configure environment immediately after loading
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.simd = true;
  }
  return ort;
}

async function getSession(): Promise<OrtType.InferenceSession> {
  if (!session) {
    const ortModule = await getOrt();
    modelLoadStartTime = Date.now();
    try {
      session = await ortModule.InferenceSession.create(
        "/models/bigram.onnx",
        { executionProviders: ["wasm"], graphOptimizationLevel: "all" }
      );
      // Track model loading time
      if (modelLoadStartTime !== null) {
        const loadDuration = (Date.now() - modelLoadStartTime) / 1000; // Convert to seconds
        metrics.llmModelLoadTime.observe({ model: 'bigram.onnx' }, loadDuration);
        modelLoadStartTime = null;
      }
    } catch (error) {
      metrics.llmErrors.inc({ type: 'model_load', model: 'bigram.onnx' });
      if (modelLoadStartTime !== null) {
        modelLoadStartTime = null;
      }
      throw error;
    }
  }
  return session;
}

export async function generate({
  meta,
  prompt = "",
  maxNewTokens = 200,
}: {
  meta: ModelMeta;
  prompt: string;
  maxNewTokens: number;
}) {
  const startTime = Date.now();
  const tracer = trace.getTracer('llm-journey-generate');
  const span = tracer.startSpan('llm.generate', {
    attributes: {
      'llm.model': 'bigram.onnx',
      'llm.max_new_tokens': maxNewTokens,
      'llm.prompt_length': prompt.length,
    },
  });

  try {
    const { stoi, itos, block_size } = meta;
    const session = await getSession();
    const ortModule = await getOrt();
    const vocabSize = Object.keys(itos).length;

    // Encode prompt
    let idx: number[] = prompt.split("").map(c => stoi[c] ?? 0);
    if (idx.length === 0) idx = [0];

    // Track input tokens
    const inputTokenCount = idx.length;
    metrics.llmTokensInput.inc({ model: 'bigram.onnx' }, inputTokenCount);

    for (let step = 0; step < maxNewTokens; step++) {
      // 1. Efficiently crop context
      const idxCond = idx.length > block_size
        ? idx.slice(-block_size)
        : idx;

      // 2. Create tensor once per step
      const inputTensor = new ortModule.Tensor(
        "int64",
        new BigInt64Array(idxCond.map(BigInt)),
        [1, idxCond.length]
      );

      // 3. Inference
      const outputs = await session.run({ input_ids: inputTensor });
      const logits = outputs.logits.data as Float32Array;

      // 4. Extract last logit without full Array.from overhead
      const T = idxCond.length;
      const lastLogits = logits.subarray((T - 1) * vocabSize, T * vocabSize);

      // 5. Softmax & Sample (ensure these accept Float32Array)
      const probs = softmax(Array.from(lastLogits));
      const nextToken = sampleMultinomial(probs);

      idx.push(nextToken);

      // Optional: Add a callback here to stream tokens to the UI
      // onToken(itos[String(nextToken)]); 
    }

    const outputText = idx.map(i => itos[String(i)] ?? "").join("");
    const outputTokenCount = idx.length - inputTokenCount;

    // Track metrics
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    metrics.llmGenerations.inc({ model: 'bigram.onnx', status: 'success' });
    metrics.llmGenerationDuration.observe({ model: 'bigram.onnx', status: 'success' }, duration);
    metrics.llmTokensGenerated.inc({ model: 'bigram.onnx' }, outputTokenCount);

    span.setAttributes({
      'llm.output_length': outputText.length,
      'llm.tokens_generated': outputTokenCount,
      'llm.tokens_input': inputTokenCount,
      'llm.duration': duration,
      'llm.status': 'success',
    });
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    return outputText;
  } catch (error) {
    // Track error metrics
    metrics.llmGenerations.inc({ model: 'bigram.onnx', status: 'error' });
    metrics.llmErrors.inc({ type: 'generation', model: 'bigram.onnx' });

    // Track duration even on error
    const duration = (Date.now() - startTime) / 1000;
    metrics.llmGenerationDuration.observe({ model: 'bigram.onnx', status: 'error' }, duration);

    span.recordException(error instanceof Error ? error : new Error(String(error)));
    span.setStatus({ 
      code: SpanStatusCode.ERROR, 
      message: error instanceof Error ? error.message : String(error) 
    });
    span.setAttributes({
      'llm.status': 'error',
      'llm.duration': duration,
    });
    span.end();

    throw error;
  }
}