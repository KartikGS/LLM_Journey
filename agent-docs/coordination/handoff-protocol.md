# Handoff Protocol

Effective communication between agents is critical to project success. Use these standardized templates for all handoffs.

## 1. BA → Senior Developer (Problem to Plan)
**File**: `agent-docs/conversations/ba-to-senior.md`

- **CR ID**: Link to `agent-docs/requirements/CR-XXX.md`
- **Clarified Goal**: What are we actually trying to achieve?
- **Constraints**: Security (CSP), Performance, Architectural Invariants.
- **Evidence**: Links to logs, terminal output, or code snippets that confirm the problem.
- **Reasoning Checklist**: Confirm that Design Invariants were considered (see [Reasoning Principles](./reasoning-principles.md)).

## 2. Senior Developer → Sub-Agent (Plan to Task)
**File**: `agent-docs/conversations/senior-to-<role>.md`

- **Objective**: Focused, single-purpose goal.
- **Context Blocks**: Specific lines of code or files to modify.
- **Constraints**: No-go zones (e.g., "Do not modify layout.tsx").
- **Definition of Done (DoD)**: Measurable criteria (e.g., "Test passes in WebKit").
- **Required Artifacts**: Which docs need updating (e.g., ADR, technical-context).

## 3. Sub-Agent/Senior → Completion (Verification)
- **What was changed?**: List of files.
- **Verification Results**: Terminal output of passing tests.
- **Residual Risks**: Any known issues or "to-do" items left behind.
- **Updated Docs**: Links to changed documentation.

## 4. Operational Guardrails
- **No Invisible Context**: If a piece of information is critical, it MUST be in the handoff document, not just in the chat history.
- **Explicit Ownership**: State clearly who owns the next step.
- **Verification Loop**: The receiver must start by confirming they understand the handoff.