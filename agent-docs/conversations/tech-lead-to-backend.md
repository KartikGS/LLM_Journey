# Handoff: Tech Lead → Backend Agent

## Subject
`CR-013 - Add Hugging Face Inference API Provider Support`

## Status
`issued`

---

## Objective

Extend `app/api/frontier/base-generate/route.ts` to support the Hugging Face (HF) Inference API request/response format alongside the existing OpenAI-compatible format, controlled by a new `FRONTIER_PROVIDER` env var.

---

## Rationale (Why)

The current endpoint only speaks OpenAI chat-completions format. The Human User wants to use `meta-llama/Meta-Llama-3-8B` via HF's free Inference API, which uses a different request body and response shape. Without this change, HF tokens cannot be used and Product End Users cannot experience a real 8B-parameter frontier model on the Transformers page.

The UI (`FrontierBaseChat.tsx`) consumes only the response envelope (`mode`, `output`, `metadata`, `reason`) — it is **not touched by this CR**.

---

## Constraints

**Technical:**
- No new npm dependencies. Use native `fetch` (already used in the route).
- `FRONTIER_API_KEY` / `FRONTIER_API_URL` / `FRONTIER_MODEL_ID` env var names are unchanged.
- New env var `FRONTIER_PROVIDER` defaults to `'openai'` when absent — existing deployments must be unaffected.
- HF token must remain server-side only (same security boundary as existing `FRONTIER_API_KEY`).
- `max_new_tokens` for HF requests is **256** (Tech Lead-specified constant; do not leave this as a magic number).
- Temperature for HF requests is `0.4` (same as current OpenAI path).

**Ownership:**
- Files in scope: `app/api/frontier/base-generate/route.ts`, `__tests__/api/frontier-base-generate.test.ts`
- `.env.example` has already been updated by Tech Lead — do not modify it.
- Test work is **explicitly delegated to you** for this CR (Testing Agent not required).

---

## Assumptions To Validate (Mandatory)

1. HF Inference API always returns a top-level JSON array `[{ "generated_text": "..." }]` on success — confirm this matches the documented format before writing the parser.
2. The existing `mapProviderFailure()` function (handling 401, 429, 5xx) is format-agnostic and applies unchanged to HF error responses — verify no HF-specific error shape is needed.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

1. If HF's free-tier returns a 503 "model loading" response that doesn't fit the standard `mapProviderFailure` codes, flag this in your preflight note. Do not add new handling without Tech Lead approval.
2. If the HF response includes the original prompt concatenated with the generated text in `generated_text` (a known HF behaviour for some models), flag it — do not silently strip a prompt prefix without Tech Lead approval.

---

## Scope

### Files to Modify

**`app/api/frontier/base-generate/route.ts`**

Implement these changes in the order listed:

**1. Add constant** at the top (alongside `DEFAULT_TIMEOUT_MS` etc.):
```typescript
const HF_MAX_NEW_TOKENS = 256;
```

**2. Extend `FrontierConfig` type** — add `provider` field:
```typescript
type FrontierConfig = {
    // ...existing fields...
    provider: 'openai' | 'huggingface';
};
```

**3. Update `loadFrontierConfig()`** — read and validate `FRONTIER_PROVIDER`:
- Read `process.env.FRONTIER_PROVIDER?.trim()`.
- If absent or `'openai'` → `provider: 'openai'`.
- If `'huggingface'` → `provider: 'huggingface'`.
- Any other non-empty value → return `configured: false, issueCode: 'invalid_config'` (no upstream call).
- Default `provider: 'openai'` must be present in the `configured: true` return path.

**4. Add `buildProviderRequestBody()` helper** (pure function, no side effects):
```typescript
// OpenAI format: { model, messages, temperature }
// HF format:     { inputs, parameters: { max_new_tokens, temperature } }
function buildProviderRequestBody(
    provider: 'openai' | 'huggingface',
    prompt: string,
    modelId: string
): Record<string, unknown>
```

**5. Replace the inline `JSON.stringify({...})` in the `fetch()` call** with:
```typescript
JSON.stringify(buildProviderRequestBody(frontierConfig.provider, prompt, frontierConfig.modelId))
```

