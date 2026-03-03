# Meta Synthesis: CR-022

**Date:** 2026-02-27
**Findings sources:**
- `agent-docs/meta/META-20260227-CR-022-frontend-findings.md`
- `agent-docs/meta/META-20260227-CR-022-backend-findings.md`
- `agent-docs/meta/META-20260227-CR-022-coordinator-findings.md`
- `agent-docs/meta/META-20260227-CR-022-tech-lead-findings.md`
- `agent-docs/meta/META-20260227-CR-022-ba-findings.md`
**Prior synthesis cross-referenced:** `agent-docs/meta/META-20260226-CR-021-synthesis.md`
**Synthesis agent:** Tech Lead (meta-improvement mode)
**Note:** Before/after wording is NOT included here — this is Phase 2 synthesis only. Implementing agent writes wording in Phase 3.

---

## Summary

CR-022's five-agent meta chain produced 25 raw Top-5 findings, consolidating to 16 distinct items after de-duplication. Nine de-duplication pairs are identified below. One finding is High priority. H-01 (Coordinator role gap) is a five-finding convergence across two roles and is simultaneously a confirmed ⚠️ regression from CR-021 H-02 (marked Fix, not implemented) — the strongest regression signal this project has produced. Thirteen Medium findings span workflow protocol gaps (pre-authored handoffs, Approval Gate exception, Background Task execution, Bash-denied fallback), verification standards (Negative Space Rule, targeted linting, ghost handler contract parity, Logic Dictation boundary), product documentation gaps (dual-audience definition, AI disclaimer policy, bridge link policy), and BA process gaps (client-server contract parity checklist, Learner Transformation AC example, Testing Contract Registry freshness). Two Low findings are deferred (Educational Content Grid, toRecord utility duplication). No findings are rejected.

---

## High Priority

| # | Finding | Source(s) | Affected Files | Decision |
|---|---|---|---|---|
| H-01 | Coordinator role gap — five-finding convergence: Tech Lead conflates planning with coordination ops; no `coordinator.md` exists; sessions enter via CR-specific state file; portable adversarial dimensions re-authored per CR; Bash-denied fallback unspecified; Background Task execution guidance absent | CRD-022-01, CRD-022-02, CRD-022-05, TL-022-01, TL-022-03 | `agent-docs/roles/coordinator.md` (new), `agent-docs/roles/tech-lead.md`, `agent-docs/workflow.md` | **Fix ⚠️** |

**H-01 rationale:** Five findings from two independent roles (Coordinator and Tech Lead) converge on the same structural absence: no Coordinator role doc exists, no stable entry protocol exists, and coordination artifacts (adversarial check specs, session sequencing, handoff issuance, quality gate verification) remain embedded in CR-specific state files and re-authored from scratch each CR. This is a confirmed regression from CR-021 H-02, which was marked Fix in the prior synthesis but was not implemented — CR-022 ran the same confused multi-session coordination pattern. The five sub-issues (no role doc, no session entry protocol, portable dimensions re-authored, Bash-denied fallback unspecified, Background Task guidance absent) are inseparable: all are resolved by creating `coordinator.md` and stripping the corresponding content from `tech-lead.md`. See Cross-Chunk Coordination Notes for sequencing constraint between Chunks A and B.

**H-01 ⚠️ regression flag:** CR-021 H-02 was marked Fix and assigned to Chunks A and B of CR-021's Phase 3. Implementing agent must read the current state of `agent-docs/roles/tech-lead.md` and `agent-docs/workflow.md` before editing to determine what CR-021 H-02 actually added. If coordination content was partially extracted during CR-021 implementation, the implementing agent should extend that work rather than overwrite it. If CR-021 H-02 was not applied at all, implement from scratch. Do not assume current file state matches the CR-021 H-02 intent.

---

## Medium Priority

