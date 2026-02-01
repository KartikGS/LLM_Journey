# Handoff Protocol

This protocol defines the mandatory communication and documentation flow between agents to ensure process integrity and role accountability. For handling discrepancies and errors in handoffs, see the [Feedback Protocol](./feedback-protocol.md).

## 1. BA → Senior Developer (Requirement Handoff)
- **File**: `agent-docs/conversations/ba-to-senior.md`
- **Trigger**: CR is "Clarified" and approved by User.
- **Content**:
    - [Objective]
    - [Linked CR] (e.g., `agent-docs/requirements/CR-XXX.md`)
    - [Acceptance Criteria]
    - [Constraints]
    - [Rationale / Rationale (The 'Why')]
    - [Risk Analysis]
- **Protocol**: Senior Dev MUST acknowledge the handoff and confirm the task is well-defined before planning.

## 2. Senior Developer → Sub-Agent (Task Delegation)
- **File**: `agent-docs/conversations/senior-to-<role>.md`
- **Trigger**: Planning Gate is complete and User has given "Go".
- **Content**:
    - [Objective]
    - [Constraints]
    - [Rationale / Rationale (The 'Why')]
    - [Definition of Done]
    - [Reference Files]
- **Protocol**: Sub-agent MUST review the prompt and the linked Plan (`agent-docs/plans/CR-XXX-plan.md`) before implementation.

## 3. Sub-Agent → Senior Developer (Execution Report)
- **File**: `agent-docs/conversations/<role>-to-senior.md`
- **Trigger**: Implementation and local verification are complete.
- **Content**:
    - [Changes Made]
    - [Verification Results] (Tests passed)
    - [New Artifacts]
    - [Follow-up Recommendations]
- **Protocol**: Senior Dev MUST review this report and verify integration before Phase 4 completion.

## 4. Senior Developer → BA Agent (Verification Completion)
- **File**: `agent-docs/conversations/senior-to-ba.md`
- **Trigger**: Integration and verification (all tests pass) complete.
- **Content**:
    - [Technical Summary]
    - [Evidence of AC Fulfillment]
    - [Technical Retrospective] (Key trade-offs, lessons learned, or new debt)
    - [Deployment Notes]
    - [Link to Updated Docs]
- **Protocol**: Senior Dev MUST NOT update `project-log.md`. This is reserved for the BA Agent in Phase 5.

## 5. BA Agent → User (Acceptance Notification)
- **Trigger**: Phase 5 (Acceptance) complete.
- **Protocol**:
    1. Update `agent-docs/requirements/CR-XXX.md` status to `Completed`.
    2. Update `agent-docs/project-log.md` with the closure entry.
    3. Notify User of completion with a summary of the value delivered.