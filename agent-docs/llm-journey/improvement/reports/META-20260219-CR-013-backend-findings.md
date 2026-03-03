# Meta Findings: Backend — CR-013

**Date:** 2026-02-19
**CR Reference:** CR-013 (Add Hugging Face Inference API Provider Support)
**Role:** Backend
**Prior findings reviewed:** none (first agent in flow)

---

## Conflicting Instructions

**B-C1 — `backend.md` "READ-ONLY" phrasing conflicts with delegation model**
`backend.md` states `READ-ONLY by default: /__tests__/**`, then immediately qualifies it with "unless the handoff explicitly delegates test scope." The word READ-ONLY has a hard connotation that overrides the qualification for a new agent. This creates hesitation even when delegation is explicit.
- Affected: `agent-docs/roles/sub-agents/backend.md` / Boundaries section

**B-C2 — `FrontierConfig` type extension: failure-path `provider` field unspecified**
The handoff (step 2) extended `FrontierConfig` to require `provider` on all paths. Step 3 only specified what `provider` should be on the `configured: true` path. The `configured: false` return paths (missing_config, invalid URL, invalid FRONTIER_PROVIDER) were left unspecified. A judgment call was required (defaulted to `'openai'` as a placeholder). This is a gap between the type change instruction and the config function instruction, not technically a doc conflict, but a handoff template pattern that should be addressed.
- Affected: `agent-docs/conversations/tech-lead-to-backend.md` template (meta: no template exists for this pattern)

---

## Redundant Information

**B-R1 — `backend.md` Boundaries + Ownership Quick Matrix duplicate each other**
The "Boundaries" prose section and the "Ownership Quick Matrix" table convey the same file-to-role mapping. The matrix is the better artifact (scannable, includes the "Backend Rule" column). The prose section above it could be reduced to only non-obvious entries (e.g., the `middleware.ts` conditional rule).
- Affected: `agent-docs/roles/sub-agents/backend.md`

**B-R2 — `backend.md` Execution Responsibilities section adds no information**
"Follow the instructions provided by the Tech Lead agent..." is already mandated by `workflow.md` for all sub-agents. This section reads as filler and could be removed or replaced with Backend-specific execution notes.
- Affected: `agent-docs/roles/sub-agents/backend.md` / Execution Responsibilities

**B-R3 — `AGENTS.md` "After Reading — What Now?" Execute bullet is circular**
"Execute → Follow Workflow" when Workflow is already in required reading. The useful part of that section is only the Mandatory Output Check.
- Affected: `agent-docs/AGENTS.md` / After Reading section

---

## Missing Information

**B-M1 — `backend.md` has a dangling reference to `/agent-docs/api/`**
"Interfaces with: Frontend via `/api/**` contracts documented in `/agent-docs/api/`." This directory does not exist (or was not referenced anywhere in the CR-013 handoff). A new agent may spend time looking for it or assume it is an established contract registry.
- Affected: `agent-docs/roles/sub-agents/backend.md` / Boundaries

**B-M2 — No documented runtime mismatch recovery path**
`tooling-standard.md` says "if runtime is below the documented minimum, classify as an environmental mismatch." It says nothing about what to do next. I used nvm to activate Node 18 — this worked, but was undocumented initiative. A recovery path should be explicit.
- Affected: `agent-docs/tooling-standard.md` / Runtime Preflight section

**B-M3 — No debug artifact hygiene checklist item**
The Backend Checklist has no item for "no debug `console.log` / `console.error` statements in production code paths." A debug statement was present in the route file during this CR. There is no policy that would catch this before report submission.
- Affected: `agent-docs/roles/sub-agents/backend.md` / Checklist

**B-M4 — Failure-path field values not required in handoff type-extension instructions**
When the handoff instructs a type extension (adding a required field to a config type), it should specify field values for ALL return paths, not just the happy path. This is a handoff template gap, not just a Backend doc gap.
- Affected: `agent-docs/conversations/TEMPLATE-tech-lead-to-backend.md` (or equivalent)

**B-M5 — Full regression suite not required before reporting**
The verification order in the handoff specifies running `pnpm test` but does not distinguish between a scoped run (faster, only new tests) and a full suite run (catches regressions). The policy should be explicit: run scoped spec first to confirm new tests pass, then run full suite before reporting.
- Affected: `agent-docs/roles/sub-agents/backend.md` / Checklist, and handoff template

---

## Unclear Instructions

**B-U1 — Preflight carry-forward: proceed or wait in synchronous sessions?**
`workflow.md` says "if open questions are non-empty and materially affect validity/scope, pause and wait for Tech Lead clarification." In a synchronous session where flags are non-blocking (as in CR-013), "pause and wait" is ambiguous — does it mean stop the entire session, or flag and proceed? The rule works well asynchronously but needs a synchronous-session clarification.
- Affected: `agent-docs/workflow.md` / Implementation Phase, Preflight Clarification

