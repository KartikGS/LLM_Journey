# Handoff Template: Tech Lead -> Frontend Agent

## Subject
`[CR-ID] - [Frontend Task Title]`

## Status
`issued`

## Execution Mode (Mandatory)
`feature-ui` | `architecture-only`
If `architecture-only`, include freeze constraints (`no visual redesign`, `no copy rewrite`, `no route rename`).

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

## Contracts Inventory (Mandatory)
- Route contracts:
  - [`/route-a`, `/route-b`]
- Selector/accessibility contracts:
  - [`data-testid=...`, `role=...`, `aria-...`]
- Continuity/navigation contracts:
  - [`href=...` that must remain stable]
- Critical interactive contracts:
  - [chat/selector/nav behaviors that must remain functional]

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
- [ ] [If architecture-only] visual/copy/IA contracts unchanged unless explicitly approved
- [ ] `pnpm lint` passes
- [ ] `pnpm exec tsc --noEmit` passes

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
Write completion report to `agent-docs/conversations/frontend-to-tech-lead.md` using `agent-docs/conversations/TEMPLATE-frontend-to-tech-lead.md`.

Status vocabulary for frontend reports:
- `completed` | `blocked` | `partial`
