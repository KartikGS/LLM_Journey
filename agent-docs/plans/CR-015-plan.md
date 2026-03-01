# Technical Plan - CR-015: Adaptation Page — Strategy-Linked Chat Interface

## Technical Analysis

The adaptation page is a Server Component with a Client Component island (`AdaptationStrategySelector`). CR-015 replaces the passive selector island with a live chat interface (`AdaptationChat`) connected to three real models. The comparison grid stays and is enriched with existing `bestFor`/`caution` data from `strategy-data.ts`.

Key structural changes:
1. Enrich comparison grid: render `bestFor` and `caution` (data already exists in `strategy-data.ts`, just not displayed).
2. Remove `AdaptationStrategySelector` component and its `adaptation-interaction` section.
3. Introduce `AdaptationChat` client component (following `FrontierBaseChat` visual/interaction pattern).
4. Create new `/api/adaptation/generate` API route with strategy-based model routing and server-side system prompt injection.
5. Update `.env.example` with new adaptation env vars.
6. Update `navigation.spec.ts` E2E tests to reflect removed/added data-testids.

---

## Discovery Findings

### `app/models/adaptation/page.tsx`
- Server Component. Imports and renders `AdaptationStrategySelector` on line 41.
- Comparison grid (`adaptation-strategy-comparison`) renders only `quality`, `cost`, `speed` — **not** `bestFor` or `caution` yet.
- Preserved stable contracts: `adaptation-page`, `adaptation-hero`, `adaptation-strategy-comparison`, `adaptation-continuity-links`.

### `app/models/adaptation/components/strategy-data.ts`
- `Strategy` type already includes `bestFor: string` and `caution: string` fields.
- All three strategy entries are fully populated. Frontend Agent only needs to render these fields in the grid.
- `StrategyId` union (`'full-finetuning' | 'lora-peft' | 'prompt-prefix'`) will be reused in the API request schema.

### `app/models/adaptation/components/AdaptationStrategySelector.tsx`
- Client Component. Contains all 6 data-testids to be removed:
  - `adaptation-interaction` (section wrapper)
  - `adaptation-strategy-selector` (radiogroup div)
  - `strategy-button-full-finetuning`, `strategy-button-lora-peft`, `strategy-button-prompt-prefix` (tab buttons)
  - `adaptation-interaction-output` (detail card)
- This file is deleted in full by the Frontend Agent.

### `app/foundations/transformers/components/FrontierBaseChat.tsx` (pattern reference)
- Split-panel `GlassCard`: left (model info area, sample prompts, status indicator) + right (textarea form, terminal output panel).
- Status state machine: `'idle' | 'live' | 'fallback' | 'error'`.
- `maxLength={2000}` on textarea. Adaptation component must follow same constraint.
- Relevant data-testids: `frontier-status`, `frontier-form`, `frontier-input`, `frontier-submit`, `frontier-output`.
- Single-model, no tab selector. Adaptation extends this with a 3-tab selector embedded in the component.

### `app/api/frontier/base-generate/route.ts` (pattern reference)
- OTel tracing via `getTracer().startActiveSpan(...)`.
- Config loaded from env vars with graceful fallback on missing/invalid config.
- Request validation via `zod`.
- Response shape: `{ mode: 'live'|'fallback', output: string, metadata: {...}, reason?: {...} }`.
- `extractProviderOutput()` handles OpenAI chat completions (`choices[].message.content`) and text completions (`choices[].text`).
- The adaptation endpoint must use the **same response shape** for the frontend to apply identical rendering logic.

### `__tests__/e2e/navigation.spec.ts` (E2E impact)
- Test "should navigate to Models/Adaptation" (lines 17–28, `@smoke`): asserts `adaptation-interaction`, `adaptation-strategy-selector`, `adaptation-interaction-output` — all removed. Must be updated.
- Test "should update adaptation output when strategy changes" (lines 30–40, **`@critical`**): asserts `adaptation-interaction-output`, `strategy-button-full-finetuning` — all removed. Must be rewritten with new `AdaptationChat` testid contracts.
- Test "should expose continuity links" (lines 42–52, `@smoke`): **unaffected**. Preserved contracts.

### `.env.example`
- Currently has: `FRONTIER_PROVIDER`, `FRONTIER_API_URL`, `FRONTIER_MODEL_ID`, `FRONTIER_API_KEY`, `FRONTIER_TIMEOUT_MS`.
- Adaptation shares `FRONTIER_API_KEY` and `FRONTIER_TIMEOUT_MS`. Adds: `ADAPTATION_API_URL` + 3 model ID vars.

