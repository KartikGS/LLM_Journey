# Workflow (The Agent Loop)

**Core Guidance**: Before starting any task, review `$LLM_JOURNEY_THINKING_REASONING`.

## Multi-Agent Workflow

### Requirement Analysis Phase (BA Agent)
1. Human User provides rough CR.
2. BA clarifies through Q&A.
3. **Audience & Outcome Check (Mandatory):** BA explicitly identifies:
   - Human User intent (session-level request),
   - Product End User audience (website learner/persona),
   - expected learner or product outcome.
4. **Technical Sanity Check**: BA consults `$LLM_JOURNEY_ARCHITECTURE`, `/agent-docs/technical-context.md`, and ADRs in `/agent-docs/decisions/` to identify potential conflicts or opportunities for "Product Shaping" (e.g., suggesting a fallback UI for a known browser constraint).
5. **Testing Incident Check (Conditional)**: If the task involves failing tests/lint/build or environment-specific runtime mismatches, BA must load `/agent-docs/testing-strategy.md` and collect at least one command-based baseline (`exact command + result`) before finalizing CR scope.
6. BA creates structured requirement document.
7. BA assesses business complexity.
8. **Output:** `/agent-docs/llm-journey/workflow/requirements/CR-XXX-<slug>.md` + prompt for Tech Lead.
9. BA reports back to Human User for review and approval.
10. Human User approves or requests changes.
11. **Pivot Loop**: If during Phase 2 the Tech Lead identifies a fundamental assumption error (e.g., "Safari actually supports X"), the BA must pivot the CR, re-clarify with the Human User, and issue a revised handoff.

### Technical Planning & Delegation Phase (Tech Lead Agent)
1. Tech Lead reads CR from BA. Read `/agent-docs/conversations/ba-to-tech-lead.md` for more details.
2. Tech Lead assesses technical complexity and identifies required sub-agents.
3. **Execution Audit**: Tech Lead audits existing `/agent-docs/conversations/` to ensure stale context is cleared or properly updated before new handoffs are issued. (See Conversation File Freshness Rule below.)
4. **MANDATORY OUTPUT:** Tech Lead creates `/agent-docs/llm-journey/workflow/plans/CR-XXX-plan.md` using the Standard Plan Template defined in `$LLM_JOURNEY_WORKFLOW_PLANS`.
5. **MANDATORY CHECK:** Tech Lead submits the COMPLETE plan (approach + delegation) to USER for "Go/No-Go" decision.
   - **Exception:** Skip explicit Go/No-Go for: (a) strictly `[S][DOC]` work or pure discovery sessions where no sub-agent delegation handoff will be issued — direct Tech Lead execution of permitted changes does not disqualify from this skip; or (b) `[S]` CRs where the plan contains no unresolved architectural decisions or option spaces requiring user judgment — i.e., every technical choice is fully determined by the BA spec and no tradeoff is left open.
6. **Execution Start:** Tech Lead formalizes task specifications + prompts for sub-agents in `/agent-docs/conversations/tech-lead-to-<role>.md`.
   - **Template Rule**: Use role-specific handoff templates in `/agent-docs/conversations/TEMPLATE-tech-lead-to-<role>.md`.
   - **Requirement**: Tech Lead MUST include the "Rationale/Why" in the handoff to ensure sub-agents understand the intent, not just the action.
   - > [!WARNING] **Write-Before-Read constraint:** Before replacing any existing handoff file, you MUST read it first — even if the prior content will be entirely discarded. The Write tool requires a prior Read call for existing files; omitting this step causes a "File has not been read yet" error and a full retry cycle.
7. **MANDATORY EXECUTION MODE DECISION:** Tech Lead MUST explicitly choose one mode in the plan:
   - **Parallel Mode**: Use when tasks are independent and can run safely without upstream outputs.
   - **Sequential Mode**: Use when later tasks depend on outputs from earlier sub-agents.
