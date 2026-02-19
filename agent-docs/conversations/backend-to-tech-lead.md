# Backend → Tech Lead Report

## Subject
`CR-014 - HF Router Migration: Update buildProviderRequestBody() and unit tests`

## Status
`in_progress`

---

## Preflight: Assumptions

1. **`extractProviderOutput()` handles `{ choices: [{ text }] }`** — CONFIRMED.
   - Lines 226–239 of `route.ts`: function checks `root.choices`, gets `choices[0]`, attempts `firstChoice.message.content` (chat format path), then falls through to `firstChoice.text` (lines 236–239). The HF Router format `{ choices: [{ text: "..." }] }` maps directly to the `firstChoice.text` path. ✅

2. **`mapProviderFailure()` is format-agnostic** — CONFIRMED.
   - Lines 281–310 of `route.ts`: branches only on HTTP status codes (`429`, `401/403`, `>=500`, else). Accepts a pre-extracted `providerMessage` string with no inspection of response body shape. Router error responses (non-OK HTTP codes) will be handled identically. ✅

3. **`return_full_text` absent from `route.ts`** — CONFIRMED. Not present anywhere in the file. AC-3 satisfied by default. ✅

## Preflight: Adjacent Risks

- The HF array path in `extractProviderOutput()` (`Array.isArray(payload)`) is now dead code for live traffic (router uses `choices[].text`, not array format) but kept intentionally per the handoff freeze on `extractProviderOutput()`. Not a risk.
- Test 3's mock currently uses old HF array format `[{ generated_text }]`. After the code change, this path still resolves correctly via `extractProviderOutput()`'s array branch — test will still pass. I will update the mock to completions format for self-consistency (minor deviation — noted in Deviations section).

## Preflight: Open Questions
none

## Preflight Status
`clear-to-implement`

---

## [CR-013 Historical Note]
Prior CR-013 backend-to-tech-lead content replaced per Conversation File Freshness Rule. CR-013 status was `completed`. Artifacts preserved in `agent-docs/requirements/CR-013-huggingface-inference-provider.md` and `agent-docs/plans/CR-013-plan.md`.

---

## Status
`completed`

## Scope Check
- Handoff source: `agent-docs/conversations/tech-lead-to-backend.md`
- Files modified:
  - `app/api/frontier/base-generate/route.ts`
  - `__tests__/api/frontier-base-generate.test.ts`
- Scope compliance:
  - [x] All modified files are in Backend ownership or explicitly delegated.
  - [x] Test files modified under explicit Tech Lead delegation for this CR.

## Changes Made

**`app/api/frontier/base-generate/route.ts`:**
- Updated the `huggingface` branch of `buildProviderRequestBody()` from HF Inference API format to OpenAI-compatible text completions format:
  - Removed: `{ inputs: prompt, parameters: { max_new_tokens: HF_MAX_NEW_TOKENS, temperature: 0.4 } }`
  - Added: `{ model: modelId, prompt, max_tokens: HF_MAX_NEW_TOKENS, temperature: 0.4 }`
- No other changes. `extractProviderOutput()`, `loadFrontierConfig()`, span attributes, and error handling are untouched.

**`__tests__/api/frontier-base-generate.test.ts`** — `HF Provider Path` describe block only:
1. `HF_ENV.FRONTIER_API_URL` → `https://router.huggingface.co/featherless-ai/v1/completions`
2. `'should return live envelope when HF upstream succeeds'` → mock updated to `{ choices: [{ text: 'HF output text' }] }`
3. `'should send HF request body format (inputs + parameters)'` → mock updated to completions format; assertions updated to `{ model, prompt, max_tokens: 256, temperature: 0.4 }` with `not.toHaveProperty('inputs')` and `not.toHaveProperty('parameters')`
4. `'should return empty_provider_output fallback when HF generated_text is empty'` → mock updated to `{ choices: [{ text: '' }] }`
5. Error case tests (401, 429, 503) and unknown-provider test — unchanged except URL update via `HF_ENV`.

## Verification Results

**Environmental note:** System Node.js v16.20.1 — below documented minimum (>=20.x). Classified as **environmental mismatch**. Verification ran using Node.js v18.19.0 via `~/.nvm/versions/node/v18.19.0`.

**1. `pnpm test`** — PASS

```
PASS __tests__/api/frontier-base-generate.test.ts
  Integration: Frontier Base Generate API
    ✓ should return 400 with controlled error payload for invalid prompt (9 ms)
    ✓ should return fallback envelope when provider config is missing (2 ms)
    ✓ should return live envelope when upstream provider succeeds (2 ms)
    HF Provider Path
      ✓ should return live envelope when HF upstream succeeds (3 ms)
      ✓ should send HF request body format (inputs + parameters) (2 ms)
      ✓ should return upstream_auth fallback when HF returns 401 (2 ms)
      ✓ should return quota_limited fallback when HF returns 429 (2 ms)
      ✓ should return upstream_error fallback when HF returns 503 (5 ms)
      ✓ should return empty_provider_output fallback when HF generated_text is empty (2 ms)
      ✓ should return invalid_config fallback and not call fetch for unknown FRONTIER_PROVIDER (2 ms)

Test Suites: 16 passed, 16 total
Tests:       111 passed, 111 total
```

**2. `pnpm lint`** — PASS
`✔ No ESLint warnings or errors` (pre-existing `next lint` deprecation notice — unrelated to CR)

**3. `pnpm exec tsc --noEmit`** — PASS
Exit code 0, no output.

**DoD checklist:**
- [x] `buildProviderRequestBody()` for `huggingface` emits `{ model, prompt, max_tokens, temperature }` — verified by "HF request body format" test
- [x] `buildProviderRequestBody()` for `openai` is unchanged — "live envelope when upstream provider succeeds" passes unchanged
- [x] `return_full_text` does not appear anywhere in `route.ts` — confirmed absent; AC-3 satisfied by default
- [x] `extractProviderOutput()` is unchanged — not touched
- [x] All 7 HF tests pass with updated mocks; all 3 non-HF tests pass unchanged — 10/10 target spec, 111/111 full suite
- [x] `pnpm test` passes — 111 tests, 16 suites, all green
- [x] `pnpm lint` passes — ✔ No ESLint warnings or errors
- [x] `pnpm exec tsc --noEmit` passes — exit code 0

## Out-of-Scope Requests Detected
none

## Blockers
none

## Failure Classification
- `CR-related`: none
- `pre-existing`: none
- `environmental`: System Node.js v16.20.1 below documented minimum (>=20.x); verified via Node v18.19.0 (nvm). Not a CR regression.
- `non-blocking warning`: `next lint` deprecation notice — pre-existing, unrelated to this CR.

## Deviations
- **Minor**: Updated test 3's mock response from `[{ generated_text: 'HF output text' }]` to `{ choices: [{ text: 'HF output text' }] }` for suite self-consistency. The handoff only specified assertion changes for test 3; the mock update was not required (old format still resolves via `extractProviderOutput()`'s array branch) but makes the test correctly represent the router format. No behavioral or contract impact.

## Ready for Next Agent
yes

## Follow-up Recommendations
none

---
*Report created: 2026-02-20*
*Backend Agent*
