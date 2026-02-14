# Handoff Protocol

This protocol defines the mandatory communication and documentation flow between agents to ensure process integrity and role accountability. For handling discrepancies and errors in handoffs, see the [Feedback Protocol](./feedback-protocol.md).

## Universal Handoff Status Model (MANDATORY)
Every active handoff/report should declare one status:
- `issued` - Handoff created, execution not started
- `in_progress` - Agent is actively working
- `blocked` - Execution cannot continue due to blocker
- `complete` - Agent finished implementation and local verification
- `verified` - Tech Lead completed adversarial review and integration verification

## Bidirectional Clarification Loop (MANDATORY)
Handoffs are not single-message contracts by default. Iterative discussion is allowed and expected:
- `Tech Lead handoff -> [Sub-agent concerns <-> Tech Lead responses] (0..N rounds) -> implementation -> report -> [Tech Lead concerns <-> Sub-agent responses] (0..N rounds)`.
- `BA handoff -> [Tech Lead concerns <-> BA responses] (0..N rounds) -> planning/execution`.
- `Tech Lead verification handoff -> [BA concerns <-> Tech Lead responses] (0..N rounds) -> closure`.

Protocol requirements:
- Disagreement is permitted and encouraged when it improves correctness, safety, or scope clarity.
- If a concern changes scope/intent, escalate to BA (or user if still unresolved).
- If a concern changes technical feasibility only, Tech Lead resolves and records rationale.
- Keep all rounds in the relevant conversation file to preserve traceability.
- Optional structure: `agent-docs/conversations/TEMPLATE-ba-tech-lead-clarification.md`.

## BA → Tech Lead (Requirement Handoff)
- **File**: `agent-docs/conversations/ba-to-tech-lead.md`
- **Trigger**: CR is "Clarified" and approved by User.
- **Content**:
    - [Objective]
    - [Linked CR] (e.g., `agent-docs/requirements/CR-XXX.md`)
    - [Acceptance Criteria]
    - [Verification Mapping] (Explicit proof required for each AC)
    - [Constraints]
    - [Rationale (The 'Why')]
    - [Risk Analysis]
- **Protocol**: Tech Lead MUST acknowledge the handoff and confirm the task is well-defined before planning.

## Tech Lead → Sub-Agent (Task Delegation)
- **File**: `agent-docs/conversations/tech-lead-to-<role>.md`
- **Trigger**: Planning Gate is complete and User has given "Go".
- **Content**:
    - [Status] (`issued`)
    - [Objective]
    - [Constraints]
    - [Rationale / Rationale (The 'Why')]
    - [Definition of Done]
    - [Reference Files]
- **Protocol**: Sub-agent MUST review the prompt and the linked Plan (`agent-docs/plans/CR-XXX-plan.md`) before implementation.
  - **Template**: Use role-specific templates in `agent-docs/conversations/TEMPLATE-tech-lead-to-<role>.md`.

## Sub-Agent → Tech Lead (Execution Report)
- **File**: `agent-docs/conversations/<role>-to-tech-lead.md`
- **Trigger**: Implementation and local verification are complete.
- **Content**:
    - [Status] (`complete` or `blocked`)
    - [Changes Made]
    - [Verification Results] (Tests passed)
    - [Dependency Consumption] (Which upstream handoff/report this work depends on)
    - [Failure Classification] (CR-related, pre-existing, environmental, or non-blocking warning)
    - [Ready for Next Agent] (yes/no)
    - [New Artifacts]
    - [Follow-up Recommendations]
- **Protocol**: Tech Lead MUST review this report and verify integration before Verification Phase completion.

## Tech Lead → BA Agent (Verification Completion)
- **File**: `agent-docs/conversations/tech-lead-to-ba.md`
- **Trigger**: Integration and verification (all tests pass) complete.
- **Content**:
    - [Status] (`verified`)
    - [Technical Summary]
    - [Evidence of AC Fulfillment] (MUST include *executable* verification commands, e.g. "Run `pnpm test:e2e`", "Check file X")
    - [Technical Retrospective] (Key trade-offs, lessons learned, or new debt)

    - [Deployment Notes]
    - [Link to Updated Docs]
- **Protocol**: Tech Lead MUST NOT update `project-log.md`. This is reserved for the BA Agent in Acceptance Phase.

## Failure Classification Rules (MANDATORY)
When reporting failures or warnings, classify each item exactly once:
- **CR-related**: Caused by current CR scope and blocks closure until fixed.
- **Pre-existing**: Already existed before current CR scope and does not invalidate CR closure.
- **Environmental**: Execution environment issue (sandbox/port/network/infra) not caused by code change.
- **Non-blocking warning**: Warning that does not fail required quality gates.

If classified as **environmental**, include concrete evidence (command + error line) and avoid framing it as a product regression.

## BA Agent → User (Acceptance Notification)
- **Trigger**: Acceptance Phase (Acceptance) complete.
- **Protocol**:
    1. Update `agent-docs/requirements/CR-XXX.md` status to `Done` (or legacy-equivalent mapping where applicable).
    2. Update `agent-docs/project-log.md` with the closure entry.
    3. Notify User of completion with a summary of the value delivered.
