# Handoff Template: Tech Lead -> Backend Agent

## Subject
`[CR-ID] - [Backend Task Title]`

## Status
`issued`

## Objective
[Outcome-focused backend objective.]

## Rationale (Why)
[Why this backend change matters to CR success.]

## Constraints
- Technical constraints:
  - [API/security/performance requirements]
  - [No dependency additions unless approved]
- Ownership constraints:
  - [Files in backend scope]
  - [Any explicitly delegated non-backend file(s), if needed, e.g. `.env.example`]
  - [Test scope delegated? yes/no + reason]

## Assumptions To Validate (Mandatory)
- [Assumption 1]
- [Assumption 2]

## Out-of-Scope But Must Be Flagged (Mandatory)
- [Adjacent risk 1]
- [Adjacent risk 2]

## Scope
### Files to Modify
- `path/to/file.ts`: [change summary]

## Definition of Done
- [ ] [Behavioral backend DoD 1]
- [ ] [Behavioral backend DoD 2]
- [ ] Route contract created/updated under `/agent-docs/api/` if API contract changed.
- [ ] `pnpm lint` passes
- [ ] `pnpm exec tsc --noEmit` passes

## Clarification Loop (Mandatory)
- Before implementation, Backend posts preflight concerns/questions in `agent-docs/conversations/backend-to-tech-lead.md`.
- Tech Lead responds in the same file.
- Repeat until concerns are resolved or status becomes `blocked`.

## Verification
[Exact commands and evidence expectations.]
- Default sub-agent command order: `pnpm lint` -> `pnpm exec tsc --noEmit` unless this handoff explicitly overrides.

## Report Back
Write completion report to `agent-docs/conversations/backend-to-tech-lead.md` using:
- `agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md`

Status vocabulary for backend reports:
- `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`
