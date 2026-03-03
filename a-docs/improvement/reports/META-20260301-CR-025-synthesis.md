# Meta Synthesis: CR-025

**Date:** 2026-03-01
**Findings sources:**
- `agent-docs/meta/META-20260301-CR-025-tech-lead-findings.md`
- `agent-docs/meta/META-20260301-CR-025-ba-findings.md`
**Prior synthesis cross-referenced:** `agent-docs/meta/META-20260228-CR-024-synthesis.md`
**Synthesis agent:** Improvement Agent
**Note:** Before/after wording is NOT included here — this is Phase 2 synthesis only. Implementing agent writes wording in Phase 3.

---

## Summary

CR-025 was the first zero-sub-agent direct-execution CR under the new all-CR coordinator model (CR-024 H-01). Two agents produced 10 raw Top-5 findings consolidating to 6 distinct items. The dominant theme is a second-order gap in the H-01 implementation: the zero-sub-agent degenerate case has no documented session model, forcing agents to derive correct behavior at runtime across three separate decision points (session collapse, `TL-session-state.md` write obligation, Wait State format). The secondary theme is Documentation Impact governance starting one phase too late — both agents independently converged on adding a Documentation Impact field to `TEMPLATE-ba-to-tech-lead.md`.

---

## High Priority

| # | Finding Summary | Source(s) | Affected Doc + Section | Priority | Decision |
|---|---|---|---|---|---|
| H-01 | Two-agent convergence: Documentation Impact governance chain starts at plan stage (TL) rather than requirement stage (BA) — `TEMPLATE-ba-to-tech-lead.md` has no Documentation Impact field, forcing BA-to-TL doc-debt identification one phase too late | TL-025-O3, BA-025-M1 | `agent-docs/conversations/TEMPLATE-ba-to-tech-lead.md` | High | **Fix** |
| H-02 | CR-024 H-01 (coordinator-for-all-CRs) introduced an undocumented zero-sub-agent degenerate case: session collapse logic, `TL-session-state.md` write obligation, and Wait State format are all undefined for direct-execution CRs — agents must derive correct behavior at runtime across three separate decision points | TL-025-C1, TL-025-M1, TL-025-W1 | `agent-docs/workflow.md` (Session Scope Management); `agent-docs/roles/tech-lead.md` (CR Execution Model) | High | **Fix** |

