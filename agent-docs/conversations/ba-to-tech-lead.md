# BA to Tech Lead Handoff

## Subject: CR-015 — Adaptation Page: Strategy-Linked Chat Interface

---

## What & Why

**What:** Replace the `AdaptationStrategySelector` (passive radio buttons + detail card) on the Model Adaptation page with a live, strategy-linked chat interface. Three tabs — Full Fine-Tuning, LoRA/PEFT, Prompt/Prefix Tuning — each connect to a real model representing that adaptation strategy. The static comparison grid stays and is enriched with `bestFor` and `caution` content.

**Why:** The current page teaches adaptation through description only. A learner reads about trade-offs but cannot experience the behavioral differences. With a live chat interface per strategy, a learner can type the same prompt into each and observe directly how a fully fine-tuned instruct model, a LoRA-adapted specialist, and a base model steered by a system prompt respond differently. This converts a description page into a behavioral demonstration — the core promise of the "Learn with Tiny, Build with Large" dual-engine philosophy, now applied to Stage 2.

---

## Scope Summary

### Change 1: Enrich Comparison Grid (adaptation page)

The `adaptation-strategy-comparison` section already renders `quality`, `cost`, `speed`. The `strategy-data.ts` already contains `bestFor` and `caution` fields that are currently only used by the selector.

**Required:** Display `bestFor` and `caution` in each grid card inline. After this change, the grid is self-contained — the strategy selector's detail card becomes fully redundant.

`data-testid="adaptation-strategy-comparison"` must be preserved.

### Change 2: Remove `AdaptationStrategySelector`

Remove the component and its containing `<section data-testid="adaptation-interaction">` from the page entirely.

**Removed data-testid contracts** (Testing handoff required — see below):
- `adaptation-interaction`
- `adaptation-strategy-selector`
- `strategy-button-full-finetuning`
- `strategy-button-lora-peft`
- `strategy-button-prompt-prefix`
- `adaptation-interaction-output`

### Change 3: New `AdaptationChat` Component

New client component following the `FrontierBaseChat` visual and interaction pattern:
- Tab/button selector for three strategies (embedded in the component, not page-level)
- Left panel: model info card + clickable example prompts
- Right panel: textarea input, send button, terminal-style output console
- Status state machine: idle → loading → live / fallback / error

**Per-strategy model targets:**

| Strategy tab | Model ID | Notes |
|---|---|---|
| Full Fine-Tuning | `meta-llama/Meta-Llama-3-8B-Instruct` | English example prompts |
| LoRA / PEFT | `swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA` | Italian example prompts mandatory; callout in info card: Italian-first specialist |
| Prompt / Prefix Tuning | `meta-llama/Meta-Llama-3-8B` (base) | System prompt prepended server-side; info card explains the technique; no system prompt shown in UI |

**Per-strategy model info card content (BA-owned copy):**

*Full Fine-Tuning — Meta-Llama-3-8B-Instruct*
- Origin: Meta AI — hundreds of engineers, multi-million GPU-hour training run
- Adaptation: All 8 billion parameters retrained on instruction-following + RLHF data
- Purpose: General-purpose assistant; the high-quality, high-cost benchmark of adaptation

*LoRA / PEFT — LLaMAntino-3-ANITA-8B-Inst-DPO-ITA*
- Origin: University of Bari Aldo Moro (SWAP-Uniba research group) — small academic team
- Adaptation: LoRA + DPO on top of Meta-Llama-3-8B-Instruct, targeting Italian language tasks
- Purpose: Italian-language specialist — demonstrates how a small team can produce a domain expert at a fraction of the full fine-tune cost
- Callout: "This model was fine-tuned primarily for Italian. Try asking in Italian for best results."

*Prompt / Prefix Tuning — Meta-Llama-3-8B (base)*
- Origin: Meta AI
- Adaptation: Zero parameter changes. A system prompt is prepended to every query server-side.
- Purpose: Shows what prompt steering can and cannot achieve on a non-instruct base model. Response reliability is lower — this is intentional and educational.

### Change 4: New API Endpoint — Adaptation Generate

A new API route to serve the `AdaptationChat` component. The Tech Lead owns path naming, env var naming, and implementation approach.

