# Technical Plan - [CR-ID]: [Title]

## Technical Analysis
- [Analysis of the current state]
- [Key technical challenges]

## Discovery Findings
- [Results of pre-plan probes (grep/find)]
- [Resolved Wildcards (e.g., "UI Lib" -> "Radix UI v1.0")]
- [Validated Assumptions]

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

## Architectural Invariants Check
- [] Invariant 1 (Description)
- [] Invariant 2 (Description)

## Delegation & Execution Order
| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | [e.g. Frontend] | [Description] |
| 2 | [e.g. Testing] | [Description] |

## Operational Checklist
- [ ] **Environment**: No hardcoded values.
- [ ] **Observability**: Tracing/Logging/Metrics included.
- [ ] **Artifacts**: `.gitignore` updated if needed.
- [ ] **Rollback**: How to revert this change.

## Definition of Done (Technical)
- [ ] [Technical AC 1]
- [ ] [Integration Test passes]