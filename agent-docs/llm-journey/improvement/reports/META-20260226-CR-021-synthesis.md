# Meta Synthesis: CR-021

**Date:** 2026-02-26
**Findings sources:**
- `agent-docs/meta/META-20260226-CR-021-testing-findings.md`
- `agent-docs/meta/META-20260226-CR-021-frontend-findings.md`
- `agent-docs/meta/META-20260226-CR-021-backend-findings.md`
- `agent-docs/meta/META-20260226-CR-021-techlead-findings.md`
- `agent-docs/meta/META-20260226-CR-021-ba-findings.md`
**Prior synthesis cross-referenced:** `agent-docs/meta/META-20260225-CR-018-synthesis.md`
**Synthesis agent:** Tech Lead (meta-improvement mode)
**Note:** Before/after wording is NOT included here — this is Phase 2 synthesis only. Implementing agent writes wording in Phase 3.

---

## Summary

CR-021's five-agent meta chain produced 25 raw Top-5 findings, consolidating to 20 distinct items after de-duplication. Five consolidation pairs are identified below. Two findings are High priority. The pre-replacement check circularity (H-01) is force-promoted by five-role convergence in a single CR — the strongest meta-signal this project has generated, explicitly meeting the meta-improvement protocol's escalation threshold. The Coordinator role decomposition (H-02) extends CR-018 H-01 with a user-endorsed structural fix; CR-021's four-session execution proves the CR-018 two-session-split note was insufficient for 3+ sub-agent CRs. Twelve Medium findings cover BA boundary ambiguities (security audit authority, implementation read authority, scope expansion protocol), testing infrastructure gaps (live-path concept, assessment table format, credential availability), and Tech Lead process gaps (adversarial review framework, Role Health input surface). One Low finding is a correctness-risk fix (SSE `{ stream: true }`); five Low items are deferred. No findings are rejected.

---

## High Priority

| # | Finding | Source(s) | Affected Files | Decision |
|---|---|---|---|---|
| H-01 | Pre-replacement check circularity — five-role convergence in CR-021 meets force-promote threshold; trust model (TL attestation vs independent sub-agent verification) is undeclared | TL-O1, BA-W1 (+ T-W1, F-W1, B-W1 in body) | `agent-docs/workflow.md` / Conversation File Freshness Rule | **Fix** |
| H-02 | Coordinator role: Tech Lead context saturates at 3+ sub-agents; CR-021 required four sessions despite CR-018 H-01 fix; user-endorsed Coordinator decomposition is the structural resolution | TL-S1 | `agent-docs/roles/tech-lead.md`, `agent-docs/workflow.md` / Execution Flow | **Fix** ⚠️ |

**H-01 rationale:** Five independent roles identified the same circularity in the same CR. Per the meta-improvement protocol, same-class finding in 3+ consecutive analyses triggers force-promote to High. The fix must declare the trust model: either (a) explicitly permit TL attestation to satisfy the gate for sub-agents, or (b) require independent verification of `project-log.md` and plan artifact. Either resolution eliminates the current undeclared gray zone.

**H-02 rationale:** CR-018 H-01 was marked Fix in `tech-lead.md`. CR-021 still required four sessions (Session A: plan + Backend handoff; B: Backend review + Frontend handoff; C: Frontend review + Testing handoff; D: Testing review + BA handoff), demonstrating the CR-018 fix did not resolve the 3+ sub-agent scaling problem. The user explicitly stated the Coordinator model during CR-021. This is an extension of H-01, not a separate issue. Implementing agent must read the current `tech-lead.md` to determine what H-01 added before writing Coordinator spec content. The new role name is pre-decided: **CR Coordinator** (see Vocabulary Pre-Decisions section).

**H-02 ⚠️ regression flag:** CR-018 H-01 Fix was applied to `tech-lead.md`. Implementing agent must verify what was written and determine whether the current content (a) already describes a two-session split that CR-021 exceeded, or (b) was not applied at all. Do not assume the current file state matches the CR-018 H-01 intent.

