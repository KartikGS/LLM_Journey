# BA to Tech Lead Handoff

## Subject
`CR-022 — Adaptation Page Upgrade and Cleanup`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing BA handoff context: `CR-021`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-021-plan.md` ✓
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-021-frontier-response-streaming.md` status is `Done` ✓
- Result: replacement allowed for new CR context.

## Objective
CR-022 bundles four related improvements to the adaptation page and its supporting code into a single deliverable:

1. **Narrative sections**: Add "Why We Adapt LLMs" (before strategy cards) and "Limitations & What's Next" (after chat, before navigation) to `/models/adaptation`. Fills the educational gap where Product End Users currently dive into strategy demos with no context for *why* adaptation exists, and leave without a motivational bridge to Stage 3.
2. **UX hardening**: Disable the three strategy tab buttons (`adaptation-chat-tab-*`) while streaming is active. Currently, tab clicks mid-stream change tab state while the prior strategy's stream continues — creating mismatched output.
3. **AI disclaimer**: Add "AI can make mistakes, check important info." to the `AdaptationChat` UI to reduce legal exposure.
4. **Dead-code cleanup**: Remove unreachable `invalid_config` branch from generation fallback code paths/types, and remove unused `ADAPTATION_API_URL` constant from adaptation API tests.

## Linked Artifacts
- CR: `agent-docs/requirements/CR-022-adaptation-page-upgrade-and-cleanup.md`

## Audience & Outcome Check
- **Human User intent**: Fix the tab mid-stream UX bug, add AI disclaimer, enrich the adaptation page with narrative framing, and clear two known dead-code items.
- **Product End User audience**: Software engineers learning LLM system design via Stage 2 (Model Adaptation page).
- **Expected learner outcome**: Learners arrive at strategy demos understanding *why* adaptation exists; they leave understanding what adaptation cannot solve — priming them for Context Engineering (Stage 3). The tab lockout and disclaimer improve interaction quality and trust calibration.

## Suggested Execution Mode
**Parallel delegation** — Frontend and Backend work on distinct files with no shared dependency:
- **Frontend sub-agent**: narrative sections in `app/models/adaptation/page.tsx` (+ any new section components) and `AdaptationChat.tsx` UX hardening (tabs + disclaimer). Items 1–4.
- **Backend sub-agent**: dead-code removal in generation route files and adaptation API test files. Items 5–6.

## Key Design Decisions for Tech Lead Resolution
1. **New narrative section rendering boundary**: Server Components are preferred for the new narrative sections (no interactivity required). Only convert to Client Component if a specific pattern forces it — note the rationale in the plan.
2. **Tab disabled implementation**: Confirm the disabled mechanism satisfies accessibility — `disabled` HTML attribute on `<button>` is preferred over a CSS-only approach for keyboard/screen-reader correctness.
3. **AI disclaimer placement**: Exact position within `AdaptationChat` (below input form vs. below output window) is a Frontend decision; must be visible in both themes.
4. **Dead-code scope confirmation**: Before Backend removes `invalid_config`, confirm it is genuinely unreachable (not referenced in any active code path or exported type). `ADAPTATION_API_URL` removal is straightforward.

## Acceptance Criteria Summary (full detail in CR-022)
- AC-1: "Why We Adapt LLMs" section present and covers 4 key points (before strategy cards)
- AC-2: "Limitations & What's Next" section present covering all 3 strategy trade-offs (after chat)
- AC-3: Limitations section includes bridging callout with navigable link to `/context/engineering`
- AC-4: Strategy tabs disabled during streaming; re-enabled on completion/error
- AC-5: Tab click mid-stream does not change strategy or restart generation
- AC-6: AI disclaimer visible in `AdaptationChat` UI (both themes)
- AC-7: No `invalid_config` branch or type member in generation code; `tsc --noEmit` passes
- AC-8: No unused `ADAPTATION_API_URL` in adaptation test files; `pnpm lint` passes
- AC-9: All existing `data-testid` contracts preserved
- AC-10: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` all pass

## Constraints
- No new packages without Tech Lead review and Standard Kit governance.
- TypeScript strict mode must remain satisfied.
- `data-testid` contracts on `adaptation-chat-tab-*`, `adaptation-chat-submit`, `adaptation-chat-input`, `adaptation-chat-output` must be preserved.
- New narrative sections must match the established glassmorphism aesthetic (consistent with existing page style).
- Dead-code items 5–6: no behavioral changes to any API contract.

## Risk Notes
- Frontend sub-agent touches both `page.tsx` and `AdaptationChat.tsx` — confirm no conflict between narrative additions and the existing `AdaptationChat` component boundary.
- The "Limitations" bridging callout should reference `/context/engineering` but not duplicate the `JourneyContinuityLinks` footer — complementary, not redundant.
