# Handoff: Tech Lead → BA Agent

## Subject
`CR-013 — Hugging Face Inference API Provider Support`

## Status
`verified`

---

## Technical Summary

CR-013 adds HF Inference API provider support to the existing `POST /api/frontier/base-generate` route via a new `FRONTIER_PROVIDER` env var. The implementation is a surgical extension to a single backend file; no UI changes, no new dependencies, no route or selector contract changes.

**Changes delivered:**
- `app/api/frontier/base-generate/route.ts` — added `FRONTIER_PROVIDER` config reading + validation, `buildProviderRequestBody()` helper (OpenAI vs HF formats), extended `extractProviderOutput()` to handle HF array-at-root `[{ generated_text }]`, added `frontier.provider` span attribute on all code paths
- `__tests__/api/frontier-base-generate.test.ts` — 7 new HF-specific test cases; 3 existing tests unchanged; `FRONTIER_PROVIDER` cleanup added to `beforeEach`
- `.env.example` — `FRONTIER_PROVIDER` entry with usage notes for both providers (Tech Lead direct edit)

---

## Evidence of AC Fulfillment

- [x] HF Inference API format supported: `POST {FRONTIER_API_URL}` with `{ inputs: prompt, parameters: { max_new_tokens: 256, temperature: 0.4 } }` request and `[{ generated_text }]` response parsed. — Verified: `app/api/frontier/base-generate/route.ts:188-208` (`buildProviderRequestBody`, `extractProviderOutput`); test: `__tests__/api/frontier-base-generate.test.ts:130` ("should send HF request body format")

- [x] Provider selection via configuration: `FRONTIER_PROVIDER=huggingface` enables HF path; absent or `=openai` preserves OpenAI path; unknown value triggers `invalid_config` fallback. — Verified: `app/api/frontier/base-generate/route.ts:102-116` (`loadFrontierConfig`); tests: `__tests__/api/frontier-base-generate.test.ts:111,223`

- [x] Existing OpenAI-compatible flow unchanged: all 3 pre-existing tests pass without modification. — Verified: `pnpm test` → 111/111 passed; existing `'should return live envelope when upstream provider succeeds'` test at line 240 passes unchanged

- [x] Fallback mechanism triggers appropriately for HF-specific errors (401, 429, 5xx, timeout): `mapProviderFailure()` is format-agnostic and handles HF HTTP status codes identically to OpenAI. — Verified: tests at `__tests__/api/frontier-base-generate.test.ts:153,169,185`

- [x] Span attributes include provider type: `frontier.provider` set at `app/api/frontier/base-generate/route.ts:378`, before all branching paths (covers configured, unconfigured, and invalid-config paths). — Verified: `app/api/frontier/base-generate/route.ts:375-378`

- [x] `pnpm lint` passes — Evidence below

- [x] `pnpm build` passes — Evidence below

- [x] Unit tests updated/added for HF response parsing: 7 new tests in `describe('HF Provider Path')`. — Verified: `__tests__/api/frontier-base-generate.test.ts:99-237`

---

## Verification Commands

- Command: `pnpm test`
- Scope: full suite (16 suites)
- Execution Mode: local-equivalent/unsandboxed (Node v18.19.0 via nvm; system Node v16 is below pnpm minimum)
- Result: **PASS** — 111 tests, 16 suites, 0 failures

- Command: `pnpm lint`
- Scope: full suite
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — `✔ No ESLint warnings or errors`

- Command: `pnpm exec tsc --noEmit`
- Scope: full TypeScript check
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — exit code 0, no output

- Command: `pnpm build`
- Scope: production build
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — all 6 routes compiled; `ƒ /api/frontier/base-generate` present

---

## Failure Classification Summary

- **CR-related**: none
- **Pre-existing**: none observed in this CR's scope
- **Environmental**: System Node.js v16.20.1 is below the pnpm minimum (>=18.12) and the project minimum (>=20.x); verified using Node v18.19.0 via nvm. Not a CR regression — confirmed pre-existing from CR-012 Backend report.
- **Non-blocking warning**:
  - `pnpm lint`: `next lint` deprecation notice (pre-existing)
  - `pnpm build`: OTel `require-in-the-middle` critical dependency warning (pre-existing)

---

## Adversarial Diff Review

- **Backward compatibility**: `FRONTIER_PROVIDER` absent → defaults to `'openai'` (line 116). No env change required for existing deployments. Verified by 3 pre-existing tests passing unchanged.
- **Security boundary**: `FRONTIER_API_KEY` remains server-side only. No provider-format information leaked in the response envelope (same `LiveModeResponse | FallbackModeResponse` contract).
- **HF parser placement**: `extractProviderOutput()` array check placed before OpenAI/Anthropic object checks — prevents false-positive matches on OpenAI/Anthropic shaped payloads. Correct.
- **Unknown provider gate**: `loadFrontierConfig()` returns `configured: false, issueCode: 'invalid_config'` before URL validation or upstream call for any unrecognised `FRONTIER_PROVIDER` value. Correct.
- **Span coverage**: `frontier.provider` set on line 378 before the `!frontierConfig.configured` branch — covers all code paths including invalid-config and missing-config early returns. Correct.

---

## Technical Retrospective

**One open product quality issue (not an AC blocker, recommend follow-up CR):**

HF text-generation API defaults to `return_full_text: true`. This means `generated_text` in the API response includes the input prompt concatenated with the generated continuation. The current implementation does not include `return_full_text: false` in the HF request `parameters` — a decision deferred per the handoff protocol (Backend correctly flagged and did not implement without approval).

Effect: Product End Users see the full prompt echoed back at the start of the output when using the HF provider.

**Recommendation**: Open a follow-up CR to add `return_full_text: false` to `buildProviderRequestBody()` for the HF branch (single-line change, no new tests required — the existing HF tests mock the response). This should be done before the User does live testing with an HF token.

The User's manual validation step (configure HF provider, send a prompt via Transformers page, observe response) will surface this behavior directly — flagging here to set expectations.

---

## Deployment Notes

- New env var: `FRONTIER_PROVIDER='openai'` | `'huggingface'` — documented in `.env.example`
- When switching to HF: set `FRONTIER_PROVIDER=huggingface`, `FRONTIER_API_URL=https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B`, `FRONTIER_API_KEY=<HF_TOKEN>`
- No package additions. No middleware, CSP, or security-boundary changes.

---

## Link to Updated Artifacts

- `agent-docs/requirements/CR-013-huggingface-inference-provider.md`
- `agent-docs/plans/CR-013-plan.md`
- `agent-docs/conversations/tech-lead-to-backend.md`
- `agent-docs/conversations/backend-to-tech-lead.md`
- `.env.example`

---
*Report created: 2026-02-19*
*Tech Lead Agent*