---

## Medium Priority

| # | Finding | Source(s) | Affected Files | Decision |
|---|---|---|---|---|
| M-01 | BA security audit graduation — `ba.md` closure checklist and `workflow.md` step 2 "independently re-read" security constraints read as always-on code audit; conflicts with graduated verification model; duplicates TL adversarial review work | BA-S2, BA-U1 | `agent-docs/roles/ba.md` / BA Closure Checklist; `agent-docs/workflow.md` / Acceptance Phase step 2 | **Fix** |
| M-02 | Assessment table format: no conditional-default distinction and no Validation Condition column — caused concrete suboptimal decision (retain 15s) that was externally overridden in CR-021 | T-C1, T-U1 | `agent-docs/conversations/TEMPLATE-tech-lead-to-testing.md` / Assessment targets table format | **Fix** |
| M-03 | Live credential availability undocumented in handoff env caveats — Testing discovered API key absence mid-run; Backend had no classification for unverifiable assumptions; both lack documented procedure | T-M1, B-M2 | `agent-docs/conversations/TEMPLATE-tech-lead-to-testing.md` / Known Environmental Caveats; `agent-docs/conversations/TEMPLATE-tech-lead-to-backend.md` / Assumptions To Validate | **Fix** |
| M-04 | Adversarial review framework absent from `tech-lead.md` — deviation severity classification (Minor/Major/Process-only) invented ad-hoc each CR; portable review checklist regenerated per CR in `TL-session-state.md` | TL-U1, TL-R1 | `agent-docs/roles/tech-lead.md` / Adversarial Review section | **Fix** |
| M-05 | Live-path vs fallback-path coverage concept missing from testing strategy — `testing-strategy.md` preference for deterministic fallback creates a blind spot when CR's core change is live-path-only | T-E1 | `agent-docs/testing-strategy.md` / Provider-Backed E2E Determinism | **Fix** |
| M-06 | Role Health input surface missing — `meta-improvement-protocol.md` context saturation threshold exists but `TL-session-state.md` has no health signal field; signal never accumulates across CRs | TL-M2 | `agent-docs/coordination/TL-session-state.md` (template); `agent-docs/coordination/meta-improvement-protocol.md` / Role Health Indicators | **Fix** |
| M-07 | OTel `span.end()` lifecycle during streaming undocumented — `streamingActive` flag pattern invented ad-hoc by Backend Agent; any future streaming route will rediscover it without guidance | B-S1 | `agent-docs/development/backend.md` / Observability | **Fix** |
| M-08 | BA authority to read implementation code during Technical Sanity Check undeclared — forces undocumented judgment call; without implementation reads, ACs lack testid/contract specificity | BA-S1 | `agent-docs/roles/ba.md` / BA Authority / Technical Sanity Check | **Fix** |
| M-09 | BA Decision Matrix missing entry for mid-session scope expansion — forced undocumented judgment calls on re-clarification, re-exploration, and pivot protocol in CR-021 | BA-M1 | `agent-docs/roles/ba.md` / BA Decision Matrix | **Fix** |
| M-10 | Expected test count delta absent from Testing handoff template — parallel agent test additions invisible to Testing Agent; requires independent tracing | T-M2 | `agent-docs/conversations/TEMPLATE-tech-lead-to-testing.md` | **Fix** |
| M-11 | Implicit test maintenance delegation — `frontend-refactor-checklist.md` prohibits test file modification without delegation, but implementing SSE broke existing component tests; no carve-out for test repair caused by structural implementation changes | F-S1 | `agent-docs/frontend-refactor-checklist.md` / Boundary Refactoring Safety | **Fix** |
| M-12 | Leaf Utility Isolation silent on sibling-directory imports — forced inline type duplication; agents will resolve inconsistently without a clarifying sentence | B-U2 | `agent-docs/development/development-standards.md` / Leaf Utility Isolation | **Fix** ⚠️ |

