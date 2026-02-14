# Handoff Template: Tech Lead -> Frontend Agent

## Subject
`[CR-ID] - [Frontend Task Title]`

## Status
`issued`

## Objective
[Outcome-focused frontend objective.]

## Rationale (Why)
[Why this UI/UX change matters to CR success.]

## Constraints
- UI/UX constraints:
  - [Theme/accessibility/responsiveness requirements]
  - [Performance/animation guardrails]
- Semantic/testability constraints:
  - [Single-select control semantics required? `radiogroup/radio` yes/no]
  - [Deterministic `data-testid` contract for repeated interactive items]
- Ownership constraints:
  - [Frontend-owned files]
  - [Test scope delegated? yes/no + reason]
  - [Shared component extraction in scope? yes/no]

## Design Intent (Mandatory for UI)
- Target aesthetic:
  - [Desired visual feel]
- Animation budget:
  - [What to animate and what not to animate]
- Explicit anti-patterns:
  - [What not to do]

## Assumptions To Validate (Mandatory)
- [Assumption 1]
- [Assumption 2]

## Out-of-Scope But Must Be Flagged (Mandatory)
- [Adjacent risk 1]
- [Adjacent risk 2]

## Scope
### Files to Modify
- `path/to/component.tsx`: [change summary]

## Definition of Done
- [ ] [UI behavior DoD 1]
- [ ] [UI behavior DoD 2]
- [ ] [Accessibility semantic contract satisfied]
- [ ] [Deterministic selector contract satisfied]
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] `pnpm lint` passes

## Clarification Loop (Mandatory)
- Frontend posts preflight concerns/questions in `agent-docs/conversations/frontend-to-tech-lead.md`.
- Tech Lead responds in the same file.
- Repeat until concerns are resolved or status becomes `blocked`.

## Verification
[Exact checks including light/dark mode, responsive breakpoints, accessibility requirements.]

## Scope Extension Control (Mandatory)
- If new feedback expands implementation beyond this handoff scope, mark it `scope extension requested`.
- Wait for explicit `scope extension approved` from Tech Lead (or User override) before implementing expanded work.

## Report Back
Write completion report to `agent-docs/conversations/frontend-to-tech-lead.md`.
