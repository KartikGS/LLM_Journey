# Meta Findings: BA — CR-025

**Date:** 2026-03-01
**CR Reference:** CR-025 — README Refresh and Documentation Governance in CR Flow
**Role:** ba
**Prior findings reviewed:**
- `agent-docs/meta/META-20260301-CR-025-tech-lead-findings.md`

---

## Conflicting Instructions

**BA-025-C1 — Meta timing rule is ambiguous between "after completed CR" and real execution timing**

`workflow.md` says post-CR meta runs by default after completed CR closure, but this meta session was requested while `CR-025` is still `Draft` and only TL verification exists. The protocol does not define whether Phase 1 is valid in the "verified but not BA-closed" state.

**Grounding:** During this session I re-opened `CR-025` and found status `Draft` while still proceeding with mandatory Phase 1 findings.
`collaboration`, `evolvability`

---

## Redundant Information

**BA-025-R1 — Documentation governance is now duplicated across multiple artifacts without a declared canonical owner section**

After CR-025 implementation, the same `Documentation Impact` rule appears in plan template (`TEMPLATE.md`), four TL->sub-agent templates, and BA closure checklist. This gives coverage, but no single section is labeled as canonical for semantics. Future wording drift is likely.

**Grounding:** While validating AC-4/AC-5 evidence in `tech-lead-to-ba.md`, I had to compare multiple files to infer the authoritative meaning of `required` vs `not-required`.
`portability`, `evolvability`

---

## Missing Information

**BA-025-M1 — BA handoff template lacks a structured `Documentation Impact` field at requirement time**

CR-025 added governance at plan/execution/closure, but the earliest artifact (`TEMPLATE-ba-to-tech-lead.md`) still has no dedicated doc-impact slot. This keeps documentation risk discovery one phase late.

**Grounding:** While authoring `ba-to-tech-lead.md` for CR-025, I had to place doc-impact intent in freeform Objective/Scope text instead of a required field.
`collaboration`, `evolvability`

**BA-025-M2 — No explicit scope rule defines which documentation domains must be considered by default**

The protocol now asks agents to declare documentation impact, but there is no default boundary statement (only `README.md`, or `agent-docs/**`, or also `human-docs/**`). Agents must improvise per CR.

**Grounding:** During CR-025 drafting I had to make a scope assumption that the rule applies to `README.md`, `agent-docs/**`, and `human-docs/**`.
`portability`, `evolvability`

---

## Unclear Instructions

**BA-025-U1 — AC-4 wording created two valid implementation targets (minimum compliance vs full coverage)**

AC-4 says "at least one planning artifact and one execution handoff template." This is legally sufficient but underspecified for governance CR intent. TL implemented all four handoff templates (good outcome), but the AC allowed a minimal one-template interpretation.

**Grounding:** Reviewing TL deviation note in `tech-lead-to-ba.md` ("exceeds minimum") showed the AC text itself created the ambiguity.
`evolvability`

**BA-025-U2 — `not-required` rationale path has no escalation trigger when likely incorrect**

Template wording allows `not-required — [rationale]`, but no explicit rule says when this must be challenged upstream (TL or BA) if rationale conflicts with CR intent.

**Grounding:** Reviewing new DoD items in role-specific TL templates showed compliance can be satisfied by rationale text alone without a defined dispute path.
`collaboration`, `evolvability`

---

## Responsibility / Scope Concerns

**BA-025-S1 — BA closure checklist now depends on sub-agent DoD declarations, but BA acceptance input is TL handoff-centric**

The new BA checklist item requires confirming doc files from plan and each sub-agent DoD are resolved. In practice BA usually operates from `tech-lead-to-ba.md`; requiring cross-artifact reconciliation expands BA closure workload and can become fragile if TL summary is incomplete.

**Grounding:** While validating the new checklist line in `ba.md`, I had to map it to what BA actually reads during acceptance.
`collaboration`, `evolvability`

---

## Engineering Philosophy Concerns

**BA-025-E1 — Documentation governance is declaration-based, not enforcement-based; this trade-off is not documented**

The new field improves auditability but still relies on accurate human/agent declaration. This is a valid trade-off for team velocity, but it should be explicit so teams do not interpret it as full enforcement.