**M-01 rationale:** BA-S2 (authority perspective) and BA-U1 (instruction clarity perspective) point to the same two files and the same fix: add a graduation path for security constraints when specific, cited TL adversarial evidence is present. The term pre-decided for this graduation condition is **"specific cited TL adversarial evidence"** (see Vocabulary Pre-Decisions). Both `ba.md` and `workflow.md` must use this term consistently — see Chunk B/C coordination note.

**M-02 rationale:** T-C1 and T-U1 are the same template gap from different angles (ambiguous conditional-default wording vs missing Validation Condition column). A single table format change in `TEMPLATE-tech-lead-to-testing.md` resolves both. Demonstrated concrete cost in CR-021.

**M-03 rationale:** T-M1 and B-M2 have the same root cause (live credentials absent from environment). They address different templates: T-M1 targets the Known Environmental Caveats field in the testing template; B-M2 targets the Assumptions To Validate section in the backend template. Both need the same new field name — pre-decided as **"Live-path availability"** (see Vocabulary Pre-Decisions). Also check whether `TEMPLATE-tech-lead-to-backend.md` exists at `agent-docs/conversations/`; if not, the implementing agent should create it or identify the canonical template location. Note: `feedback-protocol.md` mentioned in B-M2 should be read by implementing agent; if it contains assumption classification guidance, a cross-reference may suffice instead of a new field.

**M-04 rationale:** TL-U1 (no severity classification standard) and TL-R1 (checklist regenerated per-CR) both target the same missing framework in `tech-lead.md`. The fix is a single Adversarial Review section: a deviation severity table (Minor/Major/Process-only definitions) + portable review dimensions that can be supplemented per-CR. Reduces per-CR regeneration and inconsistency.

**M-06 rationale:** Low-cost, high-value fix. Adding one `## Workflow Health Signal` field to `TL-session-state.md` activates an existing but dormant mechanism in `meta-improvement-protocol.md`. No architectural change required.

**M-07 rationale:** Backend Agent named this their highest-severity finding. The `streamingActive` flag pattern solves a non-obvious span lifecycle problem that will be rediscovered independently by every future streaming route implementation without a documented pattern in `backend.md`.

**M-12 ⚠️ regression flag:** CR-018 M-06 was marked Fix for leaf utility isolation documentation in `development-standards.md`. B-U2 addresses sibling-level imports specifically (not cross-directory imports). Implementing agent must read the current `development-standards.md` before editing to determine whether M-06 was applied and what it said about sibling imports. If M-06 covered sibling imports, this is a regression; if M-06 addressed only cross-directory imports, B-U2 is an extension.

---

## Low Priority

| # | Finding | Source(s) | Affected Files | Decision | Rationale |
|---|---|---|---|---|---|
| L-01 | SSE `{ stream: true }` requirement missing from implementation guidance — multi-byte character corruption risk if future implementations omit it; Backend used it correctly; Frontend handoff omitted it | F-O1 | `agent-docs/development/backend.md` or canonical SSE protocol guide (implementing agent identifies location) | **Fix** | Correctness risk; one-line addition in the canonical SSE implementation reference. Implementing agent should determine whether `backend.md` contains an SSE implementation guide section or if a separate doc is more appropriate. |
| L-02 | SSE parsing logic identical in `FrontierBaseChat.tsx` and `AdaptationChat.tsx` — shared hook/utility would eliminate duplication | F-R1 | `app/foundations/transformers/components/FrontierBaseChat.tsx`, `app/models/adaptation/components/AdaptationChat.tsx` | **Defer** | Code change requiring a follow-up micro-CR for `lib/hooks/useSSEStream.ts`; not a doc fix. TL and BA both documented this as a next-priority item. |
| L-03 | Fail-fast philosophy (clear output on stream error) should be documented as deliberate choice, not left implicit | F-E1 | `agent-docs/conversations/tech-lead-to-frontend.md` (per-CR file) | **Defer** | Documentation of a historical design decision; no ongoing agent confusion risk. Note in the next relevant Frontend handoff rather than a role doc. |
| L-04 | Cursor visibility UX for buffered JSON responses vs streaming tokens is undefined | F-C1 | `agent-docs/conversations/tech-lead-to-frontend.md` (per-CR file) | **Defer** | UX edge case; relevant only when buffered fallback is active. Resolve in the next UI-change CR rather than process docs. |
| L-05 | Soft output cap behavior (post-token granularity, not hard truncation) undocumented trade-off | B-E1 | `lib/server/generation/streaming.ts` (code comment candidate) | **Defer** | Narrow scope; best resolved as a code comment in `streaming.ts` rather than a doc fix. Defer to a code-comment CR or next streaming route modification. |
| L-06 | `clearTimeout` structural compatibility: constraint compatibility not verified at handoff authoring time | B-C1 | `agent-docs/conversations/tech-lead-to-backend.md` (per-CR file) | **Defer** | Lesson-learned item; too specific for a reusable doc entry. General constraint-compatibility guidance could be absorbed into M-04 (adversarial review framework) at implementing agent discretion, but should not block it. |