### `agent-docs/decisions/` (ADR assessment)
- New `/api/adaptation/generate` follows existing `base-generate` pattern exactly. No new top-level architectural concept introduced.
- **No ADR required**: this is a new route following a documented existing pattern, not a new provider type, auth mechanism, rendering boundary, or observability contract.

---

## Implementation Decisions (Tech Lead Owned)

### Decision 1: API Endpoint Path
**`/api/adaptation/generate`**

Rationale: Mirrors `frontier/base-generate` naming pattern. Namespaced under `adaptation/` to match the page route (`/models/adaptation`).

### Decision 2: Provider Format
**OpenAI chat completions format** — `messages` array — for all three strategies.

Rationale: All three models (`Meta-Llama-3-8B-Instruct`, `LLaMAntino-3-ANITA-8B-Inst-DPO-ITA`, `Meta-Llama-3-8B`) are served via the featherless-ai router. Chat completions format (`v1/chat/completions`) handles instruct models correctly and cleanly expresses the `prompt-prefix` system message as `{ role: 'system', content: SYSTEM_PROMPT }` prepended to the messages array. Base model unreliability is intentional and educational.

### Decision 3: Env Var — API URL
**New `ADAPTATION_API_URL` env var**. API key: **shared with `FRONTIER_API_KEY`** (no new key var).

Rationale: Frontier endpoint uses `v1/completions` (text completions). Adaptation needs `v1/chat/completions` (chat format). Different endpoints on the same provider require a separate URL var. Sharing the key is correct since it's the same provider account.

Example `.env.example` value: `https://router.huggingface.co/featherless-ai/v1/chat/completions`

### Decision 4: Env Var — Model IDs
- `ADAPTATION_FULL_FINETUNE_MODEL_ID` → default: `meta-llama/Meta-Llama-3-8B-Instruct`
- `ADAPTATION_LORA_MODEL_ID` → default: `swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA`
- `ADAPTATION_PROMPT_PREFIX_MODEL_ID` → default: `meta-llama/Meta-Llama-3-8B`

### Decision 5: Timeout
Shared `FRONTIER_TIMEOUT_MS`. No new timeout var.

### Decision 6: System Prompt for `prompt-prefix`
```
"You are a helpful assistant. Answer the following question clearly and concisely.\n\n"
```
Applied as `{ role: 'system', content: SYSTEM_PROMPT }` prepended to the messages array. **Server-side only. Never exposed in client payload or UI.**

### Decision 7: Strategy-Specific Fallback Text (Backend Agent must use exactly)
- `full-finetuning`:
  `"Full fine-tuning retrains all model weights on task-specific data, producing highly aligned behavior at the cost of significant compute. This is a deterministic fallback — the live fine-tuned model is not configured for this environment."`
- `lora-peft`:
  `"LoRA adapts a frozen base model with small rank-decomposed matrices, achieving specialization at a fraction of full fine-tune cost. This is a deterministic fallback — the LLaMAntino specialist model is not available in this environment."`
- `prompt-prefix`:
  `"Prompt steering prepends a fixed instruction to every query without touching model weights — fastest to iterate, least robust. Base models respond less predictably than instruct variants. This is a deterministic fallback — the base model endpoint is not configured."`

### Decision 8: OTel Span
- Span name: `adaptation.generate`
- Attributes: `adaptation.strategy`, `adaptation.configured`, `adaptation.mode`, `adaptation.reason_code`, `adaptation.model_id`

### Decision 9: New `data-testid` Contracts for `AdaptationChat` (Mandatory — Frontend Agent must honor exactly; Testing Agent will reference these)
| `data-testid` | Element |
|---|---|
| `adaptation-chat` | Outermost `<section>` container (replaces `adaptation-interaction`) |
| `adaptation-chat-tab-full-finetuning` | Full Fine-Tuning tab button |
| `adaptation-chat-tab-lora-peft` | LoRA / PEFT tab button |
| `adaptation-chat-tab-prompt-prefix` | Prompt / Prefix Tuning tab button |
| `adaptation-chat-form` | `<form>` element |
| `adaptation-chat-input` | `<textarea>` |
| `adaptation-chat-submit` | Submit button |
| `adaptation-chat-output` | Terminal output `<div>` |
| `adaptation-chat-status` | Status/mode indicator |

