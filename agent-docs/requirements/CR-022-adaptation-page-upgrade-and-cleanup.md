# CR-022: Adaptation Page Upgrade and Cleanup

## Status
`Done`

## Business Context
**User Need:** The adaptation page (Stage 2) has three gaps:
1. **Narrative gap**: Product End Users jump directly into the three strategy demos without understanding *why* LLM adaptation exists in the first place, and leave without understanding what adaptation cannot solve — missing the motivational bridge to Stage 3.
2. **UX correctness gap**: Strategy tabs (`full-finetuning`, `lora-peft`, `prompt-prefix`) remain interactive during active streaming. A tab click mid-stream visually switches to a new strategy while the prior strategy's stream continues — creating mismatched output and a confusing experience.
3. **Code hygiene gap**: Two dead-code items from CR-017/CR-018 remain unresolved — an unreachable `invalid_config` branch in the generation fallback code, and an unused `ADAPTATION_API_URL` constant in adaptation API tests.

Additionally, the chat interface carries no AI accuracy disclaimer, creating legal exposure.

**Expected Value:**
- Learners arrive at the strategy comparison with context for *why* adaptation matters (motivates engagement with the demos).
- Learners leave the page understanding what the three strategies *cannot* solve — priming them for Stage 3 (Context Engineering).
- Tab lockout eliminates mid-stream confusion; the AI disclaimer establishes appropriate trust calibration.
- Removing dead code reduces false complexity for future maintainers and eliminates type-noise in generation fallback paths.

**Execution Mode:** Standard

## Functional Requirements

