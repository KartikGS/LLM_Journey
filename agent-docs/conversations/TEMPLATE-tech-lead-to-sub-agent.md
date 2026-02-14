# Template Router: Tech Lead -> Sub-Agent

Use role-specific templates instead of one generic handoff:

- Frontend: `agent-docs/conversations/TEMPLATE-tech-lead-to-frontend.md`
- Backend: `agent-docs/conversations/TEMPLATE-tech-lead-to-backend.md`
- Testing: `agent-docs/conversations/TEMPLATE-tech-lead-to-testing.md`
- Infra: `agent-docs/conversations/TEMPLATE-tech-lead-to-infra.md`

## Clarification Loop Requirement (All Roles)
Every handoff created from role-specific templates must support iterative clarification:
- `Tech Lead handoff -> [Sub-agent concerns <-> Tech Lead responses] (0..N rounds) -> Sub-agent implementation -> report -> [Tech Lead concerns <-> Sub-agent responses] (0..N rounds)`.
- Disagreement is allowed and expected when assumptions or quality risks are found.
- If any unresolved concern affects correctness/scope, execution remains `blocked` until resolved.

## Backward Compatibility
If a role-specific template is unavailable, this file may be used as fallback for one-off handoffs, but Tech Lead must include:
- explicit ownership confirmation
- assumption-risk checks
- out-of-scope risk reporting requirements
- clarification loop instructions
