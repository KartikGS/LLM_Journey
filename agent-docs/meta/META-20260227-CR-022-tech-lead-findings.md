# Meta Findings: Tech Lead — CR-022

**Date:** 2026-02-27
**CR Reference:** CR-022
**Role:** Tech Lead
**Prior findings reviewed:**
- agent-docs/meta/META-20260227-CR-022-frontend-findings.md
- agent-docs/meta/META-20260227-CR-022-backend-findings.md
- agent-docs/meta/META-20260227-CR-022-coordinator-findings.md

---

## Conflicting Instructions

- **Approval Gate exception condition is too narrow for predictable [S] CRs**: `tech-lead.md` says to skip the Go/No-Go only for "strictly `[S][DOC]` work or pure discovery sessions." `workflow.md` repeats this as the canonical exception. But CR-022 `[S]` was fully determined by the BA spec — no architectural tradeoffs, no option spaces, no uncertainty requiring user judgment. The gate still had to happen, adding a round-trip where the user's only realistic response was "go." The exception should cover `[S]` CRs where the plan contains no unresolved architectural decisions, not just `[S][DOC]`.
- **Grounding**: The Approval Gate section (tech-lead.md line 233) required me to stop and present CR-022's plan despite it having zero judgment calls left after the BA spec was read. The user said "continue from where you left off" — a signal that the gate was process-overhead, not a decision checkpoint.

---

## Redundant Information

- **Adversarial review checklist re-authored fresh into TL-session-state.md for every CR**: For CR-022, I wrote explicit per-coordinator adversarial check tables (grep patterns, line references, AC-by-AC verification) into TL-session-state.md. The portable dimensions are identical every CR. The CR-specific checks are the only part that varies. Writing both together into every state doc doubles the editing surface and risks check-list drift between CRs.
- **Grounding**: The TL-session-state.md for CR-022 contains ~120 lines of adversarial review spec across three coordinator sections. This content will be authored fresh again for CR-023, CR-024, etc. The portable dimensions (no debug artifacts, changes scoped to delegated files, report matches actual changes) should live once in a coordinator role doc.

- **Testing handoff spec embedded inside TL-session-state.md and also referenced as the canonical Testing handoff**: The Testing handoff is written inside TL-session-state.md as a code block, then the Coordinator is told to "copy it" into `tech-lead-to-testing.md`. This means the same spec exists in two places. If the Coordinator makes editorial changes during the copy step, there is silent drift between the TL-specified content and what the Testing Agent actually receives.
- **Grounding**: CR-022 TL-session-state.md "Testing Agent Handoff Spec" section is a verbatim template that the Coordinator must transcribe. This is a copy-paste requirement, which is a known fragility point.

---

## Missing Information

- **No single-handoff interface from Tech Lead to Coordinator**: The current model requires Tech Lead to author: a plan, Frontend handoff, Backend handoff, Testing handoff spec (inside TL-session-state.md), per-coordinator adversarial review specs for all three sub-agents, quality gate commands for each coordinator session, and Session B entry instructions. There is no defined "Tech Lead → Coordinator handoff" that carries only what a Coordinator needs. The Coordinator receives everything and must filter.
- **Grounding**: When authoring TL-session-state.md, I simultaneously wrote plan-level decisions, execution sequencing, adversarial check tables, and Testing handoff content. These are four distinct concern areas with different consumers (Coordinator vs Testing Agent). A single "Coordinator handoff" file with a defined schema would separate what the Coordinator needs from what the plan captures.

- **No protocol for pre-authoring sequential handoffs at plan time**: For CR-022 the Testing handoff was fully determinable at Session A time — the Testing scope does not depend on what Frontend or Backend actually produce, only on the plan. But protocol says the Coordinator "issues" the Testing handoff after reviewing Frontend + Backend. This forced me to embed the Testing spec in TL-session-state.md as a workaround rather than write `tech-lead-to-testing.md` directly. If I had written it directly, the Coordinator's job would be reduced to: verify Frontend, verify Backend, then hand the pre-written Testing handoff to the Testing Agent.
- **Grounding**: The Testing handoff spec in TL-session-state.md is a workaround for the absence of a "pre-written but not yet issued" handoff state. A simple `status: pending-issue` on a handoff file would solve this.

---

## Unclear Instructions