**6. Extend `extractProviderOutput()`** — add HF array-at-root handling **before** the existing OpenAI/Anthropic checks (to prevent false-positives from the object-shape checks):
```typescript
// HF: [{ generated_text: "..." }]
if (Array.isArray(payload) && payload.length > 0) {
    const first = toRecord(payload[0]);
    const text = first?.generated_text;
    if (typeof text === 'string' && text.trim().length > 0) {
        return text.trim();
    }
    return null; // HF array found but no usable text → empty_provider_output fallback
}
```

**7. Add `frontier.provider` span attribute** in the `POST` handler, alongside the existing `frontier.model_id` set:
```typescript
span.setAttribute('frontier.provider', frontierConfig.provider);
```
Set this on every code path that reaches the `frontierConfig` (after config is loaded). Include it in the `!frontierConfig.configured` path too.

---

**`__tests__/api/frontier-base-generate.test.ts`**

1. Add `delete process.env.FRONTIER_PROVIDER` to the `beforeEach` cleanup block alongside the existing deletes.

2. Add a new `describe` block: `'HF Provider Path'`. Add these test cases:

   - **HF live success** — `FRONTIER_PROVIDER=huggingface`, mock returns `[{ generated_text: 'HF output text' }]`, assert `body.mode === 'live'` and `body.output === 'HF output text'`.

   - **HF request body format** — verify `global.fetch` was called with body containing `{ inputs: prompt, parameters: { max_new_tokens: 256, temperature: 0.4 } }` (not OpenAI format).

   - **HF fallback on 401** — mock returns HTTP 401, assert `body.reason.code === 'upstream_auth'`.

   - **HF fallback on 429** — mock returns HTTP 429, assert `body.reason.code === 'quota_limited'`.

   - **HF fallback on 503** — mock returns HTTP 503, assert `body.reason.code === 'upstream_error'`.

   - **HF empty generated_text** — mock returns `[{ generated_text: '' }]`, assert `body.mode === 'fallback'` and `body.reason.code === 'empty_provider_output'`.

   - **Unknown FRONTIER_PROVIDER** — `FRONTIER_PROVIDER=unknown_provider`, assert `body.mode === 'fallback'`, `body.reason.code === 'invalid_config'`, and `global.fetch` was **not** called.

3. The existing 3 tests (`invalid prompt`, `missing config`, `OpenAI live success`) must pass unchanged.

---

## Definition of Done

- [ ] `FRONTIER_PROVIDER=huggingface` sends `{ inputs, parameters: { max_new_tokens: 256, temperature: 0.4 } }` to configured URL
- [ ] `FRONTIER_PROVIDER=openai` (or absent) sends `{ model, messages, temperature }` — existing behavior unchanged
- [ ] `FRONTIER_PROVIDER=<unknown>` triggers `invalid_config` fallback; `fetch` is not called
- [ ] HF `[{ generated_text }]` parsed correctly as `mode: live` output
- [ ] HF empty `generated_text` triggers `empty_provider_output` fallback
- [ ] `frontier.provider` span attribute set in all code paths after config load
- [ ] All 7 new tests pass; all 3 existing tests pass unchanged
- [ ] `pnpm lint` passes
- [ ] `pnpm exec tsc --noEmit` passes

---

## Clarification Loop (Mandatory)

Before implementation, post your preflight note (assumptions, risks, open questions) to:
`agent-docs/conversations/backend-to-tech-lead.md`

Pay special attention to the two flagged assumptions above. If the HF `generated_text` prefix-echo or 503 model-loading behaviors are confirmed risks, pause and report before writing any handling for them.

---

## Verification

Run in this order (do not run concurrently):
1. `pnpm test` — full suite; all tests must pass
2. `pnpm lint` — must pass clean
3. `pnpm exec tsc --noEmit` — must pass clean

Report results using the Command Evidence Standard from `agent-docs/testing-strategy.md`.

---

## Report Back

Write your completion report to:
`agent-docs/conversations/backend-to-tech-lead.md`

Use template: `agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md`

---

## Reference Files

- Plan: `agent-docs/plans/CR-013-plan.md`
- CR: `agent-docs/requirements/CR-013-huggingface-inference-provider.md`
- Route: `app/api/frontier/base-generate/route.ts`
- Tests: `__tests__/api/frontier-base-generate.test.ts`
- Env example (already updated): `.env.example`

---
*Handoff created: 2026-02-19*
*Tech Lead Agent*
