# Handoff: Tech Lead → Backend Agent

## Subject
`CR-015 - Adaptation Page: New /api/adaptation/generate Endpoint`

## Status
`issued`

---

## Objective

Create a new POST API route at `/api/adaptation/generate` that accepts a `strategy` parameter and routes to the correct model per strategy. The endpoint also applies a server-side system prompt for the `prompt-prefix` strategy. Fallback behavior (deterministic strategy-specific text) is required when the API is unconfigured or unavailable.

---

## Rationale (Why)

The `AdaptationChat` frontend component (being built in parallel by the Frontend Agent) needs a backend route to call. The existing `/api/frontier/base-generate` route is hardcoded to a single model via env vars — it cannot be reused for multi-strategy routing. A new endpoint is required that:
1. Accepts a `strategy` parameter to select the correct model.
2. Applies a server-side system prompt for the `prompt-prefix` strategy (educational: shows prompt steering without weight changes).
3. Returns the same response shape as `base-generate` so the frontend can apply identical rendering logic.

---

## Constraints

### Technical
- **Pattern**: Follow `app/api/frontier/base-generate/route.ts` exactly as the implementation template (OTel tracing, zod validation, config loading, fallback logic, response shape).
- **Provider format**: OpenAI **chat completions** format (`messages` array) for all three strategies. NOT text completions format. Endpoint: `ADAPTATION_API_URL` (separate env var, defaults to `https://router.huggingface.co/featherless-ai/v1/chat/completions`).
- **API key**: Shared with `FRONTIER_API_KEY`. No new API key env var.
- **Timeout**: Shared `FRONTIER_TIMEOUT_MS`. No new timeout env var.
- **No new packages**: `zod`, `@opentelemetry/api`, `next/server`, `@/lib/otel/*` from the existing stack are sufficient.
- **Response shape** (must match `base-generate` exactly so frontend code is identical):
  ```ts
  // Success (live)
  { mode: 'live', output: string, metadata: AdaptationModelMetadata }
  // Success (fallback)
  { mode: 'fallback', output: string, reason: { code: string, message: string }, metadata: AdaptationModelMetadata }
  // Validation error (400)
  { error: { code: 'invalid_json' | 'invalid_prompt' | 'invalid_strategy', message: string } }
  ```
- **Security**: System prompt for `prompt-prefix` must NEVER appear in the client-side response payload or in any logged field exposed to clients. It is applied in the server-side request body only.
- **TypeScript strict mode** is enabled. All types must be explicit.

### Ownership
- Backend-owned files:
  - `app/api/adaptation/generate/route.ts` (new)
  - `__tests__/api/adaptation-generate.test.ts` (new)
- `.env.example` update: **already done by Tech Lead**. Do NOT modify `.env.example`.
- Test scope: **delegated to Backend Agent** for unit tests only (see below). E2E tests are handled separately by the Testing Agent.

---

## Env Vars (Already Added to `.env.example`)

```
ADAPTATION_API_URL          # e.g. https://router.huggingface.co/featherless-ai/v1/chat/completions
ADAPTATION_FULL_FINETUNE_MODEL_ID   # e.g. meta-llama/Meta-Llama-3-8B-Instruct
ADAPTATION_LORA_MODEL_ID            # e.g. swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA
ADAPTATION_PROMPT_PREFIX_MODEL_ID   # e.g. meta-llama/Meta-Llama-3-8B

# Shared (read-only — no new vars for these):
FRONTIER_API_KEY            # same key as used by frontier endpoint
FRONTIER_TIMEOUT_MS         # same timeout config
```

---

## Implementation Specification (Tech Lead Owned — Use Exactly)

### 1. Request Schema (zod)
```ts
const STRATEGY_VALUES = ['full-finetuning', 'lora-peft', 'prompt-prefix'] as const;
type StrategyId = typeof STRATEGY_VALUES[number];

const requestSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  strategy: z.enum(STRATEGY_VALUES),
});
```
Return `{ error: { code: 'invalid_strategy', message: '...' } }` with HTTP 400 if strategy is invalid. Use the existing `invalid_prompt` code for prompt validation failures.

