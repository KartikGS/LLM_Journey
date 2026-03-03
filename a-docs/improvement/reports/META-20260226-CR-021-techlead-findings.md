# Meta Findings: Tech Lead — CR-021

**Date:** 2026-02-26
**CR Reference:** CR-021 — Frontier and Adaptation Response Streaming
**Role:** Tech Lead
**Prior findings reviewed:**
- `agent-docs/meta/META-20260226-CR-021-testing-findings.md`
- `agent-docs/meta/META-20260226-CR-021-frontend-findings.md`
- `agent-docs/meta/META-20260226-CR-021-backend-findings.md`

---

## Conflicting Instructions

**TL-C1 — Two-session model documented; CR-021 required four sessions — no escalation guidance:**

`tech-lead.md` defines a two-session execution model as the upper bound for CRs with multiple
sub-agents. CR-021 had three sequential sub-agents (Backend → Frontend → Testing) and required
four sessions: Session A (planning + Backend handoff), Session B (Backend review + Frontend handoff),
Session C (Frontend review + Testing handoff), Session D (Testing review + BA handoff).

At no point did any doc signal that the two-session model was being exceeded or define what to do
when it was. The plan itself noted `"Two-session model note: This CR has Backend AND Testing
sub-agents"` but failed to note that three sub-agents would require four sessions, not two.

The conflict: the role doc implies two sessions are the normal upper bound while the actual
execution pattern for 3+ sub-agent CRs structurally requires more. There is no documented
escalation path for CRs that exceed the two-session ceiling.

- **Affected doc:** `agent-docs/roles/tech-lead.md` / Two-Session Execution Model;
  `agent-docs/plans/CR-021-plan.md` / Delegation & Execution Order
- **Lens:** `portability` (any 3+ sub-agent CR reproduces this), `evolvability` (needs an
  N-sub-agent session count model, not just two-session)

---

## Redundant Information

**TL-R1 — Per-CR adversarial review checklist regenerated in TL-session-state.md instead of
  reused from tech-lead.md:**

The `TL-session-state.md` for CR-021 contained a fully specified adversarial review checklist
for the Backend agent (10 items) and a shorter checklist for Testing. These checklists encode
portable review logic: "SSE event types match exactly," "pre-stream fallback unchanged," "no
debug artifacts," etc.

Because these checklists live in a per-CR coordination file, they are:
1. Regenerated from scratch by Tech Lead for every CR that touches these files.
2. Not available to Backend agents as a self-verification checklist before reporting.
3. Effectively duplicated across every streaming-adjacent CR's session state.

A portable adversarial review framework in `tech-lead.md` — generic review dimensions, with
CR-specific additions noted per-handoff — would reduce per-CR authoring overhead and allow
Backend/Frontend agents to pre-check against the same criteria before reporting.

- **Affected doc:** `agent-docs/roles/tech-lead.md` / Adversarial Review section (if present);
  `agent-docs/coordination/TL-session-state.md` template
- **Lens:** `evolvability` (reduces per-CR regeneration), `portability` (portable review
  dimensions belong in role doc, not per-CR state)

---

## Missing Information

**TL-M1 — No documented protocol for what to include in TL-session-state.md:**

The only context continuity mechanism across Tech Lead sessions is `TL-session-state.md`. There
is no guidance on:
- What minimum information must be captured to enable the next session to proceed safely.
- How to handle Backend deviations that affect both Frontend and Testing (two downstream agents).
- What happens if session state is incomplete and the next session begins from insufficient context.

In practice, for CR-021 I captured Backend review outcomes + quality gate results + any deviations
affecting the next sub-agent. But this was judgment, not policy. A malformed session state file
could cause a downstream session to miss a critical constraint without any error signal.

- **Affected doc:** `agent-docs/coordination/TL-session-state.md` (template section);
  `agent-docs/roles/tech-lead.md` / Multi-Session Coordination
- **Lens:** `evolvability` (one section in the template defining mandatory vs. optional fields
  would make this durable), `portability` (multi-session context capture is a universal concern)

**TL-M2 — Role Health threshold for context saturation is defined but not named for Tech Lead:**

`meta-improvement-protocol.md` defines Role Health Indicators with a context saturation threshold:
"Reported in 2+ consecutive lightweight passes for the same role phase → Escalate." However,
there is no mechanism for reporting context saturation at all — there is no field in
`TL-session-state.md`, no lightweight pass for the Tech Lead's own execution, and no way to
accumulate the signal across consecutive CRs.

