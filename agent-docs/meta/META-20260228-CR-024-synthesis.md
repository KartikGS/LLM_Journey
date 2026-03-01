# Meta Synthesis: CR-024

**Date:** 2026-02-28
**Findings sources:**
- `agent-docs/meta/META-20260228-CR-024-backend-findings.md`
- `agent-docs/meta/META-20260228-CR-024-tech-lead-findings.md`
- `agent-docs/meta/META-20260228-CR-024-ba-findings.md`
**Prior synthesis cross-referenced:** `agent-docs/meta/META-20260228-CR-023-synthesis.md`
**Synthesis agent:** Tech Lead (meta-improvement mode)
**Note:** Before/after wording is NOT included here — this is Phase 2 synthesis only. Implementing agent writes wording in Phase 3.

---

## Summary

CR-024's three-agent meta chain produced 15 raw Top-5 findings, consolidating to 9 distinct items after de-duplication. Two findings are High priority. All 9 are Fix. No Defers. No Rejects.

**H-01 (coordinator scope extension to all CRs)** is a User-directed scope change, not a meta recommendation requiring deliberation. The user explicitly stated: "I think it's time to involve coordinator in every flow irrespective of number of agents involved" (BA-024-O2). The [S] single-session exception trigger clause in `workflow.md` ("acceptable unless context pressure was observed in a prior meta pass") is now satisfied: 88% context saturation in CR-024 was reported in this meta pass. Three agents converge on the diagnosis (TL-024-O2, TL-024-E1, BA-024-R1). The fix removes the [S] exception and updates affected role documentation. A companion BA workflow section update (BA-024-R1) is required as part of the same implementation — if coordinator-for-all-CRs is implemented without updating the BA workflow section, the BA will not know who authored the incoming handoff or who to escalate acceptance questions to.

