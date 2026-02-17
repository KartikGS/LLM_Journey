# META Report: BA Agent Doc Feedback Audit

## Context
- Date: 2026-02-17
- Trigger: Human User requested a meta-analysis session to improve BA effectiveness and agent-doc clarity.
- Scope audited:
  - `agent-docs/AGENTS.md`
  - `agent-docs/workflow.md`
  - `agent-docs/roles/ba.md`
  - `agent-docs/roles/tech-lead.md`
  - `agent-docs/coordination/handoff-protocol.md`
  - `agent-docs/testing-strategy.md`
  - `agent-docs/technical-context.md`
  - `agent-docs/project-principles.md`
  - Conversation templates under `agent-docs/conversations/TEMPLATE-*`

## Observed Issues
1. BA output requirement is too absolute for non-CR sessions.
   - `agent-docs/roles/ba.md:110` says every BA task must produce full CR-flow artifacts.
   - This conflicts with procedural/meta sessions that may only require analysis or a report.

2. Clarification requirement is internally tense.
   - `agent-docs/roles/ba.md:200` says BA must always ask at least one clarifying/challenging question.
   - `agent-docs/roles/ba.md:152` permits proceeding without questions for explicit procedural requests.
   - The exception exists, but the top-level rule language still creates hesitation.

3. Status model and templates are not fully aligned.
   - Canonical status vocabulary includes `in_progress` in `agent-docs/coordination/handoff-protocol.md:6-15`.
   - Sub-agent templates list only `completed|blocked|partial|needs_environment_verification` (for example `agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md:21`).

4. Terminology migration is incomplete.
   - `agent-docs/AGENTS.md:11-19` defines mandatory Human User vs Product End User terms.
   - Several sections still use generic "user" phrasing, creating ambiguity in some decision points (for example `agent-docs/workflow.md:85`, `agent-docs/workflow.md:124`, `agent-docs/workflow.md:150`).

5. BA handoff to Tech Lead lacks a canonical template.
   - There is a clarification-loop template (`TEMPLATE-ba-tech-lead-clarification.md`) but no standard `TEMPLATE-ba-to-tech-lead.md`.
   - This increases variation in quality and omitted sections risk.

6. Deviation severity classification is underspecified.
   - BA closure requires handling minor vs major deviations (`agent-docs/workflow.md:171-173`, `agent-docs/roles/ba.md:140`).
   - No formal rubric defines what qualifies as major.

## Conflict/Redundancy Analysis
### Conflicts / Tensions
- BA absolute artifact requirement vs procedural/meta tasks:
  - `agent-docs/roles/ba.md:110` vs decision-matrix procedural fast path `agent-docs/roles/ba.md:152`.

- Clarification mandate vs procedural exception:
  - `agent-docs/roles/ba.md:200` vs `agent-docs/roles/ba.md:201-202`.
  - Not a hard contradiction, but high potential for inconsistent behavior.

### Redundancy / Drift Risk
- Scope extension and Human User override policy appears in multiple places:
  - `agent-docs/workflow.md:124-131`, `agent-docs/workflow.md:198-203`, `agent-docs/coordination/handoff-protocol.md:97-109`.

- Clarification loop policy appears in multiple places:
  - `agent-docs/workflow.md:136-150`, `agent-docs/coordination/handoff-protocol.md:17-29`, `agent-docs/roles/ba.md:53-59`.

- AC evidence and CR immutability guidance appears in multiple places:
  - `agent-docs/workflow.md:162-170`, `agent-docs/roles/ba.md:139-143`, `agent-docs/requirements/README.md:27-47`.

- Tech Lead no-self-implementation/no-feature-code repeats:
  - `agent-docs/workflow.md:79`, `agent-docs/workflow.md:94-97`, `agent-docs/roles/tech-lead.md:47-93`.

Redundancy helps discoverability, but repeated policy text raises divergence risk when only one location is updated.

## Proposed Changes
### P0 (clarity/safety)
1. Update BA artifact rule with explicit exception classes.
   - Proposed change in `agent-docs/roles/ba.md`:
     - Replace "Every BA task must produce..." with "By default, BA tasks produce full CR artifacts; procedural/status/meta-feedback sessions may produce a scoped artifact set."

2. Harmonize status vocabulary across templates.
   - Add `in_progress` option (or remove from canonical list if not intended) in all sub-agent templates.
   - Keep exact token set synchronized with `agent-docs/coordination/handoff-protocol.md`.

3. Add `TEMPLATE-ba-to-tech-lead.md`.
   - Required blocks: Subject/Status, Scope summary, AC map, constraints, open decisions, risk register, evidence expectations.

### P1 (reduce ambiguity)
4. Complete terminology migration ("user" -> explicit actor).
   - Prioritize `agent-docs/workflow.md` and high-traffic templates.

5. Add deviation severity rubric.
   - Example table in `agent-docs/workflow.md` or `agent-docs/roles/ba.md`:
     - minor: no AC/contract behavior change
     - major: AC semantics changed, route/API/test contract changed, security/architecture implications

6. Consolidate policy duplication by making one source canonical and others reference it.
   - Keep canonical policy in:
     - status model: `handoff-protocol.md`
     - scope extension: `workflow.md` (single section)
     - BA closure: `workflow.md` + concise references elsewhere

### P2 (quality-of-life)
7. Add a "Meta Session Fast Path" section to BA role doc.
   - When user asks for retro/process feedback, required outputs:
     - `META-YYYYMMDD-<slug>.md`
     - optional CR draft only after user approves execution.

## Decision Needed
1. Do you want to keep the strict "full CR artifacts for every BA task" policy, or adopt scoped outputs for procedural/meta sessions?  
   - **Decision (2026-02-17):** Keep current policy for now; do not add meta-analysis fast-path language to agent docs in this cycle.
2. Should `in_progress` remain part of canonical handoff statuses?  
   - **Decision (2026-02-17):** Yes.
3. Do you want a dedicated BA->Tech Lead handoff template to be mandatory?  
   - **Decision (2026-02-17):** Yes.
4. Should deviation severity be formalized now (recommended) or deferred?  
   - **Decision (2026-02-17):** Formalize now.

## Approved Actions
- Apply decisions #2, #3, and #4 directly as documentation/process updates (no CR workflow for this cycle).
- Explicitly exclude "meta-analysis fast-path" additions from this cycle per decision #1.