### 2. Config Loading
Load per-strategy model IDs from env. Configuration is considered valid only when `ADAPTATION_API_URL`, `FRONTIER_API_KEY`, AND the specific strategy's model ID are all non-empty and the URL is a valid URL. If any of those three are missing/invalid for the requested strategy, return a `missing_config` or `invalid_config` fallback immediately (same pattern as `base-generate`).

### 3. System Prompt (prompt-prefix strategy only)
```ts
const ADAPTATION_SYSTEM_PROMPT =
  'You are a helpful assistant. Answer the following question clearly and concisely.\n\n';
```
For `prompt-prefix`: prepend as a system message in the messages array:
```ts
messages: [
  { role: 'system', content: ADAPTATION_SYSTEM_PROMPT },
  { role: 'user', content: prompt },
]
```
For `full-finetuning` and `lora-peft`: messages array is just `[{ role: 'user', content: prompt }]`.

**The system prompt string must NOT appear in any response payload field, log message, or span attribute.**

### 4. Request Body to Provider (all strategies — chat completions format)
```ts
{
  model: modelId,
  messages: [...],  // system + user, or user only per strategy
  temperature: 0.4,
}
```

### 5. Output Extraction
For chat completions format: `choices[0].message.content`. Implement a local extraction function (do NOT import from `base-generate/route.ts`). The extraction must handle:
- `choices[0].message.content` as a string → return trimmed string
- Empty string or null → return null (triggers `empty_provider_output` fallback)

