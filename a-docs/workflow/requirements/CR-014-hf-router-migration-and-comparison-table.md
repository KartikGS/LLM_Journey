# CR-014: HF Router Migration and Comparison Table Concretization

## Status
`Done`

## Date
2026-02-20

## Execution Mode
`[S] Fast` — Single session; one API route change + one UI content update; no cross-role dependencies; no route/testid/accessibility contract changes.

---

## Background & Root Cause

**Original intent (CR-013):** Support HuggingFace as a frontier inference provider using the traditional HF Inference API (`api-inference.huggingface.co`).

**What failed:** The traditional HF Inference API does not serve Meta-Llama-3-8B on the free tier. Gated models of this scale require a paid HF plan → `upstream_error` returned.

**Available alternative (user-confirmed):** HF provides a router service (`router.huggingface.co`) powered by Featherless AI, accessible with the same HF API token and free $0.10 credits. This endpoint is OpenAI-compatible (`/v1/completions` format), **not** HF Inference API format.

**Secondary bug (CR-013 retrospective):** `return_full_text: false` was missing from the HF Inference API request body. LLaMA-3 models default to echoing the full input prompt in the output. This bug is structurally moot once we migrate to the router (completions format has no such parameter), but the old code path must be cleaned up or removed to avoid confusion.

---

## Business Value

Without this change, the frontier base inference demo silently falls back to a deterministic sample — meaning the learner never actually sees a real LLM response. This is the core educational moment of Stage 1: comparing the tiny ONNX model against a scaled frontier base model. The fallback undermines the learning objective entirely.

Fixing the provider restores live inference. Filling the comparison table gives the learner concrete, factual anchors (model size, context window, tokenization method) that make the scaling comparison meaningful rather than abstract.

---

## Scope

### 1. HF Router Provider Support (`/api/frontier/base-generate/route.ts`)

Switch the `huggingface` provider to target the HF Router (featherless-ai) with OpenAI-compatible completions format.

**Request format change:**

| | Current (HF Inference API) | Required (HF Router) |
|---|---|---|
| Body | `{ inputs, parameters: { max_new_tokens, temperature } }` | `{ model, prompt, max_tokens, temperature }` |
| URL pattern | `api-inference.huggingface.co/models/{model}` | `router.huggingface.co/featherless-ai/v1/completions` |
| Response | `[{ generated_text }]` | `{ choices: [{ text }] }` |

Note: `extractProviderOutput()` already handles the `choices[].text` format — no change needed there.

**Clean up:** Remove `return_full_text` from the old HF parameters block (dead code once format changes). If the old HF Inference API format is retained as a fallback path, add `return_full_text: false` before removing it — do not leave it in an echoing state.

**Implementation decision for Tech Lead:** Whether to repurpose the existing `huggingface` provider type (simpler), add a new provider type such as `huggingface-router` (cleaner separation), or URL-detect the format. The product requirement is: sending a prompt to `router.huggingface.co/featherless-ai/v1/completions` with `FRONTIER_PROVIDER=huggingface` must produce a live response, not a fallback.

### 2. `.env.example` Update

Update the `huggingface` provider comment and example URL to reflect the router endpoint:
- URL example: `https://router.huggingface.co/featherless-ai/v1/completions`
- Comment: explain that this endpoint uses OpenAI-compatible completions format.

### 3. Comparison Table Fill (`/foundations/transformers/page.tsx`)

Replace all `TBD` cells with concrete values for `meta-llama/Meta-Llama-3-8B`:

| Row | Current | Required |
|---|---|---|
| Tokenization method | `TBD (depends on selected model)` | `BPE (byte-pair encoding), 128K vocabulary` |
| Context window | `TBD` | `8,192 tokens` |
| Model size | `TBD` | `8B parameters` |

**Third column header:** Update `Scaled Base Model` to `Meta-Llama-3-8B` so the learner knows exactly what they are comparing against.

### 4. Remove Developer-Facing Subtitle

The comparison card subtitle — *"Use this template when you lock concrete model choices."* — is a developer instruction on a learner-facing page. Remove it. No replacement needed; the table is self-explanatory once filled.