---

## Deferred / Rejected

| # | Finding | Decision | Rationale |
|---|---|---|---|
| L-02 | SSE parsing duplication (FrontierBaseChat + AdaptationChat) | **Defer** | Code change; follow-up micro-CR |
| L-03 | Fail-fast philosophy documentation | **Defer** | Historical decision; per-CR file note, not role doc |
| L-04 | Cursor UX for buffered vs streaming modes | **Defer** | UX edge case; next UI-change CR |
| L-05 | Soft output cap behavior documentation | **Defer** | Code comment, not doc fix |
| L-06 | clearTimeout constraint compatibility lesson | **Defer** | Too specific; absorbed into M-04 at implementing agent discretion |
| — | No Reject decisions | — | All 20 unique findings are actionable; no finding is a positive pattern, a non-issue, or fully subsumed by another item |

---

## Vocabulary Pre-Decisions

The following terms are pre-decided to enforce consistency across chunks. Implementing agents must use these exact terms; do not coin synonyms independently.

| Term | Definition | Used in |
|---|---|---|
| **CR Coordinator** | New role that performs adversarial review, quality gates, and sub-agent handoff issuance; reports summary to Tech Lead | H-02 — `tech-lead.md` (Coordinator spec) and `workflow.md` (execution model); both chunks must use "CR Coordinator" |
| **specific cited TL adversarial evidence** | The graduation condition under which BA independent verification of a security constraint is satisfied without a full code re-audit | M-01 — `ba.md` (Closure Checklist) and `workflow.md` (Acceptance Phase step 2); both chunks must use this exact phrase for the condition |
| **Live-path availability** | The new Known Environmental Caveats field indicating whether API keys are present and the live provider path is exercisable | M-03 — `TEMPLATE-tech-lead-to-testing.md` and `TEMPLATE-tech-lead-to-backend.md`; both templates must name the field identically |
| **Validation Condition** | The new assessment table column specifying the environment or precondition required to evaluate a conditional decision | M-02 — `TEMPLATE-tech-lead-to-testing.md`; single-file change, no cross-chunk risk |

---

## Implementation Grouping (for Phase 3)

Chunks are independent and can execute in any order or in parallel unless a cross-chunk coordination note below applies. Each chunk's implementing agent reads only the files listed for that chunk.