### 6. Strategy-Specific Fallback Text (use exactly — do not paraphrase)
```ts
const FALLBACK_TEXT: Record<StrategyId, string> = {
  'full-finetuning':
    'Full fine-tuning retrains all model weights on task-specific data, producing highly aligned behavior at the cost of significant compute. This is a deterministic fallback — the live fine-tuned model is not configured for this environment.',
  'lora-peft':
    'LoRA adapts a frozen base model with small rank-decomposed matrices, achieving specialization at a fraction of full fine-tune cost. This is a deterministic fallback — the LLaMAntino specialist model is not available in this environment.',
  'prompt-prefix':
    'Prompt steering prepends a fixed instruction to every query without touching model weights — fastest to iterate, least robust. Base models respond less predictably than instruct variants. This is a deterministic fallback — the base model endpoint is not configured.',
};
```
Fallback selection: use the same hash-based deterministic selector pattern from `base-generate` (hash prompt, `% FALLBACK_TEXT[strategy].length` — but since there's one text per strategy, just use `FALLBACK_TEXT[strategy]` directly).

### 7. OTel Span
- Span name: `adaptation.generate`
- Attributes: `adaptation.strategy`, `adaptation.configured`, `adaptation.mode`, `adaptation.reason_code` (on fallback), `adaptation.model_id`
- Same `SpanKind.SERVER` and `SpanStatusCode` pattern as `base-generate`.

### 8. Metadata Type
```ts
type AdaptationModelMetadata = {
  strategy: StrategyId;
  modelId: string;
};
```

---

## Unit Test Requirements (`__tests__/api/adaptation-generate.test.ts`)

Write unit tests covering all of the following. Follow the test structure in `__tests__/api/frontier-base-generate.test.ts` as the template.

**Required test coverage:**

| Test | Description |
|---|---|
| Missing config — full-finetuning | No env vars set → returns `mode: 'fallback'`, `reason.code: 'missing_config'`, strategy-specific fallback text |
| Missing config — lora-peft | Same for lora-peft strategy |
| Missing config — prompt-prefix | Same for prompt-prefix strategy |
| Live response — full-finetuning | Valid config + mock 200 → returns `mode: 'live'`, correct output, `metadata.strategy: 'full-finetuning'` |
| Live response — lora-peft | Same for lora-peft |
| Live response — prompt-prefix | Same for prompt-prefix |
| System prompt injection — prompt-prefix | Verify the outgoing request body includes `{ role: 'system', content: ADAPTATION_SYSTEM_PROMPT }` as first message |
| System prompt absent — full-finetuning | Verify request body does NOT contain a system message |
| Correct model routing — each strategy | Verify `model` field in request body matches the strategy's configured model ID |
| Request validation — empty prompt | Returns 400 `invalid_prompt` |
| Request validation — invalid strategy | Returns 400 `invalid_strategy` |
| Request validation — prompt too long (>2000 chars) | Returns 400 `invalid_prompt` |
| Upstream 429 | Returns `mode: 'fallback'`, `reason.code: 'quota_limited'` |
| Upstream 401 | Returns `mode: 'fallback'`, `reason.code: 'upstream_auth'` |
| Upstream 503 | Returns `mode: 'fallback'`, `reason.code: 'upstream_error'` |
| Timeout | Returns `mode: 'fallback'`, `reason.code: 'timeout'` |
| Empty provider output | Returns `mode: 'fallback'`, `reason.code: 'empty_provider_output'` |
| Strategy-specific fallback text | Verify fallback output for each strategy matches the exact strings from the plan |

Minimum: cover all rows above. This adds at least 18 tests. Total test count must remain ≥ 111 (current baseline).

---

## Assumptions To Validate (Mandatory)

1. `FRONTIER_API_KEY` is the correct env var name for the shared API key (already in codebase — just verify it is set consistently in your test env setup).
2. The `FRONTIER_TIMEOUT_MS` env var follows the same parsing logic as `base-generate` — reuse `parseTimeout()` pattern directly (implement locally, not imported from the other route).
3. The featherless-ai router returns chat completions format `{ choices: [{ message: { content: string } }] }` — standard OpenAI chat response.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

- Do NOT modify `app/api/frontier/base-generate/route.ts`. It is frozen.
- Do NOT modify `__tests__/api/frontier-base-generate.test.ts`.
- Do NOT modify `.env.example` (already updated by Tech Lead).
- If you find that `extractProviderOutput()` in `base-generate/route.ts` needs changes to support the adaptation endpoint — **stop and flag it**. The adaptation endpoint uses its own local extraction function.

---

## Scope

### Files to Create
- `app/api/adaptation/generate/route.ts` — new POST handler
- `__tests__/api/adaptation-generate.test.ts` — new unit test suite

---

## Definition of Done

- [ ] POST `/api/adaptation/generate` routes to correct model per strategy (AC-9).
- [ ] `prompt-prefix` strategy prepends system prompt server-side; system prompt not in response payload (AC-7, AC-9).
- [ ] All 3 strategies return strategy-specific deterministic fallback text when unconfigured (AC-8).
- [ ] Request validation rejects: invalid strategy, empty prompt, prompt >2000 chars.
- [ ] OTel span `adaptation.generate` emitted with `adaptation.strategy` attribute.
- [ ] Unit tests: ≥18 new tests covering all rows in the test table above.
- [ ] `pnpm test` passes (≥111 total tests, no regressions).
- [ ] `pnpm lint` passes.
- [ ] `pnpm exec tsc --noEmit` passes.

---

## Clarification Loop (Mandatory)

- Before implementation, post preflight concerns/questions to `agent-docs/conversations/backend-to-tech-lead.md`.
- Tech Lead responds in the same file.
- If an open question can change the API contract, `data-testid`, or system prompt exposure: **pause and wait for Tech Lead response** before implementing.

---

## Verification

```
pnpm test
pnpm lint
pnpm exec tsc --noEmit
```

Include the exact output of `pnpm test` (test count summary) in your report.

---

## Report Back

Write completion report to `agent-docs/conversations/backend-to-tech-lead.md` using `agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md`.
