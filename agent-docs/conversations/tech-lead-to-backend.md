# Handoff: Tech Lead → Backend Agent

## Subject
`CR-014 - HF Router Migration: Update buildProviderRequestBody() and unit tests`

## Status
`issued`

---

## Objective

Update `buildProviderRequestBody()` for the `huggingface` provider from HF Inference API format to OpenAI-compatible text completions format, targeting the HF Router (Featherless AI). Update all HF-specific unit tests to reflect the new request format and router endpoint.

---

## Rationale (Why)

The HF Inference API (`api-inference.huggingface.co`) does not serve `meta-llama/Meta-Llama-3-8B` on the free tier, so the frontier chat demo always falls back deterministically — learners never see a real LLM response. The HF Router (`router.huggingface.co/featherless-ai/v1/completions`) serves the same model via free credits and uses OpenAI-compatible text completions format. This is the core educational moment of Stage 1; fixing the provider restores live inference.

---

## Constraints

**Technical:**
- Provider type stays `'huggingface'` — do NOT add a new provider type (e.g., `huggingface-router`). The existing type union and config validation are unchanged.
- `extractProviderOutput()` is **frozen** — do not modify it. It already handles `choices[].text` (the router's response format). The HF array path must also remain even though it will not be exercised by the updated provider.
- `HF_MAX_NEW_TOKENS = 256` constant already exists — reuse it as `max_tokens: HF_MAX_NEW_TOKENS` in the new body.
- `return_full_text` must NOT be introduced anywhere. It is already absent from the codebase; AC-3 is satisfied by default — just confirm it remains absent.
- No new npm dependencies.

**Ownership:**
- Files in scope: `app/api/frontier/base-generate/route.ts`, `__tests__/api/frontier-base-generate.test.ts`
- `.env.example` has already been updated by Tech Lead — do not modify it.
- Test work is **explicitly delegated to you** for this CR (Testing Agent not required per CR-014 BA handoff).

---

## Assumptions To Validate (Mandatory)

1. `extractProviderOutput()` correctly handles `{ choices: [{ text: "..." }] }` (the HF Router's response format) — confirm by reading lines 226–239 of `route.ts` before writing any tests.
2. The existing `mapProviderFailure()` function is format-agnostic (branches only on HTTP status codes) and applies unchanged to router error responses — verify no router-specific error shape requires new handling.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

1. If `extractProviderOutput()` does NOT handle `choices[].text` as expected (i.e., the router format is different from what's documented), flag immediately — do not work around it; pause and report to Tech Lead.
2. If the router returns a response format other than `{ choices: [{ text }] }` for non-OK payloads, flag it rather than patching `extractProviderOutput()`.

---

## Scope

### Files to Modify

**`app/api/frontier/base-generate/route.ts`**

Single change only — update the `huggingface` branch of `buildProviderRequestBody()`:

```typescript
// Replace the current HF branch:
if (provider === 'huggingface') {
    return {
        inputs: prompt,
        parameters: {
            max_new_tokens: HF_MAX_NEW_TOKENS,
            temperature: 0.4
        },
    };
}

// With the router (completions) format:
if (provider === 'huggingface') {
    return {
        model: modelId,
        prompt,
        max_tokens: HF_MAX_NEW_TOKENS,
        temperature: 0.4,
    };
}
```

No other changes to `route.ts`. Do not touch `extractProviderOutput()`, `loadFrontierConfig()`, span attributes, error handling, or any other function.

---

**`__tests__/api/frontier-base-generate.test.ts`**

Update only the `'HF Provider Path'` describe block. The 3 existing non-HF tests must remain unchanged.

**1. Update `HF_ENV`** — change `FRONTIER_API_URL` to the router endpoint:
```typescript
const HF_ENV = {
    FRONTIER_API_URL: 'https://router.huggingface.co/featherless-ai/v1/completions',
    FRONTIER_MODEL_ID: 'meta-llama/Meta-Llama-3-8B',
    FRONTIER_API_KEY: 'hf-secret-key',
    FRONTIER_PROVIDER: 'huggingface',
};
```

**2. Update `'should return live envelope when HF upstream succeeds'`** — mock must use completions format:
```typescript
(global.fetch as jest.Mock).mockResolvedValueOnce(
    new Response(
        JSON.stringify({ choices: [{ text: 'HF output text' }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
);
// assertion: expect(body.output).toBe('HF output text') — unchanged
```

**3. Update `'should send HF request body format (inputs + parameters)'`** — assert new completions body:
```typescript
expect(calledBody).toEqual({
    model: 'meta-llama/Meta-Llama-3-8B',
    prompt,
    max_tokens: 256,
    temperature: 0.4,
});
expect(calledBody).not.toHaveProperty('inputs');
expect(calledBody).not.toHaveProperty('parameters');
```

**4. Update `'should return empty_provider_output fallback when HF generated_text is empty'`** — mock must use completions format with empty text:
```typescript
(global.fetch as jest.Mock).mockResolvedValueOnce(
    new Response(
        JSON.stringify({ choices: [{ text: '' }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
);
// assertion: body.reason.code === 'empty_provider_output' — unchanged
```

**5. Error case tests (401, 429, 503) and unknown-provider test** — these mock non-OK HTTP responses; only the URL change in `HF_ENV` (step 1) affects them. No other edits needed.

---

## Definition of Done

- [ ] `buildProviderRequestBody()` for `huggingface` emits `{ model, prompt, max_tokens, temperature }` (completions format)
- [ ] `buildProviderRequestBody()` for `openai` is unchanged
- [ ] `return_full_text` does not appear anywhere in `route.ts`
- [ ] `extractProviderOutput()` is unchanged
- [ ] All 7 HF tests pass with updated mocks; all 3 non-HF tests pass unchanged (10 total)
- [ ] `pnpm test` passes (full suite)
- [ ] `pnpm lint` passes
- [ ] `pnpm exec tsc --noEmit` passes

---

## Clarification Loop (Mandatory)

Before implementation, post your preflight note to `agent-docs/conversations/backend-to-tech-lead.md`:
- Confirm `extractProviderOutput()` handles `choices[].text` as expected.
- Confirm `mapProviderFailure()` is format-agnostic for router errors.
- Any open questions that could affect implementation or scope.

If open questions change contracts/scope — pause and wait for Tech Lead response.

---

## Verification

Run in this order (do not run concurrently):
1. `pnpm test` — full suite; all 10 HF-related tests must pass
2. `pnpm lint` — must pass clean
3. `pnpm exec tsc --noEmit` — must pass clean

Report results using the Command Evidence Standard from `agent-docs/testing-strategy.md`.

---

## Report Back

Write your completion report to `agent-docs/conversations/backend-to-tech-lead.md`.
Use template: `agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md`

---

## Reference Files

- Plan: `agent-docs/plans/CR-014-plan.md`
- CR: `agent-docs/requirements/CR-014-hf-router-migration-and-comparison-table.md`
- Route: `app/api/frontier/base-generate/route.ts`
- Tests: `__tests__/api/frontier-base-generate.test.ts`
- Env example (already updated by Tech Lead): `.env.example`

---
*Handoff created: 2026-02-20*
*Tech Lead Agent*
