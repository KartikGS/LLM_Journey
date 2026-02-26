# Meta Improvement Protocol

## Purpose
Standardize how agents capture, synthesize, and implement documentation/process improvement feedback through a hybrid model:
- CR-linked meta analysis for execution friction,
- recurring alignment cycles for structural agent-doc evolution.

## When To Use
Use this protocol when the user asks for:
- feedback on agent docs after a completed CR,
- instruction-conflict audits,
- process clarity or governance improvements,
- template/role-doc consistency cleanup.

---

## Operating Model (Hybrid)

### Mode A — CR-Linked Meta (Default)
Use this after normal CR execution to capture concrete friction from real implementation.

Cadence:
- **Lightweight pass (default for every completed CR):** one synthesis-owner pass (usually Tech Lead) that records top findings and lens impact.
- **Full three-phase chain (conditional):** run only when at least one trigger is true:
  - blocking contradiction or authority-boundary ambiguity was observed,
  - security/contract drift risk is identified,
  - 3+ distinct findings are captured in the lightweight pass,
  - periodic checkpoint reached (recommended: every 3 completed CRs),
  - a role health threshold is crossed (see Role Health Indicators below).

This prevents the full meta chain from serializing every CR while preserving deep analysis when needed.

### Mode B — Agent Docs Alignment Cycle (Recurring, Standalone)
Use this for structural evolution that should not wait for a specific CR (portability split, collaboration throughput, doc architecture refactors).

Execution pattern:
1. Build/update alignment backlog from recent Mode A findings.
2. Prioritize into small independent chunks.
3. Execute each chunk as `[S][DOC][ALIGN]` and close it fully before the next chunk.
4. Feed outcomes back into role/workflow docs and future Mode A prompts.

Chunk-size constraints (mandatory):
- One chunk should target one concern and remain reviewable in one pass.
- Recommended upper bound: 1-3 files changed, wording/structure only, no authority-boundary changes without explicit user approval.
- Each chunk must include rollback-safe wording (minimal reversible edits).

---

## Mandatory Evolution Lenses

Every Mode A and Mode B finding must be assessed through these three lenses:

1. **Portability Boundary Lens**: Is the instruction reusable across projects, or project-specific?
   - Reusable rules belong in role/coordination docs as general policy.
   - Project-specific details (paths, route names, environment quirks) should remain in project-scoped docs/examples.
2. **Collaboration Throughput Lens**: Does this rule force unnecessary serialization?
   - Flag steps that block parallel CR work without safety value.
   - Prefer conditional gates over always-on ceremony when safety is unchanged.
3. **Evolvability Lens**: Does this change reduce future edit cost?
   - Prefer canonical-source + cross-reference over duplicated policy text.
   - Prefer modular sections that can be updated independently.

---

## Mode A — CR-Linked Meta Flow (Three Phases)

### Lightweight Pass (Default Per CR)

When full three-phase analysis is not triggered, produce a lightweight synthesis note:
- **Owner:** Tech Lead (default) or BA when requirement/template clarity is primary.
- **Output:** `agent-docs/meta/META-YYYYMMDD-<CR-ID>-lightweight.md`
- **Template:** `agent-docs/coordination/TEMPLATE-meta-lightweight.md`
- **Required contents:**
  - top 1-5 findings,
  - lens impact summary (portability/collaboration/evolvability),
  - recommendation: `no-full-chain-needed` or `escalate-to-full-chain` with trigger rationale.

If lightweight output recommends escalation, proceed with full Phase 1 -> Phase 2 -> Phase 3 flow below.

### Phase 1 — Per-Agent Findings

**Execution order: downstream-first.**
Sub-agents run first (closest to implementation friction), then Tech Lead, then BA.

For CR-triggered meta-analysis, the typical order is:
`Backend / Frontend / Infra / Testing → Tech Lead → BA`

**Session type:** The same session that executed the CR, or a resumed session with full CR context. Execution context makes findings concrete and grounded — an agent that just ran the handoff will identify friction that a cold session would miss.

**Carry-forward rule (mandatory):** Each subsequent agent's session prompt must include all prior agents' findings files as context. Each agent:
- Validates, refutes, or extends prior findings from their own role's perspective.
- Adds findings specific to their own role experience.

This layered approach means upstream agents (Tech Lead, BA) do not need to re-discover what downstream agents already found — they evaluate and build on it.

