# Workflow (The Agent Loop)

**Core Guidance**: Before starting any task, review the [Reasoning Principles](./coordination/reasoning-principles.md).

## Multi-Agent Workflow

### Phase 1: Requirement Analysis (BA Agent)
1. User provides rough CR.
2. BA clarifies through Q&A.
3. **Technical Sanity Check**: BA consults `Architecture.md`, `technical-context.md`, and `ADRs` to identify potential conflicts or opportunities for "Product Shaping" (e.g., suggesting a fallback UI for a known browser constraint).
4. BA creates structured requirement document.
5. BA assesses business complexity.
6. **Output:** `docs/requirements/CR-XXX.md` + prompt for Senior Dev.
7. BA reports back to user for review and approval.
8. User approves or requests changes.
9. **Pivot Loop**: If during Phase 2 the Senior Developer identifies a fundamental assumption error (e.g., "Safari actually supports X"), the BA must pivot the CR, re-clarify with the User, and issue a revised handoff.

### Phase 2: Technical Planning & Delegation (Senior Developer Agent)
1. Senior reads CR from BA. Read [../conversations/ba-to-senior.md](../conversations/ba-to-senior.md) for more details.
2. Senior assesses technical complexity and identifies required sub-agents.
3. **Execution Audit**: Senior audits existing `agent-docs/conversations/` to ensure stale context is cleared or properly updated before new handoffs are issued.
4. **MANDATORY OUTPUT:** Senior creates `agent-docs/plans/CR-XXX-plan.md` using the Standard Plan Template (defined in `senior.md`).
5. **MANDATORY CHECK:** Senior submits the COMPLETE plan (approach + delegation) to USER for "Go/No-Go" decision.
6. **Execution Start:** Senior formalizes task specifications + prompts for sub-agents in `agent-docs/conversations/senior-to-<role>.md`. 
   - **Requirement**: Senior MUST include the "Rationale/Why" in the handoff to ensure sub-agents understand the intent, not just the action.

### 🛑 The Delegation Invariant (Anti-Loop Measures)
- **The Senior Developer writes the Handoff**: This is the final action of the Senior Agent for a specific sub-task.
- **The "Wait" State**: Once `agent-docs/conversations/senior-to-<role>.md` is created, the Senior Agent MUST stop and report back to the User.
- **No Self-Implementation**: Do NOT attempt to perform the sub-agent's task in the same turn or session while claiming to be the Senior Agent. 
- **The "Shift" Refusal**: If you feel the urge to "just do it" to be efficient, you are violating the Senior role. Stop. Wait for the User to either:
  1. Approve the handoff for a sub-agent execution.
  2. Explicitly ask you to switch roles.


### Phase 3: Implementation (Sub-Agents)
1. Sub-agent receives task specification from Senior Developer Agent in [/agent-docs/conversations/senior-to-<role>.md](/agent-docs/conversations/senior-to-<role>.md)
   - **Handoff Template**: Must include `[Objective]`, `[Constraints]`, and `[Definition of Done]`.
2. **Initial Verification**: Before starting code changes, verify environmental assumptions (e.g., check if a browser truly lacks a feature as claimed) and contract availability (e.g., confirm required selectors/IDs exist).
3. **Halt on Blocker/Assumption Invalidation**: If a blocker (missing contract, environmental discrepancy, or logical flaw) is identified:
   - **STOP** implementation of the affected part immediately.
   - **DO NOT** attempt to "fix" or "work around" an architectural or environmental assumption without consulting the Senior Agent.
   - Report the issue immediately via the [Feedback Protocol](./coordination/feedback-protocol.md).
   - Clearing the blocker OR re-validating the core requirement is a higher priority than completing the original task.
4. Sub-agent executes within role boundaries.
5. Sub-agent completes and verifies work.
6. **Output:** Implementation + tests + updated docs + report for senior dev.

### Phase 4: Verification (Senior Developer Agent)
1. Senior reviews completed work reports
2. Senior ensures integration works
3. Senior updates architectural docs if needed
4. **Output:** Verified feature + completion report in `agent-docs/conversations/senior-to-ba.md` following [Handoff Protocol](./coordination/handoff-protocol.md).

### Phase 5: Acceptance (BA Agent)
1. BA reviews the Senior's report and verifies AC are met.
2. BA updates requirement status in `agent-docs/requirements/CR-XXX.md`.
3. BA updates `agent-docs/project-log.md` with the final entry.
4. BA notifies the human of completion.
5. **Output:** Closed CR, updated project log.