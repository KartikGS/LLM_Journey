# Example BA Bundle: Complete CR Flow (CR-007)

Use this as a reference implementation of a full BA lifecycle from discovery to closure.

## 1) Investigation / Discovery
- `agent-docs/reports/INVESTIGATION-CR-007-pipeline-regression.md`
- Demonstrates:
  - Symptom capture from command outputs
  - Root-cause framing without implementation overreach
  - Strategy options and verification plan

## 2) Requirement Definition
- `agent-docs/requirements/CR-007-pipeline-stabilization.md`
- Demonstrates:
  - Clear business context and bounded scope
  - Measurable acceptance criteria
  - Constraint mapping to existing standards/docs
  - Closure evidence annotations per AC

## 3) BA -> Tech Lead Handoff
- `agent-docs/conversations/ba-to-tech-lead.md`
- Demonstrates:
  - Concise context and goal
  - Directives aligned to CR and workflow
  - Required verification commands

## 4) Tech Lead Plan + Sub-Agent Loop (Reference Inputs to BA Closure)
- `agent-docs/plans/CR-007-plan.md`
- `agent-docs/conversations/tech-lead-to-testing.md`
- `agent-docs/conversations/testing-to-tech-lead.md`
- `agent-docs/conversations/frontend-to-tech-lead.md`
- `agent-docs/conversations/tech-lead-to-ba.md`

## 5) BA Closure + Portfolio Hygiene
- `agent-docs/requirements/CR-007-pipeline-stabilization.md` (status `Done`, AC evidence, closure notes)
- `agent-docs/project-log.md` (lifecycle-compliant `Recent Focus` update)

## Why this example is useful
- Shows strict role boundaries (BA does not implement feature code)
- Captures measurable evidence rather than narrative-only closure
- Demonstrates low-risk stabilization CR execution and handoff discipline
