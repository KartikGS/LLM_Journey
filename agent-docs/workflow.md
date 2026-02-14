# Workflow (The Agent Loop)

**Core Guidance**: Before starting any task, review `/agent-docs/coordination/reasoning-principles.md`.

## Multi-Agent Workflow

### Requirement Analysis Phase (BA Agent)
1. User provides rough CR.
2. BA clarifies through Q&A.
3. **Technical Sanity Check**: BA consults `/agent-docs/architecture.md`, `/agent-docs/technical-context.md`, and ADRs in `/agent-docs/decisions/` to identify potential conflicts or opportunities for "Product Shaping" (e.g., suggesting a fallback UI for a known browser constraint).
4. **Testing Incident Check (Conditional)**: If the task involves failing tests/lint/build or environment-specific runtime mismatches, BA must load `/agent-docs/testing-strategy.md` and collect at least one command-based baseline (`exact command + result`) before finalizing CR scope.
5. BA creates structured requirement document.
6. BA assesses business complexity.
7. **Output:** `/agent-docs/requirements/CR-XXX.md` + prompt for Tech Lead.
8. BA reports back to user for review and approval.
9. User approves or requests changes.
10. **Pivot Loop**: If during Phase 2 the Tech Lead identifies a fundamental assumption error (e.g., "Safari actually supports X"), the BA must pivot the CR, re-clarify with the User, and issue a revised handoff.

### Technical Planning & Delegation Phase (Tech Lead Agent)
1. Tech Lead reads CR from BA. Read `/agent-docs/conversations/ba-to-tech-lead.md` for more details.
2. Tech Lead assesses technical complexity and identifies required sub-agents.
3. **Execution Audit**: Tech Lead audits existing `/agent-docs/conversations/` to ensure stale context is cleared or properly updated before new handoffs are issued.
4. **MANDATORY OUTPUT:** Tech Lead creates `/agent-docs/plans/CR-XXX-plan.md` using the Standard Plan Template defined in `/agent-docs/plans/TEMPLATE.md`.
5. **MANDATORY CHECK:** Tech Lead submits the COMPLETE plan (approach + delegation) to USER for "Go/No-Go" decision.
6. **Execution Start:** Tech Lead formalizes task specifications + prompts for sub-agents in `/agent-docs/conversations/tech-lead-to-<role>.md`.
   - **Template Rule**: Use role-specific handoff templates in `/agent-docs/conversations/TEMPLATE-tech-lead-to-<role>.md`.
   - **Requirement**: Tech Lead MUST include the "Rationale/Why" in the handoff to ensure sub-agents understand the intent, not just the action.
7. **MANDATORY EXECUTION MODE DECISION:** Tech Lead MUST explicitly choose one mode in the plan:
   - **Parallel Mode**: Use when tasks are independent and can run safely without upstream outputs.
   - **Sequential Mode**: Use when later tasks depend on outputs from earlier sub-agents.
8. **E2E Contract Sync Gate (Conditional):** If a CR changes routes, page structure, or `data-testid` contracts, the Tech Lead MUST include a Testing handoff in the same CR and explicitly list affected route/selector/state contracts in the plan + handoff.

#### Conversation File Freshness Rule (Mandatory)
- Conversation handoff/report files under `agent-docs/conversations/` are **single-CR working artifacts**.
- For a new CR, agents MUST **replace file contents** with the current CR context. Do not append historical CR logs.
- Every conversation file MUST include the active CR ID in `Subject`.
- Historical traceability belongs in CR artifacts (`requirements/`, `plans/`, `reports/`, `project-log.md`), not in accumulated conversation transcripts.

#### Delegation Mode Rules
- **Parallel Mode**
  1. Create handoffs for all independent sub-agents in one batch.
  2. Enter Wait State after issuing the batch.
  3. Review all incoming reports before integration verification.
- **Sequential Mode**
  1. Create handoff for the first required sub-agent only.
  2. Enter Wait State.
  3. After report review, issue the next handoff(s) based on validated outputs.
