# BA to Tech Lead Handoff

## Subject: CR-014 — HF Router Migration and Comparison Table Concretization

---

## What & Why

**What:** Two connected fixes for the Transformers page frontier inference demo:

1. **Migrate the HF provider** from the traditional HF Inference API (`api-inference.huggingface.co`) to the HF Router / Featherless AI (`router.huggingface.co/featherless-ai/v1/completions`), which uses OpenAI-compatible completions format.
2. **Fill the comparison table** with concrete `meta-llama/Meta-Llama-3-8B` values and remove a developer-facing subtitle that should not be visible to learners.

**Why this order matters:** Without the provider fix, the frontier chat demo always falls back to a deterministic sample. The learner never sees a real LLM response. That is the educational core of Stage 1 — the comparison is meaningless without it.

---

## Root Cause (confirmed)

The traditional HF Inference API does not serve `Meta-Llama-3-8B` on the free tier — gated models at this scale require a paid HF subscription. The upstream error is a **tier limitation**, not a request format bug. The HF Router (Featherless AI) exposes the same model via free $0.10 credits using a different endpoint and format.

---

## Required Changes

### Change 1: Provider request format (route.ts)

The `huggingface` provider currently sends:
```ts
{ inputs: prompt, parameters: { max_new_tokens: 256, temperature: 0.4 } }
```

The HF Router requires OpenAI-compatible completions format:
```ts
{ model: modelId, prompt, max_tokens: 256, temperature: 0.4 }
```

The response format (`{ choices: [{ text }] }`) is already handled by `extractProviderOutput()` — no change needed there.

**Clean-up:** Remove `return_full_text` from any HF request path (dead code — it was missing `false`, and it's irrelevant in the router format).

**Implementation decision (Tech Lead owns):** Whether to repurpose the existing `huggingface` provider type or introduce a new type (e.g., `huggingface-router`). Product requirement: `FRONTIER_PROVIDER=huggingface` + `FRONTIER_API_URL=https://router.huggingface.co/featherless-ai/v1/completions` must produce `mode: "live"` output, not fallback.

**Risk to verify:** Confirm `meta-llama/Meta-Llama-3-8B` (base, not instruct) is available in the Featherless AI catalog before locking. If unavailable, escalate to BA before proceeding.

### Change 2: `.env.example` update

Update the `huggingface` provider comment and example URL to reflect the router endpoint:
- New example URL: `https://router.huggingface.co/featherless-ai/v1/completions`
- Note that this endpoint uses OpenAI-compatible completions format (not HF Inference API format).

### Change 3: Comparison table content (page.tsx)

File: `app/foundations/transformers/page.tsx`, section `data-testid="transformers-comparison"`.

| Cell | Current | Required |
|---|---|---|
| Column header (Scaled Base Model) | `Scaled Base Model` | `Meta-Llama-3-8B` |
| Tokenization method (col 3) | `TBD (depends on selected model)` | `BPE (byte-pair encoding), 128K vocabulary` |
| Context window (col 3) | `TBD` | `8,192 tokens` |
| Model size (col 3) | `TBD` | `8B parameters` |
| Card subtitle | `Use this template when you lock concrete model choices.` | *(remove entirely)* |

Do not change row labels, table structure, or `data-testid="transformers-comparison"`.

### Change 4: Unit tests

CR-013 added 7 HF-specific unit tests for `buildProviderRequestBody()` and `extractProviderOutput()`. These will need updating to assert the new completions format request body. This is expected scope for the implementing agent — no separate Testing handoff required (no route/testid/accessibility contract changes).

---

## Acceptance Criteria (from CR-014)

- [ ] AC-1: `FRONTIER_PROVIDER=huggingface` + router URL + valid HF token → `mode: "live"`, non-empty, non-echoing output.
- [ ] AC-2: `buildProviderRequestBody()` for `huggingface` emits `{ model, prompt, max_tokens, temperature }`.
- [ ] AC-3: `return_full_text` does not appear in any active HF request path.
- [ ] AC-4: Comparison table shows `BPE (byte-pair encoding), 128K vocabulary` / `8,192 tokens` / `8B parameters`; column header reads `Meta-Llama-3-8B`.
- [ ] AC-5: Subtitle `"Use this template when you lock concrete model choices."` is removed.
- [ ] AC-6: `.env.example` HF comment and example URL reflect router endpoint.
- [ ] AC-7: `pnpm lint`, `pnpm build`, `pnpm test` pass with no new failures.

---

## Constraints

- `data-testid="transformers-comparison"` must not change.
- No new packages.
- Do not remove either response extraction path in `extractProviderOutput()` unless confirmed unused.
- No route renames; no accessibility contract changes → no E2E Testing handoff required.

---

## Reference Files

- API route: `app/api/frontier/base-generate/route.ts`
- Transformers page: `app/foundations/transformers/page.tsx`
- Unit tests: `__tests__/api/frontier-base-generate.test.ts`
- Env example: `.env.example`
- CR: `agent-docs/requirements/CR-014-hf-router-migration-and-comparison-table.md`