- **"Tech Lead writes Coordinator entry instructions" vs "Coordinator loads TL-session-state.md"**: The current protocol says Tech Lead writes per-coordinator instructions inside TL-session-state.md. But if there is a Coordinator role doc, the Coordinator should know its own entry protocol — it should not depend on the Tech Lead to re-specify it per CR. The per-CR state doc should carry only CR-specific data (plan decisions, which sub-agent handoffs were issued, which ones are pending), not coordinator operating instructions.
- **Grounding**: The "CR Coordinator: Frontend Session — Entry Instructions" section in CR-022 TL-session-state.md includes both CR-specific check items (which testids to verify) and general Coordinator protocol (load these files only, do not reload Layer 1/2). The general protocol should be in a coordinator.md and referenced, not re-authored.

---

## Responsibility / Scope Concerns

- **Tech Lead Session A authored 7 distinct artifact types in a single session**: For CR-022: (1) plan, (2) Frontend handoff, (3) Backend handoff, (4) TL-session-state.md shell, (5) per-coordinator adversarial check tables for Frontend, (6) per-coordinator adversarial check tables for Backend, (7) Testing handoff spec embedded in state doc. These span two authority domains: technical planning (1-3) and execution coordination (4-7). The coordination artifacts are not "Tech Lead" work — they are workflow management work that a Coordinator role should own.
- **Grounding**: This is the user's core observation: the flow was confusing because handoffs happen in both the TL session and elsewhere. The confusion is structural — Tech Lead's mandate includes coordination artifacts that belong to a different role.

- **Proposed role split — User-confirmed direction**: The Tech Lead's coordination responsibilities (issuing sub-agent handoffs, defining adversarial checks, sequencing execution, running quality gates, writing BA handoff) should move to a **Coordinator role**. Tech Lead's output would be: the plan artifact + a single handoff to the Coordinator. The Coordinator reads the plan, owns all downstream execution management, and returns a verified conclusion to the Tech Lead for the BA handoff. Tech Lead would need to know exactly one new template (TL → Coordinator handoff) instead of seven.
- **Impact**: This aligns with CRD-022-01, is confirmed by the user, and is the highest-value structural change available. It also satisfies CRD-022-02 (no coordinator.md exists) by defining the role formally.

- **"Permitted Direct Changes" framing creates a false category**: The TL role doc frames Session A as "plan + direct changes." For CR-022, there were zero direct changes — the session was entirely coordination artifacts. The protocol's framing implies direct changes are the default, but many `[S]` CRs require no TL-permitted file edits. The session output is not "changes" — it is planning and delegation artifacts.
- **Grounding**: After finishing the plan, I noted "Tech Lead direct changes completed: none" in TL-session-state.md. This felt like a required field with no content — a signal the framing doesn't fit.

---

## Engineering Philosophy Concerns

- **Tech Lead pre-specifying Coordinator adversarial checks creates false confidence risk**: For CR-022 I wrote exact grep patterns and line-number references into the adversarial check tables. The Coordinator confirmed these checks. But the Coordinator was confirming pre-specified answers — if my line numbers were off by one, the check would still pass because the Coordinator was told what to look for. Adversarial review requires independent verification, not confirmation of the Tech Lead's pre-solved conclusion. This is BCK-022-04 extended to the coordination layer.
- **Grounding**: The adversarial review check for AC-3 ("AC-3: `href="/context/engineering"` inside limitations section | PASS — `page.tsx` line 124") was verifiable only if the Coordinator independently read line 124. But the spec told the Coordinator where to look, reducing the review from "does this constraint hold?" to "does the specified line contain what I was told it would?"

- **Sequential handoff issuance as a quality gate assumption is incorrect for independent sub-agents**: The current model issues Frontend and Backend handoffs in parallel but the Testing handoff only after both complete. The justification is that Testing "depends on what Frontend and Backend actually produce." But for CR-022, the Testing scope (tab locking unit tests + two E2E testid assertions) was fully determined at plan time. The Testing Agent would have needed to read Frontend's output, but a staged "read report then write tests" protocol within the Testing session handles this without requiring a separate Coordinator session to issue the handoff. The serialization is adding a full session boundary where a read-then-proceed within the Testing session would suffice.
- **Grounding**: The Testing handoff was authored in TL-session-state.md at Session A time with full confidence about its content. The extra Coordinator session was pure process overhead for issuing a handoff that was already written.

