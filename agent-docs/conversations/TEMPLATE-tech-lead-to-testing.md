# Handoff Template: Tech Lead -> Testing Agent

## Subject
`[CR-ID] - [Testing Task Title]`

## Status
`issued`

## Exact Artifact Paths (Mandatory)
- Requirement: `agent-docs/requirements/[CR-ID]-[slug].md`
- Plan: `agent-docs/plans/[CR-ID]-plan.md`
- Upstream report (if sequential): `agent-docs/conversations/[upstream-role]-to-tech-lead.md`
- Report back to: `agent-docs/conversations/testing-to-tech-lead.md`

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

## Clarification Loop (Mandatory)
- Testing posts preflight concerns/questions in `agent-docs/conversations/testing-to-tech-lead.md`.
- Tech Lead responds in the same file.
- Repeat until concerns are resolved or status becomes `blocked`.

## Verification
[Use command evidence standard: Command, Scope, Execution Mode, Browser Scope (if E2E), Result.]

## Execution Checklist (Mandatory)
Before starting:
- [ ] Read this handoff completely.
- [ ] Read the plan at `agent-docs/plans/[CR-ID]-plan.md`.
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
Write completion report to `agent-docs/conversations/testing-to-tech-lead.md`.

Status vocabulary for testing reports:
- `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`
