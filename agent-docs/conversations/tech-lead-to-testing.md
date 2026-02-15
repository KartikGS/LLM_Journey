# Handoff: Tech Lead -> Testing Agent

## Subject
`CR-012 - Transformers Narrative + Frontier Contract Test Sync`

## Status
`issued`

## Objective
Update automated coverage for CR-012 contract changes (new transformers narrative sections, new frontier interaction contract, and backend frontier route behavior), then run full verification evidence.

## Rationale (Why)
CR-012 expanded selector and accessibility contracts on `/foundations/transformers` and added a new backend API route (`/api/frontier/base-generate`). Per workflow testing matrix, same-CR testing updates are required to keep UI/API contracts verifiable and prevent silent drift.

## Constraints
- Testing boundaries:
  - Modify testing-owned files under `__tests__/` only.
  - Do not modify `app/`, `lib/`, runtime config, or docs outside testing artifacts.
  - No dependency installation.
- Verification boundaries:
  - Use `pnpm` commands only.
  - Run final quality gates in sequence:
    1. `pnpm test`
    2. `pnpm lint`
    3. `pnpm exec tsc --noEmit`
    4. `pnpm build`
  - E2E is required in this CR due selector/semantic contract changes.
  - Classify each observed failure exactly once as:
    - `CR-related`
    - `pre-existing`
    - `environmental`
    - `non-blocking warning`

## Stable Signals to Assert (Mandatory)
- Transformers page section contracts:
  - `transformers-how`
  - `transformers-try`
  - `transformers-frontier`
  - `transformers-issues`
  - `transformers-next-stage`
  - `transformers-comparison`
- Frontier interaction contracts:
  - `frontier-form`
  - `frontier-input`
  - `frontier-submit`
  - `frontier-status`
  - `frontier-output`
- Legacy continuity contracts must remain stable:
  - `transformers-hero`
  - `transformers-continuity-links`
  - `transformers-link-home`
  - `transformers-link-adaptation`
- Backend contract signals:
  - `POST /api/frontier/base-generate` validation behavior for invalid prompt (HTTP 400 + error payload)
  - `mode: "live"` and `mode: "fallback"` response envelope handling

## Prohibited Brittle Assertions (Mandatory)
- Do not assert transient loading copy timing windows as the primary pass criterion.
- Do not assert full paragraph copy equality for narrative text blocks.
- Do not use layout-coupled selectors when `data-testid` and semantic signals exist.

## Known Environmental Caveats (Mandatory)
- Sandboxed E2E runs may fail at Playwright webServer startup (`Process from config.webServer exited early`).
- If that occurs, perform local-equivalent/unsandboxed E2E verification and classify sandbox startup failures as `environmental` with command evidence.

## Assumptions To Validate (Mandatory)
- New transformers section and frontier test-ids are present and unique.
- Backend route is reachable from tests and returns stable JSON contract in both fallback and validation paths.
- Existing tiny transformer E2E behavior remains functional after page restructure.

## Out-of-Scope But Must Be Flagged (Mandatory)
- Any request to change app code to satisfy tests in this handoff.
- Any route renames or contract rewrites discovered during testing.
- Any non-CR regressions uncovered by full-suite verification.

## Scope
### Files to Modify
- `__tests__/components/BaseLLMChat.test.tsx`
  - Align heading/assertions with renamed tiny chat framing.
- `__tests__/components/FrontierBaseChat.test.tsx` (new)
  - Add unit/integration-style UI contract tests for status/output transitions (`live`, `fallback`, validation error).
- `__tests__/api/frontier-base-generate.test.ts` (new)
  - Add route-level tests for invalid prompt and fallback/live envelope behavior.
- `__tests__/e2e/transformer.spec.ts`
  - Update/expand to verify CR-012 page contracts and frontier interaction surface.
- Optional: additional targeted test files under `__tests__/e2e/` if needed for stable CR-012 verification.

## Verification Depth
- `baseline` (with explicit frontier route/contract coverage)

## Definition of Done
- [ ] Updated tests cover new transformers section contracts and frontier selectors.
- [ ] API tests cover at least:
  - invalid prompt path (`400`, controlled error payload),
  - fallback envelope path,
  - live envelope path (mocked upstream path acceptable).
- [ ] E2E transformers coverage validates:
  - required section/test-id visibility,
  - frontier interaction submit cycle and status/output visibility,
  - continuity link to `/models/adaptation`.
- [ ] Existing tiny transformer interaction test signal remains validated.
- [ ] Explicit acceptance probe: verify whether a **same-prompt Tiny vs Frontier comparison artifact** is present as CR requires.
  - If missing, classify as `CR-related` and report as blocker (do not patch app code).
- [ ] `pnpm test` passes.
- [ ] `pnpm lint` passes.
- [ ] `pnpm exec tsc --noEmit` passes.
- [ ] `pnpm build` passes.
- [ ] `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts` result recorded by browser.
- [ ] `pnpm test:e2e` full-suite result recorded by browser.

## Clarification Loop (Mandatory)
- Post preflight assumptions/risks/questions in `agent-docs/conversations/testing-to-tech-lead.md` before implementation.
- Pause if any question could change contract interpretation or failure classification.

## Verification
Use command evidence format for each:
- Command
- Scope
- Execution Mode (`sandboxed` or `local-equivalent/unsandboxed`)
- Browser Scope (for E2E)
- Result

Minimum command set:
1. `pnpm test`
2. `pnpm lint`
3. `pnpm exec tsc --noEmit`
4. `pnpm build`
5. `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts`
6. `pnpm test:e2e`

## Reference Files
- `agent-docs/requirements/CR-012-transformers-tiny-to-frontier-bridge.md`
- `agent-docs/plans/CR-012-plan.md`
- `agent-docs/conversations/frontend-to-tech-lead.md`
- `app/foundations/transformers/page.tsx`
- `app/foundations/transformers/components/FrontierBaseChat.tsx`
- `app/api/frontier/base-generate/route.ts`

## Report Back
Write completion report to `agent-docs/conversations/testing-to-tech-lead.md` including:
- [Status]
- [Changes Made]
- [Verification Results] (exact commands + browser matrix)
- [Dependency Consumption]
- [Failure Classification]
- [Ready for Next Agent]
- [New Artifacts]
- [Follow-up Recommendations]

*Handoff created: 2026-02-15*
*Tech Lead Agent*
