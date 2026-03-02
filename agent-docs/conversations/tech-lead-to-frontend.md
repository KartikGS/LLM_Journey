# Handoff: Tech Lead → Frontend Agent

## Subject
`CR-022 — Adaptation Page Upgrade and Cleanup: Frontend Implementation`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing Frontend handoff context: `CR-021`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-021-plan.md` ✓
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-021-frontier-response-streaming.md` status `Done` per `agent-docs/project-log.md` ✓
- Result: replacement allowed for new CR context.

---

## Exact Artifact Paths (Mandatory)
- Requirement: `agent-docs/requirements/CR-022-adaptation-page-upgrade-and-cleanup.md`
- Plan: `agent-docs/plans/CR-022-plan.md`
- Report back to: `agent-docs/conversations/frontend-to-tech-lead.md`

## Execution Mode
`feature-ui`

---

## Objective

Add two narrative sections to `/models/adaptation` and harden `AdaptationChat` UX. Specifically:

1. Add "Why We Adapt LLMs" section to `page.tsx` before the strategy comparison cards.
2. Add "Limitations & What's Next" section to `page.tsx` after `AdaptationChat` and before `JourneyContinuityLinks`.
3. Disable strategy tab buttons in `AdaptationChat.tsx` while streaming is active.
4. Add AI accuracy disclaimer to `AdaptationChat.tsx`.

## Rationale (Why)

Product End Users currently reach strategy demos with no context for *why* adaptation exists, and leave without understanding what it cannot solve — missing the motivational bridge to Stage 3 (Context Engineering). The tab lockout prevents mismatched output when users click tabs mid-stream. The AI disclaimer establishes appropriate trust calibration and reduces legal exposure.

---

## Known Environmental Caveats

- **Node.js runtime**: System runtime may be below `>=20.x`. Run `node -v` first. If below 20.x, activate via `nvm use 20`. If nvm unavailable, classify as `environmental` in your report.
- **pnpm**: Use `pnpm` exclusively. Never `npm` or `yarn`.
- **Port**: Dev server runs on `3001`.

---

## Constraints

### UI/UX Constraints
- **Glassmorphism aesthetic**: New narrative sections must use `GlassCard` (already used for strategy cards) and match existing page typography/spacing. Do not introduce new visual primitives.
- **Dual-theme**: All new content must be legible in both light and dark mode. Use existing color token classes (`text-gray-900 dark:text-white`, `text-gray-600 dark:text-gray-400`, etc.).
- **Semantic HTML**: Narrative sections must use proper heading hierarchy (`<h2>` for section title, `<h3>` or `<p>` for subsections), `<ul>`/`<li>` for lists.
- **Bridging link**: The `/context/engineering` link in the Limitations section must use Next.js `<Link>` component (not a plain `<a>`) for client-side navigation.

### Semantic/Testability Constraints
- **`data-testid="adaptation-why-adapt"`** must be on the "Why We Adapt LLMs" outer `<section>` or `<div>`.
- **`data-testid="adaptation-limitations"`** must be on the "Limitations & What's Next" outer `<section>` or `<div>`.
- Tab buttons (`adaptation-chat-tab-full-finetuning`, `adaptation-chat-tab-lora-peft`, `adaptation-chat-tab-prompt-prefix`) **must keep their existing `data-testid` values unchanged**.

### Accessibility Constraints
- Tab disabled state: use **native `disabled` attribute** on `<button>` elements (not `aria-disabled` only). This is the accessibility-correct approach — it prevents keyboard focus and click events without additional guards.
- AI disclaimer must be readable text (not color-only hint, not tooltip).

### Ownership Constraints
- Frontend-owned files: `app/models/adaptation/page.tsx`, `app/models/adaptation/components/AdaptationChat.tsx`.
- You may create co-located component files under `app/models/adaptation/components/` (e.g., `WhyAdaptSection.tsx`, `LimitationsSection.tsx`) if needed for readability, but you are NOT required to.
- **Test scope**: Do NOT write or modify test files. Testing Agent handles tests in a subsequent step.
- **Shared component extraction**: NOT in scope. `GlassCard`, `GlowBackground` etc. are imported from `app/ui/` — use as-is.

---

## Contracts Inventory (Mandatory)

### Route Contracts
- `/models/adaptation` — unchanged (no route changes).