**H-01 rationale:** TL-025-O3 (#5 in TL top-5) and BA-025-M1 (#1 in BA top-5) are substantively identical: the Documentation Impact field is absent from the BA handoff template, meaning doc-debt identification cannot happen at requirement time. The fix is a single-template addition to `TEMPLATE-ba-to-tech-lead.md` that shifts Documentation Impact identification upstream by one session boundary — which is the explicit goal of CR-025's governance work. Two independent agents flagging the same gap on the same file constitutes a high-confidence fix signal.

**H-02 rationale:** TL-025-C1 (coordinator formula contradiction for N=0), TL-025-M1 (three undocumented decision points), and TL-025-W1 (TL-session-state.md ceremonial artifact with no Coordinator consumer) share a single root cause: the coordinator-for-all-CRs model specifies no degenerate case for zero-sub-agent CRs. C1 identifies the text contradiction in `tech-lead.md` (formula yields 0 Coordinator sessions but does not exempt zero-sub-agent CRs from the model). M1 identifies three decisions left to runtime derivation (write TL-session-state.md? when does the Wait State apply? do sessions collapse?). W1 identifies the ceremony overhead produced by deriving the wrong answer (TL-session-state.md written with no consumer). The fix requires two files: `workflow.md` is the canonical session model source; `tech-lead.md` cross-references it rather than re-describing it independently. This is a second-order consequence of a correctly implemented fix, not a regression.

---

## Medium Priority

| # | Finding Summary | Source(s) | Affected Doc + Section | Priority | Decision |
|---|---|---|---|---|---|
| M-01 | Go/No-Go skip clause (a) "no execution/delegation handoff" is ambiguous for direct-execution [S][DOC] CRs — "no execution" plausibly means "no execution at all" (Reading 2) or "no delegation to sub-agents" (Reading 1, correct); forced judgment call at execution time | TL-025-C2 | `agent-docs/workflow.md` (Technical Planning Phase step 5 / Approval Gate — Go/No-Go skip conditions) | Medium | **Fix** |
| M-02 | Meta protocol timing is undefined for "verified but not BA-closed" CR state — `meta-improvement-protocol.md` When To Use section says "after completed CR" but does not define whether "completed" means TL-verified or BA-closed; agents must derive the valid entry state for each role's meta pass | BA-025-C1 | `agent-docs/coordination/meta-improvement-protocol.md` (When To Use section) | Medium | **Fix** |
| M-03 | Documentation Impact field semantics distributed across 6 artifacts (TEMPLATE.md, 4 TEMPLATE-tech-lead-to-*.md files, ba.md) with no artifact labeled as canonical source — future wording drift across these 6 locations is a near-certainty | BA-025-R1 | `agent-docs/plans/TEMPLATE.md` (Documentation Impact section) | Medium | **Fix** |
| M-04 | Pre-Replacement Check ceremony for same-session BA handoff replacement — sixth consecutive appearance (BCK-023-W1 → TL-023-R1 → BCK-024-W1 → TL-024-W1 → BA-024-W1 → BA-025-W1); CR-024 M-06 approved Fix but implementation notes are absent ⚠️ | BA-025-W1 | `agent-docs/workflow.md` (Conversation File Freshness Rule / Pre-Replacement Check section) | Medium | **Fix** ⚠️ |

**M-01 rationale:** TL-025-C2 is well-grounded: the judgment call was made at execution time, required two reads of the skip-condition text, and the wrong reading could produce either over-ceremony (invoke Go/No-Go for a trivial pure-DOC CR) or under-ceremony (skip Go/No-Go for a [S][DOC] CR with substantial scope decisions). The correct reading — clause (a) means no sub-agent delegation, not no execution at all — needs to be made unambiguous in the text. Portability note (per improvement.md Principle 2): this ambiguity is cross-project; any agentic project with a similar Go/No-Go gate will face this edge case for direct-execution CRs. The fix is wording-only in one clause of `workflow.md` step 5.

**M-02 rationale:** BA-025-C1 identifies a concrete gap: `meta-improvement-protocol.md` When To Use says "after completed CR" without defining the completion state. In practice, the BA ran the Phase 1 meta pass while CR-025 was in "Draft" (TL-verified, BA closure not yet performed), which is the only valid time for the BA to run their meta pass (they would not run it after their own closure, as the session would be complete). The fix is a localized clarification to When To Use defining earliest valid entry states: "BA meta pass may run once TL verification is recorded; does not require prior BA closure." Scope is limited to the When To Use section — no structural changes to the phase model.

**M-03 rationale:** BA-025-R1 identifies a portability and evolvability risk consistent with improvement.md Principle 1 (Atomic Change Sites). The Documentation Impact field was introduced in CR-025 across 6 artifacts simultaneously; no artifact is labeled as the canonical semantics definition. When the field's required-vs-not-required boundary is clarified in a future meta pass, all 6 locations are at risk of independent drift unless canonical ownership is explicit. The minimum fix per improvement.md Principle 4 (Simplicity Over Protocol): add a canonical-source label to TEMPLATE.md's Documentation Impact section (as the plan-stage owner of the field), with a cross-reference note for sub-agent handoff templates and ba.md. No new file required; no semantic rewrite. The term "Documentation Impact" is already consistent across all 6 artifacts — only the canonical ownership label is new.

**M-04 rationale:** BA-025-W1 is the sixth consecutive appearance of this finding across two CRs and five agent sessions. CR-024 synthesis approved M-06 as a Fix. CR-024 synthesis implementation notes (lines 146–150) record H-01 and M-04 implementation but do not confirm M-06 implementation. ⚠️ Regression risk: the implementing agent must read the current `workflow.md` Pre-Replacement Check section before writing. If M-06 was already implemented and the ceremony persists: the current wording fix must address the gap in the prior fix. If M-06 was not implemented: this is a carry-forward write per CR-024 M-06 synthesis description (Read is a tool constraint that remains; same-session shortcut allows attestation in place of full check when agent set prior CR status in current session). Sixth consecutive appearance is a forcing condition — Fix is mandatory regardless.

---

## Deferred / Rejected

| # | Finding Summary | Decision | Rationale |
|---|---|---|---|
| R-01 | AC-4 minimum wording permits under-implementation despite governance intent | **Reject** | CR-025 requirements are historical artifacts — per `AGENTS.md`, closed CRs are immutable by default. The finding cannot be addressed by editing CR-025's AC-4. A general AC authoring standard for governance CRs would be a new policy requiring its own CR; it is out of scope for this synthesis whose primary focus is the zero-sub-agent model gap and Documentation Impact governance. If the user wants a lightweight AC authoring note for governance-type CRs, that can be tracked as a separate `[S][DOC][ALIGN]` item in `project-log.md`. |

---

## Vocabulary Pre-Decisions

The following terms are pre-decided for consistency across chunks. Implementing agents must use these exact terms; do not coin synonyms independently.

| Term | Definition | Used in |
|---|---|---|
| **Direct-execution CR** | A CR where all changes are made by the Tech Lead in permitted direct zones, with no sub-agent delegation (N=0 sub-agents in the coordinator formula). | H-02 — `workflow.md` (Session Scope Management) and `tech-lead.md` (CR Execution Model); both must use this exact term for the zero-sub-agent degenerate case |
| **Documentation Impact** | Keep this exact term (already consistent across 6 artifacts). Do not introduce synonyms when labeling canonical ownership in M-03. | M-03 — `plans/TEMPLATE.md` Documentation Impact section; canonical-source label must use "Documentation Impact" exactly as written in all six existing artifact locations |

---

## Implementation Chunks (for Phase 3)

Chunks C, D, and E are fully independent and can execute in any order or in parallel. Chunks A and B are sequentially ordered — B depends on A (see cross-chunk coordination notes). Chunks A and C share semantic territory (see cross-chunk notes) but are not blocking dependencies.

| Chunk | Fix Items | Target Files (1–3) | Notes |
|---|---|---|---|
| **A** | H-02 (Session Scope Management: add direct-execution CR session model — session collapse rule, TL-session-state.md write scope, Wait State simplification); M-01 (Go/No-Go skip clause (a) wording — clarify "no delegation" vs. "no execution at all"); M-04 (Pre-Replacement Check: ⚠️ read current section before writing) | `agent-docs/workflow.md` | Execute before Chunk B. M-04 ⚠️: implementing agent reads current Pre-Replacement Check section first. |
| **B** | H-02 companion (CR Execution Model: add direct-execution CR path — session count, TL-session-state.md protocol scope, Wait State format; cross-reference workflow.md canonical model, do not re-describe independently) | `agent-docs/roles/tech-lead.md` | Depends on Chunk A. Must cross-reference `workflow.md` direct-execution CR model rather than duplicating it. |
| **C** | H-01 (add Documentation Impact field to BA handoff template — consistent with TEMPLATE.md Documentation Impact semantics) | `agent-docs/conversations/TEMPLATE-ba-to-tech-lead.md` | Independent. Implementing agent reads `agent-docs/plans/TEMPLATE.md` Documentation Impact section before writing to align field semantics. Not a blocking dependency on Chunk E. |
| **D** | M-02 (When To Use: define "completed CR" — earliest valid entry states for each role's meta pass) | `agent-docs/coordination/meta-improvement-protocol.md` | Independent. |
| **E** | M-03 (Documentation Impact section: add canonical-source label and cross-reference note for sub-agent templates and ba.md — no semantic rewrite) | `agent-docs/plans/TEMPLATE.md` | Independent. Implementing agent reads current Documentation Impact section before writing; adds label only. |

---

## Cross-Chunk Coordination Notes

- **H-02 spans Chunks A and B.** `workflow.md` (Chunk A) is the canonical source for the direct-execution CR session model description. `tech-lead.md` (Chunk B) must cross-reference it rather than independently re-describing the model. If running sequentially: Chunk A first, Chunk B cross-references the section written in A. If running in parallel (only if the session model text is agreed in advance): both agents must use the vocabulary pre-decision term "direct-execution CR" and describe session collapse as: Session A and Session B collapse into a single session; no Coordinator session exists; `TL-session-state.md` is written as an internal record only (no Coordinator consumers).

- **H-01 (Chunk C) and M-03 (Chunk E) share Documentation Impact semantics.** Chunk C adds a new field to `TEMPLATE-ba-to-tech-lead.md`; Chunk E labels `TEMPLATE.md` as the canonical semantics source. Chunk C's implementing agent should read `TEMPLATE.md`'s Documentation Impact section before writing to ensure the new BA-template field aligns with existing field semantics. This is recommended, not a blocking dependency — Chunks C and E can execute in parallel with this pre-read.

- **Chunk A ⚠️ M-04 regression check.** Before writing the Pre-Replacement Check section: read the current `workflow.md` Pre-Replacement Check section. If already updated per CR-024 M-06 — determine what gap persists and adjust the fix accordingly (a wording fix may have been incomplete or the ceremony remains under different conditions). If not yet updated — write per CR-024 M-06 description: distinguish the tool constraint (Read is always required) from the ceremony (Pre-Replacement Check section is required only when the agent did not set prior CR status in the current session; same-session attestation is sufficient when status was set in this session).

---

## Decision Needed

- **R-01 carry-forward decision:** Should BA-025-U1 (AC wording guidance for governance-type CRs) be tracked as a deferred `[S][DOC][ALIGN]` item in `project-log.md`, or is rejection sufficient? A lightweight note in `ba.md` on AC specificity for governance CRs could be added to Chunk B (tech-lead.md update) if desired, but this would require user direction — it is not within the scope of the H-02 Fix.

---

## Stats

**Raw Top-5 findings:** 10 (2 agents × 5 findings each)
**Unique findings after de-duplication:** 6
**Fix:** 5 (2 High, 3 Medium + 1 Medium carry-forward with ⚠️)
**Reject:** 1 (R-01 — BA-025-U1, closed CR artifact)
**Defer:** 0

**De-duplication map (raw → consolidated):**
- TL-025-O3 + BA-025-M1 → H-01 (2 raw → 1 consolidated; identical fix target)
- TL-025-C1 + TL-025-M1 + TL-025-W1 → H-02 (3 raw → 1 consolidated; same root cause; 2 fix locations)
- TL-025-C2 → M-01 (standalone)
- BA-025-C1 → M-02 (standalone)
- BA-025-R1 → M-03 (standalone)
- BA-025-W1 → M-04 ⚠️ (sixth consecutive appearance; carry-forward from CR-024 M-06)
- BA-025-U1 → R-01 (standalone; rejected)

**Regression flags:**
- CR-024 M-06 (Pre-Replacement Check) → ⚠️ BA-025-W1 is the sixth consecutive appearance. CR-024 synthesis M-06 implementation notes are absent from the synthesis document. Implementing agent must confirm current workflow.md state before writing Chunk A.
- CR-024 H-01 (coordinator-for-all-CRs) → ✓ Implemented correctly; TL-025-C1/M1/W1 are second-order consequences of H-01 producing a new degenerate-case gap, not regressions in the fix itself. Now addressed as H-02.
- All other CR-024 Fix items (H-02, M-01, M-02, M-03, M-04, M-05, M-07): not referenced in CR-025 Top-5 findings; no regression evidence.

**Implementation notes (Phase 3 outcomes):**
- **H-01 (Chunk C):** Added `## Documentation Impact (Preliminary)` section to `TEMPLATE-ba-to-tech-lead.md` after Risk Analysis. Field uses `yes | no | unknown` signal with domain-level flags (not final file list). Cross-references `TEMPLATE.md` as canonical semantics source.
- **H-02 (Chunks A + B):** In `workflow.md` step 8, added `Direct-execution CR (zero sub-agents)` bullet documenting session collapse, TL-session-state.md write scope, and Wait State behavior. In `tech-lead.md` CR Execution Model, added `Direct-execution CR (N=0 sub-agents)` paragraph with 3 numbered behaviors; updated TL-session-state.md protocol with N=0 parenthetical and Session B clarification. Cross-reference pattern used: Chunk B defers to `workflow.md` step 8 as canonical — `tech-lead.md` adds numbered behavior details not appropriate in workflow.md's summary bullets.
- **M-01 (Chunk A):** Rewrote `workflow.md` step 5 exception (a) to replace "no execution/delegation handoff" with "no sub-agent delegation handoff will be issued — direct Tech Lead execution of permitted changes does not disqualify from this skip."
- **M-02 (Chunk D):** Added `"Completed CR" definition for meta timing` block to `meta-improvement-protocol.md` When To Use section. Defines earliest valid entry states for TL meta pass, BA meta pass, and Improvement Agent Phase 2.
- **M-03 (Chunk E):** Expanded `TEMPLATE.md` Documentation Impact section comment to label it as the canonical semantics source for the field across all artifacts (TEMPLATE-tech-lead-to-*.md, ba.md). Added cross-reference note for consumers.
- **M-04 (Chunk A):** ⚠️ Regression check: confirmed CR-024 M-06 was implemented (same-session shortcut present in workflow.md line 71 as "Evidence 2 only"). The BA finding (BA-025-W1) was that Evidence 1 still required re-reading even in same-session context. Fix: removed "Evidence 2 only" qualifier; extended shortcut to cover both evidences when agent set prior CR status in the same session.
- **R-01 (BA-025-U1):** Rejected — user confirmed rejection is sufficient. No follow-up item added to project-log.md.
