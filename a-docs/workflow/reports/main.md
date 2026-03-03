# Investigation Report

## Template

**Date**: [YYYY-MM-DD]
**Status**: [Draft / For Review / Closed]
**Linked CR**: [CR-XXX (Optional)]

---

## Executive Summary
Briefly describe the issue and the impact on the system or user experience.

## Observed Symptoms
- [Symptom 1]
- [Symptom 2]
- List errors, terminal outputs, or UI screenshots/descriptions.

## Investigated Areas
- [Area 1]: [Findings]
- [Area 2]: [Findings]

## Root Cause Analysis (RCA)
Deep dive into *why* the issue is occurring. Identify environmental conflicts, dependency issues, or logic flaws.

## Suggested Strategies
- **Strategy A**: [Description]
- **Strategy B**: [Description]
*Note: The implementation details should live in a CR, not here.*

## Verification Plan
How will we know the problem is solved? (e.g., specific test commands or browser checks).

---

## Example: Complete BA Bundle (CR-007)

Use this as a reference implementation of a full BA lifecycle from discovery to closure.

### 1) Investigation / Discovery
- `a-docs/workflow/reports/INVESTIGATION-CR-007-pipeline-regression.md`
- Demonstrates:
  - Symptom capture from command outputs
  - Root-cause framing without implementation overreach
  - Strategy options and verification plan

### 2) Requirement Definition
- `a-docs/workflow/requirements/CR-007-pipeline-stabilization.md`
- Demonstrates:
  - Clear business context and bounded scope
  - Measurable acceptance criteria
  - Constraint mapping to existing standards/docs
  - Closure evidence annotations per AC

### 3) BA -> Tech Lead Handoff
- `a-docs/communication/conversations/ba-to-tech-lead.md`
- Demonstrates:
  - Concise context and goal
  - Directives aligned to CR and workflow
  - Required verification commands

### 4) Tech Lead Plan + Sub-Agent Loop (Reference Inputs to BA Closure)
- `a-docs/workflow/plans/CR-007-plan.md`
- `a-docs/communication/conversations/tech-lead-to-testing.md`
- `a-docs/communication/conversations/testing-to-tech-lead.md`
- `a-docs/communication/conversations/frontend-to-tech-lead.md`
- `a-docs/communication/conversations/tech-lead-to-ba.md`

### 5) BA Closure + Portfolio Hygiene
- `a-docs/workflow/requirements/CR-007-pipeline-stabilization.md` (status `Done`, AC evidence, closure notes)
- `$LLM_JOURNEY_LOG` (lifecycle-compliant `Recent Focus` update)

### Why this example is useful
- Shows strict role boundaries (BA does not implement feature code)
- Captures measurable evidence rather than narrative-only closure
- Demonstrates low-risk stabilization CR execution and handoff discipline
