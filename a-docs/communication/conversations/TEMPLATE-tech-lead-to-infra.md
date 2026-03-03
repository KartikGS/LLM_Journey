# Handoff Template: Tech Lead -> Infra Agent

## Subject
`[CR-ID] - [Infra Task Title]`

## Status
`issued`

## Objective
[Outcome-focused infrastructure/security objective.]

## Rationale (Why)
[Why this infra/security change matters.]

## Constraints
- Security constraints:
  - [CSP/HSTS/rate-limit or deployment constraints]
  - [No unsafe production relaxations]
- Ownership constraints:
  - [Infra-owned files]
  - [Cross-role dependencies]

## Assumptions To Validate (Mandatory)
- [Assumption 1]
- [Assumption 2]

## Out-of-Scope But Must Be Flagged (Mandatory)
- [Adjacent risk 1]
- [Adjacent risk 2]

## Scope
### Files to Modify
- `path/to/file`: [change summary]

## Definition of Done
- [ ] [Infra DoD 1]
- [ ] [Infra DoD 2]
- [ ] Required verification commands pass
- [ ] **Documentation Impact**: `required — [list files updated]` | `not-required — [rationale]`

## Clarification Loop (Mandatory)
- Infra posts preflight concerns/questions in `a-docs/communication/conversations/infra-to-tech-lead.md`.
- Tech Lead responds in the same file.
- Repeat until concerns are resolved or status becomes `blocked`.

## Verification
[Exact commands and negative-space checks.]

## Report Back
Write completion report to `a-docs/communication/conversations/infra-to-tech-lead.md` using:
- `a-docs/communication/conversations/TEMPLATE-infra-to-tech-lead.md`

Status vocabulary for infra reports:
- `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`