8. **Session Scope Management:** Apply the CR Coordinator model to **all CRs** regardless of sub-agent count. Canonical specs: CR Execution Model in `$LLM_JOURNEY_ROLE_TECH_LEAD`; CR Coordinator operational spec in `$LLM_JOURNEY_ROLE_COORDINATOR`. Summary:
   - **Tech Lead Session A**: full context load → plan → direct changes → `TL-session-state.md` → Wait State.
   - **CR Coordinator sessions**: one session per sub-agent. Load only `TL-session-state.md` + sub-agent report + modified files → adversarial review → quality gates → conclusion summary → Wait State.
   - **Tech Lead Session B**: load Coordinator conclusion summaries → BA handoff authoring.
   - **Record health signal**: if context saturation is experienced at any cycle, record it in the `## Workflow Health Signal` field of `TL-session-state.md` before closing that session.
   - **Direct-execution CR (zero sub-agents)**: When a CR has no sub-agent delegation, Sessions A and B collapse into a single session — no CR Coordinator sessions exist. `TL-session-state.md` is still written as an internal record (Coordinator-targeted sections will be empty — this is expected, not a compliance gap). The Wait State exits directly to BA handoff authoring with no sub-agent handoffs issued. The Go/No-Go skip condition in step 5(a) applies.
9. **Architecture-Only Mode (Conditional):** If a CR is intended as rendering-boundary/architecture-only (no product behavior redesign), Tech Lead MUST state this explicitly in plan + handoff and include:
   - UI/copy/IA freeze statement (`no visual redesign, no content rewrite, no route rename`),
   - contract preservation list (`routes`, `data-testid`, accessibility semantics),
   - required regression checks (desktop/mobile + light/dark + critical interactive surfaces).
9. **E2E Contract Sync Gate (Conditional):** If a CR changes routes, `data-testid`, or accessibility/semantic contracts, the Tech Lead MUST include a Testing handoff in the same CR and explicitly list affected route/selector/state contracts in the plan + handoff. For pure structure/class refactors with stable contracts, follow the matrix below.

#### Testing Handoff Trigger Matrix (Mandatory)
Use this matrix to decide whether a Testing handoff is required in the same CR:

| Change Type | Testing Handoff Required? | Minimum Testing Scope |
| :--- | :--- | :--- |
| Route path rename/add/remove | Yes | Update affected E2E navigation assertions + run impacted specs |
| `data-testid` add/remove/rename | Yes | Update selector-based tests + run impacted specs |
| Accessibility contract change (`role`, `aria-*`, keyboard behavior) | Yes | Update semantic assertions + run impacted specs |
| UI structure/class refactor with unchanged route/selector/semantics | Conditional | If no contract change, Tech Lead may close without Testing handoff after documenting contract stability evidence |
| Copy-only change with stable selectors/contracts | No (default) | Existing verification gates only, unless CR explicitly requests copy assertions |
| Shared component changes under `app/ui/**` | Conditional | Require route impact list + sanity checks; Testing handoff only if contracts/behavior changed |
| Backend CR adds or renames an exported function in a shared metric infrastructure module (e.g., `lib/otel/metrics.ts`) | Conditional — **metric mock cascade check required** | Before issuing the Backend handoff, run `grep -rn "jest.mock.*otel/metrics" __tests__/` (adjust path for the module). If any closed-factory mock exists (a mock returning a literal object `{ ... }` without the new function), this is a **metric mock cascade** condition. Resolve at handoff time: either (a) explicitly name the affected test files in Backend's delegation scope, or (b) add a Testing Agent handoff to update the mocks. Do not issue the Backend handoff without resolving this. |

Canonical rule: this matrix is the source of truth for Testing handoff decisions. If any other section conflicts, follow this matrix.

#### Conversation File Freshness Rule (Mandatory)
- Conversation handoff/report files under `agent-docs/conversations/` are **single-CR working artifacts**.
- For a new CR, agents MUST **replace file contents** with the current CR context. Do not append historical CR logs.
- Every conversation file MUST include the active CR ID in `Subject`.
- Within the same CR, agents SHOULD keep preflight and completion updates in the same file as separate sections.
- Historical traceability belongs in CR artifacts (`$LLM_JOURNEY_WORKFLOW_REQUIREMENTS`, `$LLM_JOURNEY_WORKFLOW_PLANS`, `$LLM_JOURNEY_WORKFLOW_REPORTS`, `$LLM_JOURNEY_LOG`), not in accumulated conversation transcripts.
- **Pre-Replacement Check (Mandatory)**: Before replacing a conversation file for a new CR, confirm the prior CR's work is archived in a non-conversation artifact. **Non-circular evidence only** — do not cite the outgoing conversation file itself as evidence (it is the artifact being replaced). Minimum evidence: (a) `/agent-docs/llm-journey/workflow/plans/[prior CR-ID]-plan.md` exists, AND (b) `/agent-docs/llm-journey/workflow/requirements/[prior CR-ID]-[slug].md` shows `status: Done` or equivalent closure signal. Do not replace until both are confirmed.
- **Trust model (sub-agent attestation)**: If the incoming handoff (`tech-lead-to-<role>.md`) already contains a completed Pre-Replacement Check stub at the top, the sub-agent receiving the handoff may trust this attestation without independently re-verifying plan artifacts or CR status. The Tech Lead's (or CR Coordinator's) check satisfies the gate for that sub-agent. Sub-agents still complete their own Pre-Replacement Check when replacing their own outgoing report file (e.g., `backend-to-tech-lead.md`).
- **Same-session shortcut**: When the replacing agent directly annotated the prior CR's status as Done in the current session (for example, the BA completing acceptance closure before writing the next BA handoff in the same session), both Evidence 1 and Evidence 2 are satisfied by a single attestation line: `"Same-session: [prior CR-ID] annotated Done during [phase] in this session."` Independent re-reading of the plan artifact or requirements artifact is redundant and may be omitted. The Write-Before-Read tool constraint is unaffected — the outgoing conversation file must still be Read before the Write call.

