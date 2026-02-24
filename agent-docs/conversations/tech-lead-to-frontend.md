# Handoff: Tech Lead → Frontend Agent

## Subject
`CR-015 - Adaptation Page: New AdaptationChat Component + Grid Enrichment`

## Status
`issued`

## Execution Mode (Mandatory)
`feature-ui`

---

## Objective

Replace the passive `AdaptationStrategySelector` component on the Model Adaptation page with a live, strategy-linked chat interface (`AdaptationChat`). Additionally, enrich the existing comparison grid cards to show `bestFor` and `caution` fields inline.

**Three concrete deliverables:**
1. Enrich comparison grid — render `bestFor` and `caution` in each card.
2. Remove `AdaptationStrategySelector` from the page (delete the file).
3. Create `AdaptationChat` — a new client component following the `FrontierBaseChat` visual/interaction pattern, with 3 tabs (one per strategy), a model info card per tab, clickable example prompts, and a terminal-style output console.

---

## Rationale (Why)

The current adaptation page is passive — learners read about trade-off profiles but cannot experience behavioral differences. With three live chat interfaces (one per strategy), a learner can type the same prompt into each and observe directly how a fully fine-tuned instruct model, a LoRA-adapted specialist, and a base model steered by a system prompt respond differently. This converts a description page into a behavioral demonstration — the "Learn with Tiny, Build with Large" dual-engine philosophy applied to Stage 2.

---

## Constraints

### UI/UX
- **Pattern fidelity (mandatory)**: `AdaptationChat` must follow `FrontierBaseChat`'s visual and interaction pattern exactly:
  - `GlassCard` wrapper
  - Left panel: model info + clickable example prompts
  - Right panel: textarea input + terminal-style output console
  - Status state machine: `'idle' | 'live' | 'fallback' | 'error'`
  - `maxLength={2000}` on textarea
  - Terminal console aesthetic (dark `bg-gray-900`, monospace font, macOS-style dots header, `$` prompt prefix)
- **Tab selector**: Embedded inside `AdaptationChat` (not page-level). Three tabs: Full Fine-Tuning | LoRA / PEFT | Prompt / Prefix Tuning. Switching tabs changes the visible model info card and chat interface without page reload.
- **Light/dark theme**: All colors must use Tailwind dual-theme classes (`dark:` variants). No hardcoded colors.
- **Responsive**: Follow the same `lg:flex-row` split-panel pattern from `FrontierBaseChat`.
- No new npm packages. Standard Kit v1.0 is sufficient.

### Semantic/Testability
- **Mandatory data-testid contracts** (Tech Lead-specified — Testing Agent will depend on these exactly):

| `data-testid` | Element |
|---|---|
| `adaptation-chat` | Outermost `<section>` container |
| `adaptation-chat-tab-full-finetuning` | Full Fine-Tuning tab button |
| `adaptation-chat-tab-lora-peft` | LoRA / PEFT tab button |
| `adaptation-chat-tab-prompt-prefix` | Prompt / Prefix Tuning tab button |
| `adaptation-chat-form` | `<form>` element |
| `adaptation-chat-input` | `<textarea>` |
| `adaptation-chat-submit` | Submit button |
| `adaptation-chat-output` | Terminal output `<div>` |
| `adaptation-chat-status` | Status/mode indicator |

- **No other data-testids are required** beyond this list. If you add more, document them in your completion report.

### Ownership
- Frontend-owned files: `app/models/adaptation/page.tsx`, `app/models/adaptation/components/AdaptationChat.tsx` (new), `app/models/adaptation/components/AdaptationStrategySelector.tsx` (delete).
- Test scope: **not delegated to Frontend**. Testing Agent handles E2E separately.
- No shared component extraction in scope.

---

## Contracts Inventory (Mandatory)

### Stable contracts — must not change
| Contract | Value |
|---|---|
| Route | `/models/adaptation` |
| `data-testid` | `adaptation-page` |
| `data-testid` | `adaptation-hero` |
| `data-testid` | `adaptation-strategy-comparison` |
| `data-testid` | `adaptation-continuity-links` |
| `href` | `/foundations/transformers` (continuity link) |
| `href` | `/context/engineering` (continuity link) |
| `data-testid` | `adaptation-link-transformers` |
| `data-testid` | `adaptation-link-context` |

### Removed contracts (replaced by AdaptationChat)
| `data-testid` | Status |
|---|---|
| `adaptation-interaction` | Removed — replaced by `adaptation-chat` |
| `adaptation-strategy-selector` | Removed |
| `strategy-button-full-finetuning` | Removed |
| `strategy-button-lora-peft` | Removed |
| `strategy-button-prompt-prefix` | Removed |
| `adaptation-interaction-output` | Removed |

