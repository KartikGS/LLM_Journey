# Meta Findings: Coordinator — CR-022

**Date:** 2026-02-27
**CR Reference:** CR-022
**Role:** Coordinator
**Prior findings reviewed:**
- agent-docs/meta/META-20260227-CR-022-frontend-findings.md
- agent-docs/meta/META-20260227-CR-022-backend-findings.md

---

## Conflicting Instructions

- **State doc doubles as coordinator entry point**: `TL-session-state.md` is simultaneously a live state tracker (filled in progressively across sessions) and the coordinator's instruction document (adversarial check specs, quality gate commands, handoff specs). A document that changes as work progresses should not also be the authoritative source of instructions for the agents reading it — a reader mid-CR may see a partially-filled document and misread in-progress state as missing instructions.
- **Grounding**: When opening the session from `TL-session-state.md`, the "Coordinator Conclusion" placeholders and the "Pending Tasks Tracker" checkboxes were interleaved with instruction text. The distinction between "what to do" and "current state" required careful reading.

---

## Redundant Information

- **Adversarial review checklists duplicated across CR instances**: The adversarial check tables (portable dimensions + CR-specific checks) are written fresh into each `TL-session-state.md`. The portable dimensions are the same every CR. The CR-specific checks are the only part that should vary. Writing both into every CR creates editing surface and risk of drift between CRs.
- **Grounding**: Reading the Frontend and Backend coordinator instructions, the four "Portable Adversarial Review Dimensions" bullets were identical boilerplate that could live in a reusable coordinator role doc and be referenced by a one-line pointer.

---

## Missing Information

- **No defined session entry point for coordinator role**: The standard agent entry convention (per agents.md) is to read a role doc. This coordinator session was entered via a system-reminder of `TL-session-state.md` — not a role doc. There is no `coordinator.md` or equivalent. The session worked, but it is inconsistent with the framework's own entry convention and makes it unclear what a "coordinator session" is versus an ad-hoc Tech Lead verification step.
- **Grounding**: The session started with `TL-session-state.md` being pre-loaded rather than the coordinator being told "read agents.md and your role doc". This broke the pattern every other agent follows.

- **No protocol for Bash-denied subagent quality gate fallback**: When a background subagent cannot run Bash (denied permissions), there is no documented fallback. The coordinator improvised by running quality gates directly after both agents completed. This produced a correct result but was unplanned — a protocol such as "if a delegated agent cannot run quality gates, the coordinator runs them as part of the adversarial review" should be explicit.
- **Grounding**: Frontend agent reported lint and tsc as "agent self-reported; consistent with file content" because Bash was denied. Backend agent stopped entirely and returned results rather than completing. The coordinator ran `pnpm lint`, `tsc --noEmit`, and targeted test commands from scratch.

- **No execution mode guidance for when to use background Task vs interactive session**: The Testing Agent was dispatched as a background Task. This prevented reading confirmation, prevented an interactive preflight, and meant no feedback loop was possible. The Testing Agent completed correctly, but only because the coordinator read and verified all its output independently afterward.
- **Grounding**: After the Testing Agent completed, the coordinator had to manually verify the created test file, run `pnpm test` independently, run lint, tsc, and build, and then record the Testing Coordinator conclusion — essentially re-doing the verification that a live interactive session would have done inline.

---

## Unclear Instructions

- **"CR Coordinator" session vs "Tech Lead Session B" boundary is blurry for a single operator**: When one operator runs the entire workflow, the distinction between "Coordinator: Frontend session", "Coordinator: Backend session", "Coordinator: Testing session", and "TL Session B" is a cognitive load with no reduction in actual work. The spec assumes these are different human sessions or different agents. When collapsed into one operator, the naming creates confusion about which context is active.
- **Grounding**: The decision to run Frontend and Backend coordinator reviews as parallel background agents, then personally run quality gates and record conclusions, then dispatch TL Session B as another background agent, required judgment calls not specified anywhere in the protocol.