- **Decision Test**: If Step B requires any artifact, decision, or evidence from Step A, execution MUST be Sequential.

### 🛑 The Delegation Invariant (Anti-Loop Measures)
- **The Tech Lead writes the Handoff**: This is the final action of the Tech Lead Agent for a specific sub-task. Use the role-specific handoff templates in `/agent-docs/conversations/TEMPLATE-tech-lead-to-<role>.md`.
- **The "Wait" State**:
  - **Parallel Mode**: Once the full planned handoff batch is created, the Tech Lead Agent MUST stop and report back to the User.
  - **Sequential Mode**: Once the current step handoff is created, the Tech Lead Agent MUST stop and report back to the User.
- **No Self-Implementation**: Do NOT attempt to perform the sub-agent's task in the same turn or session while claiming to be the Tech Lead Agent. 
- **The "Shift" Refusal**: If you feel the urge to "just do it" to be efficient, you are violating the Tech Lead role. Stop. Wait for the User to either:
  1. Approve the handoff for a sub-agent execution.
  2. Explicitly ask you to switch roles.

#### Wait State Output
When entering the Wait State, the Tech Lead MUST inform the user:
1. Execution mode selected (`Parallel` or `Sequential`)
2. Which sub-agent role(s) need to execute next
3. The handoff file location(s) (e.g., `agent-docs/conversations/tech-lead-to-frontend.md`)
4. Clear instruction: *"Start a new session and assign the [Role] to execute this handoff."*

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
3. **Preflight Clarification (Mandatory)**: Before implementation, publish a concise preflight note to the role's `*-to-tech-lead.md` handoff including:
   - assumptions being made,
   - adjacent risks not covered by current scope,
   - open questions that could affect implementation validity.
   If open questions are non-empty and materially affect validity/scope, pause and wait for Tech Lead clarification.
4. **Halt on Blocker/Assumption Invalidation**: If a blocker (missing contract, environmental discrepancy, or logical flaw) is identified:
   - **STOP** implementation of the affected part immediately.
   - **DO NOT** attempt to "fix" or "work around" an architectural or environmental assumption without consulting the Tech Lead Agent.
   - **Reproduce before classify**: For environment/E2E blockers, run at least one exact-command rerun and one explicit-target rerun (plus local-equivalent verification if constrained execution affects startup/runtime) before final blocker classification.
   - Report the issue immediately via the `agent-docs/coordination/feedback-protocol.md`.
   - Clearing the blocker OR re-validating the core requirement is a higher priority than completing the original task.
5. Sub-agent executes within role boundaries.
   - If user or Tech Lead feedback introduces changes outside the approved handoff scope (for example cross-route refactors or shared component extraction), mark this as a **scope extension** and get explicit Tech Lead or user confirmation before implementing.
6. Sub-agent completes and verifies work.
7. **Output:** Implementation + role-appropriate verification evidence + updated docs (if in scope) + report for Tech Lead.
   - **Testing Ownership Rule**: Creating/modifying tests is owned by the Testing Agent unless the Tech Lead handoff explicitly delegates test work to another role.

#### Clarification Loop Protocol (Mandatory)
- The execution model explicitly supports iterative loops, not one-shot handoffs:
  - `Tech Lead handoff -> [Sub-agent concerns <-> Tech Lead responses] (0..N rounds) -> Sub-agent execution -> report -> [Tech Lead concerns <-> Sub-agent responses] (0..N rounds)`.
- If disagreement exists, capture:
  1. The disputed assumption/constraint
  2. Proposed alternatives
  3. Final decision owner (`Tech Lead` for technical feasibility, `BA` for scope/intent)
- If unresolved and scope/intent is affected, escalate through BA feedback protocol before continuing.

#### BA-Tech Lead Clarification Loop (Mandatory)
- Requirement handoff is also iterative when needed:
  - `BA handoff -> [Tech Lead concerns <-> BA responses] (0..N rounds) -> Plan approval -> execution`.