| # | Finding | Source(s) | Affected Files | Decision |
|---|---|---|---|---|
| M-01 | Project-wide linting serializes Backend verification gate; no documented standard for targeted file linting — Backend agent could not attest lint gate when Frontend had unrelated lint errors | BCK-022-01, BCK-022-05 | `agent-docs/tooling-standard.md` (implementing agent verifies path) | **Fix** |
| M-02 | "Negative Space Rule" verification pattern (verify absence + verify retained path) in active use by Backend handoff and Coordinator adversarial checks but not codified as a named standard — will be reinvented ad-hoc each CR | BCK-022-02, TL-022-05 | `agent-docs/testing-strategy.md` | **Fix** |
| M-03 | Ghost handler / client-server contract parity — `AdaptationChat.tsx` retained `invalid_config` error handler after Backend removed the code; neither Backend handoff scope nor BA closure checklist prompted detection; client-server contract parity has no systematic check | BCK-022-03, BA-022-02 | `agent-docs/roles/ba.md` (BA closure checklist item), `agent-docs/roles/sub-agents/backend.md` (implementing agent verifies path) | **Fix** |
| M-04 | Background Task execution guidance absent — no protocol for when to use background Task vs interactive session; no fallback when delegated agent cannot run Bash quality gates; Testing preflight was skipped because background Task cannot confirm reading interactively | CRD-022-03, CRD-022-04 | `agent-docs/roles/coordinator.md` (new — absorbed into H-01 Chunk A) | **Fix** |
| M-05 | Bridge Link / Stage Continuity tension — `project-principles.md` Stage Continuity requires an explicit bridging link but DRY navigation principle makes a second link to the same destination noise; no policy defines when the bridging callout link adds value vs duplicates footer; user removed the link post-closure confirming the conflict is real and recurring | F4, BA-022-04 | `agent-docs/project-principles.md` / Stage Continuity | **Fix** |
| M-06 | Testing handoff pre-determined at plan time but forced through a separate Coordinator issuance session — no "pending-issue" handoff state exists; Tech Lead embeds the Testing spec in `TL-session-state.md` as a workaround and Coordinator transcribes it, adding a full session boundary and transcription drift risk | TL-022-02 | `agent-docs/workflow.md` / Delegation Mode Rules; `agent-docs/roles/coordinator.md` (new — absorbed into H-01 Chunk A) | **Fix** |
| M-07 | Approval Gate exception condition too narrow — `[S][DOC]` is the only exception, but fully-determined `[S]` plans with no unresolved architectural decisions still trigger a gate that produces only a "go" response; adds a round-trip with no decision value | TL-022-04 | `agent-docs/roles/tech-lead.md` / The Approval Gate; `agent-docs/workflow.md` / Step 5 | **Fix** |
| M-08 | Logic Dictation: prescriptiveness in Coordinator verification specs converts independent adversarial review into answer confirmation — pre-specified exact line numbers mean the Coordinator checks the TL's pre-solved answer rather than independently verifying the constraint holds; this is distinct from acceptable prescriptiveness in sub-agent handoffs (which reduces ambiguity for execution) | BCK-022-04 | `agent-docs/roles/coordinator.md` (new — absorbed into H-01 Chunk A) | **Fix** |
| M-09 | JSX Character Escaping lint friction — Frontend agent's unescaped apostrophes in educational content triggered `react/no-unescaped-entities` lint failure mid-CR; no Common Pitfalls entry in the frontend agent doc warns of this; caused a rework cycle and blocked Backend lint gate (project-wide lint) | F1 | `agent-docs/development/frontend.md` or `agent-docs/roles/sub-agents/frontend.md` (implementing agent verifies path) | **Fix** |
| M-10 | Testing Contract Registry out-of-sync at CR start — registry was stale when CR-022 began; BA closure checklist says "confirm registry is updated" at closure but has no opening step to verify the registry was accurate before acceptance begins; update protocol (when, who, trigger) is not written into the registry doc itself | F2 | `agent-docs/testing-contract-registry.md` (implementing agent verifies path) | **Fix** |
| M-11 | Dual-audience gap — `project-vision.md` defines only learners on the website as the audience; no doc acknowledges developer-users who read the codebase as a reference implementation; BA, Frontend, and architecture decisions optimize exclusively for learners; user explicitly confirmed this gap post-CR | BA-022-01 | `agent-docs/project-vision.md` (audience section addition) or new `agent-docs/project-audience.md` (implementing agent decides placement) | **Fix** |
| M-12 | AI disclaimer policy absent — CR-022 added a disclaimer ad-hoc; no doc defines which interface types require disclaimers, standard wording, ARIA treatment, or placement convention; each future AI output surface will require independent judgment | BA-022-03 | `agent-docs/project-principles.md` / new Legal / Trust Signals section | **Fix** |
| M-13 | Learner Transformation AC formulation under-specified — `ba.md` requires "at least one measurable AC" for learner transformation but no example distinguishes a content checklist AC ("covers 4 points") from a transformation test AC ("after reading, learner can explain X"); BA-022-01 coverage spec fell into the content-checklist pattern by default | BA-022-05 | `agent-docs/roles/ba.md` / Quality Checklist | **Fix** |