### Selector/Accessibility Contracts — Existing (MUST PRESERVE)
- `adaptation-page` — outer page container
- `adaptation-hero` — `JourneyStageHeader`
- `adaptation-strategy-comparison` — strategy cards section
- `adaptation-chat` — `AdaptationChat` section root
- `adaptation-chat-tab-full-finetuning` — Full Fine-Tuning tab button
- `adaptation-chat-tab-lora-peft` — LoRA/PEFT tab button
- `adaptation-chat-tab-prompt-prefix` — Prompt/Prefix Tuning tab button
- `adaptation-chat-form` — the `<form>` element
- `adaptation-chat-input` — the `<textarea>`
- `adaptation-chat-submit` — the submit button
- `adaptation-chat-output` — the terminal output area
- `adaptation-chat-status` — the status indicator

### Selector/Accessibility Contracts — New Additions (CR-022)
- `adaptation-why-adapt` — new "Why We Adapt LLMs" section
- `adaptation-limitations` — new "Limitations & What's Next" section

### Continuity/Navigation Contracts
- `adaptation-link-transformers` — previous stage link (must remain unchanged)
- `adaptation-link-context` — next stage link (must remain unchanged)
- `/context/engineering` — bridging link in Limitations section (new, must be navigable)

---

## Design Intent (Mandatory for UI)

### Target Aesthetic
- Match the existing adaptation page glassmorphism style: translucent glass cards, subtle borders, dark-mode glow effects.
- Both narrative sections should feel like part of the established educational flow, not bolted-on additions.

### Content Specification

**"Why We Adapt LLMs" section** (`data-testid="adaptation-why-adapt"`):
Must visibly cover all four points (AC-1 requirement):
1. Base models lack instruction-following — they complete text, not answer questions or follow format constraints.
2. Domain expertise gap — general training data doesn't guarantee specialist accuracy.
3. Knowledge cutoff — base models cannot learn from recent events without adaptation.
4. Output format control — production applications need predictable, structured output that base models don't guarantee.

Use your judgment on the exact wording within these constraints. Educational clarity (`$LLM_JOURNEY_PRINCIPLES`) takes priority over brevity.

**"Limitations & What's Next" section** (`data-testid="adaptation-limitations"`):
Must visibly cover (AC-2 and AC-3 requirements):
- Full Fine-Tuning trade-offs: compute/data cost, catastrophic forgetting risk, inaccessible to most teams.
- LoRA/PEFT trade-offs: reduces cost but still requires quality training data; doesn't fix knowledge currency.
- Prompt/Prefix Tuning trade-offs: most accessible, but cannot inject new factual knowledge — weights are frozen.
- Bridging callout: all three strategies share one unsolved limitation — the knowledge cutoff problem cannot be patched dynamically. Next Stage: Context Engineering addresses this.
- The bridging callout must include a navigable `<Link href="/context/engineering">` to `/context/engineering` (AC-3).

**AI Disclaimer** (AC-6):
- Verbatim text: `"AI can make mistakes, check important info."`
- Placement: below the `<form>` element and above the terminal output `<div>` in the right panel.
- Style: small, subtle secondary text — not an alert/banner. Something like `text-xs text-gray-400 dark:text-gray-500 text-center mt-1`.

### Animation Budget
- No new animations. New sections are static content only.
- Do not add `framer-motion` to the narrative sections.

### Explicit Anti-Patterns
- Do NOT put the AI disclaimer inside the terminal output area.
- Do NOT add a duplicate "Stage 3 bridge" — the `JourneyContinuityLinks` at the page bottom already shows the next stage link. The Limitations callout complements it with a motivational explanation; it is not redundant.
- Do NOT convert `page.tsx` to a Client Component (`'use client'`). New sections must stay Server Components.
- Do NOT add `console.log`, TODO markers, or debug artifacts in production code.

---

## Scope

### Files to Modify

- `app/models/adaptation/page.tsx`:
  - Add `adaptation-why-adapt` section before `adaptation-strategy-comparison` section.
  - Add `adaptation-limitations` section after `<AdaptationChat />` and before `<JourneyContinuityLinks />`.
  - If you create sub-components, import them here.
  - You may need to import `Link` from `'next/link'` for the `/context/engineering` bridging link (if the link is in `page.tsx` rather than a sub-component).

- `app/models/adaptation/components/AdaptationChat.tsx`:
  - Add `disabled={isStreaming}` to all three tab `<button>` elements.
  - Add disabled visual styling to tab buttons when `isStreaming` (e.g., `disabled:opacity-50 disabled:cursor-not-allowed` — these are already used on example prompt buttons and submit button in the component).
  - Add AI disclaimer text block between the closing `</form>` tag and the terminal output `<div>`.