### Decision 10: Dead Code in `extractProviderOutput()`
The adaptation endpoint is a new, separate route file with its own output extraction logic (chat completions only: `choices[].message.content`). The existing `base-generate/route.ts` is frozen. The HF array path cleanup in `extractProviderOutput()` remains a Next Priority item — **not in scope for CR-015**.

---

## Critical Assumptions

1. All three adaptation models are available on `router.huggingface.co/featherless-ai` at the chat completions endpoint.
2. `meta-llama/Meta-Llama-3-8B-Instruct` available on featherless-ai. (High confidence — instruct variants are the most-used catalog entries.)
3. **`swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA` available on featherless-ai. (UNVERIFIED — pre-delegation gate required. See Risk below.)**
4. `meta-llama/Meta-Llama-3-8B` (base) available on featherless-ai. (Confirmed by CR-014.)
5. `FRONTIER_API_KEY` is valid and shared — no separate adaptation key needed.
6. `StrategyId` from `strategy-data.ts` is the canonical type for the strategy enum in the request schema.

---

## 🛑 Pre-Delegation Risk Gate

### LLaMAntino Model Availability (Blocking)

**Risk**: `swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA` availability on featherless-ai router cannot be verified without a live API call. If unavailable, the LoRA tab model choice must change (escalate to BA per CR-015 risk definition).

**Required action before delegation**: Human User confirms the model is available on the featherless-ai catalog, OR provides an alternative Italian-language LoRA model ID to substitute.

**Contingency**: If unavailable, fallback copy in Decision 7 already degrades gracefully. Tech Lead updates `ADAPTATION_LORA_MODEL_ID` default in `.env.example` and delegates with the confirmed model ID.

---

## Proposed Changes

### Tech Lead (direct, pre-execution)
- `.env.example`: Add adaptation config block (see below).

### Frontend Agent
**Files modified**:
- `app/models/adaptation/page.tsx` — enrich grid cards with `bestFor`/`caution`; remove `AdaptationStrategySelector` import and render; add `AdaptationChat` import and render.
- `app/models/adaptation/components/AdaptationStrategySelector.tsx` — **delete**.

**Files created**:
- `app/models/adaptation/components/AdaptationChat.tsx` — new Client Component per CR-015 spec and data-testid contracts in Decision 9 above.

### Backend Agent
**Files created**:
- `app/api/adaptation/generate/route.ts` — new POST handler.
- `__tests__/api/adaptation-generate.test.ts` — new unit test suite.

### Testing Agent (sequential — after Frontend completion report)
**Files modified**:
- `__tests__/e2e/navigation.spec.ts` — update 2 tests (remove old adaptation testids; add new `AdaptationChat` testids per Frontend report).

---

## `.env.example` Block to Add (Tech Lead direct change)

```
# Adaptation Page Inference (server-side only)
# Uses the same API key as FRONTIER_API_KEY (same featherless-ai provider account)
# Chat completions endpoint (v1/chat/completions — instruct models require chat format)
ADAPTATION_API_URL='https://router.huggingface.co/featherless-ai/v1/chat/completions'
# Full Fine-Tuning strategy model (Meta-Llama-3-8B fully instruction-tuned)
ADAPTATION_FULL_FINETUNE_MODEL_ID='meta-llama/Meta-Llama-3-8B-Instruct'
# LoRA / PEFT strategy model (Italian-language specialist, LoRA + DPO on Meta-Llama-3-8B-Instruct)
ADAPTATION_LORA_MODEL_ID='swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA'
# Prompt / Prefix Tuning strategy model (Meta-Llama-3-8B base — no instruction tuning)
ADAPTATION_PROMPT_PREFIX_MODEL_ID='meta-llama/Meta-Llama-3-8B'
```

---

## Contract Delta Assessment

- Route contracts changed? **Yes — new route `/api/adaptation/generate` added.** No existing routes removed or renamed.
- `data-testid` contracts changed? **Yes — 6 testids removed, 9 new testids added.** (See Decisions 9 above.)
- Accessibility/semantic contracts changed? **No.** Tab/button pattern is equivalent to radio-group pattern; form/textarea pattern unchanged.
- Testing handoff required per workflow matrix? **YES** — data-testid removals + additions trigger mandatory Testing handoff.

---

## Architectural Invariants Check