#### CR-Scoped Naming for Ephemeral Coordination Files (Guidance)
When a CR requires temporary coordination files beyond the standard role-pair files (e.g., `backend-to-tech-lead.md`), name them with the CR ID to prevent collision and aid discovery:
- Pattern: `[purpose]-CR-XXX.md` (e.g., `scope-clarification-CR-020.md`, `tl-notes-CR-020.md`).
- Standard role-pair files (`ba-to-tech-lead.md`, `backend-to-tech-lead.md`, etc.) keep their canonical names — the freshness rule governs these at CR boundaries.
- Freshness gate mechanism is **unchanged**: the Pre-Replacement Check still applies to role-pair files at every CR boundary.
- CR-scoped ephemeral files are single-CR artifacts; close or delete them after CR closure.

#### Pre-Replacement Check: Prefilled Stub (Efficiency Guidance)
To reduce ceremony at CR boundaries, pre-populate the check at the top of the incoming CR content using this structure — fill in the blanks during replacement:

    ## Pre-Replacement Check (Conversation Freshness)
    - Prior outgoing [role] handoff context: `[prior CR-ID]`
    - Evidence 1 (plan artifact exists): `agent-docs/llm-journey/workflow/plans/[prior CR-ID]-plan.md`
    - Evidence 2 (prior CR closed): `agent-docs/llm-journey/workflow/requirements/[prior CR-ID]-[slug].md` status is `Done`
    - Result: replacement allowed for new CR context.

The gate is not weakened — Evidence 2 requires reading the prior CR requirement artifact, not the outgoing conversation file. The stub removes formatting ceremony, not the verification step. Citing the outgoing conversation file as Evidence 2 is not permitted (circular).

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
- **Pre-authored `pending-issue` handoffs**: When a later-stage handoff (e.g., Testing) is fully determinable at plan time and does not depend on upstream sub-agent output decisions, the Tech Lead may write the handoff at Session A time and mark it `status: pending-issue` in the file header. The CR Coordinator validates applicability against upstream outputs and changes status to `status: issued` before forwarding — no re-transcription. This removes a full session boundary for handoffs that were already known at plan time.

### 🛑 The Delegation Invariant (Anti-Loop Measures)
- **The Tech Lead writes the Handoff**: This is the final action of the Tech Lead Agent for a specific sub-task. Use the role-specific handoff templates in `/agent-docs/conversations/TEMPLATE-tech-lead-to-<role>.md`.
- **The "Wait" State**:
  - **Parallel Mode**: Once all permitted direct changes (e.g., `.env.example`, config files) and the full planned handoff batch are complete in the same execution turn, the Tech Lead Agent MUST stop and report back to the User. Permitted direct changes do not require a separate Wait State — they may be completed in the same turn as handoff issuance.
  - **Sequential Mode**: Once permitted direct changes and the current step handoff are complete in the same execution turn, the Tech Lead Agent MUST stop and report back to the User.
- **No Self-Implementation**: Do NOT attempt to perform the sub-agent's task in the same turn or session while claiming to be the Tech Lead Agent.
- **The "Shift" Refusal**: If you feel the urge to "just do it" to be efficient, you are violating the Tech Lead role. Stop. Wait for the User to either:
  1. Approve the handoff for a sub-agent execution.
  2. Explicitly ask you to switch roles.