### New contracts (AdaptationChat — see Constraints above for full table)
All 9 `adaptation-chat-*` testids listed in the Constraints section are required.

---

## Per-Tab Specification

### Tab 1: Full Fine-Tuning
- **Model info card**:
  - Model ID: `meta-llama/Meta-Llama-3-8B-Instruct`
  - Origin: Meta AI — hundreds of engineers, multi-million GPU-hour training run
  - Adaptation: All 8B parameters retrained on instruction-following + RLHF data
  - Purpose: General-purpose assistant; the high-quality, high-cost benchmark of adaptation
- **Example prompts** (English):
  - `"Explain the difference between supervised and unsupervised learning."`
  - `"Write a concise summary of the transformer architecture."`
  - `"What are three practical uses for fine-tuned language models?"`
- **API call**: POST `/api/adaptation/generate` with `{ prompt, strategy: 'full-finetuning' }`

### Tab 2: LoRA / PEFT
- **Model info card**:
  - Model ID: `swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA`
  - Origin: University of Bari Aldo Moro (SWAP-Uniba research group) — small academic team
  - Adaptation: LoRA + DPO on top of Meta-Llama-3-8B-Instruct, targeting Italian language tasks
  - Purpose: Italian-language specialist — demonstrates how a small team can produce a domain expert at a fraction of full fine-tune cost
  - **Mandatory callout** (visually distinct — e.g., amber/info box): _"This model was fine-tuned primarily for Italian. Try asking in Italian for best results."_
- **Example prompts** (Italian — mandatory):
  - `"Spiega la differenza tra apprendimento supervisionato e non supervisionato."`
  - `"Cos'è il LoRA e perché è efficiente?"`
  - `"Scrivi un breve riassunto dell'architettura transformer."`
- **API call**: POST `/api/adaptation/generate` with `{ prompt, strategy: 'lora-peft' }`

### Tab 3: Prompt / Prefix Tuning
- **Model info card**:
  - Model ID: `meta-llama/Meta-Llama-3-8B`
  - Origin: Meta AI
  - Adaptation: Zero parameter changes. A system prompt is prepended to every query server-side.
  - Purpose: Shows what prompt steering can and cannot achieve on a non-instruct base model. Response reliability is lower — this is intentional and educational.
  - **Mandatory explanation** in card text: explain that (1) a prefix prompt is prepended server-side, (2) it is not visible in the UI, (3) this is a base (non-instruct) model so reliability is lower.
- **Example prompts** (English):
  - `"Describe what a language model is in simple terms."`
  - `"What is the difference between a base model and an instruct model?"`
  - `"Explain why prompt engineering has limits."`
- **API call**: POST `/api/adaptation/generate` with `{ prompt, strategy: 'prompt-prefix' }`
- **Note**: Do NOT show the system prompt in the UI. It is applied server-side transparently.

---

## API Response Contract

`AdaptationChat` calls `/api/adaptation/generate`. The response shape is identical to `FrontierBaseChat`'s `/api/frontier/base-generate` contract:

```ts
// Live mode
{ mode: 'live', output: string, metadata: { modelId: string, strategy: string, ... } }

// Fallback mode
{ mode: 'fallback', output: string, reason: { code: string, message: string }, metadata: { ... } }

// Validation error (4xx)
{ error: { code: string, message: string } }
```

Handle these cases identically to how `FrontierBaseChat` handles them — the same status state machine logic applies.

---

## Design Intent (Mandatory for UI)

- **Target aesthetic**: Premium, consistent with the Transformers page. The `AdaptationChat` component should feel like a natural extension of `FrontierBaseChat` — same glass card treatment, same terminal console, same status indicator style.
- **Tab selector**: Use a simple button-group tab bar above the split panel. Active tab: `border-blue-500/40 bg-blue-500/10` style (consistent with the old strategy selector buttons). Inactive: neutral glass style.
- **Model info card (left panel)**: Replace the "LLM Playground" heading with the strategy-specific model name/icon. Keep the same information hierarchy.
- **Animation budget**: Tab switching can have a subtle `opacity` or `transition` effect. Do not add heavy framer-motion animations — the chat interaction is the focus, not the transition.
- **Anti-patterns**:
  - Do NOT add a separate page-level title/header for the chat section — the tab selector is the heading.
  - Do NOT render all three chat panels simultaneously and hide two — render only the active tab's panel.
  - Do NOT expose the system prompt in any UI text or placeholder.

