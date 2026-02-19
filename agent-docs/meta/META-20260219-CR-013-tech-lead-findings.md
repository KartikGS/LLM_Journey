# Meta Findings: Tech Lead — CR-013

**Date:** 2026-02-19
**CR Reference:** CR-013 (Add Hugging Face Inference API Provider Support)
**Role:** Tech Lead
**Prior findings reviewed:** `agent-docs/meta/META-20260219-CR-013-backend-findings.md`

---

## Conflicting Instructions

**TL-C1 — Approval Gate is defined in two places with diverging wording**
`workflow.md` (Technical Planning Phase, step 5) and `tech-lead.md` (The Approval Gate section) both define the Go/No-Go gate. The workflow version adds "pure discovery sessions with no execution/delegation handoff" as a skip condition; `tech-lead.md` says "simple discovery." These are not the same: a discovery session could produce a delegation handoff, in which case the workflow version would require approval but `tech-lead.md` would skip it. Two parallel sources for the same rule will drift.
- Affected: `agent-docs/workflow.md` / Technical Planning Phase step 5 + `agent-docs/roles/tech-lead.md` / The Approval Gate section

**TL-C2 — Testing Ownership Rule and Testing Handoff Trigger Matrix interact without a defined resolution mechanism**
`workflow.md` Trigger Matrix says "UI structure/class refactor with unchanged contracts → Conditional (no Testing handoff if contract stability evidence documented)." The Testing Ownership Rule (same file) says "Creating/modifying tests is owned by the Testing Agent unless explicitly delegated." When the matrix waives the Testing handoff, the Ownership Rule still applies — meaning nobody owns the tests unless explicit delegation is in the main handoff. The resolution (delegate in the primary sub-agent handoff) works in practice but is not stated. A new Tech Lead reading the two rules sequentially will see a gap.
- Affected: `agent-docs/workflow.md` / Testing Ownership Rule + Testing Handoff Trigger Matrix

**TL-C3 — `.env.example` ownership is claimed by both Tech Lead and Backend**
`tech-lead.md` Permitted Direct Changes table lists `.env.example` as Tech Lead-owned. The CR-012 Backend handoff template (now replaced) had `.env.example` in Backend's scope, and Backend finding B-S2 flags this as friction. The conflict: when Backend is the agent that knows which new env vars are needed, Tech Lead ownership creates a planning dependency that requires anticipating all env vars at plan time. Neither doc explains what Backend should do if it discovers a needed env var during implementation (flag in preflight? block? proceed anyway?).
- Affected: `agent-docs/roles/tech-lead.md` / Permitted Direct Changes, `agent-docs/roles/sub-agents/backend.md` / Ownership Quick Matrix

---

## Redundant Information