#### Wait State Output
When entering the Wait State, the Tech Lead MUST inform the user:
1. Execution mode selected (`Parallel` or `Sequential`)
2. Which sub-agent role(s) need to execute next
3. The handoff file location(s) (e.g., `agent-docs/conversations/tech-lead-to-frontend.md`)
4. Clear instruction — role-dependent:
   - **Sub-agent execution roles** (Backend, Frontend, Testing, Infra): *"Start a new session and assign the [Role] to execute this handoff."*
   - **BA acceptance** (after issuing `tech-lead-to-ba.md`): *"Resume the existing BA session that produced `ba-to-tech-lead.md` and provide `tech-lead-to-ba.md` as input. Do not start a new session — the BA's accumulated CR context is required for accurate acceptance verification."*

Do NOT simply say "I'm done" — the user needs actionable next steps.

### 🛑 Pre-Implementation Self-Check (Tech Lead)
Apply the canonical checklist in `$LLM_JOURNEY_ROLE_TECH_LEAD` before any direct edits.
- Summary rule: if any target file is feature code, delegate and enter Wait State.
- This section intentionally avoids repeating the full checklist to prevent policy drift.

### Code & Git Standards
- All contributions must follow the rules defined in `agent-docs/development/contribution-guidelines.md`.
- **Parallel-CR branch strategy (deferred policy decision)**: One-branch-per-CR policy and CR-number collision strategy for concurrent CR execution are explicitly deferred as a pending Human User policy decision. Do not implement without explicit user authorization. Current working assumption: single active feature branch per session. See `$LLM_JOURNEY_LOG` Next Priorities.



### Implementation Phase (Sub-Agents)
1. Sub-agent receives task specification from Tech Lead Agent in `/agent-docs/conversations/tech-lead-to-<role>.md`
   - **Handoff Template**: Must include `[Objective]`, `[Constraints]`, and `[Definition of Done]`.
2. **Initial Verification**: Before starting code changes, verify environmental assumptions (e.g., check if a browser truly lacks a feature as claimed) and contract availability (e.g., confirm required selectors/IDs exist).
3. **Preflight Clarification (Mandatory)**: Before implementation, publish a concise preflight note to the role's `*-to-tech-lead.md` handoff including:
   - assumptions being made,
   - adjacent risks not covered by current scope,
   - open questions that could affect implementation validity.
   If open questions are non-empty and materially affect validity/scope, pause and wait for Tech Lead clarification. *(In synchronous sessions: flag the question in your preflight output and await a response in the same session turn before continuing implementation.)*
4. **Pause vs Proceed Decision Rule (Mandatory)**:
   - **Proceed** when assumptions are testable locally and implementation does not change scope/contracts/ownership.
   - **Pause** when any open question can change route/API/test-id contracts, accessibility semantics, ownership boundaries, or expected behavior with two or more plausible implementations.
   - When pausing, report the question with: `decision needed`, `options`, and `impact of each option`.
5. **Halt on Blocker/Assumption Invalidation**: If a blocker (missing contract, environmental discrepancy, or logical flaw) is identified:
   - **STOP** implementation of the affected part immediately.
   - **DO NOT** attempt to "fix" or "work around" an architectural or environmental assumption without consulting the Tech Lead Agent.
   - **Reproduce before classify**: For environment/E2E blockers, run at least one exact-command rerun and one explicit-target rerun (plus local-equivalent verification if constrained execution affects startup/runtime) before final blocker classification.
   - Report the issue immediately via the `agent-docs/coordination/feedback-protocol.md`.
   - Clearing the blocker OR re-validating the core requirement is a higher priority than completing the original task.
6. Sub-agent executes within role boundaries.
   - If user or Tech Lead feedback introduces changes outside the approved handoff scope (for example cross-route refactors or shared component extraction), mark this as a **scope extension** and get explicit Tech Lead or user confirmation before implementing.
   - **Human User Override Rule (Mandatory):** Direct scope-changing instruction from the Human User in active session is considered immediate scope-extension approval. Implementation may proceed immediately, but the agent MUST record `scope extension approved by user` in the active conversation/report artifact.
   - **Artifact Sync Rule (Mandatory):** Before continuing implementation after any scope-extension approval (Tech Lead or Human User), sync all active artifacts:
     - Update CR artifact with the approved delta.
     - Update plan artifact with delegation/verification impact.
     - Update active handoff/report with the same decision context.
     Resume work only after this sync is complete.
   - **Ownership Clarification:** Scope extension approval does not transfer file ownership. If requested changes cross role-owned boundaries, delegation or explicit role reassignment is still required.