| Chunk | Files (1–3) | Items |
|---|---|---|
| **A** | `agent-docs/roles/tech-lead.md` | H-02 (Coordinator role spec — auth boundary, execution model, session ownership), M-04 (adversarial review framework: severity table + portable checklist dimensions) |
| **B** | `agent-docs/workflow.md` | H-01 (pre-replacement check trust model declaration), H-02 (partial — execution flow update to CR Coordinator model), M-01 (partial — graduated verification rule in Acceptance Phase step 2) |
| **C** | `agent-docs/roles/ba.md` | M-01 (partial — BA Closure Checklist security audit graduation), M-08 (implementation read authority declaration in Technical Sanity Check), M-09 (Decision Matrix entry for mid-session scope expansion) |
| **D** | `agent-docs/conversations/TEMPLATE-tech-lead-to-testing.md` | M-02 (assessment table: Validation Condition column + conditional-default distinction), M-03 (partial — Live-path availability field in Known Environmental Caveats), M-10 (expected test count delta / parallel-agent additions field) |
| **E** | `agent-docs/conversations/TEMPLATE-tech-lead-to-backend.md` | M-03 (partial — Live-path availability field in Assumptions To Validate; also check `agent-docs/coordination/feedback-protocol.md` for assumption classification guidance and cross-reference if it exists) |
| **F** | `agent-docs/testing-strategy.md`, `agent-docs/coordination/TL-session-state.md`, `agent-docs/coordination/meta-improvement-protocol.md` | M-05 (live-path vs fallback-path coverage concept in Provider-Backed E2E Determinism), M-06 (Role Health health signal field in TL-session-state.md template) |
| **G** | `agent-docs/development/backend.md`, `agent-docs/development/development-standards.md` | M-07 (OTel span lifecycle / streamingActive pattern in Observability), M-12 (Leaf Utility Isolation sibling-directory import clarification ⚠️ read current file first), L-01 (SSE `{ stream: true }` — add to backend.md SSE guidance section; if no section exists, create one; do not add to development-standards.md) |
| **H** | `agent-docs/frontend-refactor-checklist.md` | M-11 (test maintenance delegation carve-out for implementation-driven test breakage) |

---

## Cross-Chunk Coordination Notes

- **H-02 (CR Coordinator)** spans Chunks A and B. Chunk A owns the role specification (authority boundary, what Coordinator does/does not do, file ownership). Chunk B owns the workflow execution model update (session flow diagram and sequencing). Whichever executes second must read the first chunk's output to verify "CR Coordinator" is used identically and execution model is consistent.

- **M-01 (BA security audit graduation)** spans Chunks B and C. Chunk B adds the graduation rule to `workflow.md` Acceptance Phase step 2. Chunk C adds the corresponding update to `ba.md` BA Closure Checklist. Both must use the pre-decided phrase **"specific cited TL adversarial evidence"** as the graduation condition trigger. Whichever chunk executes second reads the first chunk's output to confirm phrase alignment.

- **M-03 (Live-path availability)** spans Chunks D and E. Both templates must introduce a field named **"Live-path availability"** in their respective caveats/assumptions sections. Chunks are independent (different files) but must use the same field name.

- **H-01 and H-02 both touch `workflow.md`** (both in Chunk B). This is intentional — they are assigned to the same chunk so one implementing agent handles both workflow changes in a single session, preventing conflicting edits.

---

## Stats

**Raw Top-5 findings:** 25 (5 agents × 5 findings each)
**Unique findings after de-duplication:** 20
**Fix:** 15 (2 High, 12 Medium, 1 Low)
**Defer:** 5
**Reject:** 0

**De-duplicated pairs (raw → consolidated):**
- TL-O1 (Tech Lead) + BA-W1 (BA) → H-01
- BA-S2 (BA) + BA-U1 (BA) → M-01
- T-C1 (Testing) + T-U1 (Testing) → M-02
- T-M1 (Testing) + B-M2 (Backend) → M-03
- TL-U1 (Tech Lead) + TL-R1 (Tech Lead) → M-04

**Regression flags:**
- H-02 ⚠️: CR-018 H-01 was marked Fix in `tech-lead.md`; CR-021 still hit four sessions, indicating the fix was insufficient for 3+ sub-agents. Implementing agent reads current `tech-lead.md` before editing.
- M-12 ⚠️: CR-018 M-06 was marked Fix in `development-standards.md` for leaf utility isolation. Implementing agent reads current `development-standards.md` to determine whether sibling-directory import scope was covered.
