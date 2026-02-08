# Handoff Protocol

This protocol defines the mandatory communication and documentation flow between agents to ensure process integrity and role accountability. For handling discrepancies and errors in handoffs, see the [Feedback Protocol](./feedback-protocol.md).

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
    - [Objective]
    - [Constraints]
    - [Rationale / Rationale (The 'Why')]
    - [Definition of Done]
    - [Reference Files]
- **Protocol**: Sub-agent MUST review the prompt and the linked Plan (`agent-docs/plans/CR-XXX-plan.md`) before implementation.

## Sub-Agent → Tech Lead (Execution Report)
- **File**: `agent-docs/conversations/<role>-to-tech-lead.md`
- **Trigger**: Implementation and local verification are complete.
- **Content**:
    - [Changes Made]
    - [Verification Results] (Tests passed)
    - [New Artifacts]
    - [Follow-up Recommendations]
- **Protocol**: Tech Lead MUST review this report and verify integration before Verification Phase completion.

## Tech Lead → BA Agent (Verification Completion)
- **File**: `agent-docs/conversations/tech-lead-to-ba.md`
- **Trigger**: Integration and verification (all tests pass) complete.
- **Content**:
    - [Technical Summary]
    - [Evidence of AC Fulfillment] (MUST include *executable* verification commands, e.g. "Run `pnpm test:e2e`", "Check file X")
    - [Technical Retrospective] (Key trade-offs, lessons learned, or new debt)

    - [Deployment Notes]
    - [Link to Updated Docs]
- **Protocol**: Tech Lead MUST NOT update `project-log.md`. This is reserved for the BA Agent in Acceptance Phase.

## BA Agent → User (Acceptance Notification)
- **Trigger**: Acceptance Phase (Acceptance) complete.
- **Protocol**:
    1. Update `agent-docs/requirements/CR-XXX.md` status to `Completed`.
    2. Update `agent-docs/project-log.md` with the closure entry.
    3. Notify User of completion with a summary of the value delivered.