CR-021 hit context saturation in Sessions B and D (both required starting from a summary of
prior conversation). This is evidence the threshold is being crossed, but the signal has nowhere
to go. The Role Health mechanism exists in protocol docs but has no input surface in the
execution workflow.

- **Affected doc:** `agent-docs/coordination/meta-improvement-protocol.md` / Role Health Indicators;
  `agent-docs/coordination/TL-session-state.md` (no health signal field)
- **Lens:** `evolvability` (adding a one-line `## Workflow Health Signal` to TL-session-state.md
  template would activate the existing mechanism), `collaboration` (earlier escalation prevents
  larger session debt)

---

## Unclear Instructions

**TL-U1 — Adversarial review pass/fail criteria are implicit — no documented standard for
  deviation severity:**

During Sessions B, C, and D, I performed adversarial reviews of Backend, Frontend, and Testing
agent reports. In each case I made a PASS/FAIL judgment that involved classifying deviations as
Minor (non-blocking), Major (requires correction), or Process-only (no AC impact). These
severity levels are:
- Not defined anywhere in `tech-lead.md` or the handoff templates.
- Invented on-the-fly based on AC impact, security boundary, and contract integrity.
- Inconsistent with whatever criteria a different Tech Lead agent would apply.

The Frontend Agent's undeclared modification of `FrontierBaseChat.test.tsx` is a concrete example:
I classified it as "correct and necessary change; process violation only; non-blocking." A
different Tech Lead might have classified it as a scope violation and requested a revised report.
No reference doc anchors this judgment.

- **Affected doc:** `agent-docs/roles/tech-lead.md` / Adversarial Review section
- **Lens:** `portability` (deviation classification is universal to any Tech Lead adversarial
  review), `evolvability` (one table with severity criteria prevents per-CR reimvention)

---

## Responsibility / Scope Concerns

**TL-S1 — Tech Lead accumulates planning, adversarial review, quality gates, and handoff
  authoring in a single role — Coordinator decomposition is warranted:**

CR-021 Tech Lead execution comprises six distinct responsibilities:
1. Architecture planning and SSE protocol design (Session A — high context, creative)
2. Direct config change (`timeoutMs`) (Session A — execution, low context)
3. Adversarial review of three sub-agent reports (Sessions B, C, D — high context, analytical)
4. Quality gate execution four times (Sessions B, C, D — procedural)
5. Handoff authoring for Frontend and Testing (Sessions B, C — medium context, templated)
6. BA closure report (Session D — medium context, templated)

Responsibilities 1–2 and 6 require architectural memory (the plan and design decisions).
Responsibilities 3–5 require implementation memory (reading many modified files, running tests).
These two memory profiles fight for the same context window.

**Human User observation (exact wording preserved):** "After planning, tech lead will only do
coordination. Adversarial check and verification will be done by a new role. This role will
communicate with the subagents."

**Proposed decomposition:**
- **Tech Lead** retains: Architecture planning, SSE protocol design, direct-change authority,
  BA handoff authoring. One session. No file-reading adversarial review.
- **CR Coordinator** (new role): Receives sub-agent reports, performs adversarial review,
  runs quality gates, issues handoffs from pre-authored templates, returns a conclusion
  summary to Tech Lead. One session per sub-agent round-trip.

**Sequential execution model:**
```
TL → Coordinator(Backend) → Backend → Coordinator(Backend) → TL
   → Coordinator(Frontend) → Frontend → Coordinator(Frontend) → TL
   → Coordinator(Testing) → Testing → Coordinator(Testing) → TL → BA
```

**Parallel execution model:**
```
TL → [Coordinator(Backend) ↔ Backend, Coordinator(Frontend) ↔ Frontend] → TL → BA
```

(Testing would follow Frontend Coordinator completion; Testing + its Coordinator runs sequentially
after Frontend as before.)

**Role Scope Review: guiding questions answered:**
1. *Which phase hits pressure?* Verification — adversarial review + file reading + quality gates.
2. *Accumulated responsibilities or data volume?* Data volume: 5–10 file reads per sub-agent
   round-trip, plus test/build output, plus session state updating.
3. *Can adjacent phase absorb it?* Sub-agents already have self-verification checklists. Absorbing
   adversarial review there would conflict with the independence principle (sub-agent reviewing
   its own work). A new role is cleaner than restructuring self-verification.
