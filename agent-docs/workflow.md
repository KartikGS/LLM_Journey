# Workflow (The Agent Loop)

**Core Guidance**: Before starting any task, review `/agent-docs/coordination/reasoning-principles.md`.

## Multi-Agent Workflow

### Requirement Analysis Phase (BA Agent)
1. User provides rough CR.
2. BA clarifies through Q&A.
3. **Technical Sanity Check**: BA consults `/agent-docs/architecture.md`, `/agent-docs/technical-context.md`, and ADRs in `/agent-docs/decisions/` to identify potential conflicts or opportunities for "Product Shaping" (e.g., suggesting a fallback UI for a known browser constraint).
4. BA creates structured requirement document.
5. BA assesses business complexity.
6. **Output:** `/agent-docs/requirements/CR-XXX.md` + prompt for Tech Lead.
7. BA reports back to user for review and approval.
8. User approves or requests changes.
9. **Pivot Loop**: If during Phase 2 the Tech Lead identifies a fundamental assumption error (e.g., "Safari actually supports X"), the BA must pivot the CR, re-clarify with the User, and issue a revised handoff.

### Technical Planning & Delegation Phase (Tech Lead Agent)
1. Tech Lead reads CR from BA. Read `/agent-docs/conversations/ba-to-tech-lead.md` for more details.
2. Tech Lead assesses technical complexity and identifies required sub-agents.
3. **Execution Audit**: Tech Lead audits existing `/agent-docs/conversations/` to ensure stale context is cleared or properly updated before new handoffs are issued.
4. **MANDATORY OUTPUT:** Tech Lead creates `/agent-docs/plans/CR-XXX-plan.md` using the Standard Plan Template defined in `/agent-docs/plans/TEMPLATE.md`.
5. **MANDATORY CHECK:** Tech Lead submits the COMPLETE plan (approach + delegation) to USER for "Go/No-Go" decision.
6. **Execution Start:** Tech Lead formalizes task specifications + prompts for sub-agents in `/agent-docs/conversations/tech-lead-to-<role>.md`. 
   - **Requirement**: Tech Lead MUST include the "Rationale/Why" in the handoff to ensure sub-agents understand the intent, not just the action.

### 🛑 The Delegation Invariant (Anti-Loop Measures)
- **The Tech Lead writes the Handoff**: This is the final action of the Tech Lead Agent for a specific sub-task. Use the [Handoff Template](/agent-docs/conversations/TEMPLATE-tech-lead-to-sub-agent.md) for consistent structure.
- **The "Wait" State**: Once `agent-docs/conversations/tech-lead-to-<role>.md` is created, the Tech Lead Agent MUST stop and report back to the User.
- **No Self-Implementation**: Do NOT attempt to perform the sub-agent's task in the same turn or session while claiming to be the Tech Lead Agent. 
- **The "Shift" Refusal**: If you feel the urge to "just do it" to be efficient, you are violating the Tech Lead role. Stop. Wait for the User to either:
  1. Approve the handoff for a sub-agent execution.
  2. Explicitly ask you to switch roles.

#### Wait State Output
When entering the Wait State, the Tech Lead MUST inform the user:
1. Which sub-agent role needs to execute next
2. The handoff file location (e.g., `agent-docs/conversations/tech-lead-to-frontend.md`)
3. Clear instruction: *"Start a new session and assign the [Role] to execute this handoff."*

Do NOT simply say "I'm done" — the user needs actionable next steps.

### 🛑 Pre-Implementation Self-Check (Tech Lead)

Before writing code or making changes directly, the Tech Lead MUST complete this checklist:

1. **List the files you will modify.**
2. **For each file, ask: "Is this feature code?"**
   - Feature code = `components/`, `app/*/`, `hooks/`, `lib/` (feature-specific), feature tests
3. **If YES to any** → STOP. Create handoff in `conversations/tech-lead-to-<role>.md`.
4. **If NO to all** → Proceed with direct implementation.

*Skipping this checklist is a protocol violation.*

### Code & Git Standards
- All contributions must follow the rules defined in `CONTRIBUTING.md` (root directory).



### Implementation Phase (Sub-Agents)
1. Sub-agent receives task specification from Tech Lead Agent in `/agent-docs/conversations/tech-lead-to-<role>.md`
   - **Handoff Template**: Must include `[Objective]`, `[Constraints]`, and `[Definition of Done]`.
2. **Initial Verification**: Before starting code changes, verify environmental assumptions (e.g., check if a browser truly lacks a feature as claimed) and contract availability (e.g., confirm required selectors/IDs exist).
3. **Halt on Blocker/Assumption Invalidation**: If a blocker (missing contract, environmental discrepancy, or logical flaw) is identified:
   - **STOP** implementation of the affected part immediately.
   - **DO NOT** attempt to "fix" or "work around" an architectural or environmental assumption without consulting the Tech Lead Agent.
   - Report the issue immediately via the `agent-docs/coordination/feedback-protocol.md`.
   - Clearing the blocker OR re-validating the core requirement is a higher priority than completing the original task.
4. Sub-agent executes within role boundaries.
5. Sub-agent completes and verifies work.
6. **Output:** Implementation + tests + updated docs + report for Tech Lead.

### Verification Phase (Tech Lead Agent)
1. Tech Lead reviews completed work reports
2. **Diff Review**: Tech Lead inspects the code diffs for logic errors or missing edge cases (Adversarial Review).
3. Tech Lead ensures integration works
3. Tech Lead updates architectural docs if needed
4. **Output:** Verified feature + completion report in `agent-docs/conversations/tech-lead-to-ba.md` following Handoff Protocol in `agent-docs/coordination/handoff-protocol.md`.

### Acceptance Phase (BA Agent)
1. BA reviews the Tech Lead's report and verifies AC are met.
2. **AC Evidence Annotation**: For each AC in the CR, mark `[x]` with a one-line evidence reference (e.g., file + line number). Do not bulk-accept without individual verification.
3. **Deviation Handling**: BA must explicitly acknowledge deviations reported in the Tech Lead's handoff:
   - **Minor/Safe deviations**: Log acceptance in the CR's "Deviations Accepted" section.
   - **Major deviations**: Escalate to User before closing the CR.
4. **Pre-Existing Failure Tracking**: If the Tech Lead reports pre-existing test failures unrelated to the CR, BA logs them as a `Next Priority` in `project-log.md` with a follow-up CR recommendation.
5. BA updates requirement status in `agent-docs/requirements/CR-XXX.md`.
6. BA updates `agent-docs/project-log.md` with the final entry.
7. BA notifies the human of completion.
8. **Output:** Closed CR, updated project log.

---

## General Invariants

### 1. Traceability Invariant
Every ID mentioned in the `agent-docs/project-log.md` (e.g., `CR-XXX`, `ADR-XXX`) **MUST** have a corresponding artifact in the relevant directory (`requirements/`, `decisions/`, `plans/`, `reports/`). Do not reference identifiers that do not exist as files.

### 2. E2E Selector Invariant
When a CR modifies **routes**, **page structure**, or **`data-testid` attributes**, the Tech Lead **MUST** include a Testing Agent task to update affected E2E tests. Selectors that are left stale after structural changes become pre-existing failures that pollute future verification cycles.

*Example*: If CR-004 changes `/transformer` to `/foundations/transformers`, the E2E test asserting `href="/transformer"` must be updated in the same CR.