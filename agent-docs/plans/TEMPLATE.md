# Technical Plan - [CR-ID]: [Title]

## Technical Analysis
- [Analysis of the current state]
- [Key technical challenges]

## Discovery Findings
- [Results of pre-plan probes (grep/find)]
- [Resolved Wildcards (e.g., "UI Lib" -> "Radix UI v1.0")]
- [Validated Assumptions]
- [Route/selector/semantic contract inventory when UI or route scope is involved]

## Configuration Specifications
- [MANDATORY for task involving config files]
- [Define critical rules/schema here. Do not defer critical logic to sub-agent]
- [e.g. "eslint rules: warn on console.log", "commitlint scopes: [api, ui] only"]


## Critical Assumptions
- [List of things that MUST be true for this plan to work]
- [e.g. "Webkit does not support wasm-unsafe-eval"]

## Proposed Changes
- [File-by-file or component-level changes]
- [Architectural impacts]

## Contract Delta Assessment (Mandatory)
- Route contracts changed? [yes/no + details]
- `data-testid` contracts changed? [yes/no + details]
- Accessibility/semantic contracts changed? [yes/no + details]
- Testing handoff required per workflow matrix? [yes/no + rationale]

## Architecture-Only Freeze Checklist (Conditional)
If CR intent is architecture-only/refactor-only:
- [ ] No visual redesign
- [ ] No copy/content rewrite
- [ ] No route rename or information-architecture change
- [ ] Contract preservation list recorded (`routes`, `data-testid`, `role/aria`, key `href`)
- [ ] Regression checks specified (desktop/mobile, light/dark, critical interactive surfaces)

## Architectural Invariants Check
- [] Invariant 1 (Description)
- [] Invariant 2 (Description)

## Delegation & Execution Order
| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | [e.g. Frontend] | [Description] |
| 2 | [e.g. Testing] | [Description] |

## Delegation Graph (MANDATORY)
- **Execution Mode**: [Parallel | Sequential]
- **Dependency Map**:
  - [Step B depends on Step A output? yes/no]
  - [If yes, specify required artifact/evidence]
- **Parallel Groups**:
  - [Group 1: Step X + Step Y] (only if independent)
  - [Group 2: ...]
- **Handoff Batch Plan**:
  - [Parallel: list all handoffs issued together]
  - [Sequential: list first handoff only, then expected follow-up handoffs]
- **Final Verification Owner**:
  - [Which agent runs final full quality gates and reports pass/fail]

## Operational Checklist
- [ ] **Environment**: No hardcoded values.
- [ ] **Observability**: Tracing/Logging/Metrics included.
- [ ] **Artifacts**: `.gitignore` updated if needed.
- [ ] **Rollback**: How to revert this change.

## Definition of Done (Technical)
- [ ] [Technical AC 1]
- [ ] [Integration Test passes]
