# BA to Tech Lead Handoff

## Subject: CR-013 — Hugging Face Inference API Provider Support

## Requirement Summary

**What:** Extend `/api/frontier/base-generate` to support Hugging Face's free Inference API format alongside the existing OpenAI-compatible format.

**Why:** The current endpoint only supports OpenAI-compatible chat completion APIs. The Human User wants to use Meta-Llama-3-8B via Hugging Face Inference API, which uses a different request/response contract. This enables Product End Users to experience a real 8B-parameter frontier base model, demonstrating scale differences from the tiny local model.

**Who benefits:** Product End Users learning about frontier model behavior; Human User wanting HF provider flexibility.

## Current State Analysis

**Endpoint:** `app/api/frontier/base-generate/route.ts`

**Current Request Format (lines 354-358):**
```typescript
{
  model: frontierConfig.modelId,
  messages: [{ role: "user", content: prompt }],
  temperature: 0.4
}
```

**Current Response Parsing (extractProviderOutput, lines 168-207):**
- OpenAI: `{ choices: [{ message: { content: "..." } }] }`
- Anthropic: `{ content: [{ text: "..." }] }`

**Required HF Format:**
```typescript
// Request
POST https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B
Authorization: Bearer {HF_TOKEN}
{
  inputs: "prompt text",
  parameters: { max_new_tokens: N, temperature: T }
}

// Response
[{ generated_text: "..." }]
```

## Scope Boundaries

**In Scope:**
- Add HF Inference API adapter logic to route.ts
- Add env configuration for provider type selection
- Update response parser to handle HF format
- Extend span attributes for provider identification
- Update/add unit tests for HF path

**Out of Scope:**
- UI changes (FrontierBaseChat.tsx continues to work unchanged)
- Changes to the tiny local model inference
- HF Inference Endpoints (paid tier) support
- Other HF models beyond what user configures

## Acceptance Criteria (from CR-013)

1. HF Inference API format supported
2. Provider selection via configuration
3. Existing OpenAI-compatible flow unchanged
4. Fallback mechanism works for HF-specific errors
5. Span attributes include provider type
6. `pnpm lint` passes
7. `pnpm build` passes
8. Unit tests updated/added

## Constraints & Risks

1. **License Compliance:** Meta's Llama 3 Community License applies. No weight redistribution; proper attribution required. Implementation only calls HF API (no local weights).

2. **API Format Fragility:** HF Inference API format is less standardized than OpenAI's. Consider defensive parsing.

3. **Model Availability:** Meta-Llama-3-8B may have rate limits or availability issues on free tier. Existing fallback mechanism should handle this.

## Requested Action

Please assess technical complexity and create an implementation plan. Key decisions needed:

1. **Provider detection strategy:** New env var (e.g., `FRONTIER_PROVIDER=huggingface|openai`) vs. URL-based detection?
2. **Code organization:** Single route with conditionals vs. separate adapter modules?
3. **Testing approach:** Mock HF responses in existing test file or separate test file?

## Reference Files

- Endpoint: `app/api/frontier/base-generate/route.ts`
- Tests: `__tests__/api/frontier-base-generate.test.ts`
- Env example: `.env.example`
- CR: `agent-docs/requirements/CR-013-huggingface-inference-provider.md`