**M-01 rationale:** BCK-022-01 and BCK-022-05 share the same root (no targeted lint standard in tooling-standard.md). Backend agent hit a real blockage: the DoD required a passing lint gate, but `pnpm lint` is project-wide and failed on a Frontend file unrelated to the Backend change. Implementing agent should document the `--file` flag pattern as the per-domain lint primitive, with project-wide lint reserved for the Testing Agent's full gate pass.

**M-02 rationale:** BCK-022-02 (Backend) and TL-022-05 (Tech Lead) converge independently. The pattern is already in active use (named "Negative Space Rule" in the CR-022 Backend handoff and in Coordinator adversarial checks). The fix is naming it and placing it in `testing-strategy.md` — it does not need to be invented, only documented. Both Backend agent and Coordinator confirmed it is a general verification primitive, not a domain-specific one.

**M-03 rationale:** BCK-022-03 (Backend) and BA-022-02 (BA) identify the same gap from different perspectives: the ghost handler passed Backend scope review (out-of-scope by design) and passed BA acceptance (no checklist prompt to scan for client-side error handlers referencing removed server codes). The fix has two locations: (1) a BA closure checklist item for client-server contract parity checks when this CR removes server error codes; (2) a guidance note in the backend agent doc that contract cleanup CRs should flag remaining client-side handlers as a follow-up tracking item. Both fixes are independent and can be implemented in any order.

**M-04 rationale:** CRD-022-03 and CRD-022-04 are both implementation gaps for the coordinator role. Since coordinator.md is being created for H-01, both items (execution mode guidance and Bash-denied fallback) belong in Chunk A (coordinator.md creation) and do not require a separate chunk.

**M-05 rationale:** F4 (Frontend) and BA-022-04 (BA) both observed the conflict during CR-022 execution; the user's post-closure removal of the link validates that the conflict is real and not a misreading. The policy must declare when Stage Continuity requires an explicit bridging callout link vs when the footer `JourneyContinuityLinks` component satisfies the continuity requirement. Without this policy, every new educational page will require a post-closure cleanup.

**M-06 rationale:** TL-022-02 identifies a concrete waste: the Testing handoff for CR-022 was fully specified in `TL-session-state.md` at Session A time, but a full Coordinator session was required to "issue" it by transcribing the content into `tech-lead-to-testing.md`. The fix is a `status: pending-issue` handoff state marker (see Vocabulary Pre-Decisions). Coordinator's job becomes: set status to `issued` and forward to Testing Agent — not re-transcribe.

**M-07 rationale:** TL-022-04 is a clear exception broadening. The current exception covers only `[S][DOC]` work. The broader exception should cover any `[S]` CR where the plan contains no unresolved architectural decisions or option spaces requiring user judgment. This is a small change to two files (tech-lead.md Approval Gate section + workflow.md Step 5) and removes round-trips for the most common CR type.

**M-08 rationale:** BCK-022-04 and TL-022's own assessment ("Validated with nuance") establish the distinction: prescriptiveness in sub-agent handoffs (exact snippets, exact DoD items) is acceptable and reduces ambiguity for execution agents; prescriptiveness in Coordinator verification specs (pre-specified line numbers, pre-solved assertions) undermines adversarial review independence. The fix is one clarifying principle in coordinator.md: coordinators receive check criteria from the Tech Lead but must independently locate and verify the evidence, not confirm a pre-solved answer. This is absorbed into Chunk A.

**M-09 rationale:** F1 is low-cost (one Common Pitfalls entry) and directly prevented in-flight by a named pattern. Educational content CRs will routinely contain apostrophes and ampersands in JSX — this will recur without a documented pitfall note.

**M-10 rationale:** F2 and the prior synthesis's own assessment of F2 (CR-021 TL meta: "protocol for *when* the registry must be updated is still not written into the contract registry doc or the coordinator role") confirm this is unresolved. The fix is writing the update rule into the registry doc itself so it is self-documenting: "registry must be updated at the TL/BA boundary per CR; TL Session B is the designated update point."

**M-11 rationale:** User-explicit confirmation ("not only the learners on the website but also developer who will use this project code to maybe make their own AI system") removes ambiguity about intent. The absence of a dual-audience definition causes every BA to optimize exclusively for learners and every architectural decision to ignore developer-user readability goals. The implementing agent should decide whether to add a new Audience section to `project-vision.md` or create a standalone `project-audience.md` — the pre-decided vocabulary applies either way (see Vocabulary Pre-Decisions).

**M-12 rationale:** BA-022-03 identified a real legal-exposure policy gap. An inline `<p>` tag was the implicit decision for CR-022, but with no policy governing disclaimer triggers, wording, ARIA treatment, or placement, future AI output surfaces will accumulate inconsistent disclaimer elements. A "Legal / Trust Signals" section in `project-principles.md` prevents this accumulation.

