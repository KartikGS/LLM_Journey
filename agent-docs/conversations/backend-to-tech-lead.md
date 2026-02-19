# Report: Backend -> Tech Lead

## Subject
`CR-013 - Add Hugging Face Inference API Provider Support`

---

## [Preflight: Assumptions]

1. **HF response shape `[{ "generated_text": "..." }]` confirmed** — The HF Serverless Inference API for text-generation tasks (`/models/{model_id}`) consistently returns a top-level JSON array with a single object containing `generated_text`. This is the documented format for the serverless endpoint and applies to `meta-llama/Meta-Llama-3-8B`. Implementation proceeded using this shape.

2. **`mapProviderFailure()` is format-agnostic for status-code routing** — The function branches only on HTTP status codes (401/403 → `upstream_auth`, 429 → `quota_limited`, 5xx → `upstream_error`). HF error bodies will not surface a human-readable `providerMessage` via `extractProviderErrorMessage` because HF uses `{ "error": "string" }` (string value, not nested object), which the current parser cannot extract. Status code routing remains correct; the fallback message will be the generic one. Minor fidelity loss, not a blocker.

## [Preflight: Adjacent Risks]

1. **HF 503 "model loading" response (flagged per handoff)** — HF free-tier returns `{ "error": "Model X is currently loading", "estimated_time": N }` with HTTP 503 on cold-start. The current `mapProviderFailure` maps 503 → `upstream_error`, which is technically correct. The `estimated_time` context is dropped. **Not implemented new handling — flagged for Tech Lead approval if desired.**

2. **`generated_text` prefix echo (flagged per handoff)** — HF text-generation models default to `return_full_text=true`, causing `generated_text` to contain the input prompt concatenated with the generated continuation. This would surface the full string including the prompt to the Product End User. **Not stripping the prefix — flagged for Tech Lead approval before implementing any prefix removal.**

## [Preflight: Open Questions]
- None that materially affected implementation validity or scope. Both flagged risks above were acknowledged in the handoff with clear guidance: flag, do not implement without approval.

## [Preflight Status]
- `clear-to-implement`

---

## [Status]
- `completed`

## [Scope Check]
- Handoff source: `agent-docs/conversations/tech-lead-to-backend.md`
- Files modified:
  - `app/api/frontier/base-generate/route.ts`
  - `__tests__/api/frontier-base-generate.test.ts`
- Scope compliance:
  - [x] All modified files are in Backend ownership or explicitly delegated.
  - [x] Test files created/modified under explicit Tech Lead delegation for this CR.

## [Changes Made]

**`app/api/frontier/base-generate/route.ts`:**
1. Added `const HF_MAX_NEW_TOKENS = 256` constant alongside existing timeout constants.
2. Extended `FrontierConfig` type with `provider: 'openai' | 'huggingface'` field.
3. Updated `loadFrontierConfig()` to read `FRONTIER_PROVIDER`: validates against `'openai'`/`'huggingface'` — unknown non-empty values return `configured: false, issueCode: 'invalid_config'` immediately; absent or `'openai'` defaults to `provider: 'openai'`.
4. Added `buildProviderRequestBody()` pure helper — returns `{ inputs, parameters: { max_new_tokens: 256, temperature: 0.4 } }` for HF, or `{ model, messages, temperature: 0.4 }` for OpenAI.
5. Replaced inline `JSON.stringify({...})` in `fetch()` call with `buildProviderRequestBody(frontierConfig.provider, prompt, frontierConfig.modelId)`.
6. Extended `extractProviderOutput()` — added HF array-at-root check (`Array.isArray(payload)`) before existing OpenAI/Anthropic object checks; returns `generated_text` trimmed on success, `null` on empty (triggers `empty_provider_output` fallback).
7. Added `span.setAttribute('frontier.provider', frontierConfig.provider)` immediately after `frontier.model_id` — covers all code paths including `!frontierConfig.configured`.

**`__tests__/api/frontier-base-generate.test.ts`:**
1. Added `delete process.env.FRONTIER_PROVIDER` to `beforeEach` cleanup block.
2. Added `describe('HF Provider Path')` block with 7 test cases:
   - HF live success → `mode: 'live'`, `output: 'HF output text'`
   - HF request body format → fetch called with `{ inputs, parameters: { max_new_tokens: 256, temperature: 0.4 } }`; no `model`/`messages` fields
   - HF 401 → `reason.code: 'upstream_auth'`
   - HF 429 → `reason.code: 'quota_limited'`
   - HF 503 → `reason.code: 'upstream_error'`
   - HF empty `generated_text` → `mode: 'fallback'`, `reason.code: 'empty_provider_output'`
   - Unknown `FRONTIER_PROVIDER` → `mode: 'fallback'`, `reason.code: 'invalid_config'`, `fetch` not called