- [x] **Observability Safety**: New endpoint follows same OTel pattern. Telemetry failures do not affect UI (span errors are isolated).
- [x] **Security Boundaries**: System prompt injected server-side only. `FRONTIER_API_KEY` remains server-side. No secrets in client payload.
- [x] **No new packages**: Standard Kit v1.0 (`zod`, `lucide-react`, `framer-motion` available if needed, `GlassCard` primitive) is sufficient.
- [x] **Fallback path present**: All 3 strategies have strategy-specific deterministic fallback text. Unconfigured state handled identically to `base-generate`.
- [x] **Component Rendering Strategy**: `AdaptationChat` is a Client Component (correct — requires interactive chat state). `page.tsx` remains a Server Component with targeted client island.

---

## Delegation & Execution Order

| Step | Agent | Task |
| :--- | :--- | :--- |
| 0 | **Tech Lead** (direct) | Update `.env.example`; create this plan |
| 1a | **Frontend Agent** | Enrich grid; delete `AdaptationStrategySelector`; create `AdaptationChat` |
| 1b | **Backend Agent** | Create `/api/adaptation/generate/route.ts` + unit tests |
| 2 | **Testing Agent** | Update `navigation.spec.ts` E2E (after Frontend report confirms testid contracts) |

---

## Delegation Graph (MANDATORY)

- **Execution Mode**: Mixed — **Parallel (1a + 1b)** → **Sequential (2 after 1a)**
- **Dependency Map**:
  - 1a (Frontend) and 1b (Backend) are fully independent. No shared artifacts.
  - 2 (Testing) depends on 1a (Frontend) completion report for confirmed data-testid contracts. Sequential.
- **Parallel Groups**:
  - Group 1 (simultaneous): Frontend (1a) + Backend (1b)
  - Group 2 (after Group 1 Frontend report reviewed): Testing (2)
- **Handoff Batch Plan**:
  - Batch 1: Issue `tech-lead-to-frontend.md` + `tech-lead-to-backend.md` together.
  - Wait state after Batch 1: review both reports, confirm Frontend's testid implementation.
  - Batch 2: Issue `tech-lead-to-testing.md` with confirmed testid contracts from Frontend report.
  - Wait state after Batch 2: review Testing report.
  - Tech Lead runs final quality gates.
- **Final Verification Owner**: Tech Lead — `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`.

---

## Operational Checklist

- [x] **Environment**: No hardcoded values. All API URLs, keys, model IDs in env vars.
- [x] **Observability**: `adaptation.generate` span with `adaptation.strategy` attribute.
- [x] **Artifacts**: No generated artifacts; `.gitignore` update not required.
- [x] **Rollback**: Delete `AdaptationChat.tsx`; restore `AdaptationStrategySelector` import in `page.tsx`; delete `/api/adaptation/generate/`; revert `.env.example`. Clean rollback path.

---

## Definition of Done (Technical)

- [ ] Comparison grid renders `bestFor` and `caution` for all 3 strategies (AC-1).
- [ ] `AdaptationStrategySelector` removed; 6 legacy data-testids absent from rendered DOM (AC-2).
- [ ] `AdaptationChat` renders with 3-tab selector; tab switching updates model info + chat without page reload (AC-3).
- [ ] Each tab's model info card displays model ID, origin/team, adaptation method, purpose (AC-4).
- [ ] Full Fine-Tuning tab: calls `/api/adaptation/generate` with `strategy: 'full-finetuning'`; English example prompts (AC-5).
- [ ] LoRA/PEFT tab: calls with `strategy: 'lora-peft'`; Italian example prompts; Italian-first callout in info card (AC-6).
- [ ] Prompt/Prefix tab: calls with `strategy: 'prompt-prefix'`; system prompt applied server-side and not visible in UI; info card explains technique (AC-7).
- [ ] All 3 strategies return strategy-specific fallback text when unconfigured (AC-8).
- [ ] Adaptation API routes to correct model per strategy; `prompt-prefix` prepends system prompt server-side (AC-9).
- [ ] `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` all pass (≥111 unit tests) (AC-10).
- [ ] Light/dark themes both render correctly for `AdaptationChat` (AC-11).
- [ ] `navigation.spec.ts` updated: old adaptation testids removed; new `AdaptationChat` testids asserted; `@critical` tag preserved (AC-12).
- [ ] 9 mandatory data-testid contracts from Decision 9 present in `AdaptationChat` DOM.
- [ ] `ADAPTATION_API_URL` + 3 model ID vars present in `.env.example`.
