# Technical Plan — CR-020: CR Process Hardening and Artifact Organization

## Technical Analysis

CR-020 operationalizes 5 agreed meta-analysis outcomes from CR-019. All changes are agent-docs
documentation updates — process templates, workflow guidance, and a feasibility analysis artifact.
No feature code is touched. All files are within Tech Lead direct-change authority.

Key technical scope:
1. Handoff templates (Backend, Testing, TL-to-BA) need execution-checklist and exact-path sections.
2. `TL-session-state.md` needs a gap-items/known-risks section and execution checklist.
3. `workflow.md` needs CR-scoped naming guidance and explicit retention policy language.
4. A foldering feasibility artifact must be produced.
5. Git strategy deferment must be explicitly recorded (already in project-log; confirm sufficiency).

---

## Discovery Findings

### Template Audit

| Template | Execution Checklist? | Exact Artifact Paths? |
| :--- | :--- | :--- |
| `TEMPLATE-tech-lead-to-backend.md` | No | No |
| `TEMPLATE-tech-lead-to-testing.md` | No | No |
| `TEMPLATE-tech-lead-to-frontend.md` | No | No |
| `TEMPLATE-tech-lead-to-ba.md` | No | No |
| `TL-session-state.md` | No | No |

### workflow.md Audit

- Conversation File Freshness Rule (lines 62-68): no CR-scoped naming guidance present.
- Historical Artifact Invariant (lines 222-228): states closed CRs are immutable records; no explicit retention/deletion policy statement present.
- No prefilled freshness-stub example exists.

### project-log.md AC-8 Check

Next Priorities already contains: `[S][DOC] Parallel-CR git flow decision (deferred): One-branch-per-CR policy and CR-number collision strategy explicitly deferred pending later user decision.`

This satisfies the intent of AC-8. The plan will confirm this is the canonical record and add a corroborating note in `workflow.md` for process-doc completeness.

### Contract Delta

No routes, data-testids, or accessibility contracts affected. Backend-owned files untouched.
Testing Handoff Trigger Matrix: not triggered (doc-only CR). No E2E required.

---

## Configuration Specifications

None — this CR has no config changes.

---

## Implementation Decisions (Tech Lead Owned)