---

## Read Before Implementing (Mandatory)

Read `app/models/adaptation/components/AdaptationChat.tsx` in full before implementing the tab disable change. The tab buttons are at approximately lines 337–357. Confirm:
1. All three tab buttons have their `data-testid` values matching the contract inventory above.
2. The `disabled` attribute pattern is consistent with how example prompt buttons are disabled (`disabled={isStreaming}`).
3. The `isStreaming` state is already available in scope.

---

## Assumptions To Validate (Mandatory)

1. `page.tsx` has no `'use client'` directive — confirm before adding new sections.
2. `GlassCard` is importable from `'@/app/ui/components/GlassCard'` — confirm the import path.
3. `isStreaming` is already tracked as a `useState` variable in `AdaptationChat.tsx` — confirm at approximately line 93.
4. The tab buttons currently have no `disabled` attribute — confirm.
5. `Link` from `next/link` is appropriate for the `/context/engineering` bridging link in a Server Component context.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

- If the `JourneyContinuityLinks` component already links to `/context/engineering` and the Limitations bridging callout creates a visually redundant second link, flag this in your preflight note with a suggestion (e.g., differentiate with different copy or style). Do NOT remove the footer link — it is a required continuity contract.
- If any styling token you use for new sections appears in the dark mode as unreadable (contrast issue), flag it.
- The `toRecord()` helper is present as a local utility in `AdaptationChat.tsx` (pre-existing duplication noted as CR-017 backlog item). Do NOT extract it — the third-consumer threshold for shared extraction has not been met.

---

## Definition of Done

- [ ] AC-1: `adaptation-why-adapt` section visible before strategy cards; all 4 "Why Adapt" points covered; readable in light and dark mode.
- [ ] AC-2: `adaptation-limitations` section visible after `AdaptationChat` and before nav footer; covers all 3 strategy trade-offs.
- [ ] AC-3: Limitations section includes `<Link href="/context/engineering">` bridging callout.
- [ ] AC-4: All three strategy tab buttons have `disabled={isStreaming}`; buttons become non-interactive when `isStreaming` is `true`.
- [ ] AC-5: Clicking a tab during streaming does not fire `handleTabChange` (native `disabled` prevents the click event). Verify: `onClick` is only bound, no separate `isStreaming` guard needed since `disabled` blocks the event.
- [ ] AC-6: AI disclaimer "AI can make mistakes, check important info." visible in `AdaptationChat` UI; legible in both themes.
- [ ] AC-9: All existing `data-testid` contracts preserved — no renames, no removals.
- [ ] `pnpm lint` passes.
- [ ] `pnpm exec tsc --noEmit` passes.

---

## Negative Space Rule (AC-4 Verification)

The Definition of Done for AC-4 must verify BOTH directions:
- [ ] **Positive**: Tabs are disabled/non-interactive when `isStreaming === true`.
- [ ] **Negative**: Tabs are enabled/interactive when `isStreaming === false` (idle and post-stream states).

Do not only verify the restriction — verify the base case still works.

---

## Clarification Loop (Mandatory)

Frontend posts preflight concerns/questions in `agent-docs/conversations/frontend-to-tech-lead.md`. Tech Lead responds in the same file. Repeat until concerns are resolved or status becomes `blocked`.

---

## Verification

Run in sequence under the documented runtime:
```
node -v
pnpm lint
pnpm exec tsc --noEmit
```

Report using Command Evidence Standard: Command, Scope, Execution Mode, Result.

**Note**: `pnpm test` and `pnpm build` are owned by the Testing Agent in the subsequent step. You are only responsible for `lint` and `tsc` passing after your changes.

---

## Scope Extension Control

If any feedback expands implementation beyond this handoff scope, mark it `scope extension requested` in your report. Wait for explicit `scope extension approved` from Tech Lead (or User override) before implementing expanded work.

---

## Report Back

Write completion report to `agent-docs/conversations/frontend-to-tech-lead.md` using `agent-docs/conversations/TEMPLATE-frontend-to-tech-lead.md`.

Status vocabulary: `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`

Report must include:
- Preflight note (assumptions confirmed/invalidated).
- Summary of each file changed with key line numbers.
- Confirmation that all `data-testid` contracts from the Contracts Inventory are preserved.
- Verification evidence (lint + tsc in Command Evidence Standard format).
- Deviations from this spec (if any), classified per the Deviation Protocol.
