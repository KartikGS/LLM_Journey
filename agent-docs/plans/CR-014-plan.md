# Technical Plan - CR-014: HF Router Migration and Comparison Table Concretization

## Technical Analysis

The HF Inference API (`api-inference.huggingface.co`) does not serve `meta-llama/Meta-Llama-3-8B` on the free tier. The HF Router (Featherless AI) at `router.huggingface.co/featherless-ai/v1/completions` exposes the same model via free credits and uses OpenAI-compatible **text completions** format — not the HF Inference API array format.

Two related fixes are required:
1. **API route** (`route.ts`): update `buildProviderRequestBody()` for the `huggingface` provider to emit completions format instead of HF Inference API format.
2. **UI content** (`page.tsx`): fill the comparison table with concrete `meta-llama/Meta-Llama-3-8B` values and remove the developer-facing subtitle.

---

## Discovery Findings

### route.ts (`app/api/frontier/base-generate/route.ts`)
- `buildProviderRequestBody()` for `huggingface` currently emits `{ inputs, parameters: { max_new_tokens, temperature } }` — the HF Inference API body. **Must change.**
- `extractProviderOutput()` already handles **both** `[{ generated_text }]` (HF Inference API) AND `{ choices: [{ text }] }` (OpenAI completions) at line 236 (`firstChoice.text`). The router's completions response (`choices[].text`) is already handled. **No change to `extractProviderOutput()` needed.**
- `return_full_text` **is not present** in the current codebase. The Next Priority fix mentioned in the project log was never implemented. Per CR-014 AC-3, it simply must not appear — this is already satisfied; the Backend Agent must not introduce it.
- `HF_MAX_NEW_TOKENS = 256` constant exists and will be reused as `max_tokens: HF_MAX_NEW_TOKENS` in the new completions body.

