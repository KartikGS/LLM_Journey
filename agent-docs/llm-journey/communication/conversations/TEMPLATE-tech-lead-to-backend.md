# Handoff Template: Tech Lead -> Backend Agent

## Subject
`[CR-ID] - [Backend Task Title]`

## Status
`issued`

## Exact Artifact Paths (Mandatory)
- Requirement: `agent-docs/requirements/[CR-ID]-[slug].md`
- Plan: `agent-docs/plans/[CR-ID]-plan.md`
- Upstream report (if sequential): `agent-docs/llm-journey/communication/conversations/[upstream-role]-to-tech-lead.md`
- Report back to: `agent-docs/llm-journey/communication/conversations/backend-to-tech-lead.md`

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
- **Live-path availability**: [yes — API key present, live provider reachable | no — API key absent | unknown — verify before starting]. If `no` or `unknown`: classify any assumption that requires live provider behavior as `unverifiable without live credentials` and flag it explicitly in your preflight note. Do not block implementation on an unverifiable external assumption — document it and proceed with the verifiable scope.
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
- [ ] **Documentation Impact**: `required — [list files updated]` | `not-required — [rationale]`

## Clarification Loop (Mandatory)
- Before implementation, Backend posts preflight concerns/questions in `agent-docs/llm-journey/communication/conversations/backend-to-tech-lead.md`.
- Tech Lead responds in the same file.
- Repeat until concerns are resolved or status becomes `blocked`.

## Verification
[Exact commands and evidence expectations.]
- Default sub-agent command order: `pnpm lint` -> `pnpm exec tsc --noEmit` unless this handoff explicitly overrides.

## Execution Checklist (Mandatory)
Before starting:
- [ ] Read this handoff completely.
- [ ] Read the plan at `agent-docs/plans/[CR-ID]-plan.md`.
- [ ] If sequential: read the upstream report at the path listed in Exact Artifact Paths.
- [ ] Write preflight note to `backend-to-tech-lead.md` (assumptions + open questions). Wait for TL response if any question is non-trivial.

Before reporting:
- [ ] All Definition of Done items checked.
- [ ] `pnpm lint` passes.
- [ ] `pnpm exec tsc --noEmit` passes.
- [ ] Completion report written to `backend-to-tech-lead.md` using the template.

## Report Back
Write completion report to `agent-docs/llm-journey/communication/conversations/backend-to-tech-lead.md` using:
- `agent-docs/llm-journey/communication/conversations/TEMPLATE-backend-to-tech-lead.md`

Status vocabulary for backend reports:
- `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`