**TL-R1 — Quality gate command list is documented in three places**
`tech-lead.md` Verification Checklist, `testing-strategy.md` Tech Lead Verification Matrix, and `workflow.md` (referenced as "run quality gates per testing-strategy.md") all document the same four commands (`pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`). When the ordering rule or conditionality changes, all three need updating. The canonical source should be one doc (testing-strategy.md's Verification Matrix, since it also defines conditionality), with the other docs cross-referencing it.
- Affected: `agent-docs/roles/tech-lead.md` / Verification Checklist + `agent-docs/testing-strategy.md` + `agent-docs/workflow.md`

**TL-R2 — Self-Review Checklist and Verification Checklist overlap without declared scope**
`tech-lead.md` has two checklists: the Verification Checklist (procedural, gate-specific) and the Quality Checklist (reflective, end-of-CR). Items like "Are constraints explicit and documented?" and "Did I delegate appropriately?" in the Quality Checklist overlap with the Verification Checklist's "Adversarial Diff Review" and "Artifact & ADR Update" items. Neither checklist explains when it applies relative to the other, or that both are required.
- Affected: `agent-docs/roles/tech-lead.md` / Verification Checklist + Quality Checklist (Self-Review)

**TL-R3 — Plan template includes Architecture-Only Freeze Checklist for every CR**
The `plans/TEMPLATE.md` includes the Architecture-Only Freeze Checklist as a conditional section, but it appears in the template body without a clear signal to delete it for non-architecture-only CRs. For CR-013 (a pure backend feature extension), I had to skip this section mentally. Every Tech Lead working on a feature CR will encounter this section and either waste time marking it N/A or omit it silently. A "delete this section if not applicable" note would eliminate the overhead.
- Affected: `agent-docs/plans/TEMPLATE.md` / Architecture-Only Freeze Checklist

---

## Missing Information

**TL-M1 — No decision rule for adversarial review findings that fail non-AC criteria**
The Verification Checklist mandates an adversarial diff review but gives no guidance on what to do when a finding does not fail an explicit AC. In CR-013, the `return_full_text` prefix echo was a real product quality issue but not an AC requirement. The options available were: (a) block closure and re-delegate to Backend, (b) document as a follow-up recommendation, (c) fix directly (not permitted). No rule helps a Tech Lead choose between (a) and (b). I chose (b) because no AC mentioned it, but another Tech Lead might block. A decision rule — "only block closure for findings that fail an explicit AC; all other findings become follow-up CR candidates" — should be documented.
- Affected: `agent-docs/roles/tech-lead.md` / Verification & BA Handoff

**TL-M2 — Verification checklist does not include a debug artifact check**
The adversarial diff review step says "look for edge cases that tests might miss" but does not include "check for debug artifacts (console.log, commented-out code, TODO markers left in production paths)." This is a distinct category from logic edge cases and is routinely missed because it's invisible to quality gates unless ESLint's no-console rule is active. Should be a named checklist item.
- Affected: `agent-docs/roles/tech-lead.md` / Verification Checklist

**TL-M3 — No protocol for user-made modifications to feature files after agent verification**
During CR-013, the user added `console.log(upstreamResponse)` to `route.ts` after my verification was complete. This made the Tech Lead's verification evidence stale before the BA acceptance phase. No protocol exists for this scenario. The implicit assumption is that users don't modify feature files directly, but this assumption is undocumented and will not always hold. A note is needed: either "Tech Lead should re-verify if feature files are modified between verification and BA handoff," or "user-made changes after TL verification require a new verification pass before BA acceptance."
- Affected: `agent-docs/workflow.md` / Verification Phase, or `agent-docs/coordination/handoff-protocol.md`

**TL-M4 — Backend and Tech Lead verification scopes are not documented as intentionally different**
In CR-013, Backend ran a scoped test run (single spec file) and TL ran the full suite. This is the correct division: Backend proves new work passes; Tech Lead proves integration with the full system. But this division of verification labor is not documented anywhere. A new Tech Lead might defer to Backend's verification or re-run only scoped tests. The policy should explicitly state: "Sub-agent verification is scoped to affected files (fast feedback). Tech Lead verification is always full-suite (integration gate)."
- Affected: `agent-docs/roles/tech-lead.md` / Verification Checklist (or `testing-strategy.md`)

**TL-M5 — `Configuration Specifications` section in plan template lacks purpose explanation**
The plan template includes a `Configuration Specifications` section marked "MANDATORY for task involving config files" and "Do not defer critical logic to sub-agent." For CR-013, I used this to specify `HF_MAX_NEW_TOKENS = 256` (a constant the sub-agent would otherwise have to guess) and the valid `FRONTIER_PROVIDER` values. But the section's purpose — "record Tech Lead decisions that would otherwise create judgment gaps for sub-agents" — is not stated. A new Tech Lead might use it to document existing configs rather than record new decisions, missing its core value.
- Affected: `agent-docs/plans/TEMPLATE.md` / Configuration Specifications

**TL-M6 — BA handoff: `tech-lead-to-ba.md` has no template reference in Tech Lead's context**
`tech-lead.md` Verification Checklist step says "Create Tech Lead → BA Handoff" and references the handoff protocol. But it does not link to `TEMPLATE-tech-lead-to-ba.md` (if one exists) or provide the required section structure. The Handoff Protocol doc defines required content (`[Status]`, `[Technical Summary]`, etc.), but a new Tech Lead consulting only `tech-lead.md` would not find this.
- Affected: `agent-docs/roles/tech-lead.md` / Verification Checklist last item; `agent-docs/conversations/` (TEMPLATE-tech-lead-to-ba.md may be missing)

---

## Unclear Instructions

**TL-U1 — "Execution Audit" step does not reference the Freshness Rule it implements**
`workflow.md` Technical Planning Phase step 3 says "Tech Lead audits existing `/agent-docs/conversations/` to ensure stale context is cleared or properly updated." The Conversation File Freshness Rule (same doc, Delegation Mode Rules section) defines what "stale" means and what to do. These are the same concept in two different sections with no cross-reference. A Tech Lead reading step 3 in isolation won't know what the audit should produce or where the governing rule lives.
- Affected: `agent-docs/workflow.md` / Technical Planning Phase step 3

**TL-U2 — BA handoff validation is mandated but the output format is unspecified**
`tech-lead.md` Validate & Internalize says "explicitly verify the handoff from BA" with a checklist (AC testable? Constraints compatible? etc.). It doesn't say where this verification is recorded. Is it a mental check? A comment in the plan file? A separate conversation file reply? For synchronous sessions it works either way, but for multi-session workflows a future Tech Lead needs to know if there's a formal output requirement.
- Affected: `agent-docs/roles/tech-lead.md` / Validate & Internalize section

**TL-U3 — "Specify the Testing Sequence" is mandated for all CRs but is undefined for delegated-test Backend CRs**
`tech-lead.md` says "MANDATORY: Specify the Testing Sequence. Example: (1) Testing Agent writes failing tests → (2) Frontend Agent implements UI → (3) Testing Agent verifies. Deciding between TDD or Implementation-First is a Tech Lead technical decision." For Backend CRs where test work is explicitly delegated to Backend (not Testing Agent), TDD would require Testing Agent to write failing tests first — but there is no Testing Agent handoff. Implementation-First is the only viable approach in this case. The instruction should acknowledge this: "When tests are delegated to Backend in the same handoff, TDD is unavailable; use Implementation-First and specify this explicitly in the plan."
- Affected: `agent-docs/roles/tech-lead.md` / Technical Planning & Delegation

---

## Responsibility / Scope Concerns

**TL-S1 — Tech Lead adversarial review has no documented escalation path for non-AC findings**
(Extends TL-M1.) When the adversarial review surfaces an issue, the Tech Lead's available responses are: block, delegate-fix, or pass-to-BA. These options exist implicitly in the workflow model but no ownership rules govern which applies. This is a responsibility gap: the Tech Lead is the "final technical authority" but the consequence of that authority in the review phase is undefined. Adding a severity-based decision rule (matching the BA Deviation Severity Rubric pattern) would close this gap.
- Affected: `agent-docs/roles/tech-lead.md` / Verification & BA Handoff

**TL-S2 — User-made feature code modifications are not governed by any role protocol**
(Related to TL-M3.) The delegation invariants cover agent-to-agent scope. But the User can directly modify any file at any time. When a user modifies feature code that was recently verified, the verification record is stale. The handoff protocol and verification checklist both assume the Tech Lead is the last writer of verification evidence — this assumption is undocumented and false in practice. The User Override Rule (workflow.md) governs scope extension approvals but says nothing about direct user edits to verified files.
- Affected: `agent-docs/workflow.md` / General Invariants, or a new protocol note

**TL-S3 — ADR decision criteria are underspecified for infrastructure-only changes**
`tech-lead.md` says an ADR "must" be created when "introducing new architectural constraints, modifying system invariants, adding cross-cutting concerns, changing security or observability boundaries." CR-013 added a new provider type, a new env var, and new span attributes — none of these clearly meets the ADR threshold, but they are architectural choices. The criteria are broad enough that a cautious Tech Lead would create an ADR for every non-trivial backend change, or a lenient one would never create one. The examples given in AGENTS.md / decisions README don't help calibrate. A clearer decision test is needed.
- Affected: `agent-docs/roles/tech-lead.md` / Architecture & ADRs

---

## Engineering Philosophy Concerns

**TL-P1 — No philosophy for "trivially correct improvements discovered during verification"**
CR-013's `return_full_text: false` case is representative of a class of findings: a clearly correct, low-risk change discovered during adversarial review that falls outside the explicit ACs. The project has a documented "minimum changes necessary" philosophy in its general principles. But there is no documented position on whether to fold such improvements into the current CR (with a scope extension approval) or always defer them. In practice, the "minimum changes" principle suggests always deferring, but the trade-off (known product defect in live release vs. scope discipline) is not acknowledged. This ambiguity will recur.
- Affected: `agent-docs/general-principles.md` or a new philosophy note in `tech-lead.md`

**TL-P2 — Dual quality gate runs (Backend + Tech Lead) are by design but their distinct purposes are undocumented**
Backend runs quality gates to prove the new implementation is locally correct. Tech Lead runs the full suite to prove integration is intact. Both run lint and tsc. The duplication is intentional (adversarial, independent verification) but if you read only the workflow docs, it looks like unnecessary repetition. An agent optimizing for efficiency might skip one pass. The distinct purpose of each pass — sub-agent proves "new tests pass"; Tech Lead proves "full suite still passes" — should be stated explicitly.
- Affected: `agent-docs/workflow.md` / Implementation Phase + Verification Phase

---

## Redundant Workflow Steps

**TL-W1 — Mandatory Reading Confirmation listing is identical every session for a given role**
Already captured by Backend (B-W2). Extending: the confirmation serves as an attestation of role readiness, not a content verification. Its value could be preserved with a shorter form — "Context loaded per `tech-lead.md` required readings. No skips." — with the full list required only when a file was intentionally omitted (with rationale). The full listing is meaningful for auditing but could be reduced to an exception-based model.
- Affected: `agent-docs/AGENTS.md` / Mandatory Output Check

**TL-W2 — Plan file `Contract Delta Assessment` section is always empty for Backend-only CRs**
Every plan uses the standard template including the Contract Delta Assessment section. For CR-013 (backend only, no route/selector/accessibility changes), all fields were "no." The section adds no value when the answer is uniformly no across all fields. Consider making it conditional: "Complete this section only if any contract type might have changed; otherwise, state 'No contract changes — backend-only scope.'"
- Affected: `agent-docs/plans/TEMPLATE.md` / Contract Delta Assessment

---

## Other Observations

**TL-O1 — `/agent-docs/decisions/` reading requirement scales poorly with ADR count**
`tech-lead.md` Context Loading (Every Task) says to read "Architecture & [Decisions](/agent-docs/decisions/)." Currently one ADR exists; at 10+ ADRs this becomes expensive. There is no guidance for how to triage which ADRs are relevant to a given CR. Consider adding: "For CRs that don't touch observability, security, or rendering boundaries, only the README and any directly-related ADR need to be read."
- Affected: `agent-docs/roles/tech-lead.md` / Context Loading

**TL-O2 — Conversation File Freshness Rule creates silent history loss without an archive check**
The Freshness Rule mandates replacing conversation file contents for each new CR. I replaced CR-012's `tech-lead-to-ba.md` with CR-013's content — CR-012's verification evidence is now gone from that file. The rule says "historical traceability belongs in CR artifacts" but there's no enforced check that the prior content was already captured in its CR artifact before replacement. A Tech Lead following the rule mechanically could destroy evidence if the prior CR's artifacts were incomplete.
- Affected: `agent-docs/workflow.md` / Conversation File Freshness Rule

**TL-O3 — `meta/` directory existence is not documented in AGENTS.md or workflow.md**
The Meta Improvement Protocol references `agent-docs/meta/META-YYYYMMDD-...` files, but no doc in the standard agent reading stack tells agents this directory exists or that they should create it if it doesn't. A new agent running the protocol for the first time would need to discover it via the protocol doc itself (or create the directory blindly).
- Affected: `agent-docs/coordination/meta-improvement-protocol.md` (add a note that the directory must exist; create it if not)

**TL-O4 — The `keep-in-mind.md` lifecycle is underdone: "Fix root cause → Move to permanent doc → Delete" is never triggered**
`keep-in-mind.md` has warnings with lifecycle notes ("Fix root cause → Move to permanent doc → Delete from here"). The CR-013 flow (and prior CRs reviewed in project log) have never resulted in a `keep-in-mind.md` entry being promoted or deleted. The file will grow indefinitely. The lifecycle step needs to be explicitly owned — either Tech Lead promotes during Verification Phase, or BA promotes during Acceptance — and linked to a verification step in the relevant checklist.
- Affected: `agent-docs/keep-in-mind.md` / lifecycle note; `agent-docs/roles/tech-lead.md` or BA role doc / ownership of promotion

---

## Prior Findings: Assessment

- **B-C1** (READ-ONLY phrasing conflicts with delegation model) → **Validated** — The conditional qualifier ("unless explicitly delegated") follows a hard stop word, which creates hesitation even when the handoff is unambiguous. The pattern applies to any READ-ONLY marking in the docs.

- **B-C2** (FrontierConfig failure-path `provider` field unspecified) → **Validated and Extended** — In the handoff I pre-specified this (defaulting to `'openai'`), but this was an intuitive choice, not a documented standard. The handoff template for type extensions should require specifying field values for ALL return paths including failure paths.

- **B-R1** (backend.md Boundaries + Ownership Matrix duplication) → **Validated** — Consistent with TL-R1: single-source-of-truth violations create drift risk.

- **B-R2** (Execution Responsibilities section adds no value) → **Validated** — This is universal filler in sub-agent role docs. The Backend-specific execution constraints (no package install, verification order) are the real content.

- **B-R3** (AGENTS.md circular Execute bullet) → **Validated** — The After Reading section is almost entirely redundant with the required readings themselves.

- **B-M1** (dangling `/agent-docs/api/` reference) → **Validated** — This directory does not exist. I confirmed during discovery phase.

- **B-M2** (no runtime mismatch recovery path) → **Validated** — I used the same nvm workaround without documented guidance. Both agents independently discovered the same recovery path.

- **B-M3** (no debug artifact hygiene checklist) → **Extended** — The `console.log` that appeared in route.ts during this CR was user-added after my verification, which reveals a deeper gap: neither Backend's checklist nor Tech Lead's verification covers post-verification user modifications. TL-M3 covers the Tech Lead angle; B-M3 covers the Backend angle.

- **B-M4** (failure-path field values not required in type extension handoffs) → **Validated** — Extended in TL's handoff template note (TL-C2 / TL-M5 area).

- **B-M5** (full regression suite not required before Backend reporting) → **Validated and Extended as TL-M4** — The intentional asymmetry (Backend scoped, TL full-suite) should be documented explicitly.

- **B-U1** (preflight pause semantics in synchronous sessions) → **Validated** — The "pause and wait" instruction is designed for async multi-session usage and breaks down when both agents operate in the same session.

- **B-U2** (span attribute placement ambiguity) → **Validated** — "Every code path" is genuinely ambiguous between "in each branch" and "once before branching." Handoff template should prefer the more precise "set once after X returns" pattern.

- **B-U3** (first action ambiguity in AGENTS.md Mandatory Output Check) → **Validated** — "First action" should read "first output message."

- **B-S1** (testing delegation criteria undocumented) → **Validated and Extended as TL-U3** — The deeper issue: for Backend-delegated tests, TDD is structurally unavailable, but the tech-lead.md mandate to specify TDD vs. Implementation-First doesn't acknowledge this case.

- **B-S2** (`.env.example` ownership friction) → **Validated as TL-C3** — This is a genuine ownership conflict between two docs.

- **B-P1** (project principles irrelevant to Backend as Universal Standards) → **Partially validated** — For Tech Lead, cross-cutting concerns make project principles somewhat relevant (e.g., when evaluating whether a backend change affects educational flow). But the cost/benefit for Backend is clearly negative.

- **B-P2** (dependency constraint in handoffs not in policy) → **Validated** — `technical-context.md` Governance Invariant is the canonical home; it should be cross-referenced in `backend.md`.

- **B-W1** (preflight as ceremony when pre-confirmed) → **Partially refuted** — In CR-013, the preflight produced genuine value by surfacing the 503 model-loading and `return_full_text` risks in writing, even though both were pre-flagged in the handoff. The written preflight created a formal record of risk acknowledgment, which was referenced in the TL verification. Making it conditional might cause these risks to not be formally recorded. Suggest a lighter-weight version rather than elimination.

- **B-W2** (Mandatory Reading Check always identical per role) → **Validated as TL-W1** — Extending: exception-based model is better.

- **B-O1** (template section ordering: preflight before status) → **Validated** — Overall status should be the first thing a reviewer sees.

- **B-O2** (meta-analysis flow was undocumented) → **Noted** — Already resolved by the new protocol.