- Acceptance is also iterative when needed:
  - `Tech Lead verification handoff -> [BA concerns <-> Tech Lead responses] (0..N rounds) -> closure`.
- Disagreement is expected when it improves correctness; unresolved scope conflicts must be escalated to user.

### Verification Phase (Tech Lead Agent)
1. Tech Lead reviews completed work reports
2. **Diff Review**: Tech Lead inspects the code diffs for logic errors or missing edge cases (Adversarial Review).
3. Tech Lead ensures integration works
4. **E2E Contract Closure Check (Conditional)**: For CRs touching routes/page structure/test IDs, Tech Lead verifies matching E2E assertion updates are present in the same CR (not deferred silently).
5. Tech Lead updates architectural docs if needed
6. **Output:** Verified feature + completion report in `agent-docs/conversations/tech-lead-to-ba.md` following Handoff Protocol in `agent-docs/coordination/handoff-protocol.md`.

### Acceptance Phase (BA Agent)
1. BA reviews the Tech Lead's report and verifies AC are met.
2. **AC Evidence Annotation**: For each AC in the CR, mark `[x]` with a one-line evidence reference (e.g., file + line number). Do not bulk-accept without individual verification.
3. **CR Immutability Rule (Historical Integrity):**
   - Once a CR is marked `Done`, treat it as a historical record.
   - Do **not** rewrite closed CRs to match newer templates or style conventions.
   - If gaps are discovered later, create a new artifact (follow-up CR or investigation report) that references the original CR.
4. **Allowed Post-Closure Edits (closed CRs only):**
   - Typo/formatting fixes, broken link fixes, or factual corrections.
   - Any such update must be logged in an `Amendment Log` section with date + reason.
   - Do **not** retroactively change acceptance intent or silently rewrite AC history.
5. **Deviation Handling**: BA must explicitly acknowledge deviations reported in the Tech Lead's handoff:
   - **Minor/Safe deviations**: Log acceptance in the CR's "Deviations Accepted" section.
   - **Major deviations**: Escalate to User before closing the CR.
6. **Pre-Existing Failure Tracking**: If the Tech Lead reports pre-existing test failures unrelated to the CR, BA logs them as a `Next Priority` in `project-log.md` with a follow-up CR recommendation.
7. BA updates requirement status in `agent-docs/requirements/CR-XXX.md`.
8. BA updates `agent-docs/project-log.md` with the final entry.
9. BA notifies the human of completion.
10. **Output:** Closed CR, updated project log.

---

## General Invariants

### 1. Traceability Invariant
Every ID mentioned in the `agent-docs/project-log.md` (e.g., `CR-XXX`, `ADR-XXX`) **MUST** have a corresponding artifact in the relevant directory (`requirements/`, `decisions/`, `plans/`, `reports/`). Do not reference identifiers that do not exist as files.

### 2. E2E Selector Invariant
When a CR modifies **routes**, **page structure**, or **`data-testid` attributes**, the Tech Lead **MUST** include a Testing Agent task to update affected E2E tests. Selectors that are left stale after structural changes become pre-existing failures that pollute future verification cycles.

*Example*: If CR-004 changes `/transformer` to `/foundations/transformers`, the E2E test asserting `href="/transformer"` must be updated in the same CR.

### 3. Historical Artifact Invariant (CRs)
Closed CRs are immutable records and must not be normalized retroactively.
- Legacy format variance across older CRs is acceptable.
- Standardization requirements apply to new CRs going forward.
- If historical evidence needs clarification, append an amendment note or create a linked follow-up artifact rather than rewriting intent/history.

### 4. Scope Extension Invariant
When execution feedback expands work beyond the approved handoff (for example touching additional routes, introducing shared abstractions, or changing ownership boundaries), implementation must pause until `scope extension approved` is explicitly recorded by the decision owner (Tech Lead for technical scope, User for direct override).