7. Sub-agent completes and verifies work.
8. **Output:** Implementation + role-appropriate verification evidence + updated docs (if in scope) + report for Tech Lead.
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
6. **Post-Verification Drift Check (Mandatory):** Before issuing the BA handoff, confirm that feature files verified in steps 1–5 have not been modified after verification was recorded — whether by an agent or by the Human User directly. **Mechanism**: In synchronous single-session execution where verification and handoff issuance occur consecutively, this check is trivially satisfied — no drift is possible between sequential tool calls. In multi-session or async scenarios, re-read feature files or compare modification timestamps to confirm no intervening edits. If drift is detected, a re-verification pass is required. Note the drift in the BA handoff with the original and current file state.
7. **Output:** Verified feature + completion report in `agent-docs/conversations/tech-lead-to-ba.md` following Handoff Protocol in `agent-docs/coordination/handoff-protocol.md`.

### Acceptance Phase (BA Agent)
1. BA reviews the Tech Lead's report and verifies AC are met.
2. **AC Evidence Annotation**: For each AC in the CR, mark `[x]` with a one-line evidence reference (file + line number). Apply graduated verification:
   - **Security constraints** (data must/must not appear, auth invariants) and **deleted contracts** (structural deletions that alter observable product behavior, test contracts, or external integration contracts — including but not limited to: removed testids, removed or renamed API endpoints, changed error codes, removed files, removed route handlers, removed metric instruments, removed observability configuration): independently re-read the cited file/line to confirm — **unless** the `tech-lead-to-ba.md` handoff includes **specific cited TL adversarial evidence** for that constraint. Specific cited TL adversarial evidence must identify: (a) the file path, (b) the line number or range, and (c) what the evidence demonstrates — i.e., what was independently confirmed (natural language is sufficient; a formal assertion-type label is not required). Example: "`__tests__/api/frontier.test.ts:45 — mocked-fetch test confirms no fetch calls triggered on 413 path`" qualifies; a general `"reviewed and confirmed"` note does not. In that case, the BA may accept the TL citation in place of an independent re-read and must log: `"graduated per specific cited TL adversarial evidence: [reproduce the TL citation]"`.
   - **Additive changes** (new components, copy changes, dark mode, UI layout): trust the Tech Lead's citation with a brief source audit note.
   Do not bulk-accept all ACs with a single pass. Each AC must have a distinct evidence reference.
3. **Assumed Gate Fallback (Mandatory)**: If `tech-lead-to-ba.md` marks any verification gate result as "assumed" (rather than confirmed with a specific command output), those "assumed" citations are not sufficient for BA acceptance. The BA must rerun the specific assumed gates directly and include the result in the AC evidence annotation. An "assumed" gate citation from the Tech Lead handoff does not satisfy AC evidence for the corresponding acceptance criterion.
   - **Runtime mismatch clarification**: If an AC requires verification gates to pass "under compliant runtime" and the BA is running on a non-compliant runtime, this does not automatically constitute AC failure. If the runtime mismatch is pre-existing and already tracked in `$LLM_JOURNEY_LOG`, the BA may proceed using the proceed-and-classify exception per `tooling-standard.md` (Runtime Preflight section). The BA must document the exception in the AC evidence annotation (e.g., "runtime mismatch pre-existing per project-log; proceed-and-classify exception applied per `tooling-standard.md`"). A new, untracked runtime mismatch is not covered by this exception.
4. **CR Immutability Rule (Historical Integrity):**
   - Once a CR is marked `Done`, treat it as a historical record.
   - Do **not** rewrite closed CRs to match newer templates or style conventions.
   - If gaps are discovered later, create a new artifact (follow-up CR or investigation report) that references the original CR.
5. **Allowed Post-Closure Edits (closed CRs only):**
   - **AC evidence annotation** (`[ ]` -> `[x]` + one-line evidence reference) and CR status change to `Done` are required closure actions and do not constitute retroactive rewriting of intent. No Amendment Log entry is required for closure annotation.
   - Typo/formatting fixes, broken link fixes, or factual corrections. Any such update must be logged in an `Amendment Log` section with date + reason.
   - Do **not** retroactively change acceptance intent, expand or narrow AC scope, or silently rewrite AC history.
6. **Deviation Handling**: BA must explicitly acknowledge deviations reported in the Tech Lead's handoff:
   - Classify each deviation using the **Deviation Severity Rubric (Canonical)** below.
   - **Minor deviations**: Log acceptance in the CR's "Deviations Accepted" section.
   - **Major deviations**: Escalate to Human User before closing the CR.
