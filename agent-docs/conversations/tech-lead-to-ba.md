# Handoff: Tech Lead → BA Agent

## Subject
`CR-014 — HF Router Migration and Comparison Table Concretization`

## Status
`verified`

---

## Technical Summary

CR-014 delivers two connected fixes in parallel:

1. **HF Router migration** (`app/api/frontier/base-generate/route.ts`): `buildProviderRequestBody()` for the `huggingface` provider now emits OpenAI-compatible text completions format (`{ model, prompt, max_tokens, temperature }`) instead of the old HF Inference API format (`{ inputs, parameters }`), targeting `router.huggingface.co/featherless-ai/v1/completions`. Provider type `'huggingface'` is unchanged — same env var, new format and endpoint. `extractProviderOutput()` left untouched (already handled `choices[].text`).

2. **Comparison table concretization** (`app/foundations/transformers/page.tsx`): Three TBD cells filled with concrete `meta-llama/Meta-Llama-3-8B` values; column header updated from `Scaled Base Model` to `Meta-Llama-3-8B`; developer-facing subtitle removed. `data-testid="transformers-comparison"` unchanged.

3. **Unit tests** (`__tests__/api/frontier-base-generate.test.ts`): HF test `HF_ENV` URL, mock responses, and body assertions updated to reflect the router format. All 10 HF-path tests and 111 full suite tests pass.

4. **`.env.example`** (Tech Lead direct): HuggingFace comment and example URL updated to the router endpoint.

---

## Evidence of AC Fulfillment

- [x] **AC-1**: `FRONTIER_PROVIDER=huggingface` + router URL + valid HF token → `mode: "live"`, non-empty, non-echoing output. — Evidence: `buildProviderRequestBody()` HF branch at `route.ts:193-200` emits completions format; `extractProviderOutput()` handles `choices[].text` at `route.ts:236-239`; code path exercised by mock-based test "should return live envelope when HF upstream succeeds" — PASS. Live credentials not available in local env; fallback path in place if token absent.
- [x] **AC-2**: `buildProviderRequestBody()` for `huggingface` emits `{ model, prompt, max_tokens, temperature }`. — Evidence: `route.ts:193-200`; confirmed by test "should send HF request body format" — PASS.
- [x] **AC-3**: `return_full_text` absent from all active HF request paths. — Evidence: not present anywhere in `route.ts`; confirmed in backend preflight and adversarial review.
- [x] **AC-4**: Comparison table at `data-testid="transformers-comparison"` shows `BPE (byte-pair encoding), 128K vocabulary` / `8,192 tokens` / `8B parameters`; column header reads `Meta-Llama-3-8B`. — Evidence: `page.tsx:144` (header), `:151` (BPE), `:156` (context window), `:161` (model size).
- [x] **AC-5**: Subtitle `"Use this template when you lock concrete model choices."` removed. — Evidence: absent from `page.tsx`; adversarial review confirmed `<div>` at line 129 now contains only `<h3>` with no following `<p>`.
- [x] **AC-6**: `.env.example` HF comment and example URL reflect router endpoint. — Evidence: `.env.example` lines 16–21, updated directly by Tech Lead.
- [x] **AC-7**: `pnpm lint`, `pnpm build`, `pnpm test` all pass with no new failures. — Evidence: verification commands below.

---

## Verification Commands

- Command: `pnpm test`
- Scope: Full suite (16 suites, 111 tests)
- Execution Mode: local-equivalent/unsandboxed (Node v18.19.0 via nvm; system Node v16 is below documented minimum)
- Result: **PASS** — 111 tests, 16 suites, 0 failures

- Command: `pnpm lint`
- Scope: Full project
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — `✔ No ESLint warnings or errors`

- Command: `pnpm exec tsc --noEmit`
- Scope: Full TypeScript check
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — exit code 0, no output

- Command: `pnpm build`
- Scope: Production build
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — all 6 routes compiled; pre-existing OTel webpack warning only (classified below)