**BA entry-point check**: If prior findings files are already provided as session context, this check is satisfied and BA may proceed directly to findings production. Otherwise, before beginning BA findings, verify that Backend (or other downstream sub-agent) and Tech Lead findings files exist for this CR in `agent-docs/meta/`. If they do not exist, pause and request the missing agent meta sessions before proceeding. BA findings without carry-forward context are incomplete per this protocol.

**Standard session prompt (use verbatim when starting each Phase 1 agent session):**

```
You are a <Role> Agent operating in meta-improvement mode for the LLM Journey project.

This is a resumed session. You have full context of your <CR-ID> execution.

Your task: produce your findings file at:
`agent-docs/meta/META-YYYYMMDD-<CR-ID>-<role>-findings.md`

Follow Phase 1 of `agent-docs/coordination/meta-improvement-protocol.md` for the required
file format. Create the `agent-docs/meta/` directory if it does not yet exist.

[Include the following block for every agent except the first:]
Prior findings to review and assess (carry-forward — mandatory):
- @agent-docs/meta/META-YYYYMMDD-<CR-ID>-<prior-role>-findings.md
[Add one line per prior findings file in execution order]

Use these 8 categories to guide your analysis:
1. Conflicting Instructions — did any two doc sections give contradictory guidance?
2. Redundant Information — is the same rule written in multiple places without a declared canonical source?
3. Missing Information — what would have made a specific decision easier or removed a judgment call?
4. Unclear Instructions — what wording created hesitation, ambiguity, or two plausible readings?
5. Responsibility / Scope Concerns — are any role boundaries wrong, missing, or friction-producing?
6. Engineering Philosophy Concerns — does any doc reflect an unacknowledged trade-off or undocumented position?
7. Redundant Workflow Steps — which steps produced no value relative to their ceremony cost?
8. Other Observations — anything else worth capturing for process improvement.

For each non-trivial finding, add lens tags:
- `portability` (cross-project reusable vs project-specific placement),
- `collaboration` (parallelism/serialization impact),
- `evolvability` (future doc maintenance cost).

Ground every finding in a specific moment from your CR execution (file read, decision made,
judgment call required). Avoid generic observations.

Finally, produce a `## Top 5 Findings (Ranked)` section at the bottom of your file.
List your 5 highest-impact findings, one line each:
`[ID] | [one-line summary] | [affected doc / section] | [lens tags]`
Phase 2 synthesis reads this section only — not the full file.
```

**Output per agent:**
`agent-docs/meta/META-YYYYMMDD-<CR-ID>-<role>-findings.md`
> Note: Create the `agent-docs/meta/` directory if it does not yet exist before writing findings files.

#### Per-Agent Findings File Format

```markdown
# Meta Findings: <Role> — <CR-ID>

**Date:** YYYY-MM-DD
**CR Reference:** <CR-ID>
**Role:** <role>
**Prior findings reviewed:** [list files, or "none" if first agent]

---

## Conflicting Instructions
- [Finding or "none"]

## Redundant Information
- [Finding or "none"]

## Missing Information
- [Finding or "none"]

## Unclear Instructions
- [Finding or "none"]

## Responsibility / Scope Concerns
- [Finding or "none"]

## Engineering Philosophy Concerns
- [Finding or "none"]

## Redundant Workflow Steps
- [Finding or "none"]

## Other Observations
- [Finding or "none"]

## Lens Coverage (Mandatory)
- Portability Boundary: [summary of reusable vs project-specific placement gaps]
- Collaboration Throughput: [summary of serialization/parallelism friction]
- Evolvability: [summary of canonical-source and edit-surface implications]

## Prior Findings: Assessment
(Only present if prior findings files were provided)
- [Prior finding ID or summary] → Validated / Refuted / Extended — [one-line rationale]

## Top 5 Findings (Ranked)
1. [ID] | [one-line summary] | [affected doc / section] | [lens tags]
2. [ID] | [one-line summary] | [affected doc / section] | [lens tags]
3. [ID] | [one-line summary] | [affected doc / section] | [lens tags]
4. [ID] | [one-line summary] | [affected doc / section] | [lens tags]
5. [ID] | [one-line summary] | [affected doc / section] | [lens tags]

(Max 5. Rank by impact. Phase 2 synthesis reads this section only — not the full file.)
```

---

### Phase 2 — Synthesis

**Session type: New session — NOT the agent that executed the CR.**

Synthesis requires editorial judgment without ownership bias over prior implementation decisions. The findings files carry sufficient context forward; the synthesis agent does not need to remember why decisions were made, only whether the doc gaps that caused friction should be fixed.

**Synthesis owner:** Tech Lead role for technical/coordination findings. BA role for findings about requirement clarity, CR templates, and workflow scope. For a combined synthesis, use Tech Lead — they can flag BA-scoped items for BA review.

**Standard session prompt (use verbatim when starting the synthesis session):**

```
You are a Tech Lead operating in meta-improvement mode for the LLM Journey project.

