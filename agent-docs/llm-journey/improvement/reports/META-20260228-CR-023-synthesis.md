# Meta Synthesis: CR-023

**Date:** 2026-02-28
**Findings sources:**
- `agent-docs/meta/META-20260228-CR-023-backend-findings.md`
- `agent-docs/meta/META-20260228-CR-023-tech-lead-findings.md`
- `agent-docs/meta/META-20260228-CR-023-ba-findings.md`
**Prior synthesis cross-referenced:** `agent-docs/meta/META-20260227-CR-022-synthesis.md`
**Synthesis agent:** Tech Lead (meta-improvement mode)
**Note:** Before/after wording is NOT included here — this is Phase 2 synthesis only. Implementing agent writes wording in Phase 3.

---

## Summary

CR-023's three-agent meta chain produced 15 raw Top-5 findings, consolidating to 9 distinct items after de-duplication. Two findings are High priority. H-01 (observability design principle) is a three-agent convergence — the only finding all three agents independently identified from their own vantage point; High is assigned on 3-agent convergence merits (the force-promote condition in meta-improvement-protocol.md targets consecutive cross-CR analyses, which is technically not met for this new-in-CR-023 finding). H-02 (metric mock cascade) is a four-finding convergence covering the full structural gap: missing TL pre-delegation check, missing Testing Handoff Trigger Matrix row, Backend/Testing ownership split, and the "Do NOT modify test files" + DoD conflict that blocked CR-023 execution. Five Medium findings address: BA negative assertion without grep (root cause of AC-4 error), Reversal Risk annotation formalization, safeMetric test-vs-production divergence, adversarial review dimensions portability (⚠️ confirmed regression from TL-022-03 → CR-022 H-01), and deleted contracts classification ambiguity. M-01 (scope-narrowing authority) is rejected — see rationale below. One Low finding (nvm sourcing) is deferred per user-stated low priority.

**File move completed (pre-Phase 3):** `agent-docs/observability.md` has been relocated to `agent-docs/llm-journey/project-principles/observability.md`. The new `llm-journey/project-principles/` directory is established. No references to the old path existed. Phase 3 implementing agents for H-01 write to the new path only.

---

## High Priority

| # | Finding | Source(s) | Affected Files | Decision |
|---|---|---|---|---|
| H-01 | Observability design principle not documented — "instrument product operations not infrastructure plumbing; prefer metrics+logs over disconnected root spans" exists only in CR-023 rationale text; will be lost on archival; three agents independently identified the gap | BCK-023-E1, TL-023-E1, BA-023-E1 | `agent-docs/llm-journey/project-principles/observability.md` (primary — file exists, add Design Principles section); `agent-docs/development/architecture.md` (cross-reference); `agent-docs/development/backend.md` (cross-reference); `agent-docs/AGENTS.md` (add note to follow in-file references) | **Fix** |
| H-02 | Metric mock cascade structural gap — four-finding convergence: TL pre-delegation checklist missing the mock cascade grep check (TL-023-M1); Testing Handoff Trigger Matrix missing the metric getter row (TL-023-S1); Backend/Testing ownership split for metrics.ts is structurally recurring (BCK-023-S1); "Do NOT modify test files" + DoD `pnpm test` conflict blocked CR-023 and required user override (BCK-023-C1) | BCK-023-C1, BCK-023-S1, TL-023-M1, TL-023-S1 | `agent-docs/roles/coordination/tech-lead.md` (implementing agent verifies path); `agent-docs/workflow.md`; `agent-docs/roles/sub-agents/backend.md` (implementing agent verifies path) | **Fix** |

