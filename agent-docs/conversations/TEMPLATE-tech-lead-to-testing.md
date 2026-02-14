# Handoff Template: Tech Lead -> Testing Agent

## Subject
`[CR-ID] - [Testing Task Title]`

## Status
`issued`

## Objective
[Outcome-focused testing objective.]

## Rationale (Why)
[Why this test work is required for CR correctness.]

## Constraints
- Testing boundaries:
  - [Allowed files under `__tests__/` / testing docs]
  - [No app code changes unless explicitly delegated]
- Verification boundaries:
  - [Required command sequence]
  - [Failure classification requirement]

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

## Clarification Loop (Mandatory)
- Testing posts preflight concerns/questions in `agent-docs/conversations/testing-to-tech-lead.md`.
- Tech Lead responds in the same file.
- Repeat until concerns are resolved or status becomes `blocked`.

## Verification
[Exact commands and expected evidence lines.]

## Report Back
Write completion report to `agent-docs/conversations/testing-to-tech-lead.md`.