Attached are per-agent findings files from a <CR-ID> meta-analysis:
- [list findings files with paths]

Your task:
1. Read ONLY the `## Top 5 Findings (Ranked)` section from each findings file — not the full files.
2. De-duplicate overlapping findings across agents.
3. Assign consolidated priority: High (blocks agent effectiveness) / Medium (friction or confusion) / Low (polish).
4. For each finding, decide: Fix | Defer | Reject — with a one-line rationale.
5. Before finalizing, cross-reference the most recent prior synthesis Fix table (`agent-docs/meta/META-*-synthesis.md`) for overlapping items. Flag any finding that may already have been addressed as a regression risk (⚠️) — the implementing agent will confirm current file state.
6. For any Fix items that span multiple chunks and require consistent vocabulary (e.g., a renamed term used in two files), pre-decide the exact term in the synthesis document. Do not leave cross-chunk vocabulary to be resolved independently by implementing agents.
7. Group Fix items into implementation chunks (1-3 files per chunk) that can execute independently. Include a "Cross-chunk coordination notes" section for items spanning multiple chunks.

Do NOT propose before/after wording. That is written by the implementing agent during Phase 3.

Output: agent-docs/meta/META-YYYYMMDD-<CR-ID>-synthesis.md

This is NOT a CR execution session. Do not write plans, handoffs, or code.
Do not treat prior implementation decisions as correct by default — evaluate each finding on its merits.
```

**Output:** `agent-docs/meta/META-YYYYMMDD-<CR-ID>-synthesis.md`

#### Synthesis File Format

```markdown
# Meta Synthesis: <CR-ID>

**Date:** YYYY-MM-DD
**Findings sources:** [list findings files]
**Synthesis agent:** Tech Lead (meta-improvement mode)

---