**B-U2 — "Every code path" span attribute placement is ambiguous**
The handoff said "Set this on every code path that reaches the `frontierConfig` (after config is loaded)." This could mean: set it once after `loadFrontierConfig()` (which covers all downstream branches), or set it in every branch individually. I chose the former, which is correct — but the instruction should specify "set once, immediately after `loadFrontierConfig()` returns."
- Affected: handoff template for span attribute instructions (meta: pattern to document)

**B-U3 — "First action" in Mandatory Output Check is ambiguous**
`AGENTS.md` says "Before you take your first action in this session, you MUST list the files you have read." Using the Read tool is an "action," so this instruction is technically violated if a file is read before the listing is output. The intent is clearly "your first communication output to the user must include the file listing." That should be stated explicitly.
- Affected: `agent-docs/AGENTS.md` / After Reading — Mandatory Output Check

---

## Responsibility / Scope Concerns

**B-S1 — Testing delegation criteria are undocumented**
The Backend role says not to create/modify tests unless explicitly delegated. In practice, almost every Backend CR needs test coverage. The current model relies entirely on the Tech Lead to decide per-CR, with no documented criteria for when to delegate to Backend vs. Testing Agent. Suggested criterion: unit tests for pure internal functions may be delegated to Backend; integration/contract tests for public API routes are always Testing Agent scope unless explicitly overridden.
- Affected: `agent-docs/roles/sub-agents/backend.md`, `agent-docs/workflow.md` / Testing Handoff Trigger Matrix

**B-S2 — `.env.example` ownership creates unnecessary friction**
`.env.example` is Tech Lead-owned. Backend is the role that knows which new env vars are needed. The current model requires Tech Lead to anticipate env vars during planning (as happened in CR-013 where TL pre-updated the file). If Backend discovers a needed env var during implementation, it becomes a blocker. Either: delegate `.env.example` updates to Backend as standard practice when Backend introduces new env vars, OR require Backend to propose env var additions in the preflight note for TL approval.
- Affected: `agent-docs/roles/sub-agents/backend.md` / Ownership Quick Matrix, `agent-docs/technical-context.md` / Governance Invariant

---

## Engineering Philosophy Concerns

**B-P1 — Project principles are irrelevant to Backend but required reading**
`project-principles.md` covers educational clarity, learner progression, visual polish — entirely Frontend/content concerns. Backend agents read these as "Universal Standards" but they have no applicability to API route implementation. This adds cognitive load without benefit. Project principles should be scoped: "read if your work touches user-facing content or narrative."
- Affected: `agent-docs/AGENTS.md` / Layer 1 Universal Standards

**B-P2 — Dependency constraint ("no new packages") lives in handoffs, not policy docs**
The constraint "no new npm dependencies" was stated in the CR-013 handoff. The general rule that sub-agents cannot install packages is buried in `technical-context.md` (Governance Invariant). If a handoff ever said "use library X" that doesn't exist in the Standard Kit, Backend would have no clear documented path to resolve the conflict. This constraint belongs in `backend.md` as a Backend-specific engineering constraint.
- Affected: `agent-docs/roles/sub-agents/backend.md`, `agent-docs/technical-context.md`

---

## Redundant Workflow Steps

**B-W1 — Preflight ceremony is high-cost when there are no blockers**
When all assumptions are pre-confirmed (as in CR-013, where the handoff explicitly pre-addressed both flag items), the preflight note becomes ceremony. The step has high value when genuine unknowns exist; near-zero value when everything is pre-specified. Consider making it conditional: "Preflight required only if (a) assumptions cannot be confirmed without investigation, or (b) there are questions that could change implementation scope."
- Affected: `agent-docs/workflow.md` / Preflight Clarification (Mandatory)

**B-W2 — Mandatory Reading Check file listing is always identical per role**
Listing files read at the start of every session provides a confidence signal, but the list is the same for every Backend session. It could be replaced with "Context loaded per `backend.md` required readings" unless something was skipped. The full list adds value only when it surfaces a gap.
- Affected: `agent-docs/AGENTS.md` / Mandatory Output Check

---

## Other Observations

**B-O1 — `backend-to-tech-lead.md` template section ordering is confusing**
The template has `[Preflight Status]` followed by `[Status]`. The overall status (`in_progress` / `completed`) should come before the preflight status — reviewers scanning the file want to know overall state first. The two status fields are also easy to confuse.
- Affected: `agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md`

**B-O2 — Meta-analysis flow was undocumented**
No protocol existed for running multi-agent meta-analysis with carry-forward. This was discussed during this session and has been formalized in `agent-docs/coordination/meta-improvement-protocol.md`. Noting here for traceability.
- Affected: `agent-docs/coordination/meta-improvement-protocol.md` (now updated)

---

## Prior Findings: Assessment
none (first agent in flow)