**H-02 (acceptance verification policy clarity)** is a two-finding convergence (BA's top-1 and top-2). The three-tier graduated verification policy currently requires O(reasoning-from-text) per AC rather than O(lookup). No diagnostic prompt exists to classify an AC into the correct tier. A worked example for the evidence threshold criterion ("specific cited TL adversarial evidence") is also absent, causing agents to re-derive what qualifies every acceptance.

**Seven Medium findings** cover: lint scope ambiguity (canonical decision rule missing — two-agent convergence); L-01 nvm promotion (CR-023 synthesis trigger mandated by deferral condition); meta-improvement-protocol.md absent from BA required readings; `readStreamWithLimit` docstring + TL Permitted Direct Changes gap for `lib/security/*`; security vulnerability class scan as standing Backend practice; Pre-Replacement Check ceremony (fifth consecutive appearance — synthesis must produce Fix, not deferral); and `@ts-expect-error` two-outcome coverage as TL handoff authoring gap.

**L-01 from CR-023 synthesis** is promoted to M-02 Fix per the explicit deferral condition: "if recurs in future CR, promote to Medium and fix `agent-docs/tooling-standard.md` Runtime Preflight." BCK-024-O3 and TL-024-M2 both confirm recurrence. Promotion is mandatory, not discretionary.

---

## High Priority

| # | Finding | Source(s) | Affected Files | Decision |
|---|---|---|---|---|
| H-01 | User-directed coordinator scope extension to all CRs — [S] single-session exception trigger clause satisfied (88% saturation in CR-024 meta pass); adversarial re-reads (not sub-agent count) are the true cost driver; companion BA workflow update required or Acceptance Phase becomes inaccurate | TL-024-O2, TL-024-E1, BA-024-R1 | `agent-docs/workflow.md` (session scope section + Acceptance Phase attribution); `agent-docs/roles/tech-lead.md` (implementing agent verifies path — may be `agent-docs/roles/coordination/tech-lead.md`) | **Fix** |
| H-02 | Acceptance verification policy requires derivation not lookup — three-tier graduated verification has no diagnostic decision tree; "specific cited TL adversarial evidence" criterion has no worked example or function-based description; BA re-derives tier classification from first principles for every security-adjacent AC | BA-024-U1, BA-024-E1 | `agent-docs/workflow.md` (Acceptance Phase step 2 — evidence criterion only); `agent-docs/roles/ba.md` (Acceptance Verification — full decision tree) | **Fix** |

**H-01 rationale:** TL-024-O2 establishes the trigger condition is met (88% saturation in a [S] CR satisfies the [S] exception's own revocation clause). TL-024-E1 corrects the misdiagnosis: the [S] exception was created by reasoning "fewer sub-agents = less context," but the actual cost driver is adversarial review re-reading files already read during discovery — a cost present in any CR regardless of sub-agent count. The coordinator model's benefit (fresh-context adversarial review) therefore applies to all CRs, not just [M]/[L]. BA-024-O2 confirms the user explicitly directed this change rather than merely observing it, making normal synthesis deliberation unnecessary. BA-024-R1 is treated as a companion to H-01 rather than a standalone finding: if the coordinator scope extends without updating the BA workflow section, the BA will receive a Coordinator-authored handoff (not a TL-authored handoff) and the workflow text will be factually wrong about: (1) who authored `tech-lead-to-ba.md`, (2) who to escalate acceptance questions to, and (3) the provenance of adversarial evidence in the handoff.

**H-02 rationale:** BA-024-U1 and BA-024-E1 share a root: the acceptance policy is expressed in descriptive text, not as a decision procedure. BA-024-U1 isolates the threshold ambiguity (what makes adversarial evidence "specific enough" to qualify for tier 3); BA-024-E1 identifies the full three-tier classification problem (no diagnostic prompt tells BA which tier applies before reading policy text). The risk is bidirectional: over-trusting weak evidence misses defects; over-reading correct evidence wastes acceptance time and context. The fix has two components: (1) in `workflow.md` step 2, clarify the evidence criterion with a worked example or a description of what the evidence must *demonstrate* rather than what form it must take; (2) in `ba.md`, add a short diagnostic decision tree that produces a tier classification without requiring policy re-reading. These are separate locations and can be written independently, but the tier labels used in both must be consistent (see Vocabulary Pre-Decisions).

---

## Medium Priority

| # | Finding | Source(s) | Affected Files | Decision |
|---|---|---|---|---|
| M-01 | DoD `pnpm lint` is ambiguous — targeted lint (sub-agent scope) vs. full-suite lint (integration gate) have no canonical decision rule; Backend agents make inconsistent AC-5 attestations that TL cannot detect without re-running the gate | BCK-024-C1, TL-024-R1 | `agent-docs/tooling-standard.md` (Targeted File Linting section) | **Fix** |
| M-02 | L-01 nvm sourcing recurrence — CR-023 synthesis deferred with explicit "promote to Medium on recurrence" condition; recurred in CR-024 (v16.20.1 on session start again); promotion is mandatory per prior synthesis decision | BCK-024-O3, TL-024-M2 | `agent-docs/tooling-standard.md` (Runtime Preflight (Mandatory) section) | **Fix** (promoted from CR-023 Defer) |
| M-03 | `meta-improvement-protocol.md` not in BA required readings — BA is assigned the post-CR meta pass by `workflow.md` but `ba.md` does not equip BA with the protocol's format, Phase 1 carry-forward rules, or lens definitions; BA runs meta cold without an explicit user prompt | BA-024-C1 | `agent-docs/roles/ba.md` (Role-Specific Readings / Required Readings section) | **Fix** |
| M-04 | `readStreamWithLimit` docstring undocumented + `lib/security/*` absent from TL Permitted Direct Changes — docstring does not explain `contentLength` parameter contract; TL cannot unambiguously edit shared security infrastructure without either unnecessary delegation or treating omission as implicit permission | BCK-024-M2, TL-024-M3 | `lib/security/contentLength.ts` (function docstring); `agent-docs/roles/tech-lead.md` (Permitted Direct Changes table — implementing agent verifies path) | **Fix** |
| M-05 | No standing Backend guidance for security vulnerability class scan — the instruction "when implementing a class-of-vulnerability fix, scan all affected surface area and flag but do not fix adjacent instances" was provided ad hoc in the CR-024 handoff; a Backend without an explicit scan instruction would omit the check | BCK-024-M1 | `agent-docs/development/backend.md` (implementing agent verifies path — may be `agent-docs/roles/sub-agents/backend.md`) | **Fix** |
| M-06 | Pre-Replacement Check ceremony — fifth consecutive appearance across two CRs and four roles (BCK-023-W1 → TL-023-R1 → BCK-024-W1 → TL-024-W1 → BA-024-W1); BA explicitly escalates: synthesis must produce Fix or Reject, not another deferral | BA-024-W1 | `agent-docs/workflow.md` (Conversation File Freshness Rule / Pre-Replacement Check section) | **Fix** |
| M-07 | `@ts-expect-error` TL handoff only covers one failure mode — handoff template included `@ts-expect-error` with fallback "if suppression fails, use cast"; inverse case (TypeScript does NOT raise an error → directive becomes TS2578) was not named; caused tsc failure and deviation in CR-024 | BCK-024-U1 | `agent-docs/roles/tech-lead.md` (handoff self-check or test helper template guidance — implementing agent verifies path) | **Fix** |

**M-01 rationale:** BCK-024-C1 documents the live ambiguity: `pnpm lint` in a DoD item, `backend.md` deferring to the DoD, and `tooling-standard.md` permitting targeted lint for sub-agents together produce an unresolved interpretation. TL-024-R1 extends: a pre-existing lint error in an unrelated file would produce a false AC-5 attestation that TL cannot detect without re-running full-suite lint. The canonical decision rule resolves the ambiguity with a single lookup: sub-agents use targeted lint on their modified files; full-suite lint is owned by the integration gate authority (the Coordinator Session under the new all-CR coordinator model). Both gates must pass before CR closure; neither alone is sufficient. Implementing agent writes the rule into `tooling-standard.md` Targeted File Linting section — not into `workflow.md` or `backend.md`.

**M-02 rationale:** CR-023 synthesis explicitly deferred L-01 with the condition "if the nvm sourcing issue recurs in a future CR, promote to Medium and fix `agent-docs/tooling-standard.md` Runtime Preflight." BCK-024-O3 confirms recurrence: `node -v` returned v16.20.1 on CR-024 session start, requiring the same manual `export NVM_DIR + source nvm.sh + nvm use` sequence as CR-023. TL-024-M2 names the fix target: the full sourcing sequence (not just `nvm use <version>`) must be written into Runtime Preflight as explicit steps, because `nvm use` silently fails without the sourcing step in non-interactive shells. Promotion is not discretionary — it was the deferral condition.

**M-03 rationale:** BA-024-C1 identified a doc-ownership gap between what `workflow.md` assigns to the BA (post-CR meta pass) and what `ba.md` equips the BA to do (no meta-improvement-protocol.md in required readings). The protocol has a specific structure: Phase 1 carry-forward rules, lens definitions (Portability Boundary, Collaboration Throughput, Evolvability), and mandatory Lens Coverage section. A BA loading context from `ba.md` alone would not know the format. The user compensated in CR-024 by explicitly including the protocol instruction in the meta-mode prompt — but this is prompt-dependent, not structural. One-line fix: add `meta-improvement-protocol.md` to the BA required readings list.

**M-04 rationale:** BCK-024-M2 identifies a concrete knowledge-loss risk: `readStreamWithLimit`'s `contentLength` parameter has a non-obvious contract (pass `MAX_BODY_SIZE` when `Content-Length` header absent; this makes both primary and secondary checks fire at the same threshold) that currently lives only in the CR-024 plan and handoff — one-CR artifacts that will be archived. TL-024-M3 identifies the companion issue: the TL should have been able to fix this docstring directly as shared infrastructure, but `lib/security/*` is not listed in the Permitted Direct Changes table under "Shared Infra: Non-feature utilities," creating unnecessary delegation friction. Two fix sites: (1) the function docstring in `lib/security/contentLength.ts`, (2) one row addition to the Permitted Direct Changes table in `tech-lead.md`. These are independent and can execute in parallel.

**M-05 rationale:** BCK-024-M1 correctly identifies that the CR-024 scan instruction was ad hoc and effective but would have been omitted without the explicit handoff instruction. The pattern — "when implementing a security fix for a class of vulnerability, scan all affected surface area and flag but do not fix adjacent instances" — is a general Backend security practice, not a CR-specific instruction. Adding it as a standing principle to `backend.md` (Security section or equivalent) eliminates the dependency on TL including the instruction explicitly in every security CR handoff.

**M-06 rationale:** BA-024-W1 is the fifth consecutive occurrence of this finding (BCK-023-W1 → TL-023-R1 → BCK-024-W1 → TL-024-W1 → BA-024-W1). The BA explicitly escalates: "five consecutive appearances across two CRs and four roles is a forcing condition." The BA correctly separates the technical constraint (the Write tool requires a prior Read — this remains valid regardless) from the policy ceremony (the Pre-Replacement Check section verifying facts the same-session agent just established — this is the ceremony to fix). The fix is a scoped policy clarification: the Read is always required (tool constraint); the Pre-Replacement Check *section* is required only when the agent did NOT set the prior CR status in the current session. When the same-session agent set the status, a single attestation ("same-session: [prior CR] annotated Done during acceptance in this session") satisfies the check. This preserves the tool constraint while eliminating the zero-information ritual.

**M-07 rationale:** BCK-024-U1 documents a concrete handoff authoring failure: the `@ts-expect-error` conditional covered only one failure mode (TypeScript raises error but suppression fails → use cast), not the inverse (TypeScript accepts the line without error → directive becomes TS2578 Unused directive → remove it). Backend added the directive verbatim, tsc failed with TS2578, and the fix (remove the directive) required reasoning that the inverse was not covered. TL-024-U1 (in the full findings, not top-5) confirms this is a TL handoff authoring gap: when a handoff includes an environment-sensitive TypeScript construct with conditional instructions, both outcomes must be named. The fix is one addition to the TL handoff self-check list: "if snippet contains `@ts-expect-error`, name both outcomes."

---

## Rejected

| # | Finding | Source(s) | Decision | Rationale |
|---|---|---|---|---|
| M-03 | `meta-improvement-protocol.md` absent from BA required readings | BA-024-C1 | **Reject** | User rejected. The user explicitly provides the meta-mode prompt when invoking the meta pass, which can include the protocol reference. Adding it to `ba.md` required readings would load it into every BA session, not only meta-pass sessions — adding unnecessary context cost to standard CR sessions. The explicit meta-mode prompt is the correct loading mechanism. |

---

## Low Priority / Deferred

None. The only carry-forward deferred item (CR-023 L-01) is promoted to M-02 Fix per the deferral condition.

---

## Vocabulary Pre-Decisions

The following terms are pre-decided to enforce consistency across chunks. Implementing agents must use these exact terms; do not coin synonyms independently.

| Term | Definition | Used in |
|---|---|---|
| **Coordinator Session** | The session that performs adversarial review, quality gates, and BA handoff authoring — now applies to ALL CRs regardless of sub-agent count; the [S] single-session exception is removed | H-01 — `workflow.md` (session scope section) and `tech-lead.md` (CR Execution Model); both must describe the model as "Coordinator Session (adversarial review → quality gates → BA handoff authoring) — applies to all CRs regardless of sub-agent count" |
| **Graduated Verification Decision Tree** | The named diagnostic prompt in `ba.md` that produces a tier classification (re-read independently / trust with source audit note / graduated per specific cited TL adversarial evidence) without requiring BA to read the full policy text | H-02 — `ba.md` (Acceptance Verification section) only; `workflow.md` step 2 gets a clarified evidence criterion but not the full tree; both documents must use the same tier labels: "re-read independently," "trust with source audit note," "graduated per specific cited TL adversarial evidence" |
| **Lint Gate Authority** | The integration gate owner responsible for full-suite lint; under the all-CR coordinator model, this is the Coordinator Session for all CRs; sub-agents use targeted lint on their modified files only | M-01 — `tooling-standard.md` (Targeted File Linting section); use "Lint Gate Authority" as the named concept in the canonical decision rule |

---

## Implementation Grouping (for Phase 3)

Unless a cross-chunk coordination note below applies, chunks are independent and can execute in any order or in parallel. Each chunk's implementing agent reads only the files listed for that chunk.

| Chunk | Files (1–3) | Items |
|---|---|---|
| **A** | `agent-docs/workflow.md` | H-01 (remove [S] single-session exception from session scope section; update Acceptance Phase to reflect that `tech-lead-to-ba.md` is authored by Coordinator, not TL directly, when coordinator model applies; clarify escalation path for BA acceptance questions); H-02 (workflow.md component: update Acceptance Phase step 2 evidence criterion — `specific cited TL adversarial evidence` — with a worked example or function-based rephrasing that describes what the evidence must demonstrate, not just what form it must take); M-06 (Pre-Replacement Check policy: distinguish tool constraint from ceremony; add same-session shortcut rule — when agent set prior CR status in current session, single attestation satisfies the check) |
| **B** | `agent-docs/roles/ba.md` | H-02 (ba.md component: add Graduated Verification Decision Tree to Acceptance Verification section as a short diagnostic prompt for tier classification); M-03 (add `meta-improvement-protocol.md` to BA Role-Specific Readings / Required Readings list) |
| **C** | `agent-docs/roles/tech-lead.md` (implementing agent verifies path — may be `agent-docs/roles/coordination/tech-lead.md`) ⚠️ | H-01 companion (update CR Execution Model section to reflect coordinator-for-all-CRs; remove [S] exception from TL-side model description; ensure consistent vocabulary with Chunk A); M-04 (tech-lead.md component: add `lib/security/*` to Permitted Direct Changes table under "Shared Infra: Non-feature utilities"); M-07 (add `@ts-expect-error` two-outcome coverage requirement to TL handoff self-check list: if snippet contains `@ts-expect-error`, name both outcomes — error present: keep directive; no error: omit directive to avoid TS2578) |
| **D** | `agent-docs/tooling-standard.md` | M-01 (add Lint Gate Authority canonical decision rule to Targeted File Linting section — targeted lint = sub-agent modified-files scope; full-suite lint = Lint Gate Authority / Coordinator Session; both gates must pass before CR closure); M-02 (add complete nvm sourcing steps to Runtime Preflight (Mandatory) section — full sequence: `export NVM_DIR`, `source $NVM_DIR/nvm.sh`, `nvm use <version>`; not just `nvm use <version>` which silently fails without sourcing) |
| **E** | `agent-docs/development/backend.md` (implementing agent verifies path — may be `agent-docs/roles/sub-agents/backend.md`) | M-05 (add security vulnerability class scan as standing Backend practice — when implementing a fix for a class of vulnerability, scan all affected surface area for the same class and flag but do not fix adjacent instances in the same CR; cite the grep scope appropriate to the vulnerability class) |
| **F** | `lib/security/contentLength.ts` | M-04 (lib/security/ component: improve `readStreamWithLimit` function docstring to document the `contentLength` parameter contract — specifically: what value to pass when `Content-Length` header is absent, why passing `MAX_BODY_SIZE` makes both primary and secondary byte checks fire at the same threshold, and the distinction between limit and contentLength when a declared header value is present) |

---

## Cross-Chunk Coordination Notes

- **H-01 spans Chunks A and C.** Chunk A (workflow.md) and Chunk C (tech-lead.md) both describe the coordinator model change. Both must use the term **"Coordinator Session"** and describe the model as applying to all CRs regardless of sub-agent count. If running in parallel, pre-agree: the description in workflow.md is canonical; Chunk C cross-references it rather than re-describing it independently. Chunk A should execute first or confirm the exact session model description before Chunk C writes.

- **H-02 spans Chunks A and B.** Chunk A (workflow.md step 2: evidence criterion) and Chunk B (ba.md: full decision tree) both touch the graduated verification policy. They are logically independent — Chunk A clarifies the criterion wording; Chunk B adds the decision tree. Both must use the same tier labels: **"re-read independently," "trust with source audit note," "graduated per specific cited TL adversarial evidence."** Tier labels must not be coined independently in each chunk.

- **M-04 spans Chunks C and F.** Chunk C (tech-lead.md Permitted Direct Changes table) and Chunk F (lib/security/contentLength.ts docstring) are fully independent and can run in parallel. No vocabulary coordination required.

- **Chunk C ⚠️ prerequisite check (CR-023 M-05 regression risk).** CR-023 synthesis Chunk E targeted `coordinator.md` or `tech-lead.md` for an adversarial review dimension library (M-05). When implementing Chunk C (tech-lead.md updates for H-01 companion and M-07), the implementing agent must check whether CR-023 Chunk E was completed and whether `coordinator.md` exists. Document the current state before writing. If `coordinator.md` exists and has an adversarial review section, do not duplicate content there. If CR-023 Chunk E was not implemented, flag it as a regression in the implementation report; do not implement it in this chunk.

---

## Stats

**Raw Top-5 findings:** 15 (3 agents × 5 findings each)
**Unique findings after de-duplication:** 9
**Fix:** 8 (2 High, 6 Medium)
**Defer:** 0
**Reject:** 1 (M-03 — user rejected)

**De-duplication map (raw → consolidated):**
- TL-024-O2 + TL-024-E1 + BA-024-R1 → H-01 (3 raw findings → 1 consolidated; BA-024-R1 is companion, not standalone)
- BA-024-U1 + BA-024-E1 → H-02 (2 raw findings → 1 consolidated)
- BCK-024-C1 + TL-024-R1 → M-01 (2 raw findings → 1 consolidated)
- BCK-024-O3 + TL-024-M2 → M-02 (2 raw findings → 1 consolidated; promoted from CR-023 L-01 Defer)
- BA-024-C1 → M-03
- BCK-024-M2 + TL-024-M3 → M-04 (2 raw findings → 1 consolidated, 2 fix locations)
- BCK-024-M1 → M-05
- BA-024-W1 → M-06 (carry-forward — fifth consecutive appearance)
- BCK-024-U1 → M-07

**Regression flags:**
- CR-023 M-05 (adversarial review dimension library, coordinator.md path): **Confirmed implemented** — `coordinator.md` contains a complete "Portable Adversarial Review Dimensions" section and a full "Adversarial Dimension Library (by CR Domain)" with four domain categories. No regression. ✓
- CR-023 L-01 (nvm sourcing) → promoted to M-02 Fix. Expected; mandated by CR-023 deferral condition. ✓
- No other regression flags from CR-023 Fix items appear in CR-024 Top-5 findings. BCK-024-O1 (full findings, not Top-5) confirms CR-023 M-04 (safeMetric documentation) is durable and applied correctly in CR-024.

**Implementation notes (Phase 3 outcomes):**
- M-03 rejected by user — meta-improvement-protocol.md remains out of BA required readings; explicit meta-mode prompt is the correct loading mechanism.
- BA-024-R1 (Acceptance Phase attribution companion to H-01): upon reading current file state, `coordinator.md` and `tech-lead.md` both assign `tech-lead-to-ba.md` authorship to the Tech Lead (Session B). The BA workflow section ("BA reviews the Tech Lead's report") remains accurate after the coordinator scope extension — no change needed in the Acceptance Phase attribution.
- H-01 implementation: removed `(for [M]/[L] CRs)` qualifier from workflow.md Session Scope Management header; removed `[S]` single-session exception bullet; added explicit `[S]` CR session count note to tech-lead.md (3 sessions: TL Session A + 1 Coordinator + TL Session B).
- M-04: `lib/security/*` added to TL Permitted Direct Changes table under Shared Infra. `readStreamWithLimit` docstring updated with full `contentLength` parameter contract (header-present vs. header-absent behavior, dual-threshold semantics).
