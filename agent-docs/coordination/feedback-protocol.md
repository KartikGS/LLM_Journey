# Feedback Protocol

This protocol defines how agents should handle discrepancies, logical flaws, and missing dependencies discovered during execution. It complements the [Handoff Protocol](./handoff-protocol.md) by providing a return path for information.

## Discovery of Discrepancies

If an agent (BA, Tech Lead, or Sub-Agent) identifies one of the following, they MUST NOT silently fix it if it belongs to another role's authority:

- **Missing Contract**: A component lacks an expected property (e.g., a missing `id` required for testing).
- **False Assumption**: A requirement or plan is based on a technical premise that is found to be incorrect (e.g., claiming a browser doesn't support a feature when it does).
- **Logical Flaw**: A proposed solution contradicts project principles or will cause regression.

## Reporting Path

### Sub-Agent → Tech Lead
- **When**: A sub-agent finds a flaw in the plan or a missing dependency in the codebase.
- **Action**: 
    1. Stop implementation of the affected part.
    2. Document the issue in `agent-docs/conversations/<role>-to-tech-lead.md` under a `## BLOCKER / FEEDBACK` section.
    3. Clearly state:
        - What was expected (per plan).
        - What was found (reality).
        - Impact on the task.
    4. Notify the USER (directly in-session or via Tech Lead relay in the active conversation artifact) that a coordination check is required.
    5. For environment/E2E blockers, include a minimal reproduction matrix (exact command, execution mode, browser scope, result) and at least one artifact reference.

### Tech Lead → BA Agent
- **When**: The plan reveals a requirement is unfeasible or based on wrong business logic.
- **Action**:
    1. Update `agent-docs/conversations/tech-lead-to-ba.md` with a `## REQUIREMENT FEEDBACK` section.
    2. Propose a technical alternative or request requirement clarification.

## Resolution Protocol

1. **Acknowledge**: The receiving agent must acknowledge the feedback.
2. **Re-delegate or Refine**:
    - If it's a missing dependency: The Tech Lead may delegate a quick fix to the responsible sub-agent (e.g., Frontend) OR ask the current agent to fix it ONLY IF they update the documentation to reflect the fix.
    - If it's a false assumption: The plan must be revised and re-approved by the USER.

## Helpful Refusals

"Helpfulness does NOT override Authority." (AGENTS.md)

It is MORE helpful to point out a mistake that improves the system's long-term health than to silently work around it to meet a short-term "Definition of Done."

## Priority of Feedback

**Clearing a blocker or addressing a discrepancy is always higher priority than completing the original implementation.**

If you discover a flaw:
1.  **Halt implementation**: Do not "force" a solution or use brittle workarounds.
2.  **Report immediately**: The focus shifts entirely to resolving the feedback.
3.  **Resume only after resolution**: No further implementation steps should be taken until the feedback is acknowledged and the plan/code is updated.

## Environmental Blocker Validation
Before classifying an issue as an environmental blocker, agents must:
1. Re-run with the exact handoff command.
2. Re-run with explicit target scope (for example, spec path).
3. If constrained execution can affect startup/runtime, run one local-equivalent verification.
4. Attach at least one concrete artifact (`error-context.md`, screenshot, or log excerpt).