---

## Redundant Workflow Steps

- **Pre-replacement check on handoff files at Session A start**: The Write-Before-Read constraint requires reading all four prior handoff files before replacing them. For CR-022, all four files contained CR-021 content that was immediately discarded. The protocol exists to prevent tool errors, but the check is a ceremony with no analytical value when the prior content is definitively obsolete. A lighter enforcement (e.g., confirm CR-ID in Subject field, then proceed) would satisfy the tool constraint without requiring the agent to read 400 lines of discarded content.
- **Grounding**: Session A required reading `tech-lead-to-frontend.md` (415 lines, CR-021 content), `tech-lead-to-backend.md` (255 lines, CR-021 content), `tech-lead-to-testing.md` (185 lines, CR-021 content), and `TL-session-state.md` (225 lines, CR-021 state). All four were fully replaced. Total: ~1080 lines read and discarded.

- **Coordinator issuing a handoff that Tech Lead already wrote**: The Coordinator "issued" the Testing handoff by transcribing TL-session-state.md's Testing handoff spec into `tech-lead-to-testing.md`. This is a copy step that adds a session boundary, creates drift risk, and provides no analytical value. If Tech Lead writes the handoff at plan time with `status: pending-issue`, the Coordinator's job is to set the status to `issued` and hand it to the Testing Agent — not to re-transcribe content.
- **Grounding**: TL-session-state.md included a `### Testing Agent Handoff Spec (to be written to tech-lead-to-testing.md)` section as a code block. The Coordinator had to copy-paste this into the actual handoff file — a mechanical step that introduced the possibility of transcription error.

---

## Other Observations

- **The Coordinator as currently practiced is a Tech Lead subpersonality, not a role**: In CR-022, the "CR Coordinator" sessions were not distinct agents — they were Tech Lead verification passes with a narrowed context load. There is no coordinator.md, no coordinator entry protocol, and no coordinator authority boundary. The role exists in name in tech-lead.md but has no standalone identity. Formalizing it as a first-class role (with its own doc, its own handoff templates, its own authority) would make the framework consistent.

- **The "Negative Space Rule" TL-022 originated in this CR's planning and was effective**: The explicit "verify both positive and negative" pattern I added to Frontend and Backend handoffs was picked up and used by the Coordinator. Backend finding BCK-022-02 and Coordinator finding CRD-022-05 both identify this as a codification opportunity. The pattern is already in practice; it just needs a name and a home in testing-strategy.md.

---

## Lens Coverage (Mandatory)

- **Portability Boundary**: The Coordinator role (session entry, adversarial review portable dimensions, quality gate sequencing, Bash-denied fallback) is a cross-project pattern. None of it is LLM Journey-specific. It belongs in a role doc (`coordinator.md`), not embedded in per-CR state files. The CR-specific adversarial check items (which testids, which grep patterns) remain in the per-CR state file.
- **Collaboration Throughput**: The largest throughput bottleneck is the full session boundary between "Tech Lead finishes plan" and "Testing handoff issued." If the Coordinator role is formalized and Testing handoffs can be pre-written at plan time, the Testing Agent could start as soon as Frontend and Backend complete — without a separate Coordinator session to issue the handoff. This removes one session from the critical path for every CR with a parallel Front+Back → sequential Testing sequence.
- **Evolvability**: The TL role doc's "CR Execution Model" section (tech-lead.md lines 248–276) is 125+ lines of coordination protocol that should move to coordinator.md. Once moved, the TL role doc describes only planning and architecture decisions — a stable, rarely-changing surface. Coordination protocols evolve more frequently (new sub-agent types, new verification patterns) and should be independently updatable without touching the TL role doc.

---

## Prior Findings: Assessment