---

## Responsibility / Scope Concerns

- **Tech Lead role conflates planning with coordination, verification, and handoff authoring**: In this CR, "Tech Lead" was responsible for: writing the plan, writing the Frontend handoff, writing the Backend handoff, writing the TL-session-state.md coordinator entry instructions, specifying adversarial review checklists for all three sub-agent types, writing the Testing handoff spec inside TL-session-state.md, and then in Session B updating the contract registry and writing the BA handoff. This is 7 distinct responsibilities across 2 sessions. The plan (what to build) is cleanly separable from the coordination (who does what, in what order, with what checks).
- **Grounding**: The entire TL-session-state.md was authored as part of Session A and represents coordination artifacts. A dedicated Coordinator role could own the session-state doc, the adversarial review specs, the handoff sequencing, and the quality gate verification — leaving Tech Lead to own only the plan and the contract registry update.
- **Proposed direction**: New Coordinator role that takes one input (the plan artifact) and owns: issuing sub-agent handoffs, defining adversarial checks, sequencing execution, running or delegating quality gates, and writing the BA handoff. Tech Lead's only interface to Coordinator would be one handoff: "here is the plan." This reduces TL template surface from 7 concern areas to 1.

- **Testing Agent dispatched without being able to run an interactive preflight**: The standard Testing Agent handoff includes an "Execution Checklist" requiring the agent to confirm reading before starting. A background Task cannot confirm reading interactively. The preflight write step ("Write preflight note to testing-to-tech-lead.md") was skipped.
- **Grounding**: The Testing Agent completion report did not include a preflight note. The coordinator did not catch this gap until post-hoc review.

---

## Engineering Philosophy Concerns

- **Background Task pattern creates a trust gap**: Running agents as background Tasks means the coordinator cannot observe or redirect mid-execution. For Frontend and Backend (read-only verification), this is acceptable — the worst outcome is a wrong conclusion in the report, which the coordinator catches. For Testing (which writes new files and runs commands), background dispatch risks an agent completing partial work or making incorrect assumptions with no opportunity for course correction.
- **Grounding**: The Testing Agent correctly created the test file and correctly imported `{ AdaptationChat }` as a named export after discovering this in the component. But if it had made a wrong assumption, the coordinator would only have found out after the full run.

---

## Redundant Workflow Steps

