# Feedback Protocol

This protocol defines how agents should handle discrepancies, logical flaws, and missing dependencies discovered during execution. It complements the [Handoff Protocol](./handoff-protocol.md) by providing a return path for information.

## 1. Discovery of Discrepancies

If an agent (BA, Senior, or Sub-Agent) identifies one of the following, they MUST NOT silently fix it if it belongs to another role's authority:

- **Missing Contract**: A component lacks an expected property (e.g., a missing `id` required for testing).
- **False Assumption**: A requirement or plan is based on a technical premise that is found to be incorrect (e.g., claiming a browser doesn't support a feature when it does).
- **Logical Flaw**: A proposed solution contradicts project principles or will cause regression.

## 2. Reporting Path

### Sub-Agent → Senior Developer
- **When**: A sub-agent finds a flaw in the plan or a missing dependency in the codebase.
- **Action**: 
    1. Stop implementation of the affected part.
    2. Document the issue in `agent-docs/conversations/<role>-to-senior.md` under a `## BLOCKER / FEEDBACK` section.
    3. Clearly state:
        - What was expected (per plan).
        - What was found (reality).
        - Impact on the task.
    4. Notify the USER that a coordination check is required.

### Senior Developer → BA Agent
- **When**: The plan reveals a requirement is unfeasible or based on wrong business logic.
- **Action**:
    1. Update `agent-docs/conversations/senior-to-ba.md` with a `## REQUIREMENT FEEDBACK` section.
    2. Propose a technical alternative or request requirement clarification.

## 3. Resolution Protocol

1. **Acknowledge**: The receiving agent must acknowledge the feedback.
2. **Re-delegate or Refine**:
    - If it's a missing dependency: The Senior Developer may delegate a quick fix to the responsible sub-agent (e.g., Frontend) OR ask the current agent to fix it ONLY IF they update the documentation to reflect the fix.
    - If it's a false assumption: The plan must be revised and re-approved by the USER.

## 4. Helpful Refusals

"Helpfulness does NOT override Authority." (AGENTS.md)

It is MORE helpful to point out a mistake that improves the system's long-term health than to silently work around it to meet a short-term "Definition of Done."