**Grounding:** CR-025 changed process templates (declaration mechanism) without adding an independent verification mechanism beyond BA closure review.
`portability`, `evolvability`

---

## Redundant Workflow Steps

**BA-025-W1 — Pre-Replacement Check remains high-ceremony for same-session BA handoff replacement**

Replacing `ba-to-tech-lead.md` required repeating evidence checks for CR-024 closure that were already established in active context. The check is valid for freshness, but same-session repetition remains mostly ceremonial.

**Grounding:** Authoring the CR-025 BA handoff required explicit Evidence 1/Evidence 2 replay for CR-024 before replacement.
`collaboration`, `evolvability`

---

## Other Observations

**BA-025-O1 — Carry-forward input naming is non-deterministic without explicit file path syntax**

The prompt provided "CR 25 tech lead meta analysis" (natural language), not a path. This required repository search before assessment, adding avoidable setup time.

**Grounding:** I used project-wide search to resolve the prior findings file path before writing this Phase 1 artifact.
`collaboration`, `evolvability`

---

## Lens Coverage (Mandatory)

- **Portability Boundary:** BA-025-R1, M2, and E1 are cross-project governance design issues (canonical-source ownership, doc-domain boundary defaults, declaration-vs-enforcement semantics).
- **Collaboration Throughput:** BA-025-C1, M1, U2, S1, W1, and O1 all create extra session hops or reconciliation overhead that slows CR throughput.
- **Evolvability:** BA-025-R1, M1, M2, U1, U2, E1, and W1 indicate future drift risk unless semantics are centralized and ambiguity is removed.

## Prior Findings: Assessment

- **TL-025-C1** (zero-sub-agent coordinator contradiction) → **Validated** — same ambiguity affects BA acceptance timing/provenance when Session A/B collapses.
- **TL-025-C2** (Go/No-Go skip ambiguity) → **Validated** — BA-side planning expectations are also affected by unclear skip conditions.
- **TL-025-M1** (missing zero-sub-agent session model) → **Validated** — BA receives outputs from an execution path that is currently derived, not documented.
- **TL-025-M2** (delegation graph template assumes sub-agent delegation) → **Validated** — BA quality expectations depend on plan semantics that are currently stretched for zero-delegation CRs.
- **TL-025-U1** (`strict [S][DOC]` boundary unclear) → **Validated** — classification ambiguity propagates into BA acceptance criteria framing.
- **TL-025-U2** (`Documentation Impact` scope semantics unclear) → **Extended** by BA-025-M2 and BA-025-U2 with requirement-stage and escalation-path gaps.
- **TL-025-R1** (BA Reversal Risk canonical-source check is redundant) → **Partially Refuted** — for BA it provides AC-scoped stop conditions, which are more actionable than generic required-reading compliance.
- **TL-025-O3** (add Documentation Impact to BA handoff template) → **Validated and promoted** as BA-025-M1 due to direct requirement-authoring friction observed.

## Top 5 Findings (Ranked)

1. BA-025-M1 | Documentation Impact governance starts too late because BA handoff template lacks a required field | `agent-docs/conversations/TEMPLATE-ba-to-tech-lead.md` | `collaboration`, `evolvability`
2. BA-025-C1 | Meta protocol timing is ambiguous for "verified but not BA-closed" CR state | `agent-docs/workflow.md` / Post-CR meta cadence; `meta-improvement-protocol.md` / When To Use | `collaboration`, `evolvability`
3. BA-025-U1 | AC-4 minimum wording permits under-implementation despite governance intent | `agent-docs/requirements/CR-025-readme-refresh-and-documentation-governance.md` / AC-4 pattern | `evolvability`
4. BA-025-R1 | Documentation Impact rule is duplicated across six artifacts without declared canonical semantics | `agent-docs/plans/TEMPLATE.md`; `agent-docs/conversations/TEMPLATE-tech-lead-to-*.md`; `agent-docs/roles/ba.md` | `portability`, `evolvability`
5. BA-025-W1 | Pre-Replacement Check still incurs high ceremony for same-session BA handoff replacement | `agent-docs/workflow.md` / Conversation Freshness rule; `agent-docs/conversations/ba-to-tech-lead.md` flow | `collaboration`, `evolvability`