**M-13 rationale:** BA-022-05 identifies that `ba.md`'s "at least one measurable AC for learner transformation" requirement has no example to show what "measurable transformation" looks like versus a content checklist check. One concrete before/after example is sufficient to calibrate future BA ACs without changing the requirement itself.

---

## Low Priority / Deferred

| # | Finding | Decision | Rationale |
|---|---|---|---|
| L-01 | F3 — Educational Content Grid Pattern: `design-tokens.md` lacks a standard for "Bullet Point Groups" or "Feature Grids"; Frontend made ad-hoc markup choices | **Defer** | Requires design decisions beyond current meta-improvement scope; a design system pattern is a product design task, not an agent process fix. Revisit when a design system CR is scheduled. |
| L-02 | F5 — `toRecord` utility duplication in `FrontierBaseChat.tsx` and `AdaptationChat.tsx`; handoff explicitly restricted extraction | **Defer** | Code change requiring a follow-up micro-CR; extraction to a shared utility is correct but outside meta-improvement scope. Similar to CR-021 L-02 (SSE parsing duplication). Track as a future micro-CR. |

---

## Vocabulary Pre-Decisions

The following terms are pre-decided to enforce consistency across chunks. Implementing agents must use these exact terms; do not coin synonyms independently.

| Term | Definition | Used in |
|---|---|---|
| **CR Coordinator** | The role that owns post-plan execution management: issues sub-agent handoffs, defines adversarial check criteria, sequences execution, runs or delegates quality gates, and delivers a verified conclusion to Tech Lead; does NOT own the plan artifact | H-01 — `coordinator.md` (role definition), `tech-lead.md` (role reference), `workflow.md` (execution model); all three must use "CR Coordinator" |
| **Negative Space Rule** | A verification primitive: for every removal or restriction, verify (a) absence — grep for zero matches of the removed item — and (b) retained-path correctness — the replacement or remaining path still passes a positive assertion | M-02 — `testing-strategy.md` Verification Depth section; coordinators and testing agents referencing this rule must use "Negative Space Rule" as the named standard |
| **`status: pending-issue`** | A handoff file status marker indicating the handoff content was authored at plan time but has not yet been issued to the receiving agent; Coordinator's responsibility is to set status to `issued` and forward | M-06 — `workflow.md` (Delegation Mode Rules) and `coordinator.md` (handoff issuance protocol); both must use the same status value |
| **learner-user** | An audience member who visits the website to learn about LLMs; optimizes for conceptual clarity and progressive narrative | M-11 — `project-audience.md` or `project-vision.md` Audience section; any other doc referencing the learner audience must use "learner-user" |
| **developer-user** | An audience member who reads the codebase as a reference implementation to build their own AI system; optimizes for code pattern clarity, architectural explicitness, and production-realistic choices | M-11 — same files as "learner-user"; consistent compound-noun form must appear in both audience definitions |
| **client-server contract parity** | The property that client-side error handlers reference only error codes, enums, and contract members that the server currently emits; absence of parity produces ghost handlers | M-03 — `ba.md` (closure checklist item label) and backend sub-agent doc (cleanup guidance); both must use this phrase for cross-role traceability |

---

## Implementation Grouping (for Phase 3)

Unless a cross-chunk coordination note below applies, chunks are independent and can execute in any order or in parallel. Each chunk's implementing agent reads only the files listed for that chunk.