7. **Pre-Existing Failure Tracking**: If the Tech Lead reports pre-existing test failures unrelated to the CR, BA logs them as a `Next Priority` in `$LLM_JOURNEY_LOG` with a follow-up CR recommendation.
8. BA updates requirement status in `/agent-docs/llm-journey/workflow/requirements/CR-XXX-<slug>.md`.
9. BA updates `$LLM_JOURNEY_LOG` with the final entry.
10. BA notifies the human of completion.
11. **Output:** Closed CR, updated project log.

### Post-CR Meta Improvement Cadence (Conditional)
- Canonical procedure: `$LLM_JOURNEY_IMPROVEMENT_PROTOCOL`.
- Default after each completed CR: run Mode A lightweight meta pass.
- Escalate to full Mode A three-phase chain only when trigger conditions in the meta protocol are met.
- For structural doc evolution (portability split, collaboration throughput, doc maintainability), use Mode B alignment flow and implement in small `[S][DOC][ALIGN]` chunks.

#### Deviation Severity Rubric (Canonical)
Use this rubric during BA acceptance closure:

| Severity | Classification Signal | Required BA Action |
| :--- | :--- | :--- |
| Minor | No acceptance-criteria intent change; no route/API/test-id/accessibility contract change; no security/architecture invariant impact | Accept and log in CR "Deviations Accepted" with rationale/evidence reference |
| Major | Changes acceptance-criteria intent/semantics, or changes route/API/test-id/accessibility contracts, or affects security/architecture constraints | Escalate to Human User before closure; record decision outcome in CR |

If uncertain between minor and major, treat as major and escalate.

---

## General Invariants

### 1. Traceability Invariant
Every ID mentioned in the `$LLM_JOURNEY_LOG` (e.g., `CR-XXX`, `ADR-XXX`) **MUST** have a corresponding artifact in the relevant directory (`$LLM_JOURNEY_WORKFLOW_REQUIREMENTS`, `$LLM_JOURNEY_WORKFLOW_PLANS`, `$LLM_JOURNEY_WORKFLOW_REPORTS`, `agent-docs/decisions/`). Do not reference identifiers that do not exist as files.

### 2. E2E Selector Invariant
When a CR modifies **routes**, **`data-testid` attributes**, or **accessibility/semantic contracts**, the Tech Lead **MUST** include a Testing Agent task to update affected E2E tests. For pure page structure/class refactors with unchanged contracts, a Testing handoff is optional only if contract stability evidence is documented per the Testing Handoff Trigger Matrix.

*Example*: If CR-004 changes `/transformer` to `/foundations/transformers`, the E2E test asserting `href="/transformer"` must be updated in the same CR.

### 3. Historical Artifact Invariant (CRs)
Closed CRs are immutable records and must not be normalized retroactively.
- Legacy format variance across older CRs is acceptable.
- Standardization requirements apply to new CRs going forward.
- If historical evidence needs clarification, append an amendment note or create a linked follow-up artifact rather than rewriting intent/history.
- **Retention policy**: Closed CR artifacts in `$LLM_JOURNEY_WORKFLOW_REQUIREMENTS`, `$LLM_JOURNEY_WORKFLOW_PLANS`, and `$LLM_JOURNEY_WORKFLOW_REPORTS` are **retained, not deleted**. Archive/index strategies (moving older artifacts to a subdirectory, creating a searchable index) are permitted for organizational improvement. Deletion of closed CR artifacts requires explicit Human User authorization and is out of scope for any standard CR.

### 4. Scope Extension Invariant
When execution feedback expands work beyond the approved handoff (for example touching additional routes, introducing shared abstractions, or changing ownership boundaries), implementation must pause until `scope extension approved` is explicitly recorded by the decision owner (Tech Lead for technical scope, User for direct override).
- Direct in-session Human User instruction qualifies as explicit approval when recorded as `scope extension approved by user`.
- Direct Human User approval does not bypass role ownership; cross-owned edits still require delegation or role reassignment.
- Before implementation resumes, artifact sync is required in CR + plan + active handoff/report to preserve traceability of the approved delta.

### 5. Shared Component Blast-Radius Invariant
If a CR modifies shared UI under `app/ui/**`:
- The implementing agent MUST list impacted routes in preflight.
- The completion report MUST include a regression sanity check for each impacted route (at minimum: render integrity and primary interactive surface visibility).