## [Verification Results]

**Environmental note:** System Node.js is v16.20.1, below the documented minimum of >=20.x — classified as **environmental mismatch**. Verification commands were run using Node.js v18.19.0 via `~/.nvm/versions/node/v18.19.0` (nvm), which satisfies the `pnpm` minimum (>=18.12).

- `pnpm test` (scoped to frontier-base-generate): **pass** — 10 tests: 3 existing + 7 new, all green.
  ```
  PASS __tests__/api/frontier-base-generate.test.ts
    Integration: Frontier Base Generate API
      ✓ should return 400 with controlled error payload for invalid prompt (8 ms)
      ✓ should return fallback envelope when provider config is missing (2 ms)
      ✓ should return live envelope when upstream provider succeeds (2 ms)
      HF Provider Path
        ✓ should return live envelope when HF upstream succeeds (2 ms)
        ✓ should send HF request body format (inputs + parameters) (2 ms)
        ✓ should return upstream_auth fallback when HF returns 401 (2 ms)
        ✓ should return quota_limited fallback when HF returns 429 (1 ms)
        ✓ should return upstream_error fallback when HF returns 503 (1 ms)
        ✓ should return empty_provider_output fallback when HF generated_text is empty (2 ms)
        ✓ should return invalid_config fallback and not call fetch for unknown FRONTIER_PROVIDER (1 ms)
  Tests: 10 passed, 10 total
  ```
- `pnpm lint`: **pass** — `✔ No ESLint warnings or errors`
- `pnpm exec tsc --noEmit`: **pass** — exit code 0, no output

**DoD checklist:**
- [x] `FRONTIER_PROVIDER=huggingface` sends `{ inputs, parameters: { max_new_tokens: 256, temperature: 0.4 } }` — verified by "HF request body format" test
- [x] `FRONTIER_PROVIDER=openai` (or absent) sends `{ model, messages, temperature }` — existing "live envelope" test passes unchanged
- [x] `FRONTIER_PROVIDER=<unknown>` triggers `invalid_config` fallback; `fetch` not called — verified by "Unknown FRONTIER_PROVIDER" test
- [x] HF `[{ generated_text }]` parsed correctly as `mode: live` — verified by "HF live success" test
- [x] HF empty `generated_text` triggers `empty_provider_output` fallback — verified by "HF empty generated_text" test
- [x] `frontier.provider` span attribute set in all code paths after config load — set immediately after `frontier.model_id`, before `!frontierConfig.configured` branch
- [x] All 7 new tests pass; all 3 existing tests pass unchanged — 10/10 tests green
- [x] `pnpm lint` passes — ✔ No ESLint warnings or errors
- [x] `pnpm exec tsc --noEmit` passes — exit code 0

## [Out-of-Scope Requests Detected]
- `none`

## [Blockers]
- `none`

## [Failure Classification]
- `CR-related`: none
- `pre-existing`: none observed in verification commands
- `environmental`: System Node.js v16.20.1 is below the documented minimum (>=20.x); verified using Node v18.19.0 via nvm. Not a CR regression.
- `non-blocking warning`: `next lint` deprecation notice (`next lint` replaced by ESLint CLI in Next.js 16) — pre-existing, unrelated to this CR.

## [Deviations]
- `none`

## [Ready for Next Agent]
- `yes`

## [Follow-up Recommendations]
1. **HF 503 model loading**: Consider adding a distinct `model_loading` fallback reason code or surfacing `estimated_time` to the Product End User during cold starts. Requires Tech Lead decision.
2. **`generated_text` prefix echo**: Consider passing `return_full_text: false` in HF request `parameters` to prevent the prompt from being echoed in output. Requires Tech Lead approval before implementing.
3. **Node.js runtime**: System Node v16 is below project minimum (>=20.x). Recommend environment upgrade to avoid environmental mismatch on future verification runs.

---
*Report created: 2026-02-19*
*Backend Agent*