| Chunk | Files (1–3) | Items |
|---|---|---|
| **A** | `agent-docs/roles/coordinator.md` (new file) | H-01 (role definition, session entry protocol, portable adversarial dimensions), M-04 (Background Task vs interactive session guidance, Bash-denied fallback protocol), M-06 partial (pre-authored `pending-issue` handoff state and issuance protocol in coordinator authority), M-08 (prescriptiveness boundary: check criteria vs. pre-solved line references in verification specs) |
| **B** | `agent-docs/roles/tech-lead.md`, `agent-docs/workflow.md` | H-01 partial (strip coordination ops from tech-lead.md, reference coordinator.md; update workflow.md execution model to CR Coordinator), M-06 partial (add `status: pending-issue` as a handoff state in workflow.md Delegation Mode Rules), M-07 (Approval Gate exception broadening for no-decision [S] CRs in both files) |
| **C** | `agent-docs/testing-strategy.md`, `agent-docs/tooling-standard.md` (implementing agent verifies path) | M-02 (Negative Space Rule: named standard in Verification Depth section of testing-strategy.md), M-01 (targeted file linting standard in tooling-standard.md: `--file` flag pattern for per-domain gates, project-wide lint reserved for Testing Agent full gate pass) |
| **D** | `agent-docs/roles/ba.md` | M-03 partial (client-server contract parity — add BA closure checklist item triggered when CR removes server error codes or contract members), M-13 (Learner Transformation AC — add one concrete before/after example to Quality Checklist distinguishing content checklist AC from transformation test AC) |
| **E** | `agent-docs/project-principles.md` | M-05 (Bridge Link / Stage Continuity policy — declare when bridging callout link adds value vs duplicates footer; resolve the explicit link vs JourneyContinuityLinks question), M-12 (Legal / Trust Signals — new section defining disclaimer triggers, standard wording, ARIA treatment, placement convention for AI output surfaces) |
| **F** | `agent-docs/project-vision.md` or new `agent-docs/project-audience.md` (implementing agent decides placement; if new file, add cross-reference from project-vision.md) | M-11 (dual-audience definition: learner-user, developer-user, their respective goals, and the trade-off priority rule when a decision serves one audience but not the other) |
| **G** | frontend agent doc (implementing agent verifies path: `agent-docs/development/frontend.md` or `agent-docs/roles/sub-agents/frontend.md`), backend sub-agent doc (implementing agent verifies path: `agent-docs/roles/sub-agents/backend.md` or equivalent) | M-09 (JSX escaping Common Pitfalls entry in frontend agent doc), M-03 partial (client-server contract parity — add backend agent guidance: cleanup CRs that remove server error codes must flag remaining client-side handlers as follow-up tracking items) |
| **H** | `agent-docs/testing-contract-registry.md` (implementing agent verifies path) | M-10 (write registry update protocol into the registry doc itself: update at TL/BA boundary per CR, TL Session B is the designated update point, registry is a hard invariant not a best-effort artifact) |

---

## Cross-Chunk Coordination Notes

- **H-01 (CR Coordinator) spans Chunks A and B.** Chunk A must execute first; it creates `coordinator.md` with the role definition, authority boundary, and session entry protocol. Chunk B reads `coordinator.md` before editing `tech-lead.md` and `workflow.md` to (a) confirm what was moved to coordinator.md so it can be removed from tech-lead.md without duplication, and (b) verify "CR Coordinator" is used identically in all three files. Do not run Chunks A and B in parallel.

- **M-03 (client-server contract parity) spans Chunks D and G.** Chunk D adds the BA closure checklist item; Chunk G adds the backend sub-agent guidance. These are independent (different files, different role docs) and can run in parallel. Both must use the term **"client-server contract parity"** so the two fixes are traceable to the same root cause.

- **M-06 (pre-authored pending-issue handoffs) spans Chunks A and B.** Chunk A defines the `pending-issue` state in coordinator.md (what it means, when the Coordinator sets it to `issued`). Chunk B adds the status marker to `workflow.md`'s Delegation Mode Rules as a formal handoff state. Both must use the pre-decided literal **`status: pending-issue`**.

- **H-01 ⚠️ regression check is a prerequisite for Chunk B.** Implementing agent for Chunk B must read the current state of `tech-lead.md` and `workflow.md` before writing any content. The CR-021 H-02 Fix may have partially applied content that overlaps with H-01. Read current files; do not assume they match CR-021 intent.

---

## Stats

**Raw Top-5 findings:** 25 (5 agents × 5 findings each)
**Unique findings after de-duplication:** 16
**Fix:** 14 (1 High, 13 Medium)
**Defer:** 2 (both Low)
**Reject:** 0

**De-duplication map (raw → consolidated):**
- CRD-022-01 + CRD-022-02 + CRD-022-05 + TL-022-01 + TL-022-03 → H-01 (5 raw findings → 1 consolidated)
- BCK-022-01 + BCK-022-05 → M-01
- BCK-022-02 + TL-022-05 → M-02
- BCK-022-03 + BA-022-02 → M-03 (same root; two distinct fix locations retained)
- CRD-022-03 + CRD-022-04 → M-04 (absorbed into H-01 Chunk A)
- F4 + BA-022-04 → M-05

**Regression flags:**
- H-01 ⚠️: CR-021 H-02 was marked Fix; CR-022 five-finding convergence confirms implementation did not occur or was insufficient. Implementing agent reads current `tech-lead.md` and `workflow.md` before writing.
- No other regression flags from CR-021 synthesis items appear in CR-022 Top-5 findings.
