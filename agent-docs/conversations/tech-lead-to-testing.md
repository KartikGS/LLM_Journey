# Handoff: Tech Lead -> Testing Agent

## Subject
`CR-010 - E2E Baseline Stabilization (Landing + Transformer Contract Alignment)`

## Status
`issued`

## Objective
Stabilize CR-010 E2E baseline by updating stale landing-page and transformer spec assertions to match the current app contract and durable behavioral signals.

## Rationale (Why)
Current E2E failures are dominated by assertion drift and transient UI timing assumptions, which creates non-actionable noise and weakens release confidence. This handoff restores trust in route-level E2E signal without changing feature behavior.

## Constraints
- Testing boundaries:
  - Modify testing-owned files only under `__tests__/e2e/` unless escalation is explicitly approved by Tech Lead.
  - Do not modify `app/`, `components/`, `hooks/`, or runtime config in this handoff.
- Verification boundaries:
  - Use `pnpm` commands only.
  - Run required commands exactly as listed in Verification.
  - Classify every failure as `CR-related`, `pre-existing`, `environmental`, or `non-blocking warning` with concrete evidence.
- Security/architecture:
  - Do not relax security controls to force test pass.
  - Treat OTEL upstream refusal (`127.0.0.1:4318`) under observability failure-boundary intent unless it causes user-visible flow failure.

## Assumptions To Validate (Mandatory)
- Landing CTA canonical destination is `/foundations/transformers`.
- Current home-page card structure can be asserted via stable locator strategy without `div.grid > a` dependency.
- Transformer generation can be validated through durable user-visible behavior instead of strict `Generating...` transient text visibility.

## Out-of-Scope But Must Be Flagged (Mandatory)
- Any new route/content regressions discovered outside landing/navigation/transformer specs.
- Any browser-specific environmental startup/runtime issues (port/server/Playwright webServer anomalies).
- Any non-CR regressions revealed by full-suite run after assertion fixes.

## Scope
### Files to Modify
- `__tests__/e2e/landing-page.spec.ts`: replace stale selector/route expectations with canonical/stable assertions.
- `__tests__/e2e/transformer.spec.ts`: replace brittle `Generating...` timing assertion with stable behavioral signal(s).
- `__tests__/e2e/navigation.spec.ts`: no expected edit; run as targeted regression check and update only if contract drift is proven.

## Verification Depth
- `baseline`

## Definition of Done
- [ ] Landing page route assertion validates `/foundations/transformers`.
- [ ] Landing page selectors no longer depend on stale `div.grid > a` structure.
- [ ] Transformer spec no longer depends on brittle `Generating...` visibility window.
- [ ] `pnpm test:e2e -- __tests__/e2e/landing-page.spec.ts` passes (browser matrix).
- [ ] `pnpm test:e2e -- __tests__/e2e/navigation.spec.ts` passes (browser matrix).
- [ ] `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts` passes (browser matrix).
- [ ] `pnpm test:e2e` full suite result recorded with explicit classification for any remaining failures.

## Clarification Loop (Mandatory)
- Post preflight assumptions/risks/questions in `agent-docs/conversations/testing-to-tech-lead.md` before implementation.
- Tech Lead responds in the same file.
- Repeat until concerns are resolved or status becomes `blocked`.

## Verification
1. Update scoped E2E assertion files.
2. Run `pnpm test:e2e -- __tests__/e2e/landing-page.spec.ts`.
3. Run `pnpm test:e2e -- __tests__/e2e/navigation.spec.ts`.
4. Run `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts`.
5. Run `pnpm test:e2e`.
6. Record pass/fail summary by browser and classify all failures once.

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

Reference plan: `agent-docs/plans/CR-010-plan.md`

*Handoff created: 2026-02-14*
*Tech Lead Agent*