- **CRD-022-01 (Tech Lead conflates planning with coordination — new Coordinator role needed)** → Validated and Extended — confirmed from inside the role. Session A authored coordination artifacts (adversarial checks, state doc, Testing spec) that are structurally distinct from planning artifacts. The user's session prompt confirms this is the top priority. The Coordinator role should own all post-plan execution management.
- **CRD-022-02 (No coordinator session entry point)** → Validated — there is no coordinator.md. Each coordinator session was bootstrapped from TL-session-state.md, which is a CR-specific artifact, not a role definition. A coordinator.md would provide stable entry protocol without requiring TL to re-specify it per CR.
- **CRD-022-03 (Background Task dispatch prevents interactive preflight)** → Validated and Contextualized — the preflight skipping is a symptom of the background Task execution pattern, not a protocol failure. The fix is execution mode guidance: interactive session for agents that write files; background Task acceptable for agents that only read and report.
- **CRD-022-04 (No Bash-denied fallback protocol)** → Validated — unspecified. Should be codified: "if a delegated agent cannot run quality gates due to environment constraints, the Coordinator runs them as part of the adversarial review pass."
- **CRD-022-05 (Portable adversarial dimensions re-authored per CR)** → Validated and Extended — I authored these fresh. They are byte-for-byte identical to what any coordinator session would need. They belong in coordinator.md once, referenced by a one-line pointer in TL-session-state.md.
- **F1 (JSX Character Escaping lint friction)** → Validated — Frontend lint failed on this, then had to re-run after fixing. The Frontend role doc (or a Common Pitfalls section) should include JSX entity escaping as a pre-submission check.
- **F2 (Testing Contract Registry out-of-sync)** → Validated and Partially Resolved — the registry was updated in TL Session B for CR-022. However, the "update registry at TL/BA boundary per CR" rule needs to be explicit in the registry doc itself, not only in the TL role doc's Session B tasks.
- **BCK-022-01 (Project-wide linting serializes Backend)** → Validated — the Backend handoff's DoD required `pnpm lint` to pass, which fails when Frontend has parallel lint errors. The DoD should specify targeted lint (`--file` flag) for Backend verification, with project-wide lint reserved for the Testing Agent's full gate pass.
- **BCK-022-02 (Negative Space verification pattern missing from standards)** → Validated and Extended — I used this pattern explicitly in both handoffs ("Negative Space Rule" DoD section). It should be codified in testing-strategy.md as a general principle: "For every removal or restriction, verify absence (grep for zero matches) AND verify that the retained path still works (positive assertion)."
- **BCK-022-04 (Logic Dictation reduces adversarial review)** → Validated with nuance — for the Backend handoff, exact snippets were appropriate given the purely mechanical nature of the dead-code removal. For the Coordinator adversarial checks, pre-specifying exact line numbers is a problem because it converts independent verification into answer confirmation. The principle should distinguish: prescriptiveness in sub-agent handoffs (acceptable, reduces ambiguity) vs prescriptiveness in Coordinator verification specs (risky, reduces independence).
- **BCK-022-05 (Missing standard for targeted file linting)** → Validated — tooling-standard.md should document `pnpm lint --file path/to/file.ts` usage for scoped verification passes.

---

## Top 5 Findings (Ranked)

1. TL-022-01 | Tech Lead Session A conflates technical planning with coordination ops — Coordinator role needed to own handoffs, adversarial checks, sequencing, and quality gate verification; Tech Lead's only Coordinator interface should be one handoff: "here is the plan" | `agent-docs/roles/tech-lead.md` / CR Execution Model + new `coordinator.md` | `collaboration`, `evolvability`, `portability`
2. TL-022-02 | Testing handoff pre-determined at plan time but forced through a separate Coordinator issuance session — pre-authored `pending-issue` handoffs would remove a full session from the critical path without changing verification guarantees | `agent-docs/workflow.md` / Delegation Mode Rules + `tech-lead.md` / Session A scope | `collaboration`, `evolvability`
3. TL-022-03 | Portable adversarial review dimensions re-authored fresh into every TL-session-state.md — identical boilerplate should live once in `coordinator.md` and be referenced by a one-line pointer | `agent-docs/coordination/TL-session-state.md` template + `coordinator.md` (missing) | `portability`, `evolvability`
4. TL-022-04 | Approval Gate applied uniformly to [S] CRs with no architectural decisions — exception condition too narrow; predictable plans with no unresolved tradeoffs should bypass the gate | `agent-docs/roles/tech-lead.md` / The Approval Gate + `agent-docs/workflow.md` / Step 5 | `collaboration`
5. TL-022-05 | "Negative Space" verification pattern (verify absence + verify retained path) in use across Tech Lead handoffs and Coordinator checks but not codified — should be a named standard primitive in `testing-strategy.md` | `agent-docs/testing-strategy.md` / Verification Depth section | `portability`, `evolvability`