---

## Acceptance Criteria

- [x] **AC-1:** A POST to `/api/frontier/base-generate` with a valid prompt and `FRONTIER_PROVIDER=huggingface` + `FRONTIER_API_URL=https://router.huggingface.co/featherless-ai/v1/completions` + valid `HF_TOKEN` returns `mode: "live"` with a non-empty, non-echoing output. — Evidence: `buildProviderRequestBody()` HF branch at `route.ts:193-200` emits completions format; `extractProviderOutput()` handles `choices[].text` at `route.ts:236-239`; exercised by mock-based test "should return live envelope when HF upstream succeeds" — PASS. Live token not available in local env; fallback path in place.
- [x] **AC-2:** `buildProviderRequestBody()` for the `huggingface` provider emits `{ model, prompt, max_tokens, temperature }` (OpenAI completions format), not `{ inputs, parameters }`. — Evidence: `route.ts:193-200`; confirmed by unit test "should send HF request body format" — PASS.
- [x] **AC-3:** `return_full_text` does not appear anywhere in the active HF request path. — Evidence: absent from `route.ts`; confirmed in adversarial review.
- [x] **AC-4:** The comparison table at `data-testid="transformers-comparison"` shows `BPE (byte-pair encoding), 128K vocabulary`, `8,192 tokens`, and `8B parameters` in the Scaled Base Model column, and the column header reads `Meta-Llama-3-8B`. — Evidence: `page.tsx:144` (header), `:151` (BPE), `:156` (context window), `:161` (model size).
- [x] **AC-5:** The subtitle *"Use this template when you lock concrete model choices."* is removed from the comparison card. — Evidence: absent from `page.tsx`; `<div>` at line 129 contains only `<h3>`, confirmed in adversarial review.
- [x] **AC-6:** `.env.example` HuggingFace comment and example URL reflect the router endpoint format. — Evidence: `.env.example` lines 16–21 updated with Featherless AI router URL and format note.
- [x] **AC-7:** `pnpm lint`, `pnpm build`, and `pnpm test` all pass with no new failures. — Evidence: 111 tests / 16 suites — PASS; lint ✔ no warnings or errors; tsc exit 0; build — all 6 routes compiled.

---

## Deviations Accepted

| # | Description | Severity | Decision |
|---|---|---|---|
| 1 | Frontend Agent updated TBD cell CSS from `text-gray-500 dark:text-gray-400` to `text-gray-600 dark:text-gray-300` alongside content changes. Not reported explicitly by Frontend Agent; flagged in Tech Lead adversarial review. | Minor — no AC impact, no route/testid/accessibility contract change; improves visual consistency with adjacent cells. | Accepted. |

---

## Constraints

- Do not change `data-testid="transformers-comparison"` or any other `data-testid` on the Transformers page.
- Do not change the comparison table row labels or row structure — only cell content and the Scaled Base Model column header.
- `extractProviderOutput()` handles both HF array format and OpenAI `choices[]` format. Do not remove either path unless confirmed unused.
- Unit tests added in CR-013 for the `huggingface` provider will need updating to reflect the new request body format. This is expected scope for the implementing agent.
- No new package installations required.

---

## Risks & Assumptions

| Risk | Mitigation |
|---|---|
| `meta-llama/Meta-Llama-3-8B` (base, not instruct) may not be in Featherless AI's catalog | Tech Lead to verify model availability at `router.huggingface.co/featherless-ai` before locking the model ID. If unavailable, escalate to BA for model ID decision. |
| $0.10 free credit may deplete during testing | Fallback path is already in place; E2E tests should mock the provider, not call live API. |
| LLaMA-3 base model output may be raw/unformatted | Expected behavior for a base (non-assistant-tuned) model. This is the educational point — no mitigation needed, it is the lesson. |

---

## Out of Scope

- Switching to any other inference provider or model.
- Streaming responses.
- Updating E2E tests (no route, testid, or accessibility contract change — existing E2E mocking unaffected).
- Visual redesign of the comparison table.