**Product contract (BA-owned, not negotiable):**
- Accepts `{ prompt: string, strategy: 'full-finetuning' | 'lora-peft' | 'prompt-prefix' }`
- Routes each strategy to its configured model ID
- For `prompt-prefix`: prepends a system prompt to the user input server-side before upstream call (prompt content open — see Risks below)
- Returns the same `mode: 'live' | 'fallback'` response shape as `base-generate`
- Fallback text must be strategy-specific (not generic). Suggested themes:
  - Full fine-tune: context about what instruction tuning achieves and costs
  - LoRA: context about specialist models and parameter efficiency
  - Prompt-prefix: context about prompt steering limitations on base models
- Same OTel tracing pattern as `base-generate`

**New env vars required (naming: Tech Lead decides):**
- Model ID env var per strategy (3 total)
- API URL and API key can be shared with existing `FRONTIER_*` config — Tech Lead to confirm if same provider serves all three models
- `.env.local` and `.env.example` must be updated

---

## Acceptance Criteria

Canonical source: `agent-docs/requirements/CR-015-adaptation-strategy-chat-interface.md`

- AC-1: Comparison grid cards display `bestFor` and `caution`
- AC-2: `AdaptationStrategySelector` and `adaptation-interaction` section removed from DOM
- AC-3: New chat section renders with 3-tab strategy selector; tab switching changes content without page reload
- AC-4: Each tab's model info card shows model ID, origin/team, adaptation method, purpose
- AC-5: Full Fine-Tuning tab — calls adaptation API with `strategy: 'full-finetuning'`, English example prompts
- AC-6: LoRA/PEFT tab — calls API with `strategy: 'lora-peft'`, Italian example prompts, Italian-first callout
- AC-7: Prompt/Prefix tab — calls API with `strategy: 'prompt-prefix'`, system prompt applied server-side, not shown in UI; info card explains technique
- AC-8: Strategy-specific fallback text for all three strategies when API unavailable
- AC-9: API endpoint routes to correct model per strategy; system prompt prepended for `prompt-prefix`
- AC-10: `pnpm lint`, `pnpm build`, `pnpm test` pass (≥111 unit tests)
- AC-11: Light and dark themes correct for new component
- AC-12: E2E tests updated for removed selectors and new `AdaptationChat` selectors (Testing handoff)

---

## Testing Handoff Requirement

Per `workflow.md` Testing Handoff Trigger Matrix:

- `data-testid` removals: 6 selectors removed (listed above in Change 2)
- New `data-testid` contracts will be introduced by `AdaptationChat` (Frontend to document in its completion report)
- **A Testing handoff is required in this CR.** Testing must update affected E2E specs after the Frontend completion report documents new selectors.

Recommended execution order: **Parallel** for Frontend + Backend → **Sequential** for Testing (waits on Frontend's new data-testid documentation).

---

## Constraints

- `FrontierBaseChat` visual and interaction pattern must be followed for `AdaptationChat`
- System prompt for `prompt-prefix` is server-side only — never in client payload or UI
- Italian example prompts for LLaMAntino tab are mandatory
- No new npm packages
- Preserved contracts: `adaptation-page`, `adaptation-hero`, `adaptation-strategy-comparison`, `adaptation-continuity-links`

---

## Risks for Tech Lead to Resolve Before Delegation

| Risk | Required Action |
|---|---|
| LLaMAntino model availability on featherless-ai router | Verify before delegation. If unavailable, escalate to BA — the LoRA model choice may need to change. |
| All three models on same provider/router | Confirm whether shared `FRONTIER_API_URL` + `FRONTIER_API_KEY` works, or separate config needed |
| System prompt content for `prompt-prefix` | Decide or propose to Human User. Suggestion: `"You are a helpful assistant. Answer the following question clearly and concisely.\n\n"` |
| `extractProviderOutput()` dead code (`Array.isArray` HF path) | This was flagged as a `Next Priority` in CR-014. If the new adaptation endpoint shares this utility, decide whether to clean it up in-scope or keep as-is |

---

## Reference Files

- CR: `agent-docs/requirements/CR-015-adaptation-strategy-chat-interface.md`
- Adaptation page: `app/models/adaptation/page.tsx`
- Strategy data: `app/models/adaptation/components/strategy-data.ts`
- Strategy selector (to be removed): `app/models/adaptation/components/AdaptationStrategySelector.tsx`
- FrontierBaseChat (pattern reference): `app/foundations/transformers/components/FrontierBaseChat.tsx`
- Existing frontier API route (pattern reference): `app/api/frontier/base-generate/route.ts`
- Env example: `.env.example`