### Unit Tests (`__tests__/api/frontier-base-generate.test.ts`)
- 7 HF tests exist in the `'HF Provider Path'` describe block (added by CR-013).
- `HF_ENV.FRONTIER_API_URL` is currently `https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B` — must update to `https://router.huggingface.co/featherless-ai/v1/completions`.
- Success mock uses `[{ generated_text }]` format — must update to `{ choices: [{ text }] }` (router's completions format).
- Body format assertion test checks `{ inputs, parameters }` — must update to assert `{ model, prompt, max_tokens, temperature }`.
- Empty output test uses `[{ generated_text: '' }]` — must update to completions format empty case.
- Error case tests (401, 429, 503) are HTTP-status-based and only need the URL update in `HF_ENV`.

### Transformers Page (`app/foundations/transformers/page.tsx`)
- `data-testid="transformers-comparison"` at line 128 — stable, must not change.
- Subtitle at line 135: `"Use this template when you lock concrete model choices."` — must be removed.
- Column header at line 145: `Scaled Base Model` → `Meta-Llama-3-8B`.
- Tokenization at line 152: `TBD (depends on selected model)` → `BPE (byte-pair encoding), 128K vocabulary`.
- Context window at line 157: `TBD` → `8,192 tokens`.
- Model size at line 162: `TBD` → `8B parameters`.

### `.env.example`
- HuggingFace comment block (lines 14–20) references old HF Inference API URL. Must update comment and example URL to reflect the router. **Tech Lead owns this directly.**

### Contract Stability
- Route `/api/frontier/base-generate`: **unchanged**.
- `data-testid="transformers-comparison"`: **unchanged** (constraint).
- No accessibility/semantic contract changes.
- No route renames.

---

## Configuration Specifications

### Implementation Decision: Provider Type (Tech Lead resolves)
**Decision: Repurpose the existing `huggingface` provider type. Do NOT add a new `huggingface-router` type.**

Rationale:
- The product requirement is: `FRONTIER_PROVIDER=huggingface` + new router URL = live mode. The type value remains a stable env var contract.
- Adding a new type requires expanding the type union, config validation logic, and all downstream branches — more surface area, more risk.
- The difference between "HF Inference API" and "HF Router" is captured by the URL and `.env.example` documentation, not by the provider type string.
- This decision is recorded here to prevent Backend Agent from introducing a new type.

### New `buildProviderRequestBody()` for `huggingface` (Backend Agent must use exactly):
```ts
if (provider === 'huggingface') {
    return {
        model: modelId,
        prompt,
        max_tokens: HF_MAX_NEW_TOKENS,
        temperature: 0.4,
    };
}
```

### `extractProviderOutput()`: No changes permitted.
The function already handles `choices[].text` (line 236). The HF array path must remain even though it will not be exercised by the `huggingface` provider after migration (CR-014 constraint: do not remove unless confirmed unused).

---

## Critical Assumptions

1. `meta-llama/Meta-Llama-3-8B` (base, not instruct) is available in the Featherless AI catalog at `router.huggingface.co/featherless-ai/v1/completions`. User has confirmed this. Fallback is in place if not — **no plan blocker**.
2. The HF Router returns OpenAI-compatible completions format `{ choices: [{ text }] }`. Already supported by `extractProviderOutput()`. No parser changes needed.
3. The `HF_MAX_NEW_TOKENS = 256` constant is reused for `max_tokens` in the completions body — value unchanged, parameter name changes in the body only.

---

## Proposed Changes

### Tech Lead (direct):
- `.env.example`: Update HuggingFace provider comment + example URL to reflect the router endpoint.

### Backend Agent (`app/api/frontier/base-generate/route.ts`):
- Update `buildProviderRequestBody()` HF branch: replace `{ inputs, parameters }` body with `{ model, prompt, max_tokens, temperature }`.
- No other changes to `route.ts`. `extractProviderOutput()` is frozen.

### Backend Agent (`__tests__/api/frontier-base-generate.test.ts`):
- Update `HF_ENV.FRONTIER_API_URL` to router URL.
- Update success mock response from HF array to completions format.
- Update body format assertion to assert new completions format.
- Update empty output test mock to completions format empty case.
- Error-case tests (401, 429, 503) only need the URL update — no other changes.

### Frontend Agent (`app/foundations/transformers/page.tsx`):
- Update column header: `Scaled Base Model` → `Meta-Llama-3-8B`.
- Fill `TBD` cells: tokenization / context window / model size.
- Remove the developer-facing subtitle (line 135).

---

## Contract Delta Assessment (Mandatory)

- Route contracts changed? **No** — `/api/frontier/base-generate` unchanged.
- `data-testid` contracts changed? **No** — `transformers-comparison` explicitly preserved; no additions or removals.
- Accessibility/semantic contracts changed? **No**.
- Testing handoff required per workflow matrix? **No** — no route/selector/accessibility contract changes. Unit test updates are delegated to Backend Agent in the same handoff.

---

## Architectural Invariants Check

- [x] **Observability Safety**: Telemetry path unchanged; `frontier.provider` span attribute already in place from CR-013. No new observability risk.
- [x] **Security Boundaries**: `FRONTIER_API_KEY` remains server-side only. Token sent via `Authorization: Bearer` header — no change.
- [x] **No new packages**: Confirmed. `fetch` is already used. No new dependencies.
- [x] **Fallback path preserved**: All fallback reason codes and the `selectFallbackSample()` path remain intact.

---

## Delegation & Execution Order

| Step | Agent | Task |
| :--- | :--- | :--- |
| 0 | **Tech Lead** (direct) | Update `.env.example` |
| 1a | **Backend Agent** | Update `route.ts` + unit tests |
| 1b | **Frontend Agent** | Update comparison table + remove subtitle in `page.tsx` |

---

## Delegation Graph (MANDATORY)

- **Execution Mode: Parallel**
- **Dependency Map**: Steps 1a and 1b have zero dependency on each other. `route.ts` and `page.tsx` are independent files. Backend Agent does not need Frontend output and vice versa.
- **Parallel Groups**:
  - Group 1: Backend Agent (1a) + Frontend Agent (1b) — issued together in a single handoff batch.
- **Handoff Batch Plan**:
  - Issue `tech-lead-to-backend.md` and `tech-lead-to-frontend.md` simultaneously.
  - Both agents report back to `backend-to-tech-lead.md` and `frontend-to-tech-lead.md` respectively.
  - Tech Lead reviews both reports, then runs full quality gates.
- **Final Verification Owner**: Tech Lead runs `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` after both sub-agent reports are reviewed.

---

## Operational Checklist

- [x] **Environment**: No hardcoded values. All URLs/keys remain in env vars.
- [x] **Observability**: No new telemetry surfaces; existing `frontier.provider` span attribute covers this.
- [x] **Artifacts**: No new tool-generated artifacts; `.gitignore` update not required.
- [x] **Rollback**: Revert `buildProviderRequestBody()` HF branch to old `{ inputs, parameters }` format and revert `.env.example` to old URL. Page content changes are reversible.

---

## Definition of Done (Technical)

- [ ] `buildProviderRequestBody()` for `huggingface` emits `{ model, prompt, max_tokens, temperature }`.
- [ ] `return_full_text` absent from all active HF request paths (already satisfied; agent to confirm).
- [ ] All HF unit tests updated and passing with router format mocks.
- [ ] Comparison table at `data-testid="transformers-comparison"` shows concrete `Meta-Llama-3-8B` values; column header updated.
- [ ] Developer subtitle removed from comparison card.
- [ ] `.env.example` HF comment + example URL reflect router endpoint.
- [ ] `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` all pass with no new failures.
