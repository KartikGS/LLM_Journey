import { ModelMeta } from "@/types/llm";
import { softmax, sampleMultinomial } from "./sampling";
import type * as OrtType from "onnxruntime-web";

let session: OrtType.InferenceSession | null = null;
let ort: typeof OrtType | null = null;

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
    session = await ortModule.InferenceSession.create(
      "/models/bigram.onnx",
      { executionProviders: ["wasm"], graphOptimizationLevel: "all" }
    );
  }
  return session;
}

import { getTracer } from "../otel/client";
import { SpanStatusCode, Span, SpanKind } from "@opentelemetry/api";

export async function generate({
  meta,
  prompt = "",
  maxNewTokens = 200,
}: {
  meta: ModelMeta;
  prompt: string;
  maxNewTokens: number;
}) {
  const { stoi, itos, block_size } = meta;
  const session = await getSession();
  const ortModule = await getOrt();
  const vocabSize = Object.keys(itos).length;

  return getTracer().startActiveSpan("llm.generate", { kind: SpanKind.INTERNAL }, async (span: Span) => {
    try {
      span.setAttribute("llm.request.model", "bigram");
      span.setAttribute("llm.request.max_tokens", maxNewTokens);
      span.addEvent("llm.generation.start");

      // Encode prompt
      let idx: number[] = prompt.split("").map((c) => stoi[c] ?? 0);
      if (idx.length === 0) idx = [0];

      const initialLength = idx.length;
      span.setAttribute("llm.prompt_length", initialLength);

      for (let step = 0; step < maxNewTokens; step++) {
        // 1. Efficiently crop context
        const idxCond = idx.length > block_size ? idx.slice(-block_size) : idx;

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

      const generatedText = idx.map((i) => itos[String(i)] ?? "").join("");
      const completionTokens = idx.length - initialLength;

      span.setAttribute("llm.usage.completion_tokens", completionTokens);
      span.addEvent("llm.generation.complete");

      return generatedText;
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw e;
    } finally {
      span.end();
    }
  });
}