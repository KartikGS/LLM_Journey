# CR-015: Adaptation Page — Strategy-Linked Chat Interface

## Status
`Done`

## Business Value

The current Adaptation page teaches adaptation strategies through description alone: text cards and a strategy selector that displays trade-off profiles. This is passive learning — the learner reads about the *concept* of fine-tuning without experiencing the *behavior* it produces.

This CR replaces the passive strategy selector with three live chat interfaces, each connected to a real model representing a distinct adaptation method. A learner can type the same prompt into all three and observe directly how a full fine-tune, a LoRA specialist, and a base model steered by a system prompt respond differently — converting a description page into a behavioral demonstration.

**Learner transformation goal**: After completing this stage, a learner should be able to answer:
- "Why would a small team use LoRA instead of full fine-tuning?"
- "What does a base model with a prepended system prompt look like in practice vs. a fine-tuned instruct model?"
- "How does a task-specialist model differ from a general assistant?"

## Product End User Audience

Software engineers at Stage 2 of the LLM Journey, who have already interacted with the base transformer demo on the Transformers page and understand the concept of model pretraining. They are now learning *why* adaptation exists and what behavioral differences the strategies produce.

---

## Scope

### 1. Enrich the Static Comparison Grid

The existing `adaptation-strategy-comparison` grid currently shows `quality`, `cost`, and `speed` per strategy. The `AdaptationStrategySelector` component additionally shows `bestFor` and `caution` text — data that already exists in `strategy-data.ts` but is not shown in the grid.

**Required**: Enrich each grid card to also display `bestFor` and `caution` fields inline, so the comparison grid is self-contained and the strategy selector's detail card becomes redundant.

### 2. Remove `AdaptationStrategySelector`

The `AdaptationStrategySelector` component (and its `data-testid="adaptation-interaction"` section) is replaced in full by the new `AdaptationChat` component. The selectors tied to this component will no longer exist after this CR.

Removed `data-testid` values (see Testing Handoff requirement below):
- `adaptation-interaction`
- `adaptation-strategy-selector`
- `strategy-button-full-finetuning`
- `strategy-button-lora-peft`
- `strategy-button-prompt-prefix`
- `adaptation-interaction-output`

### 3. New `AdaptationChat` Component

A new client component replaces the strategy selector. It follows the `FrontierBaseChat` visual and interaction pattern (split-panel layout, terminal-style output console, fallback-aware state machine). It extends the pattern to support multiple models via a tab/strategy selector embedded in the component itself.

**Component structure**:

```
[ Full Fine-Tuning | LoRA / PEFT | Prompt / Prefix Tuning ]  ← tab selector
────────────────────────────────────────────────────────────
  LEFT PANEL                     RIGHT PANEL
  ─────────────────────          ──────────────────────────
  Model info card                Textarea input (max 2000 chars)
    · Model ID                   Send button
    · Origin / team              Terminal-style output console
    · Adaptation method          Status indicator
    · Purpose
  Example prompts (clickable)
────────────────────────────────────────────────────────────
```

The component renders one chat interface at a time, switching on tab selection. The API endpoint must be called with a `strategy` parameter so the server can route to the correct model.

#### Per-Strategy Model Info

| Strategy | Model | Origin | Adaptation Method | Purpose |
|---|---|---|---|---|
| Full Fine-Tuning | `meta-llama/Meta-Llama-3-8B-Instruct` | Meta AI (hundreds of engineers, massive GPU budget) | All 8B parameters retrained on instruction + RLHF data | General-purpose assistant; the "expensive benchmark" |
| LoRA / PEFT | `swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA` | University of Bari research group (small academic team) | LoRA + DPO on top of Meta-Llama-3-8B-Instruct for Italian | Italian-language specialist — demonstrates LoRA's cost advantage for task specialization |
| Prompt / Prefix Tuning | `meta-llama/Meta-Llama-3-8B` (base) | Meta AI | Zero parameter changes; system prompt prepended server-side | Shows what prompt steering can and cannot achieve on a base model |

#### LLaMAntino UX (LoRA tab)

- Example prompts **must be in Italian** to demonstrate the model's specialization.
- The model info card **must include a callout** explaining that LLaMAntino is primarily an Italian-language model: learners should try Italian queries for best results.
- This teaches the trade-off: LoRA enables high specialization at low cost, but produces a task-specialist, not a generalist.

#### Prompt / Prefix Tuning UX

- The system prompt is applied **server-side only**. It is **not visible** in the chat UI.
- The model info card **must explain** the technique in text: a prefix prompt steers the base model's output distribution without any weight changes.
- The info card **must note** that this is a base (non-instruct) model, so reliability and instruction-following are limited compared to the fine-tuned alternatives.