- **Parallel coordinator agent dispatch produced no parallelism benefit for quality gates**: Frontend and Backend coordinator agents were dispatched in parallel, both as background Tasks. Both had Bash denied. Both returned static analysis results only. The coordinator then ran all quality gates sequentially from scratch. The parallel dispatch saved some context window, but the net effect was: read two reports, then re-run all checks that the agents could not run. A single coordinator pass over the four backend files and two frontend files would have been equivalent.
- **Grounding**: After both background agents completed, the coordinator ran: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm exec jest __tests__/api/adaptation-generate.test.ts`, `pnpm exec jest __tests__/api/frontier-base-generate.test.ts`. These runs were additive verification, not confirming the agents' self-reported results — they were running the gates from scratch because the agents hadn't.

---

## Other Observations

- **The adversarial check spec in TL-session-state.md was highly effective for the checks it covered**: The line-by-line verification structure (e.g., "AC-1: rendered before `adaptation-strategy-comparison`") gave coordinators concrete, falsifiable claims. The portability problem is not the checks themselves but their location — they belong in a reusable coordinator role doc, not a CR-specific state file.
- **The "Negative Space" pattern (BCK-022-02) was used in the coordinator checks too**: Several checks in the CR-022 adversarial checklist explicitly verify absence ("zero matches for `invalid_config`"). This coordinator session validated that negative-space verification is a general coordinator pattern, not just a backend testing pattern.

---

## Lens Coverage (Mandatory)

- **Portability Boundary**: The portable adversarial dimensions, the fallback protocol for Bash-denied agents, and the session entry convention for coordinator sessions are all reusable across projects. They belong in a `coordinator.md` or equivalent role doc, not in CR-specific state files. The CR-specific adversarial checks (which testids to verify, which grep patterns to run) are correctly CR-specific and should stay in the state file.
- **Collaboration Throughput**: The largest serializing bottleneck in this CR workflow was the absence of a Coordinator role with clear authority. Without it, the Tech Lead had to author 7+ artifacts and the coordinator sessions were ad-hoc judgment calls. A formalized Coordinator role with a defined handoff interface would let Tech Lead and Coordinator work from a shared plan artifact independently, unlocking earlier parallel execution.
- **Evolvability**: The current TL-session-state.md template grows with each CR because it embeds the full Testing handoff spec inline. Separating the coordinator role doc (stable, reusable) from the CR state file (ephemeral, CR-specific) reduces the maintenance surface and prevents the state file from becoming a knowledge dump.

---

## Prior Findings: Assessment

- **F1 (JSX Character Escaping, Frontend)** → Validated and Extended — The lint failure caused by unescaped JSX entities in `page.tsx` was directly observed during the quality gate run. From the coordinator's perspective, this failure could have blocked the Backend adversarial review gate (project-wide lint) had the coordinator relied on Backend agent's self-reported lint result rather than re-running independently.
- **F2 (Testing Contract Registry out-of-sync, Frontend)** → Validated and Resolved for this CR — The TL Session B agent correctly reconciled the registry. However, the protocol for *when* the registry must be updated (at the Tech Lead/BA boundary per CR) is still not written into the contract registry doc or the coordinator role.
- **BCK-022-01 (Project-wide linting serializes Backend, Backend)** → Validated — Confirmed from coordinator perspective. A `--file` filter on lint would allow Backend and Frontend quality gates to be verified independently.
- **BCK-022-02 (Negative Space pattern missing from standards, Backend)** → Extended — The coordinator's own adversarial checklist used negative-space verification (absence of `invalid_config`, absence of `ADAPTATION_API_URL`). This confirms the pattern is already in practice at the coordinator level and should be codified in `testing-strategy.md` as a general verification primitive.
- **BCK-022-03 (Ghost Handlers in client, Backend)** → Noted — Out of coordinator scope for this CR. Carry-forward to Phase 2 synthesis.
- **BCK-022-04 (Logic Dictation reduces adversarial review, Backend)** → Extended — The coordinator adversarial checks were themselves highly prescriptive (exact line references, exact grep patterns). While this removed ambiguity for the coordinator, it also means the coordinator was confirming a pre-solved answer rather than independently verifying. The risk is that a wrong pre-specified line number would not be caught if the coordinator trusts the spec without re-reading.

---

## Top 5 Findings (Ranked)

1. CRD-022-01 | Tech Lead conflates planning with coordination — new Coordinator role needed to own handoffs, adversarial checks, sequencing, and quality gate verification | `roles/` / Tech Lead responsibilities + new coordinator.md | `collaboration`, `evolvability`
2. CRD-022-02 | No coordinator session entry point — sessions started from CR-specific state file rather than a role doc, breaking the standard framework entry convention | `workflow.md` / Session Entry Convention + coordinator.md (missing) | `portability`, `collaboration`
3. CRD-022-03 | Background Task dispatch prevents interactive reading and feedback loop — Testing preflight was skipped; quality gates had to be re-run by coordinator | `workflow.md` / Agent Execution Protocol | `collaboration`, `portability`
4. CRD-022-04 | No fallback protocol when delegated agent cannot run Bash quality gates — coordinator improvised; result was correct but unspecified | `workflow.md` / Quality Gate Responsibility | `collaboration`, `portability`
5. CRD-022-05 | Portable adversarial review dimensions are re-authored into every TL-session-state.md rather than referenced from a stable coordinator role doc | TL-session-state.md template / coordinator role doc (missing) | `portability`, `evolvability`