**Decision 1: Execution checklist scope**
- AC-1 specifies "Backend/Testing/Tech Lead handoff templates." "Tech Lead" interpreted as:
  (a) `TL-session-state.md` (TL's own execution artifact — gains a checklist section), and
  (b) incidentally improves `TEMPLATE-tech-lead-to-ba.md` for AC-3 (exact paths).
- Frontend template: exact-path section added for consistency (minor scope extension within
  same file category; no additional delegation or risk).

**Decision 2: Exact-path section placement**
- Add a `## Exact Artifact Paths (Mandatory)` section early in each handoff template,
  before `Objective`, so agents see it immediately.
- Include: requirement path, plan path, upstream report path (when sequential), report-back path.

**Decision 3: CR-scoped naming guidance location**
- Add to `workflow.md` Conversation File Freshness Rule section as an extension paragraph.
- Include compatibility note: freshness check mechanism is unchanged; naming convention
  applies to ephemeral coordination files only (not canonical role-pair files like
  `backend-to-tech-lead.md`).

**Decision 4: Retention policy location**
- Add an explicit retention statement to `workflow.md` General Invariants section (Historical
  Artifact Invariant). The existing invariant says CRs are immutable — augment it with an
  explicit "retained, not deleted" clause and "archive/index allowed" note.

**Decision 5: Foldering feasibility — options**
- Four options evaluated in the feasibility artifact:
  - A: Status quo (flat directories)
  - B: Archive subdirectory (rolling window, matching project-log model)
  - C: CR-scoped folder per CR (full folder isolation)
  - D: Index file (no structural change, searchable catalog)
- Recommendation: Option D (index file) for near-term (<50 CRs); Option B as a deferred
  upgrade when directory count triggers the backlog threshold. Option C deferred indefinitely
  due to canonical-path migration cost.

**Decision 6: Execution mode**
- Single session — no Backend+Testing sub-agents. Two-session model does not apply.
- All changes are direct Tech Lead writes.

---

## Critical Assumptions

- All `TEMPLATE-*.md` files in `agent-docs/conversations/` are within TL direct-change authority.
- `workflow.md` edits follow the "canonical source + cross-reference" principle — no policy text
  is duplicated; the workflow.md section remains the single source.
- Freshness gate is not weakened by CR-scoped naming guidance (naming applies to ephemeral
  per-CR coordination files; the gate mechanism itself is unchanged).
- `project-log.md` Next Priorities entry for git strategy is sufficient for AC-8; a corroborating
  note in `workflow.md` completes the process-doc evidence.

---

## Proposed Changes

### Tech Lead Direct Changes

| File | Change | AC |
| :--- | :--- | :--- |
| `agent-docs/conversations/TEMPLATE-tech-lead-to-backend.md` | Add `Exact Artifact Paths` + `Execution Checklist` sections | AC-1, AC-3 |
| `agent-docs/conversations/TEMPLATE-tech-lead-to-testing.md` | Add `Exact Artifact Paths` + `Execution Checklist` sections | AC-1, AC-3 |
| `agent-docs/conversations/TEMPLATE-tech-lead-to-frontend.md` | Add `Exact Artifact Paths` section | AC-3 |
| `agent-docs/conversations/TEMPLATE-tech-lead-to-ba.md` | Add `Exact Artifact Paths` section | AC-3 |
| `agent-docs/coordination/TL-session-state.md` | Overwrite: new template structure with `Execution Checklist`, `Exact Artifact Paths`, `Gap Items / Known Risks`, prefilled freshness stub | AC-1, AC-2, AC-5 |
| `agent-docs/workflow.md` | Add CR-scoped naming guidance to Freshness Rule; add explicit retention policy to Historical Artifact Invariant; add freshness prefilled stub note | AC-4, AC-5, AC-6, AC-8 |
| `agent-docs/plans/CR-020-foldering-feasibility.md` (new) | Feasibility analysis: 4 options, migration/compatibility impact, recommendation | AC-7 |
| `agent-docs/plans/CR-020-plan.md` | This file | — |
| `agent-docs/conversations/tech-lead-to-ba.md` | CR-020 completion handoff with AC evidence + verification gate results | AC-9 |

---

## Contract Delta Assessment

No contract changes — doc-only scope. No routes, data-testids, or accessibility semantics affected.

---

## Architectural Invariants Check

- [x] **Observability Safety**: Not affected (no code changes).
- [x] **Security Boundaries**: Not affected (no code changes).
- [x] **Telemetry failure boundary**: Not affected.
- [x] **Component Rendering Strategy**: Not affected.
- [x] **Traceability Invariant**: All new artifacts are referenced from CR-020 plan and project-log.
- [x] **Historical Artifact Invariant**: No closed CRs are modified.

---

## Delegation & Execution Order

| Step | Owner | Task Description |
| :--- | :--- | :--- |
| 1 (direct) | Tech Lead | Update 4 handoff templates (Backend, Testing, Frontend, TL-to-BA) |
| 2 (direct) | Tech Lead | Overwrite TL-session-state.md with improved template |
| 3 (direct) | Tech Lead | Update workflow.md (naming guidance, retention policy, freshness stub) |
| 4 (direct) | Tech Lead | Create foldering feasibility artifact |
| 5 (direct) | Tech Lead | Run verification gates + write tech-lead-to-ba.md |

---

## Delegation Graph

- **Execution Mode**: N/A — no sub-agent delegation. All changes within Tech Lead direct authority.
- **Single session**: Doc-only CR with no Backend/Testing sub-agents; two-session model does
  not trigger (per tech-lead.md: "Apply this model for any CR with both Backend AND Testing
  sub-agents. Single-sub-agent CRs may fit in one session.").
- **Final Verification Owner**: Tech Lead runs all quality gates directly.

---

## Operational Checklist

- [x] **Environment**: No hardcoded values (doc-only CR).
- [x] **Observability**: Not applicable (no code changes).
- [x] **Artifacts**: No .gitignore entries needed.
- [x] **Rollback**: Revert `.md` file changes via git. No structural side-effects.

---

## Definition of Done (Technical)

- [ ] `TEMPLATE-tech-lead-to-backend.md` has `Exact Artifact Paths` and `Execution Checklist` sections (AC-1, AC-3).
- [ ] `TEMPLATE-tech-lead-to-testing.md` has `Exact Artifact Paths` and `Execution Checklist` sections (AC-1, AC-3).
- [ ] `TL-session-state.md` template has `Execution Checklist`, `Gap Items / Known Risks`, `Exact Artifact Paths`, and prefilled freshness stub (AC-1, AC-2, AC-5).
- [ ] `workflow.md` has CR-scoped naming guidance and explicit retention/deletion policy (AC-4, AC-6, AC-8).
- [ ] `workflow.md` has prefilled freshness stub guidance (AC-5).
- [ ] `agent-docs/plans/CR-020-foldering-feasibility.md` exists with ≥2 options, migration impact, and recommendation (AC-7).
- [ ] Git strategy deferment is explicitly recorded in `workflow.md` and confirmed in `project-log.md` (AC-8).
- [ ] `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` all pass (AC-9).
- [ ] `tech-lead-to-ba.md` written with per-AC evidence and verification command results.