---

## Comparison Grid Enrichment

In `app/models/adaptation/page.tsx`, each strategy card in the `adaptation-strategy-comparison` section currently renders:
```tsx
<li>Quality: {strategy.quality}</li>
<li>Cost: {strategy.cost}</li>
<li>Speed: {strategy.speed}</li>
```

Add `bestFor` and `caution` to each card below the existing list. Follow the same `<li>` pattern for visual consistency. The `strategy-data.ts` `Strategy` type already has `bestFor: string` and `caution: string` fields populated for all three strategies.

---

## Assumptions To Validate (Mandatory)

1. `GlassCard`, `lucide-react` icons, and `clsx`/`tailwind-merge` are sufficient for the component — no new packages needed.
2. `strategy-data.ts`'s `strategies` array and `StrategyId` type can be imported directly into `AdaptationChat.tsx` for tab configuration and strategy IDs.
3. `page.tsx` remains a Server Component — `AdaptationChat` is the only new Client Component island introduced.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

- If you find that any shared component in `app/ui/**` needs modification to support this design, **stop and flag it** — do not modify shared components without Tech Lead approval.
- Multi-turn conversation/chat history is **not** in scope. Single-turn only.
- Side-by-side model comparison (all three simultaneously) is **not** in scope. Tab-based only.

---

## Scope

### Files to Modify
- `app/models/adaptation/page.tsx`: (1) Add `bestFor`/`caution` to grid cards; (2) Remove `AdaptationStrategySelector` import + render; (3) Add `AdaptationChat` import + render.

### Files to Create
- `app/models/adaptation/components/AdaptationChat.tsx`: New client component per spec above.

### Files to Delete
- `app/models/adaptation/components/AdaptationStrategySelector.tsx`: Remove entirely.

---

## Definition of Done

- [ ] Comparison grid cards display `bestFor` and `caution` for all 3 strategies (AC-1).
- [ ] `AdaptationStrategySelector` removed; no import or render in `page.tsx`; file deleted (AC-2).
- [ ] `AdaptationChat` renders with 3-tab selector; switching tabs changes model info + chat interface without page reload (AC-3).
- [ ] Each tab's model info card displays: model ID, origin/team, adaptation method, purpose (AC-4).
- [ ] Full Fine-Tuning tab: calls API with `strategy: 'full-finetuning'`; English example prompts visible (AC-5).
- [ ] LoRA/PEFT tab: calls API with `strategy: 'lora-peft'`; Italian example prompts; Italian-first callout visible in info card (AC-6).
- [ ] Prompt/Prefix tab: calls API with `strategy: 'prompt-prefix'`; system prompt NOT visible in UI; info card explains the technique (AC-7).
- [ ] All 9 mandatory `data-testid` contracts present in the rendered DOM (see Constraints table).
- [ ] All stable contracts unchanged: `adaptation-page`, `adaptation-hero`, `adaptation-strategy-comparison`, `adaptation-continuity-links`, continuity `href`s (see Contracts Inventory).
- [ ] Light and dark themes both render correctly — no hardcoded colors (AC-11).
- [ ] `pnpm lint` passes.
- [ ] `pnpm exec tsc --noEmit` passes.
- [ ] **Completion report documents all new data-testid values** (Testing Agent depends on this).

---

## Clarification Loop (Mandatory)

- Post preflight concerns/questions to `agent-docs/conversations/frontend-to-tech-lead.md`.
- Tech Lead responds in the same file.
- Repeat until concerns are resolved or status becomes `blocked`.

---

## Verification

- Visually verify: light mode and dark mode both render correctly for `AdaptationChat` and enriched grid cards.
- Verify tab switching updates model info card and input area without page reload.
- Verify `adaptation-strategy-comparison` testid still present and grid shows 3 cards with all fields including `bestFor`/`caution`.
- Verify all 6 removed testids are absent from the DOM.
- Verify all 9 new testids are present in the DOM.

---

## Scope Extension Control (Mandatory)

If new feedback expands implementation beyond this handoff scope, mark it `scope extension requested` in your report. Wait for explicit `scope extension approved` from Tech Lead before implementing expanded work.

---

## Report Back

Write completion report to `agent-docs/conversations/frontend-to-tech-lead.md` using `agent-docs/conversations/TEMPLATE-frontend-to-tech-lead.md`.

**Critical**: Your completion report MUST include the full list of `data-testid` values introduced by `AdaptationChat`. The Testing Agent's handoff is issued based on your confirmed contracts.