### 4. New API Endpoint: Adaptation Generate

The existing `base-generate` endpoint is hardcoded to a single model via env vars. A new endpoint is required to accept a `strategy` parameter and route to the correct model ID per strategy.

**Required endpoint contract** (Tech Lead decides exact path and implementation approach):
- Input: `{ prompt: string, strategy: 'full-finetuning' | 'lora-peft' | 'prompt-prefix' }`
- Routes to the correct model per strategy
- For `prompt-prefix`: prepends a system prompt to the user's input server-side before calling the API
- Inherits the same fallback pattern as `base-generate`: if unconfigured or provider fails, return strategy-specific deterministic fallback text
- Inherits the same OTel tracing pattern

**New env vars required** (exact naming: Tech Lead decides):
- One env var per strategy model ID (3 total), e.g., model IDs for full fine-tune, LoRA, and prompt-prefix strategies
- The API URL, API key, and provider can be shared with the existing `FRONTIER_*` config or via new vars — Tech Lead decides whether to extend or create a new config namespace

**Note**: The `.env.local` file will need to be updated to include the new model ID env vars.

---

## Acceptance Criteria

- [x] **AC-1**: The `adaptation-strategy-comparison` grid card for each strategy displays `bestFor` and `caution` text in addition to the existing quality/cost/speed fields. — `app/models/adaptation/page.tsx:35-36`, two `<li>` entries rendering `strategy.bestFor` / `strategy.caution`.
- [x] **AC-2**: The `AdaptationStrategySelector` component is removed from the page. The `adaptation-interaction` section and its child data-testids are no longer present in the rendered DOM. — `AdaptationStrategySelector.tsx` deleted (confirmed in git status); `page.tsx` has no import or render of the component; no removed data-testid present in DOM.
- [x] **AC-3**: A new interactive section is rendered on the adaptation page with a tab selector for all three strategies. Switching tabs changes the visible model info card and chat interface without a page reload. — `AdaptationChat.tsx:239-265` (`role="tablist"`, 3 buttons); `handleTabChange` at line 99 is synchronous client state; E2E Test 3 `@critical` verifies tab switching via terminal label change.
- [x] **AC-4**: Each tab's model info card displays: model ID, origin/team, adaptation method, and purpose. — `AdaptationChat.tsx:26-73` (`TAB_CONFIGS` with all four fields); rendered at lines 277-307.
- [x] **AC-5 (Full Fine-Tuning tab)**: Chat sends to the adaptation API with `strategy: 'full-finetuning'`; model is `meta-llama/Meta-Llama-3-8B-Instruct`; example prompts are in English. — `AdaptationChat.tsx:147-151` (fetch body `{ prompt, strategy: activeTab }`); `TAB_CONFIGS[0]` line 31-40 (modelId + English prompts).
- [x] **AC-6 (LoRA/PEFT tab)**: Chat sends to the adaptation API with `strategy: 'lora-peft'`; model is `swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA`; example prompts are in Italian; the model info card contains a callout noting this model is Italian-first. — `TAB_CONFIGS[1]` lines 43-56 (modelId, Italian prompts, callout field); callout rendered at `AdaptationChat.tsx:311-316`.
- [x] **AC-7 (Prompt/Prefix tab)**: Chat sends to the adaptation API with `strategy: 'prompt-prefix'`; model is `meta-llama/Meta-Llama-3-8B`; system prompt is applied server-side and not shown to the user; the model info card explains this technique. — `TAB_CONFIGS[2]` lines 58-72 (modelId, adaptation field explains technique); `route.ts:17-18` (`ADAPTATION_SYSTEM_PROMPT` constant); `route.ts:144-148` (`buildMessages()` injects system role for `prompt-prefix` only); constant not present in any response field, log call, or span attribute (audited).
- [x] **AC-8**: All three strategies have strategy-specific deterministic fallback text when the API is unconfigured or unavailable. Fallback text must be thematically relevant to the strategy (not generic). — `route.ts:20-27` (`FALLBACK_TEXT` record); three thematic strings verified; unit tests `adaptation-generate.test.ts:374-396` assert exact text per strategy.
- [x] **AC-9**: The adaptation API endpoint routes to the correct model per strategy. For `prompt-prefix`, the system prompt is prepended server-side before the upstream call. — `route.ts:29-33` (`STRATEGY_MODEL_ENV` map); `route.ts:100-138` (`loadAdaptationConfig` reads per-strategy env var); `route.ts:140-152` (`buildMessages` injects system message for `prompt-prefix` only); routing and injection verified by 5 unit tests.
- [x] **AC-10**: All quality gates pass: `pnpm lint`, `pnpm build`, `pnpm test` (≥111 unit tests). — `pnpm test`: 133 passed (22 new tests); `pnpm lint`: ✔; `pnpm exec tsc --noEmit`: exit 0; `pnpm build`: succeeded. (Run under Node v18.19.0 via nvm — see environmental note.)
- [x] **AC-11**: Light and dark themes both render correctly for the new component. No hardcoded colors that break in either mode. — All Tailwind classes in `AdaptationChat.tsx` use `dark:` variants; no raw hex colors in className attributes; source-audited by Tech Lead adversarial diff review.
- [x] **AC-12**: E2E tests for the adaptation page are updated to reflect removed data-testids and any new selectors introduced by the `AdaptationChat` component. — `navigation.spec.ts:17-64` — Test 2 fully rewritten with 9 new assertions on `adaptation-chat` testids; Test 3 (`@critical`) added for tab-switch behaviour; no old selectors remain; 12/12 E2E passed across 3 browsers.

