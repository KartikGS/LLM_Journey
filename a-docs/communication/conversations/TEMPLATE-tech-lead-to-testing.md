# Handoff Template: Tech Lead -> Testing Agent

## Subject
`[CR-ID] - [Testing Task Title]`

## Status
`issued`

## Exact Artifact Paths (Mandatory)
- Requirement: `a-docs/workflow/requirements/[CR-ID]-[slug].md`
- Plan: `a-docs/workflow/plans/[CR-ID]-plan.md`
- Upstream report (if sequential): `a-docs/communication/conversations/[upstream-role]-to-tech-lead.md`
- Report back to: `a-docs/communication/conversations/testing-to-tech-lead.md`

## Objective
[Outcome-focused testing objective.]

## Rationale (Why)
[Why this test work is required for CR correctness.]

## Constraints
- Testing boundaries:
  - [Allowed files under `__tests__/` / testing docs]
  - [No app code changes unless explicitly delegated]
- Verification boundaries:
  - [Required command sequence (`pnpm test` -> `pnpm lint` -> `pnpm exec tsc --noEmit` -> `pnpm build` when full verification is in scope)]
  - [E2E required? yes/no + trigger rationale from workflow testing matrix]
  - [Failure classification requirement]

## Stable Signals to Assert (Mandatory)
- [Durable contract 1: role/testid/href/state signal]
- [Durable contract 2]

## Prohibited Brittle Assertions (Mandatory)
- [Transient loading-copy dependency not allowed]
- [Layout-coupled selector not allowed]

## Known Environmental Caveats (Mandatory)
- **Live-path availability**: [yes — API key present, live provider exercisable | no — API key absent, live-provider path will be bypassed | unknown — check `FRONTIER_API_KEY` in environment before starting]
- [Sandbox/startup/runtime caveat]
- [How to classify if reproduced]

## Assumptions To Validate (Mandatory)
- [Assumption 1]
- [Assumption 2]

## Out-of-Scope But Must Be Flagged (Mandatory)
- [Adjacent risk 1]
- [Adjacent risk 2]

## Scope
### Files to Modify
- `path/to/test.spec.ts`: [change summary]

## Assessment Targets (Mandatory)

Use this table for any coverage or timeout decision that has a conditional dimension. Each row must have a `Validation Condition` so that assessments are not interpreted as environment-independent defaults.

| Target | Assessment | Validation Condition | Default if condition unmet |
|---|---|---|---|
| [e.g., E2E submit timeout] | [e.g., 30 000 ms] | [e.g., live-path available: API key present] | [e.g., 15 000 ms (fallback path only)] |
| [e.g., live-provider E2E coverage] | [e.g., required] | [e.g., `FRONTIER_API_KEY` set in environment] | [e.g., skip live-path assertions; cover fallback path only] |

## Expected Test Count Delta (Mandatory)
- Tests added by this handoff: `+[N]` (list affected spec files)
- Tests added by parallel agents in same CR (if any): `+[N]` at `[spec file]` — do not double-count
- Net expected change to suite total: `[+N / ±0 / other]`

## Verification Depth
- `baseline` or `boundary-focused`
- If `boundary-focused`, list required boundary classes:
  - [threshold edge]
  - [window expiry]
  - [state isolation]
  - [failure-path behavior]

## Definition of Done
- [ ] [Test DoD 1]
- [ ] [Test DoD 2]
- [ ] `pnpm test` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] `pnpm build` passes (when delegated in scope)
- [ ] **Documentation Impact**: `required — [list files updated]` | `not-required — [rationale]`

## Clarification Loop (Mandatory)
- Testing posts preflight concerns/questions in `a-docs/communication/conversations/testing-to-tech-lead.md`.
- Tech Lead responds in the same file.
- Repeat until concerns are resolved or status becomes `blocked`.

## Verification
[Use command evidence standard: Command, Scope, Execution Mode, Browser Scope (if E2E), Result.]

## Execution Checklist (Mandatory)
Before starting:
- [ ] Read this handoff completely.
- [ ] Read the plan at `a-docs/workflow/plans/[CR-ID]-plan.md`.
- [ ] If sequential: read the upstream report at the path listed in Exact Artifact Paths before writing tests.
- [ ] Write preflight note to `testing-to-tech-lead.md` (assumptions + open questions). Wait for TL response if any question affects test scope or contracts.

Before reporting:
- [ ] All Definition of Done items checked.
- [ ] `pnpm test` passes (full suite or targeted scope per handoff).
- [ ] `pnpm lint` passes.
- [ ] `pnpm exec tsc --noEmit` passes.
- [ ] `pnpm build` passes (when delegated in scope).
- [ ] Completion report written to `testing-to-tech-lead.md` using the template.

## Report Back
Write completion report to `a-docs/communication/conversations/testing-to-tech-lead.md`.

Status vocabulary for testing reports:
- `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`