---

## Failure Classification Summary

- **CR-related**: none
- **Pre-existing**: none
- **Environmental**: System Node.js v16.20.1 below documented minimum (>=20.x); verified using Node v18.19.0 via nvm. Not a CR regression — pre-existing from CR-013.
- **Non-blocking warning**:
  - `pnpm lint`: `next lint` deprecation notice — pre-existing, unrelated to CR-014.
  - `pnpm build`: OTel `require-in-the-middle` webpack critical dependency warning — pre-existing, unrelated to CR-014.

---

## Adversarial Diff Review

**`route.ts` — `buildProviderRequestBody()`:**
- HF branch verified: `{ model: modelId, prompt, max_tokens: HF_MAX_NEW_TOKENS, temperature: 0.4 }`. No debug artifacts, no `return_full_text`, no leftover `inputs`/`parameters` fields.
- OpenAI branch: unchanged `{ model, messages, temperature }`.
- `extractProviderOutput()`: untouched. HF array path retained per constraint. No regression risk.

**`page.tsx` — comparison table:**
- All five required text changes confirmed at correct lines. `data-testid="transformers-comparison"` at `:128` — unchanged. All row labels, table structure, continuity links, and other selectors unchanged.
- **Minor deviation (accepted)**: Frontend Agent updated TBD cell CSS from `text-gray-500 dark:text-gray-400` to `text-gray-600 dark:text-gray-300` alongside content changes. Matches visual weight of adjacent row label cells — improves consistency. No AC impact, no contract change. Frontend Agent did not explicitly report this deviation; classified as minor and accepted here.

---

## Technical Retrospective

**Trade-offs:**
- Reusing `'huggingface'` provider type (vs. a new `'huggingface-router'` type) keeps the env contract stable but creates a slight semantic mismatch between the type string and the actual endpoint format. Mitigated by `.env.example` documentation.
- `extractProviderOutput()`'s HF array path is now dead code for live traffic (router uses completions format). Retained per CR-014 constraint — removal deferred to a future cleanup CR.

**Tech Lead Recommendations (non-AC concerns, follow-up candidates):**
1. **`<h3>` heading "Model Comparison Template"**: Still developer-facing language on the learner page. The subtitle was removed (AC-5), but the card heading remains. Frontend Agent correctly flagged this but left it unchanged (out of scope). Recommend renaming to learner-facing language (e.g., "Tiny vs Frontier: By the Numbers") in a content polish CR.
2. **HF array dead code in `extractProviderOutput()`**: The `Array.isArray(payload)` branch is now unreachable for the `huggingface` provider. Candidate for removal in a future cleanup CR once confirmed no other code path exercises it.
3. **Node.js runtime**: System v16.20.1 is below documented minimum (>=20.x). Recommend environment upgrade to v20+.

---

## Deployment Notes

- **To enable live HF inference**: set `FRONTIER_PROVIDER=huggingface`, `FRONTIER_API_URL=https://router.huggingface.co/featherless-ai/v1/completions`, `FRONTIER_MODEL_ID=meta-llama/Meta-Llama-3-8B`, `FRONTIER_API_KEY=<hf-token>`. Without these, the route falls back gracefully — no crash risk.
- No new packages. No infrastructure, middleware, or CSP changes. All changes backwards-compatible.

---

## Link to Updated Docs

- Plan: `agent-docs/plans/CR-014-plan.md`
- CR: `agent-docs/requirements/CR-014-hf-router-migration-and-comparison-table.md`
- Backend handoff: `agent-docs/conversations/tech-lead-to-backend.md`
- Frontend handoff: `agent-docs/conversations/tech-lead-to-frontend.md`
- Backend report: `agent-docs/conversations/backend-to-tech-lead.md`
- Frontend report: `agent-docs/conversations/frontend-to-tech-lead.md`

---
*Verified: 2026-02-20*
*Tech Lead Agent*