---

## Constraints

- The visual and interaction pattern of `FrontierBaseChat` (split-panel, terminal console, status machine) **must be followed**. The adapted component must feel consistent with the Transformers page.
- System prompt for `prompt-prefix` strategy is applied **server-side only** — never exposed in the client payload or UI.
- Italian example prompts for the LLaMAntino tab are **mandatory**.
- No new npm packages. The Standard Kit (Standard Kit v1.0) is sufficient.
- `data-testid="adaptation-strategy-comparison"` and `data-testid="adaptation-page"` and `data-testid="adaptation-hero"` and `data-testid="adaptation-continuity-links"` must be preserved — these are stable E2E contracts from prior CRs.
- Converting `AdaptationStrategySelector` to a server component is **not** an option (it requires client interactivity). The new component will also be a client component.

---

## Testing Handoff Requirement

Per the Testing Handoff Trigger Matrix in `workflow.md`, **a Testing handoff is required** in this CR:

- **data-testid removals**: `adaptation-interaction`, `adaptation-strategy-selector`, `strategy-button-full-finetuning`, `strategy-button-lora-peft`, `strategy-button-prompt-prefix`, `adaptation-interaction-output` — all removed.
- **New data-testid contracts**: New selectors introduced by `AdaptationChat` must be documented in the Frontend handoff and reflected in the Testing handoff.
- Affected E2E specs must be updated to reflect the new component structure.

---

## Risks & Assumptions

| Item | Type | Notes |
|---|---|---|
| LLaMAntino model availability on featherless-ai router | Risk | Not confirmed. Tech Lead must verify before implementation. If unavailable, fallback to an alternative Italian-fine-tuned LoRA model or document as "API not available for this model — fallback shown." |
| Meta-Llama-3-8B base model response quality with prompt steering | Assumption | Base models are less reliable at instruction-following. Fallback and UX copy should set learner expectations accurately (per Honest Model Framing principle). |
| Shared API key/URL for all three models | Assumption | All three models are expected to be served via the same featherless-ai router endpoint. Tech Lead to confirm during planning. |
| System prompt content for prompt-prefix strategy | Open | The exact system prompt to prepend is a Tech Lead / Human User decision. Suggestion: a generic assistant-style prefix (e.g., `"You are a helpful assistant. Answer clearly and concisely.\n\n"`). |

---

## Execution Mode

`[M]` — Multi-step, single-phase. Requires: Frontend (new component), Backend (new API route), Testing (E2E selector updates). Frontend and Backend are in **Parallel Mode** (independent artifacts); Testing is **Sequential** (depends on Frontend output for new data-testid contracts).

---

## Deviations Accepted

| # | Description | Severity | BA Decision |
|---|---|---|---|
| 1 | `/api/adaptation/generate` route has no output length cap. `base-generate` caps at 4000 chars (`FRONTIER_OUTPUT_MAX_CHARS`). | Minor — no AC intent change; no contract change; low practical risk as instruct models are generally concise | Accepted. Follow-up CR recommended (logged in project-log Next Priorities). |

---

## Out of Scope

- Multi-turn conversation / chat history. Single-turn only (same as current `FrontierBaseChat`).
- Side-by-side model comparison (all three simultaneously). Tab-based sequential interaction only.
- Fine-tuning the models or changing their weights. This is a UI/API integration exercise only.
- Changes to the Transformers page or any other stage.