## Summary
(1–3 sentences on the overall doc health signal from this CR's meta-analysis)

---

## Fix Items
| # | Finding Summary | Source Role(s) | Affected Doc + Section | Priority | Rationale |
|---|---|---|---|---|---|
| F1 | ... | Backend | `backend.md` / Boundaries | High | ... |

## Deferred / Rejected
| # | Finding Summary | Decision | Rationale |
|---|---|---|---|

## Implementation Chunks (for Phase 3)
| Chunk | Fix Items | Target Files (1-3) | Notes |
|---|---|---|---|

---

## Decision Needed
Items requiring Human User input before proceeding.
- [Item or "none"]
```

> **Note:** No before/after wording in the synthesis. The implementing agent reads the target doc and writes the wording change during Phase 3 execution.

---

### Phase 3 — Human Approval + Implementation

1. Human User reviews the synthesis doc and marks each item: **approved** / **rejected** / **deferred**.
2. Approved changes are implemented in **small independent chunks**:
   - Default: doc-only CR per chunk (`CR-XXX-<slug>.md`, recommended tags `[S][DOC][ALIGN]`).
   - Inline edits by Tech Lead only for small, isolated wording fixes in one localized section.
   - Do not batch unrelated fixes into one large doc sweep if they can ship independently.
   - **Wording is written here, not in Phase 2**: The implementing agent reads the target doc section and proposes before/after wording at the time of implementation. The synthesis doc identifies *what* to fix and *where*; the implementing CR defines *how*.
3. BA validates closure if changes touch requirement templates, workflow phase definitions, or role authority boundaries.
4. Implemented changes are logged in `agent-docs/project-log.md`.
5. If approved items exceed one chunk, schedule the remaining approved chunks in `project-log.md` `Next Priorities` so evolution continues without blocking feature CR throughput.

---

## Mode B — Agent Docs Alignment Flow (Standalone)

Use this when the goal is agent-doc architecture evolution rather than post-CR forensics.

### Alignment Phase A — Backlog Curation
Inputs:
- recent Mode A synthesis files,
- unresolved deferred items,
- recurring friction from role sessions.

Output:
- `agent-docs/meta/ALIGN-YYYYMMDD-backlog.md` with entries tagged by lens (`portability`, `collaboration`, `evolvability`).
- Recommended template: `agent-docs/coordination/TEMPLATE-align-backlog.md`.

### Alignment Phase B — Chunk Planning
For each selected alignment item, define:
- target docs,
- expected impact,
- rollback note,
- owner (Tech Lead, BA, or joint).

Output:
- one chunk plan per item or small bundle, mapped to a doc-only CR.

### Alignment Phase C — Incremental Implementation
Execute chunk plans one at a time.
- Keep each chunk small and independently reviewable.
- Re-run lens check during closure to confirm the change actually improved portability/collaboration/evolvability.
- Record residual items in `project-log.md` `Next Priorities`.

This mode is intended to run in parallel with feature CRs without forcing a full meta chain on every CR.

---

## Decision Ownership

| Finding Category | Synthesis Owner | Final Approver |
|---|---|---|
| Handoff template gaps, coordination protocol issues | Tech Lead | User |
| Role boundary ambiguities, ownership matrix gaps | Tech Lead | User |
| CR template gaps, requirement clarity, scope definition | BA | User |
| Workflow step redundancy, phase sequencing | Tech Lead proposes, BA ratifies | User |
| Portable vs project-specific instruction boundary changes | Tech Lead + BA jointly | User |
| Collaboration throughput/cadence changes to meta procedure | Tech Lead proposes, BA ratifies | User |
| Cross-cutting policy (affects multiple roles) | Tech Lead + BA jointly | User |

---

## Role Health Indicators

Workflows accumulate responsibilities over time. Use these signals to detect when a role or workflow phase has grown beyond what a single session can hold effectively.

**Primary input surface:** The `## Workflow Health Signal` section of `agent-docs/coordination/TL-session-state.md` (populated per-session during CR execution). Secondary input: the Workflow Health Signal section of the lightweight meta pass (post-CR synthesis). Together these give both real-time and post-hoc health data per CR.

### Threshold Definitions

| Signal | Threshold | Automatic Action |
|---|---|---|
| Role doc line count | > 350 lines | Flag in next lightweight pass; schedule a Mode B scope review if confirmed in 2 consecutive CRs |
| Context saturation (same phase) | Reported in 2+ consecutive lightweight passes for the same role phase | Escalate to `role-scope-review` in Mode A; schedule as Mode B item |
| Unfixed carry-forward finding | Same finding class appears across 3+ consecutive meta analyses | Force-promote to High in the next synthesis regardless of re-assessed priority |
| Responsibility accumulation | A role doc section count exceeds 10 distinct H2 sections | Review whether sections belong to the same role or should split into a sub-session or new role |

### Response Levels

- **Flag** — record in the lightweight pass Workflow Health Signal. No immediate action required.
- **Mode B item** — schedule a `[S][DOC][ALIGN]` chunk to redistribute, clarify, or split the affected role responsibility.
- **Role scope review** — a dedicated analysis session (not tied to a specific CR) to decide: redistribute responsibilities within the role, formalize a two-session execution model, or introduce a new role. Output is a proposal for user approval before any role authority changes are made.

### Role Scope Review: guiding questions

When a role scope review is triggered, answer these before proposing changes:
1. Which phase of the role's execution is hitting context pressure — planning, execution, or verification?
2. Is the pressure from accumulated responsibilities (role doc growth) or from data volume (reading many files per CR)?
3. Can the responsibility be moved to an adjacent phase (e.g., sub-agent does more self-verification) without creating a new handoff ceremony?
4. Would a defined two-session model (Phase A / Phase B) within the same role reduce pressure without requiring a new role doc?
5. If a new role is warranted: does it have a distinct authority boundary, a distinct execution context, and a non-overlapping file ownership zone?

---

## Guardrails

- Do not silently mutate role authority boundaries.
- Do not rewrite historical closed CRs to retrofit new policy wording.
- If two docs conflict, resolve by updating one source-of-truth section and adding a cross-reference — never duplicate policy text.
- Do not store project-specific constants/paths in reusable policy sections when a project-scoped section can hold them.
- Do not require full multi-agent meta chains for every CR by default; use trigger-based escalation.
- Do not execute alignment work as a single monolithic rewrite when it can be shipped in independent chunks.
- Synthesis agent must NOT treat prior implementation decisions as correct by default. Evaluate each finding on its merits.
- Findings files are role-scoped artifacts. Keep them separate during Phase 1 — do not merge per-agent findings into a single file. Attribution and independent validation depend on this separation.
- A meta-analysis session is not a CR execution session. Synthesis agents must not produce plans, handoffs, or code. Output is doc change proposals only.