**H-01 rationale:** BCK-023-E1 (Backend: principle lives only in one CR's rationale), TL-023-E1 (Tech Lead: TL-authored plan rationale has no mechanism to flow into persistent docs), and BA-023-E1 (BA: BA-authored principle in CR Business Context has no pathway to persistent guidance) all independently located the same absence. The principle was the intellectual core of CR-023 — it directly shaped scope, rationale, and implementation decisions across all three agents. Without documentation in a persistent reference artifact, every future CR touching instrumentation will re-derive it or miss it entirely, reproducing the span-on-infrastructure mistake.

Fix target is `agent-docs/llm-journey/project-principles/observability.md` — a dedicated principle file that is the atomic change site for observability decisions. This file already exists (moved from `agent-docs/observability.md`) and contains the architecture overview. The implementing agent adds a new "Design Principles" section containing the Purposeful Observability Principle. `architecture.md` and `backend.md` add cross-references to this file by path — they do not duplicate the principle. `AGENTS.md` gains a note that agents must follow in-file references (links within loaded docs) to their targets, not treat linked files as optional reading.

**H-02 rationale:** Four raw findings trace to the same structural root: the TL delegation graph for observability CRs has no mechanism to detect that adding a new metric getter to `lib/otel/metrics.ts` triggers a test mock cascade in Testing-owned files. BCK-023-C1 hit this cascade as a live blocker requiring user override. BCK-023-S1 identifies the ownership split as structurally recurring — every future observability CR adding metric getters hits the same trap without the fix. TL-023-M1 identifies the missing pre-delegation grep as TL-owned and TL-discoverable before delegation. TL-023-S1 identifies the missing trigger matrix row as the systemic fix point in workflow.md. Three fix locations address different phases: pre-delegation checklist in tech-lead.md (prevents the oversight at source), trigger matrix row in workflow.md (standing decision rule for future CRs), ownership note in backend.md (preflight signal so Backend can flag the cascade proactively).

---

## Medium Priority

| # | Finding | Source(s) | Affected Files | Decision |
|---|---|---|---|---|
| M-02 | BA negative assertion without grep — `ba.md` Technical Sanity Check permits file reads to ground AC claims but does not distinguish positive claims (verifiable by reading the specific file) from negative claims (absence assertions require exhaustive caller search, not file reads); direct root cause of AC-4 error and downstream TL pre-planning audit cost | BA-023-M1 | `agent-docs/roles/ba.md` (Technical Sanity Check + BA Decision Matrix) | **Fix** |
| M-03 | Reversal Risk annotation informal — BA's targeted risk note in `ba-to-tech-lead.md` was causally effective (TL-023-O1 confirms the note directly caused TL to run the audit that caught the AC-4 error) but was produced by intuition, not protocol; no named annotation field in the handoff template distinguishes a Reversal Risk note from general Risk Notes | BA-023-M2 | `agent-docs/roles/ba.md` (handoff template guidance); `ba-to-tech-lead.md` template (implementing agent verifies path — if a separate template file exists, add Reversal Risk field there; if not, ba.md guidance is sufficient) | **Fix** |
| M-04 | safeMetric test-vs-production divergence undocumented — in production, `safeMetric` swallows and logs metric errors; in test mocks across this codebase, `safeMetric` is implemented as `(fn) => fn()` and propagates errors; this load-bearing contract is nowhere written; agents adding new metric calls have no way to anticipate that test-side metric failures propagate into route error boundaries and surface as wrong-content-type assertion failures | BCK-023-M2 | `agent-docs/development/backend.md` (Observability section) | **Fix** |
| M-05 | Adversarial review dimensions not portable — TL re-derives relevant check types from the CR spec each session; no maintained library of adversarial dimension types exists in tech-lead.md or coordinator.md; TL-022-03 was incorporated into CR-022 H-01 but the dimension-portability sub-issue was not resolved | TL-023-E2 | `agent-docs/roles/coordinator.md` (implementing agent verifies: if coordinator.md exists and has adversarial review authority, add dimension library there; if not, add to tech-lead.md adversarial review section) | **Fix ⚠️** |
| M-06 | Deleted contracts classification ambiguous — BA acceptance graduation rule cites testids, files, and APIs as examples of "deleted contracts" requiring independent re-read; no underlying principle is stated; instrumentation removal (spans, metric wrappers) does not match any named example and requires judgment rather than rule application | BA-023-U1 | `agent-docs/roles/ba.md` (Acceptance Verification — graduated verification rule) | **Fix** |

**M-02 rationale:** BA-023-M1 directly caused the AC-4 error: BA wrote "no call site exists anywhere in the codebase" after reading the route file and metrics.ts without running a caller grep. A single grep before writing the AC would have caught the caller at requirements time. The fix is a targeted rule in ba.md Technical Sanity Check: when an AC asserts absence (dead code, no callers, unused function, removed export), run a verification command before writing the AC.

**M-03 rationale:** TL-023-O1 confirmed the causal chain: BA's Reversal Risk note → TL ran the grep → found `lib/otel/token.ts:20` → escalated before implementing. Without the note, TL would have implemented AC-4 and the error would have surfaced later. The note was produced by intuition, not a template prompt. A named "Reversal Risk" annotation field ensures this protective mechanism is systematic, not luck-dependent.

**M-04 rationale:** BCK-023-M2 identifies a load-bearing test contract currently invisible to any agent adding metric calls. The divergence (production: swallows errors; tests: propagates them) is correct and intentional. But the cascading failure mode (new metric getter → test-side `undefined()` call → TypeError → route outer catch → wrong content-type response) is completely non-obvious. Without documentation, every future agent adding metric getters will hit the same diagnostic dead-end.

**M-05 rationale:** TL-023-E2 confirms TL-022-03 is unaddressed after one synthesis cycle. TL-022-03 was merged into CR-022 H-01 (Coordinator role creation). H-01 was marked Fix. If coordinator.md was created but did not include adversarial dimension portability, the TL-022-03 sub-item was silently dropped. If coordinator.md was not created at all, CR-022 H-01 itself is an unimplemented Fix. Implementing agent must check current file state and document which scenario applies. Do not create coordinator.md from scratch in this chunk; if it does not exist, add adversarial dimension guidance to tech-lead.md and note the regression.

**M-06 rationale:** BA-023-U1 correctly identifies that examples-based definitions create judgment gaps when new case types don't match the examples. Instrumentation removal (span calls, metric wrappers) is structurally a deletion that alters observable behavior — but it is not a testid, a file deletion, or an API change. A principle-based definition would classify instrumentation removal correctly without requiring a judgment call.

---

## Rejected

| # | Finding | Source(s) | Decision | Rationale |
|---|---|---|---|---|
| M-01 | Scope-narrowing authority gap — no protocol defines when TL may resolve a scope change in-session with user vs. when BA must formally sign off on an AC descope | TL-023-C1, BA-023-C1 | **Reject** | BA does not have deep technical knowledge and may legitimately miss details — this is inherent to the role, not a process gap. The correct response when TL finds a factual discrepancy is to surface it to the user directly. If the user considers the CR fundamentally broken they will stop the flow; otherwise they approve. The existing informal path that occurred in CR-023 (TL presents options → user decides) is the correct behavior. Creating a formal authority protocol adds ceremony without improving outcomes for an edge case that is adequately handled by user consultation. |

---

## Low Priority / Deferred

| # | Finding | Decision | Rationale |
|---|---|---|---|
| L-01 | BCK-023-M3 — nvm recovery path in Runtime Preflight is incomplete: `nvm use 20` silently fails without the nvm sourcing step | **Defer** | User explicitly stated during CR-023 execution that this is environmental and low priority. If the nvm sourcing issue recurs in a future CR, promote to Medium and fix `agent-docs/tooling-standard.md` Runtime Preflight. |

---

## Vocabulary Pre-Decisions

The following terms are pre-decided to enforce consistency across chunks. Implementing agents must use these exact terms; do not coin synonyms independently.

| Term | Definition | Used in |
|---|---|---|
| **Purposeful Observability Principle** | The named observability design principle: a span adds diagnostic value only when it can link to a parent trace context; infrastructure-only routes with no parent trace context produce disconnected root spans (trace noise, not signal); prefer metrics and logs for operations that do not participate in an end-to-end distributed trace | H-01 — `agent-docs/llm-journey/project-principles/observability.md` (where the principle is defined and named); `architecture.md` and `backend.md` cross-references must use this exact name |
| **metric mock cascade** | The event pattern where adding or renaming an exported function in a shared metric infrastructure module (e.g., `lib/otel/metrics.ts`) silently breaks test files that mock the module with a closed factory object, causing test-side callers of the new function to receive `undefined` and propagate errors into route error boundaries | H-02 — `tech-lead.md` pre-delegation checklist (check trigger name), `workflow.md` Testing Handoff Trigger Matrix (row label), `backend.md` (preflight warning label); all three must use "metric mock cascade" |
| **Reversal Risk** | A named annotation type in the BA handoff — distinct from general Risk Notes — that specifies: before implementing a given AC, a named verification step must be run, and if that verification fails, implementation must stop and the BA must be contacted before proceeding | M-03 — `ba.md` (handoff template guidance) and any separate `ba-to-tech-lead.md` template file; both must use "Reversal Risk" as the field label |

---

## Implementation Grouping (for Phase 3)

Unless a cross-chunk coordination note below applies, chunks are independent and can execute in any order or in parallel. Each chunk's implementing agent reads only the files listed for that chunk. Implementing agents should consult `agent-docs/improvement.md` when deciding whether new content warrants a dedicated file vs. an inline addition.

| Chunk | Files (1–3) | Items |
|---|---|---|
| **A** | `agent-docs/llm-journey/project-principles/observability.md` (file exists — add Design Principles section); `agent-docs/development/architecture.md`; `agent-docs/AGENTS.md` | H-01 (add Purposeful Observability Principle as a named Design Principles section in observability.md; add cross-reference by file path in architecture.md; add note in AGENTS.md that agents must follow in-file links to their referenced files, not treat them as optional) |
| **B** | `agent-docs/workflow.md`; `agent-docs/roles/coordination/tech-lead.md` (implementing agent verifies path — may be `agent-docs/roles/tech-lead.md`) | H-02 (add Testing Handoff Trigger Matrix row for metric mock cascade in workflow.md; add pre-delegation mock cascade grep check step to tech-lead.md discovery phase checklist) |
| **C** | `agent-docs/roles/ba.md` | M-02 (add negative assertion grep requirement to Technical Sanity Check + BA Decision Matrix); M-03 partial (add Reversal Risk annotation guidance to handoff template section); M-06 (clarify deleted contracts definition from examples-based to principle-based in graduated verification rule) |
| **D** | `agent-docs/development/backend.md` | H-01 partial (add cross-reference to `agent-docs/llm-journey/project-principles/observability.md` by exact path — do not duplicate principle text); H-02 partial (add metric mock cascade warning to backend.md preflight checklist or Ownership Quick Matrix); M-04 (document safeMetric test-vs-production behavior divergence in Observability section, including cascading failure mode and why divergence is intentional) |
| **E** | `agent-docs/roles/coordinator.md` (implementing agent verifies existence) or `agent-docs/roles/coordination/tech-lead.md` | M-05 ⚠️ (add adversarial review dimension library — implementing agent reads coordinator.md first; if it exists with adversarial review authority, add library there; if coordinator.md does not exist, add to tech-lead.md and note CR-022 H-01 regression in implementation report; do not create coordinator.md from scratch) |
| **F** | `ba-to-tech-lead.md` template (implementing agent verifies path — if a separate persistent template file exists, add Reversal Risk as a named field distinct from Risk Notes; if no separate template file exists, this chunk is a no-op — document the decision) | M-03 partial (add Reversal Risk annotation field to ba-to-tech-lead.md template) |

---

## Cross-Chunk Coordination Notes

- **H-01 spans Chunks A and D.** Chunk A must execute first (or confirm the file path and section title before Chunk D writes). Implementing agent for Chunk D must use the exact path `agent-docs/llm-journey/project-principles/observability.md` in the cross-reference sentence added to backend.md. If running concurrently, Chunk D defers the cross-reference sentence until Chunk A confirms the section title is "Design Principles" (or whatever Chunk A implements — pre-decided section name: **"Design Principles"**).

- **H-02 spans Chunks B and D.** Chunk B adds the TL pre-delegation mock cascade check (tech-lead.md) and the Testing Handoff Trigger Matrix row (workflow.md). Chunk D adds the metric mock cascade warning to backend.md. Independent — can run in parallel. Both must use the term **"metric mock cascade"** as the canonical label.

- **M-03 spans Chunks C and F.** Chunk C adds Reversal Risk guidance to ba.md. Chunk F adds the Reversal Risk field to the ba-to-tech-lead.md template. Chunk C should execute before Chunk F so guidance and template field are consistent. Both must use **"Reversal Risk"** as the field label.

- **M-05 ⚠️ prerequisite check.** Implementing agent for Chunk E must verify current state of coordinator.md before writing. Determine and document which scenario applies: (a) coordinator.md exists with adversarial review authority → add library there; (b) coordinator.md exists but adversarial review authority absent → add to tech-lead.md and note gap; (c) coordinator.md does not exist → add to tech-lead.md and flag CR-022 H-01 as regression.

---

## Stats

**Raw Top-5 findings:** 15 (3 agents × 5 findings each)
**Unique findings after de-duplication:** 9
**Fix:** 7 (2 High, 5 Medium)
**Defer:** 1 (Low)
**Reject:** 1 (M-01)

**De-duplication map (raw → consolidated):**
- BCK-023-E1 + TL-023-E1 + BA-023-E1 → H-01 (3 raw findings → 1 consolidated)
- BCK-023-C1 + BCK-023-S1 + TL-023-M1 + TL-023-S1 → H-02 (4 raw findings → 1 consolidated)
- TL-023-C1 + BA-023-C1 → M-01 → Rejected
- BA-023-M1 → M-02
- BA-023-M2 → M-03
- BCK-023-M2 → M-04
- TL-023-E2 → M-05
- BA-023-U1 → M-06
- BCK-023-M3 → L-01

**Regression flags:**
- M-05 ⚠️: TL-023-E2 confirms TL-022-03 (adversarial review dimensions portability) was not addressed after being incorporated into CR-022 H-01. Implementing agent for Chunk E must read current state of coordinator.md and tech-lead.md before writing.
- No other regression flags from CR-022 synthesis Fix items appear in CR-023 Top-5 findings. (BCK-023-O1 confirms CR-022 M-01 targeted linting fix is durable and working.)