4. *Two-phase within same role?* Possible but would not solve context saturation — same agent,
   same context window, just split across two sub-sessions. The Coordinator avoids saturation
   by being a separate session entirely.
5. *Does a new role have distinct boundaries?* Yes:
   - **Authority boundary**: Coordinator does not modify architecture or issue novel design
     decisions; Tech Lead does not read implementation files or run quality gates.
   - **Execution context**: Coordinator starts fresh with sub-agent report + implementation files
     + handoff template; Tech Lead starts fresh with plan and Coordinator summary.
   - **File ownership**: Coordinator owns `tech-lead-to-[role].md` handoff issuance and quality
     gate command execution; Tech Lead owns `TL-session-state.md`, plan authoring, and BA handoff.

- **Affected doc:** `agent-docs/roles/tech-lead.md`; `agent-docs/workflow.md` / Execution Flow;
  `agent-docs/coordination/meta-improvement-protocol.md` / Role Health Indicators
- **Lens:** `portability` (any multi-agent sequential CR would benefit from this split),
  `collaboration` (Coordinator removes Tech Lead from the serial path of sub-agent cycles;
  parallel CRs become genuinely more parallel), `evolvability` (defines a stable split that
  scales to N sub-agents without further role growth)

---

## Engineering Philosophy Concerns

**TL-E1 — The two-session model is a point solution, not a scaling model:**

The two-session model was designed for a CR with one "implementation" sub-agent + one "testing"
sub-agent. CR-021 had three sub-agents. The session count grew from 2 to 4, not from 2 to 3.
This is because each additional sub-agent adds exactly one session (one review + one handoff).
The growth is linear in the number of sub-agents, but the model was never documented as linear.

A CR with 4 sub-agents would require 5 sessions (A + one per sub-agent). At some CR complexity
level, the Tech Lead role as currently defined is simply not executable in a single session per
phase — the context window is a hard constraint, not a tunable parameter.

The engineering philosophy concern: the two-session model masks an architectural scaling problem
behind a low-complexity default. The meta-improvement protocol's Role Health mechanism exists
precisely to catch this, but the input surface (where to log the signal) is missing from the
workflow (TL-M2 above).

- **Affected doc:** `agent-docs/roles/tech-lead.md` / Two-Session Execution Model;
  `agent-docs/coordination/meta-improvement-protocol.md` / Role Health Indicators
- **Lens:** `evolvability` (the model should generalize from N=2 to N=any), `portability`
  (context window as a constraint applies to any LLM-based agent workflow)

---

## Redundant Workflow Steps

**TL-W1 — Quality gates executed 4 times with no differentiation between gate purposes:**

Sessions B, C, and D each ran `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`.
Session D also ran `pnpm test:e2e`. Total: 4 full test runs, 4 lint runs, 4 tsc runs, 4 build runs.

The rationale for running gates after each sub-agent round-trip is sound: catch integration
issues before the next sub-agent begins work. But this design assumes the Tech Lead is the only
entity who can run quality gates. If a Coordinator ran quality gates as part of its cycle, the
Tech Lead would only need to review the Coordinator's gate summary (not re-run gates independently).

Additionally, the tech-lead role doc does not document why gates are run per-session rather than
once at the end. A future Tech Lead might skip the per-session gates as overhead if the rationale
is not explicit. Documenting "gates run after each sub-agent to catch integration regressions
early" prevents this.

- **Affected doc:** `agent-docs/roles/tech-lead.md` / Verification section;
  `agent-docs/workflow.md` / Tech Lead Responsibilities
