# CR-020 Artifact Foldering Feasibility Analysis

**Date:** 2026-02-26
**Owner:** Tech Lead (CR-020 scope item — AC-7)
**Status:** Completed — recommendation produced for Human User decision.

---

## Context

As of 2026-02-26, `agent-docs/requirements/` and `agent-docs/plans/` contain 20+ CR artifacts in flat
directories. CR-019 meta-analysis (Pointer 3) flagged this as a potential discoverability concern at
scale (~100+ files projected within ~1 year at current pace of 1–2 CRs/week).

This document evaluates four options for organizing CR artifacts to improve discoverability while
preserving the traceability invariants established in `agent-docs/workflow.md`.

---

## Traceability Invariants (Must Preserve)

Per `workflow.md` Historical Artifact Invariant and Traceability Invariant:
- Every CR ID in `project-log.md` must have a corresponding artifact in `requirements/`, `plans/`, or `reports/`.
- Canonical paths in templates, handoff files, and process docs must remain stable.
- Closed CR artifacts are immutable records (Historical Artifact Invariant — retained, not deleted).

Any option that breaks canonical path stability or forces path changes on existing references is
disqualifying unless the migration cost is explicitly accepted by the Human User.

---

## Option A: Status Quo (Flat Directories)

**Description:** No structural change. All CRs remain as flat files in `requirements/`, `plans/`,
`reports/`.

### Pros
- Zero migration cost.
- All canonical paths remain stable — no template, handoff, or process doc updates needed.
- No new process step or maintenance burden introduced.
- Works correctly at current scale (<30 CRs).

### Cons
- Directory will contain 100+ files within ~1 year at current pace.
- No grouping signal — active and closed CRs are mixed regardless of status.
- Discovery requires knowing CR-ID or using grep.

### Compatibility
Full. No changes to any canonical path, template, or workflow rule.

### Migration Impact
None.

### Recommendation
Sufficient for current scale. Revisit when count exceeds 50 files per directory.

---

## Option B: Archive Subdirectory (Rolling Window)

**Description:** Add `requirements/archive/` and `plans/archive/` subdirectories. Move CRs older than
the rolling visible window (4 most recent, matching the project-log model) into the archive after closure.

### Pros
- Active CRs remain highly visible in the root directory — reduced noise.
- Archived artifacts remain accessible for historical reference.
- Aligns conceptually with the existing project-log Archive pattern.
- Minimal ongoing maintenance: one archive-move action per CR closure cycle.

### Cons
- **Canonical paths change when a CR is archived.** Any agent-docs file, plan, or handoff that
  cross-references the pre-archive path (e.g., `requirements/CR-015-slug.md`) will produce a broken
  reference after the move.
- Agents must know to check both root and archive directories when searching for older artifacts.
- Archive trigger (when to move) adds a new process step that must be documented and enforced.
- Moving an immutable artifact is a potentially irreversible action if the move is not tracked.

### Compatibility
Partial. Pre-existing cross-references to moved CRs break silently. Mitigation requires:
1. Auditing all `agent-docs/` files for CR-path cross-references before any archive move.
2. Updating all broken references as part of the archive operation.
3. Documenting the archive trigger (e.g., "4 most recent CRs remain in root") in `workflow.md`.

### Migration Impact
Medium. Estimated effort for initial migration (moving CRs 1–16 to archive): one agent session.
Ongoing cost: one cross-reference audit per archive cycle.

### Recommendation
Viable as a deferred upgrade when directory count exceeds 50 files. Not recommended for immediate
implementation — path-breakage cost exceeds benefit at current scale. Add to project-log Next
Priorities as a trigger-based backlog item.

---

## Option C: CR-Scoped Folder per CR

**Description:** Each CR gets its own dedicated folder: `agent-docs/cr/CR-020/requirement.md`,
`agent-docs/cr/CR-020/plan.md`, `agent-docs/cr/CR-020/conversations/`. All CR artifacts co-located
under their CR ID.

### Pros
- Maximum discoverability — all artifacts for a CR in one place.
- Supports parallel CR execution (each CR has its own namespace with no file-name collision).
- Logical grouping eliminates the flat-directory discovery problem entirely.

### Cons
- **Full migration required.** All 20+ existing artifacts must move.
- Breaks every canonical path referenced in templates, workflow docs, role docs, and handoff files.
- The `project-log.md` Traceability Invariant assumes paths under `requirements/`, `plans/`,
  `reports/` — all process docs need updating.
- Any incomplete migration creates a period of broken cross-references across agent-docs.
- Significant re-training cost: all agent roles use the existing directory conventions.

### Compatibility
Low. Full migration of 20+ existing artifacts plus updates to all templates, handoffs, `workflow.md`,
`AGENTS.md`, and role docs required. Estimated affected files: 25+.

### Migration Impact
High. Estimated effort: 2–3 agent sessions for migration plus process doc updates.

### Recommendation
Defer indefinitely. Benefit does not justify migration cost at current scale. Revisit only if parallel
CR execution becomes a concrete operational requirement forcing CR-namespace isolation.

---

## Option D: Index File (No Structural Change)

**Description:** Add `agent-docs/requirements/INDEX.md` listing all CRs with their ID, title, status,
date, and artifact path. Optionally mirror at `agent-docs/plans/INDEX.md`. No directory restructuring.

### Pros
- **Zero migration cost** — no existing paths change.
- Immediate discoverability improvement via a single well-known lookup file.
- Compatible with all existing canonical paths, templates, and process docs.
- Easy to backfill for existing CRs (one-time effort, ~30 minutes).
- BA can update the index as part of the acceptance phase closure steps.
- Extensible: add status tags, complexity, date, or search-friendly metadata without any structural change.

### Cons
- Index must be kept current — adds one maintenance step per CR closure.
- Does not eliminate the flat-file discovery problem for agents that bypass the index.
- Index itself is an additional artifact; it can drift if not maintained.

### Compatibility
Full. No changes to any canonical path, template, or workflow rule.

### Migration Impact
Low. Backfill entries for all existing CRs (one agent session). Update BA acceptance phase checklist
to include "update INDEX.md" as a closure step.

### Recommendation
**Implement now.** Provides immediate discoverability improvement at minimal cost. Best near-term
solution for the current scale problem.

---

## Recommendation Summary

| Timeline | Option | Rationale |
| :--- | :--- | :--- |
| **Now (< 50 CRs)** | **Option D** (Index File) | Zero migration cost; immediate discoverability; no path breakage; low maintenance. |
| **Medium term (50–100 CRs)** | **Option B** (Archive Subdirectory) | Active/historical separation; moderate migration cost acceptable at this scale. Trigger-based deferral. |
| **Long term** | Revisit C or hybrid | Only if parallel CR execution or team scaling creates a genuine namespace-collision need. |

### Immediate Action for Option D (if approved)

1. Tech Lead creates `agent-docs/requirements/INDEX.md` with backfilled entries for all existing CRs.
2. BA acceptance phase adds a step: update the index when closing each CR.
3. Handoff templates optionally reference the index as a discovery aid (no canonical-path change).

Estimated effort: `[S][DOC]` — one agent session for index creation and backfill. Can be executed as
an inline action in a subsequent BA acceptance phase, or as a standalone micro-CR.

---

## Decision Required from Human User

| Option | Direction |
| :--- | :--- |
| **Option D (Index File)** — implement now | Approve as follow-up `[S][DOC]` task? |
| **Option B (Archive Subdirectory)** — defer to trigger | Add to project-log Next Priorities at count > 50? |
| **Option C (CR-Scoped Folder)** — long-term only | Explicitly defer to long-term backlog? |
