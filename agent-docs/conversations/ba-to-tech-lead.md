# BA to Tech Lead Handoff

## Subject
`CR-017 — Small Backlog Fixes and Runtime Alignment`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing BA handoff context: `CR-015`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-015-plan.md`
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-015-adaptation-strategy-chat-interface.md` status is `Done`
- Result: replacement allowed for new CR context.

## Objective
Complete the five small `Next Priorities` items from `project-log.md:48-52` in one controlled pass, with no contract regressions.

## Linked CR
- `agent-docs/requirements/CR-017-small-backlog-fixes-and-runtime-alignment.md`

## Audience & Outcome Check
- Human User intent: execute the five queued small tasks now.
- Product End User audience: LLM Journey learners on Stage 1/2 pages.
- Expected outcome: clearer learner copy, safer adaptation output behavior, reduced cleanup debt, and explicit Node runtime contract.

## Clarified Requirement Summary
- Add adaptation output-length cap contract (`ADAPTATION_OUTPUT_MAX_CHARS`) and enforce it on live output.
- Reduce duplicated server-side `toRecord()` helpers between adaptation and frontier API routes.
- Rename Transformers comparison heading from developer-facing to learner-facing language.
- Remove unreachable HF-array branch from `extractProviderOutput()` once dependency check confirms no valid path needs it.
- Align repository runtime contract to Node `>=20.x` with explicit activation guidance.

## Acceptance Criteria Mapping
- [ ] AC-1: `/api/adaptation/generate` live output is capped by configurable maximum length.
- [ ] AC-2: Output-cap environment contract is explicit and documented in `.env.example`.
- [ ] AC-3: Server-side `toRecord()` duplication is reduced via shared utility with no API behavior regression.
- [ ] AC-4: Transformers heading text no longer shows `Model Comparison Template`; learner-facing text is used.
- [ ] AC-5: Unreachable `Array.isArray(payload)` branch in `extractProviderOutput()` is removed after validation.
- [ ] AC-6: Node runtime contract is machine-readable as `>=20.x`, with explicit developer activation path.
- [ ] AC-7: No route, `data-testid`, or accessibility semantic contracts change.
- [ ] AC-8: `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` pass under compliant runtime.

## Verification Mapping
- Backend code + tests for AC-1/2/3/5.
- Frontend file-level copy proof for AC-4.
- Runtime artifact + command proof (`node -v`) for AC-6.
- Explicit contract stability statement in completion report for AC-7.
- Full quality-gate command evidence (sequence required) for AC-8.

## Constraints
- Preserve response schemas for `/api/adaptation/generate` and `/api/frontier/base-generate`.
- No visual redesign beyond heading copy.
- No dependency installation or package churn.
- Preserve observability failure-boundary behavior.
- If any route/test-id/accessibility contract changes become necessary, pause and trigger Testing handoff per workflow matrix.

## Open Decisions
- `none` (scope is explicit).

## Risk Analysis
- Runtime alignment may still require local environment action even after repo contract updates.
- Dead-code cleanup must be validated against supported provider payload contracts before deletion.
- Utility extraction should remain narrow (avoid broad refactor spillover).

## Rationale (Why)
These five items are low-risk but high-signal maintenance tasks that improve learner-facing clarity, consistency with existing API safety patterns, and engineering hygiene before larger roadmap items.

## Evidence Expectations for Tech Lead Handoff
- Command evidence in canonical sequence with exact commands and pass/fail summaries.
- File-level evidence for each AC with precise paths/lines.
- Runtime mismatch classification note if host runtime remains below policy even after repo updates.
- Explicit note that route/selector/semantic contracts remained stable.
