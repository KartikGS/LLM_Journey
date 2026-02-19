# Meta Improvement Protocol

## Purpose
Standardize how agents capture, synthesize, and implement documentation/process improvement feedback through a structured multi-agent meta-analysis flow.

## When To Use
Use this protocol when the user asks for:
- feedback on agent docs after a completed CR,
- instruction-conflict audits,
- process clarity or governance improvements,
- template/role-doc consistency cleanup.

---

## The Three-Phase Flow

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

**BA entry-point check**: Before beginning BA findings, verify that Backend (or other downstream sub-agent) and Tech Lead findings files exist for this CR in `agent-docs/meta/`. If they do not exist, pause and request the missing agent meta sessions before proceeding. BA findings without carry-forward context are incomplete per this protocol.

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

Ground every finding in a specific moment from your CR execution (file read, decision made,
judgment call required). Avoid generic observations.
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

## Prior Findings: Assessment
(Only present if prior findings files were provided)
- [Prior finding ID or summary] → Validated / Refuted / Extended — [one-line rationale]
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
1. De-duplicate overlapping findings across agents.
2. Prioritize each finding: High (blocks agent effectiveness) / Medium (causes friction or confusion) / Low (polish).
3. For each finding, decide: Fix | Defer | Reject — with a one-line rationale.
4. For Fix items: propose specific, minimal before/after wording for the affected doc and section.

Output: agent-docs/meta/META-YYYYMMDD-<CR-ID>-synthesis.md

This is NOT a CR execution session. Do not write plans, handoffs, or code.
Do not treat prior implementation decisions as correct by default — evaluate each finding on its merits.
Do not fix items by duplicating policy text across files; resolve by updating one source-of-truth location and cross-referencing.
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

## High Priority
| # | Finding Summary | Source Role(s) | Affected Doc + Section | Decision | Proposed Change |
|---|---|---|---|---|---|
| H1 | ... | Backend | `backend.md` / Boundaries | Fix | Before: ... / After: ... |

## Medium Priority
| # | Finding Summary | Source Role(s) | Affected Doc + Section | Decision | Proposed Change |
|---|---|---|---|---|---|

## Low Priority
| # | Finding Summary | Source Role(s) | Decision | Rationale |
|---|---|---|---|---|

## Deferred / Rejected
| # | Finding Summary | Decision | Rationale |
|---|---|---|---|

---

## Decision Needed
Items requiring Human User input before doc changes can proceed.
- [Item or "none"]
```

---

### Phase 3 — Human Approval + Implementation

1. Human User reviews the synthesis doc and marks each item: **approved** / **rejected** / **deferred**.
2. Approved changes are implemented as:
   - A doc-only CR (`CR-XXX-<slug>.md`) for multi-file or structurally significant changes.
   - Inline edits by Tech Lead for small, isolated wording fixes.
3. BA validates closure if changes touch requirement templates, workflow phase definitions, or role authority boundaries.
4. Implemented changes are logged in `agent-docs/project-log.md`.

---

## Decision Ownership

| Finding Category | Synthesis Owner | Final Approver |
|---|---|---|
| Handoff template gaps, coordination protocol issues | Tech Lead | User |
| Role boundary ambiguities, ownership matrix gaps | Tech Lead | User |
| CR template gaps, requirement clarity, scope definition | BA | User |
| Workflow step redundancy, phase sequencing | Tech Lead proposes, BA ratifies | User |
| Cross-cutting policy (affects multiple roles) | Tech Lead + BA jointly | User |

---

## Guardrails

- Do not silently mutate role authority boundaries.
- Do not rewrite historical closed CRs to retrofit new policy wording.
- If two docs conflict, resolve by updating one source-of-truth section and adding a cross-reference — never duplicate policy text.
- Synthesis agent must NOT treat prior implementation decisions as correct by default. Evaluate each finding on its merits.
- Findings files are role-scoped artifacts. Keep them separate during Phase 1 — do not merge per-agent findings into a single file. Attribution and independent validation depend on this separation.
- A meta-analysis session is not a CR execution session. Synthesis agents must not produce plans, handoffs, or code. Output is doc change proposals only.