### Adaptation Page — Narrative Sections
1. A "Why We Adapt LLMs" section is added to `/models/adaptation` **before** the strategy comparison cards. It covers four key points: (a) base models lack instruction-following — they complete text, not answer questions or follow format constraints; (b) domain expertise gap — general training data doesn't guarantee specialist accuracy; (c) knowledge cutoff — base models cannot learn from recent events without adaptation; (d) output format control — production applications need predictable, structured output that base models don't guarantee.
2. A "Limitations & What's Next" section is added to `/models/adaptation` **after** the `AdaptationChat` component and **before** the `JourneyContinuityLinks` footer. It covers the trade-offs of all three strategies shown: Full Fine-Tuning (compute/data cost, catastrophic forgetting risk, inaccessible to most teams), LoRA/PEFT (reduces cost but still requires quality training data; doesn't fix knowledge currency), Prompt/Prefix Tuning (most accessible, but cannot inject new factual knowledge — weights are frozen). It concludes with a bridging callout: all three strategies share one unsolved limitation — the knowledge cutoff problem cannot be patched dynamically. This motivates Context Engineering (Stage 3) as the answer.

### AdaptationChat — UX Hardening
3. The three strategy tab buttons (`adaptation-chat-tab-full-finetuning`, `adaptation-chat-tab-lora-peft`, `adaptation-chat-tab-prompt-prefix`) are disabled while `isStreaming` is `true`. They become interactive again on stream completion or error.
4. An AI accuracy disclaimer — "AI can make mistakes, check important info." — is rendered visibly within the `AdaptationChat` component, in the chat output area or below the input form. Legible in both light and dark mode.

### Generation Routes / Tests — Dead-Code Cleanup
5. The unreachable `invalid_config` branch is removed from generation fallback code paths and any associated type definitions (discriminated union members, switch/if cases). Scope: generation-related files only.
6. The unused `ADAPTATION_API_URL` constant is removed from the adaptation API test file(s).

## Non-Functional Requirements
- **Accessibility**: New narrative sections must use semantic HTML (headings, lists). Streaming tab disabled state must be accessible (not just visual — use `disabled` attribute or `aria-disabled` with keyboard-focus prevention).
- **Visual consistency**: New sections must match the established glassmorphism aesthetic of the adaptation page (GlassCard, GlowBackground, consistent typography and spacing).
- **No user-visible behavior change** from items 5–6 (pure dead-code removal).

## System Constraints & Invariants
- **Constraint Mapping**:
  - `tooling-standard.md`: TypeScript strict mode, ESLint, Prettier — all must remain passing.
  - `technical-context.md`: `data-testid` contracts on `adaptation-chat-tab-*`, `adaptation-chat-submit`, `adaptation-chat-input`, `adaptation-chat-output` must not change (no rename/removal/addition outside this CR's explicit additions).
  - `architecture.md` (Component Rendering Strategy): The adaptation page is interactive-primary; existing server/client component boundary decisions must not be changed without a Tech Lead rationale note. New narrative sections may be Server Components unless they require client state.
  - `project-principles.md` (Educational Clarity First, Stage Continuity, Resource-Rich Learning): All new content must be written for a learner audience, preserve the stage narrative flow, and may include reference links where relevant.
- **Design Intent**: Standard educational narrative extension + UX hardening + housekeeping. Not an architectural pivot. No new packages expected.

## Acceptance Criteria
- [x] AC-1: A "Why We Adapt LLMs" section exists on `/models/adaptation`, rendered before the strategy comparison cards. It visibly covers all four points: instruction-following limitation, domain expertise gap, knowledge cutoff, output format control. Content is readable in both light and dark mode. — Verified: `app/models/adaptation/page.tsx` line 23 (`adaptation-why-adapt`); all 4 points at lines 31–67 (BA independent read confirmed).
- [x] AC-2: A "Limitations & What's Next" section exists on `/models/adaptation`, rendered after `AdaptationChat` and before the navigation footer. It covers trade-offs for all three strategies (Full Fine-Tuning, LoRA/PEFT, Prompt/Prefix Tuning) and includes a bridging callout naming Context Engineering (`/context/engineering`) as the next stage. — Verified: `app/models/adaptation/page.tsx` line 95 (`adaptation-limitations`), positioned after `<AdaptationChat />` at L93 and before `<JourneyContinuityLinks />` at L135; all 3 strategy trade-offs present L101–117 (BA independent read confirmed).
- [x] AC-3: The "Limitations & What's Next" section bridging callout explicitly references Stage 3 (Context Engineering) with a navigable link to `/context/engineering`. This is the measurable learner-transformation signal: after reading, the learner can identify *why* Stage 3 exists. — Verified: `app/models/adaptation/page.tsx` line 123–128 `<Link href="/context/engineering">Learn Context Engineering</Link>` in indigo callout box (BA independent read confirmed).
- [x] AC-4: `adaptation-chat-tab-full-finetuning`, `adaptation-chat-tab-lora-peft`, and `adaptation-chat-tab-prompt-prefix` buttons are non-interactive (disabled or equivalent) while streaming is active; they become interactive again on completion or error. — Verified: `app/models/adaptation/components/AdaptationChat.tsx` line 347 `disabled={isStreaming}` on `<button>` element rendered via `TAB_CONFIGS.map()`; `finally { setIsStreaming(false) }` re-enables; native React `disabled` prop (not CSS-only) — CSS affordances at L353 are supplementary (BA independent read confirmed).
- [x] AC-5: Clicking a tab button during active streaming does not change the active strategy or restart generation. — Verified: native `disabled` prop at L347 prevents click events; unit test `AdaptationChat.test.tsx` case 3 "tab click during streaming does not change active strategy" confirms behavioral invariant. Note: TL AC evidence labelled this as "native disabled prop (not CSS-only)" — the behavioral requirement is satisfied by the implementation approach.
- [x] AC-6: The AI disclaimer "AI can make mistakes, check important info." is visible within the `AdaptationChat` component UI in both light and dark mode. — Verified: `app/models/adaptation/components/AdaptationChat.tsx` lines 497–500; positioned after `</form>` and before terminal output `data-testid="adaptation-chat-output"` (BA independent read confirmed).
- [x] AC-7: No `invalid_config` branch or `invalid_config` type member exists in generation-related code paths. `pnpm exec tsc --noEmit` passes. — Verified: grep across all `.ts/.tsx` files returns no matches; `pnpm exec tsc --noEmit` exit 0 (BA grep confirmed; TL command evidence confirmed).
- [x] AC-8: No unused `ADAPTATION_API_URL` constant exists in adaptation API test files. `pnpm lint` passes. — Verified: grep in `__tests__/` returns no matches; `pnpm lint` no warnings or errors (BA grep confirmed; TL command evidence confirmed).
- [x] AC-9: All existing `data-testid` contracts on the adaptation page and chat component are preserved (no renames, no removals outside explicitly deleted dead-code). — Verified: all 12 pre-existing contracts confirmed present by Frontend Coordinator; `adaptation-why-adapt` and `adaptation-limitations` added as new contracts; `testing-contract-registry.md` updated to correct stale pre-CR-012 registry entries (`adaptation-interaction`, `adaptation-strategy-selector`, `adaptation-interaction-output`) which were registry artifacts, not live code contracts.
- [x] AC-10: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` all pass. — Verified: `pnpm test` 165 passed/0 failures (+3 new `AdaptationChat.test.tsx` unit tests); `pnpm lint` no errors; `pnpm exec tsc --noEmit` exit 0; `pnpm build` PASS; `pnpm test:e2e` ENV (non-blocking — new section testids are static Server Component outputs; no dev server at Testing Agent execution time).

## Verification Mapping
- **Development Proof**:
  - AC-1, AC-2, AC-3: Manual browser check at `/models/adaptation` — sections visible in correct position; link to `/context/engineering` navigates correctly.
  - AC-4, AC-5: Trigger a stream in `AdaptationChat`; attempt tab click mid-stream — tabs must be unresponsive. Verify tabs re-enable after stream completes.
  - AC-6: Visible in rendered UI (both themes).
  - AC-7, AC-8: `pnpm exec tsc --noEmit` and `pnpm lint` pass; grep confirms no `invalid_config` branch and no `ADAPTATION_API_URL` constant remain.
  - AC-9: Diff confirms no `data-testid` rename or removal.
  - AC-10: Full quality gate run.
- **AC Evidence Format (for closure)**:
  - `[x] <AC text> — Verified: <file-or-command>, <result>`
- **User Validation**: Navigate to `/models/adaptation` and confirm: (a) new "Why Adapt" section appears before strategy cards; (b) new "Limitations" section with Stage 3 bridge appears after the chat; (c) AI disclaimer is visible in the chat UI; (d) triggering a stream locks out strategy tabs mid-stream.

## Baseline Failure Snapshot
N/A — items 1–4 are enhancements; items 5–6 are housekeeping. No failing tests being fixed.

## Post-Fix Validation Snapshot (Filled at Closure)
- **Date**: 2026-02-27
- **Command(s)**: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build`, `pnpm test:e2e`
- **Execution Mode**: local-equivalent/unsandboxed (Node v20 via nvm)
- **Observed Result**: All pass — 18 suites, 165 tests (162 prior + 3 new); lint clean; tsc exit 0; build clean (pre-existing OTel warning only); E2E ENV (non-blocking: dev server not running at Testing Agent execution time; new section testids are static Server Component outputs).

## Dependencies
- Blocks: None
- Blocked by: None

## Notes
- **Parallel execution**: Frontend sub-agent handles items 1–4 (page.tsx narrative sections + AdaptationChat.tsx UX hardening). Backend sub-agent handles items 5–6 (dead-code removal). These touch distinct files and can run in parallel.
- **Dead-code scope**: Items 5–6 are scoped to generation route files and adaptation API test files only. No behavioral changes to any API contract.
- **Disclaimer placement**: Exact positioning of the AI disclaimer (below input form vs. below output window) is a Frontend sub-agent decision; it must be visible and legible in both themes.
- **New sections rendering boundary**: Tech Lead should decide whether the new narrative sections in `page.tsx` are Server Components (preferred, no interactivity needed) or Client Components (only if a pattern constraint forces it). No ADR expected for this — a note in the plan is sufficient.
- **toRecord() duplication** (CR-017 deferred item): No third client-side consumer has appeared. The shared utility at `lib/utils/record.ts` exists but the deferred extraction condition (third consumer) has not been met. Keeping on Next Priorities backlog — not included in this CR scope.

## Technical Analysis (filled by Tech Lead — required for M/L/H complexity; optional for [S])
**Complexity:**
**Estimated Effort:**
**Affected Systems:**
**Implementation Approach:**

## Deviations Accepted (filled at closure by BA)
- **AC-5 label discrepancy** — TL report AC-5 reads "Native `disabled` prop (not CSS-only)" rather than CR's AC-5 "Clicking a tab during streaming does not change strategy or restart generation." The behavioral requirement is fully satisfied: native `disabled` prevents click events, and unit test case 3 in `AdaptationChat.test.tsx` explicitly asserts the behavioral invariant. No AC intent change. Severity: **Minor** (no contract, security, or scope change). Accepted.