- **Lens:** `evolvability` (adding one sentence explaining the per-session gate rationale
  prevents future under-use), `collaboration` (Coordinator absorbing gates removes 3 of 4
  from Tech Lead's context without losing coverage)

---

## Other Observations

**TL-O1 — Pre-replacement check circularity is confirmed from every role's perspective:**

T-W1 (Testing), F-W1 (Frontend), B-W1 (Backend) all independently identified the same
pre-replacement check circularity: the gate is satisfied by reading the handoff file that
initiates the replacement — there is no independent verification. This convergence across
three roles in the same CR is a strong signal that the finding is real, not role-specific.

From the Tech Lead perspective: I fill in the Pre-Replacement Check in the handoff I issue.
The sub-agent reads my attestation to satisfy the gate. The sub-agent is never required to
independently check `project-log.md`. The gate has no content value — it only documents
what I already confirmed. Either (a) the protocol should explicitly allow Tech Lead attestation
to satisfy the gate, removing the sub-agent's redundant verification step, or (b) the gate
should be independent of the handoff (sub-agent reads project-log.md directly). Currently it is
neither.

- **Affected doc:** `agent-docs/workflow.md` / Conversation File Freshness Rule /
  Pre-Replacement Check
- **Lens:** `collaboration` (removes 1–2 file reads per sub-agent session), `portability`
  (applies to every CR with a pre-replacement check)

**TL-O2 — BA handoff authoring requires full implementation context that Tech Lead no longer
  holds reliably in Session D:**

The BA handoff requires file:line evidence for all ACs. In Session D, I cited
`FrontierBaseChat.tsx` line numbers from a read performed in a prior session segment. The
session had been compacted, so I relied on a mix of fresh reads and memorized line numbers from
the summary. Line 38, 39, 342, 349, 376, 381, 388, 263 — I cited these from the session
summary rather than from a live read.

This creates a risk: if a Frontend Agent had modified the component and the session summary
reflected pre-modification line numbers, the BA handoff would contain stale evidence citations.
In CR-021, the Frontend Agent report and my own prior read were consistent, so this was safe.
But the BA handoff authoring process has an implicit dependency on Tech Lead context fidelity
that breaks under session compaction.

The Coordinator model would resolve this: Coordinator reads all implementation files during the
review cycle and provides the Tech Lead with a verified summary including exact line numbers.
The Tech Lead writes the BA handoff from the Coordinator summary, not from stale session memory.

- **Affected doc:** `agent-docs/roles/tech-lead.md` / BA Handoff section;
  `agent-docs/conversations/TEMPLATE-tech-lead-to-ba.md`
- **Lens:** `evolvability` (BA handoff accuracy degrades as session complexity grows),
  `portability` (any multi-session role faces this)

---

## Lens Coverage (Mandatory)

- **Portability Boundary:** TL-S1 (Coordinator decomposition) and TL-E1 (session scaling model)
  are the most portable findings — they apply to any multi-agent sequential workflow where
  verification and planning share a context window. TL-C1, TL-M1, TL-W1 are portable to any
  project using a multi-session Tech Lead model. TL-R1 (adversarial checklist location) is
  portable to any role with a structured review responsibility.

- **Collaboration Throughput:** TL-S1 is the highest-impact collaboration finding. Under the
  current model, the Tech Lead is in the serial path of every sub-agent cycle: sub-agent reports
  → Tech Lead reviews → Tech Lead issues next handoff. The Coordinator model removes Tech Lead
  from this serial path, enabling parallel sub-agent cycles (parallel mode) and reducing
  Tech Lead sessions from 4 to 2 in a 3-sub-agent CR. TL-W1 (gates run 4x) and TL-O1
  (pre-replacement check redundancy) are smaller throughput wins achievable without a new role.

- **Evolvability:** TL-U1 (deviation severity criteria) and TL-R1 (adversarial checklist in
  role doc) have the highest evolvability value — both grow in value proportionally to CR volume.
  TL-M2 (health signal input surface) is low cost, high value: one field in TL-session-state.md
  template activates an existing but dormant mechanism.

---

## Prior Findings: Assessment

**T-M1 (API key availability in env caveats)** → **Validated and Extended.** From Tech Lead
perspective: I knew the E2E run would use fallback mode at handoff issuance time and did not
document it in the Testing handoff. The omission was deliberate (the handoff included a note
that status assertions should use `/Mode: (live|fallback)/i`) but the higher-level implication —
that CR-021's core behavioral change is untested by E2E — was only acknowledged in the BA
handoff as a Tech Lead recommendation, not in the Testing handoff where it would have been
actionable. The fix belongs in the Testing handoff template.

**T-M2 (Expected test count delta)** → **Validated.** I was aware the Backend and Frontend agents
added unit tests but did not communicate the expected delta in the Testing handoff. One sentence
would have eliminated the 162 vs. baseline ambiguity.

**T-E1 (Live-path vs fallback-path coverage concept)** → **Validated.** This is the systemic
version of T-M1. The testing strategy correctly prioritizes fallback-mode determinism but
doesn't acknowledge that some CRs' core changes are live-path-only. Needs a distinction in
`testing-strategy.md`.

**T-C1 / T-U1 (Timeout ambiguity, "adequate" unanchored)** → **Validated with lesson.** I wrote
the ambiguous timeout guidance and then overrode the Testing Agent's correct-by-literal-reading
decision. The fix is Tech Lead owning the timeout decision at handoff authoring time (extend to
30s unconditionally given the streaming context) rather than delegating an empirical decision
that the Testing Agent cannot make without a live API key.

**T-W1 (Pre-replacement check circularity)** → **Validated.** Confirmed from Tech Lead side in
TL-O1. All four agents (Testing, Frontend, Backend, Tech Lead) independently identified this
in the same CR. Strong escalation signal per meta-improvement protocol (same finding class,
multiple roles).

**F-R1 (SSE parsing logic duplicated across components)** → **Validated and scope-owned.** I chose
not to extract a shared `useSSEStream` hook in the Frontend handoff because the scope was tight.
This was a deliberate trade-off, not an oversight. The technical debt is real and documented in
the BA handoff as a residual risk. The correct resolution is a follow-up micro-CR for
`lib/hooks/useSSEStream.ts` or `lib/client/sse.ts`.

**F-S1 (Implicit test maintenance delegation)** → **Validated.** The Frontend handoff said
"Do NOT modify route files, test files, config files." The Frontend Agent modified
`FrontierBaseChat.test.tsx` anyway, correctly. The prohibition was too broad — it should have
had an explicit carve-out: "Do not modify test files, except where your implementation changes
break existing tests that are structurally tied to the component behavior."

**F-E1 (Fail-fast vs partial content on stream error)** → **Acknowledged as deliberate design
decision.** I specified `setOutput('')` on stream error in the Frontend handoff. The fail-fast
philosophy was intentional for the educational demo context (partial content with an error is
more confusing than a clean error state). This should be documented as a deliberate choice in
the component or handoff, not left implicit.

**B-S1 (OTel span lifecycle undocumented)** → **Validated as the highest-severity Backend
finding.** The `streamingActive` flag pattern was invented ad-hoc by the Backend Agent and I
accepted it during adversarial review without verifying against any documented pattern. Any future
streaming route implementation will rediscover this from scratch. Belongs in `backend.md` /
Observability.

**B-C1 (clearTimeout restructuring conflict)** → **Validated.** The "keep existing pattern"
instruction conflicted with the mid-stream abort requirement. I wrote both constraints without
checking their structural compatibility. A pre-implementation compatibility note would have
prevented the ad-hoc resolution.

**B-U2 (Leaf Utility Isolation sibling imports)** → **Validated.** I did not check the Leaf
Utility Isolation wording before writing the streaming.ts creation task. One clarifying sentence
in `development-standards.md` would have prevented the inline type duplication in `streaming.ts`.

**B-O2 (Pre-existing test failures not disclosed)** → **Validated.** I knew CR-019 had left
failing tests. I did not call this out in the Backend handoff, and Backend resolved it as a
judgment call. The correct practice: always list known pre-existing failures in the Backend
handoff "Known Environmental Caveats" section.

**B-E1 (Soft cap vs hard truncation)** → **Documented as residual risk in BA handoff.** The
trade-off was acknowledged during adversarial review and classified as low risk for the
educational context. Not a doc fix priority.

---

## Top 5 Findings (Ranked)

1. TL-S1 | Tech Lead context saturates at 3+ sub-agents; Coordinator role (verification + sub-agent communication) is the structural fix | `agent-docs/roles/tech-lead.md` + `agent-docs/workflow.md` | `portability` `collaboration` `evolvability`
2. TL-U1 | Adversarial review pass/fail criteria are implicit — no deviation severity standard, causing inconsistent classification across CRs | `agent-docs/roles/tech-lead.md` / Adversarial Review | `portability` `evolvability`
3. TL-O1 | Pre-replacement check circularity confirmed by all 4 roles in same CR — highest convergence signal in this analysis; trust model is undeclared | `agent-docs/workflow.md` / Conversation File Freshness Rule | `collaboration` `portability`
4. TL-M2 | Role Health threshold for context saturation exists in protocol but has no input surface in the execution workflow — signal never accumulates | `agent-docs/coordination/TL-session-state.md` template + `meta-improvement-protocol.md` | `evolvability` `collaboration`
5. TL-R1 | Per-CR adversarial review checklist regenerated in TL-session-state.md — portable criteria should live in tech-lead.md for reuse and sub-agent self-verification | `agent-docs/roles/tech-lead.md` / Adversarial Review; `agent-docs/coordination/TL-session-state.md` template | `portability` `evolvability`
