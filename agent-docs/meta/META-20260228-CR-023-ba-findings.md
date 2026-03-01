# Meta Findings: BA — CR-023

**Date:** 2026-02-28
**CR Reference:** CR-023 — Purpose-Driven Observability Refinement
**Role:** BA
**Prior findings reviewed:**
- `agent-docs/meta/META-20260228-CR-023-backend-findings.md`
- `agent-docs/meta/META-20260228-CR-023-tech-lead-findings.md`

---

## Conflicting Instructions

**BA-023-C1 — No protocol defining BA sign-off authority when TL descopes a BA-authored AC during pre-planning**

When TL discovery overturned the BA's AC-4 claim (`getTelemetryTokenErrorsCounter` is live, not dead), the TL correctly escalated to in-session user consultation and recorded the descope in the plan and tech-lead-to-ba.md. But the workflow defines no protocol for this specific case: a TL pre-planning discovery that invalidates a BA-authored AC, requiring a scope change before implementation begins.

The BA-Tech Lead Clarification Loop in `workflow.md` covers post-handoff disagreement — "BA handoff → [Tech Lead concerns ↔ BA responses] (0..N rounds) → Plan approval." It does not cover the case where the TL discovers a factual error in the BA's requirement *during* planning (before any formal concern is raised to the BA) and resolves it with the user directly. The BA's first knowledge of the AC-4 descope was the tech-lead-to-ba.md handoff — after implementation had already completed. There was no formal BA sign-off on the scope change.

In this CR the descope was correct and low-risk, so the informal path worked. But the authority question is real: can the TL descope a BA-authored AC with only user approval, or does the BA remain the requirement-owner even for factual corrections? The workflow gives BAs authority over "requirement clarity and scope" — does that authority extend to requiring BA co-sign on any AC removal?

**Grounding:** Reading tech-lead-to-ba.md and finding "AC-4: DESCOPED — confirmed active call site in lib/otel/token.ts:20" as a fait accompli. The first BA involvement in this decision was acceptance, not planning. `collaboration`, `evolvability`

---

## Redundant Information

**BA-023-R1 — Pre-Replacement Check for ba-to-tech-lead.md at CR-023 start is distinct from the TL self-attestation case (partial refutation of TL-023-R1)**

TL-023-R1 identifies the Pre-Replacement Check as adding ceremony without independent verification "when TL attestation is already present." At the BA level, the pre-replacement check when starting CR-023 required me to independently read `CR-022-adaptation-page-upgrade-and-cleanup.md` and confirm its status was `Done` — work done by a different agent in a prior session. This IS an independent verification step, not a self-attestation. It has genuine safety value: it prevents a BA from accidentally overwriting a handoff tied to an in-flight CR.

The TL-023-R1 finding is valid for S-class CRs where the TL writes tech-lead-to-ba.md and is self-confirming their own just-completed work. But generalizing TL-023-R1 to "Pre-Replacement Checks add no value" risks removing a check that matters when the verifying agent is NOT the one who completed the prior CR. The streamlining proposal should target the self-attestation case specifically, not the cross-role case.

**Grounding:** The Pre-Replacement Check for ba-to-tech-lead.md required me to open CR-022 and read its status field — a 5-second read that confirmed a boundary condition I could not otherwise assume. The TL-023-R1 streamlining proposal should preserve this step for cross-role boundary checks. `evolvability`

---

## Missing Information

**BA-023-M1 — BA Technical Sanity Check guidance does not differentiate positive claims from negative claims; no instruction to grep before asserting absence**

This is the direct root cause of the AC-4 error. I wrote "no call site exists anywhere in the codebase" after reading the telemetry-token route file (where the function is not called) and the metrics.ts file (where the function is defined). I did not grep for callers before making the negative assertion.

`ba.md` states the BA "MAY read implementation code files during Technical Sanity Check to ground AC specificity." It does not distinguish between:
- **Positive claims** ("this component exists at line X") — verifiable by reading the specific file
- **Negative claims** ("this function is never called") — requires exhaustive caller search, not file reads

When the BA makes a negative claim in an AC (dead code, unused constant, no callers), a file read is structurally insufficient — it proves only that the file being read is not a call site, not that no call site exists. The BA Decision Matrix does not list "negative assertion in AC" as a condition requiring a verification command before finalization.

The fix is clear: `ba.md` Technical Sanity Check guidance should add: "When an AC asserts *absence* (dead code, unused function, no callers), run the verification command (grep for callers) before writing the AC — do not delegate this to the TL as a verification step."

**Grounding:** Writing AC-4 ("lib/otel/metrics.ts exports no getTelemetryTokenErrorsCounter") after reading metrics.ts and not grepping. The same diagnostic note that I wrote for the TL ("run `grep -rn getTelemetryTokenErrorsCounter` before removing") should have been run by me before I finalized the AC. `evolvability`, `collaboration`

**BA-023-M2 — The BA handoff template has no "Reversal Risk" annotation field; the causal mechanism that worked in CR-023 is informal**

The targeted risk note I added to ba-to-tech-lead.md — "Before removing, run `grep -rn 'getTelemetryTokenErrorsCounter'` across the codebase. If a call site is found, flag it to the BA before proceeding" — was directly responsible for the TL running the audit that caught the AC-4 error (confirmed by TL-023-O1). The note was added because I had an intuition that the function might have callers I hadn't checked. It was not produced by a systematic process.

The BA handoff currently has a "Risk Notes" section for general risks. But there is no distinct "Reversal Risk" or "Pre-check Required" annotation that specifically says: "before implementing AC-X, verify assumption Y — if it fails, stop and contact BA." This is a named pattern that should appear in the handoff template so it is produced systematically when BA makes a claim it has not fully verified, rather than only when BA happens to anticipate the risk.

**Grounding:** Adding the risk note to the handoff without a template prompt to do so — it was an ad hoc decision that happened to be causally critical. If I hadn't added it, the TL would have implemented AC-4 and then the grep would have surfaced either at TL adversarial review or at BA acceptance. `collaboration`, `portability`

---

## Unclear Instructions

**BA-023-U1 — "Deleted contracts" in the graduated verification rule is defined by example, leaving instrumentation removal in ambiguous territory**

The BA acceptance graduation rule states: "Security constraints and deleted contracts (removed testids, removed files, changed APIs): independently re-read the cited file/line to confirm."

The examples given — testids, files, APIs — are clear contract types in the product/test domain. But AC-1 (no span code in proxy route) is a deletion of instrumentation from a route file. It is none of the named examples. I treated it as a "deleted contract" class and independently re-read the file. This was the right call — span removal is structural and I wanted to see all 11 metric wrappers myself — but it required judgment that the policy does not provide.

The TL provided "specific cited TL adversarial evidence" (grep commands + 0 matches) for AC-1 and AC-3. The graduation rule says: "if the handoff includes specific cited TL adversarial evidence... the BA may accept the TL citation in place of an independent re-read." I chose to re-read anyway. Whether this was required or optional is not clear from the rule — the TL provided qualifying evidence, but I had a legitimate reason to re-read (confirming all 11 metric calls). Both paths are defensible. The policy doesn't give a decision rule for this case.

**Grounding:** Deciding whether to independently re-read app/api/otel/trace/route.ts for AC-1/AC-2/AC-3 when the TL had already provided specific grep evidence. The classification of span/instrumentation removal as "deleted contract" vs. "additive change" is not addressable from the rule's current examples. `evolvability`

---

## Responsibility / Scope Concerns

**BA-023-S1 — BA's defined scope ("content intent, audience, learning objectives") does not cover infrastructure-only CRs; the role fills the gap by judgment**

`ba.md` defines BA's primary content ownership as: "For LLM Journey pages, BA owns the content intent (target audience, learning objective, key message hierarchy)." This CR had no educational content, no learner audience, no product behavior change. The BA's role was as a technical auditor conducting an observability gap analysis across 4 API route files.

The BA performed: systematic route-by-route code reading, purpose-driven observability analysis, design principle synthesis ("instrument product operations not infrastructure plumbing"), and measurable AC formulation for code structure. This is clearly within the BA's general authority ("requirement clarification, scope definition, risk identification"). But nothing in ba.md specifically defines the BA's approach for infrastructure-only CRs. The "Product Content Ownership" section applies to pages; there's no analogous section for infrastructure audits.

The gap is low-risk — the BA's general authorities are broad enough to cover infrastructure CRs. But a BA reading their role doc for the first time would find no explicit guidance for "what does a BA do when the CR has no learner audience and no product behavior?" The answer exists in the general authorities but is not stated for this case.

**Grounding:** Starting the technical sanity check by reading 4 API route files and synthesizing an observability design principle — and finding nothing in ba.md that explicitly says this is the expected BA contribution to an infrastructure CR. `evolvability`

---

## Engineering Philosophy Concerns

**BA-023-E1 — The observability design principle authored at BA requirements time has no pathway from CR Business Context to persistent docs (BA-side of TL-023-E1)**

The principle — "a span adds diagnostic value only when it can link to a parent context; infrastructure plumbing with no parent trace context should use metrics+logs, not spans" — was the core intellectual contribution of this CR. I authored it in the Business Context section of CR-023 to justify the proxy span removal. The TL referenced it in the plan. The Backend applied it during implementation.

When CR-023 is archived, this principle lives only in the CR Business Context — a historical artifact that future agents don't browse for design guidance. Neither `architecture.md`, `project-principles.md`, nor `backend.md` contains this principle. The next CR that adds observability to a new infrastructure route will default to the same span-first approach that CR-023 corrected.

From the BA perspective, the mechanism for forwarding a BA-authored design principle from a CR to persistent guidance is undefined. The BA closure checklist asks BA to "review keep-in-mind.md" — but keep-in-mind.md is for temporary warnings, not persistent design principles. There's no checklist item: "if this CR established a design principle applicable to future CRs, propose a doc update to capture it."

**Grounding:** Writing the Business Context rationale for proxy span removal and recognizing I was articulating a portable principle, then finding no BA closure checklist item that would route this principle into architecture.md or project-principles.md. `portability`, `evolvability`

---

## Redundant Workflow Steps

**BA-023-W1 — BA Closure Checklist has no CR-type scoping; infrastructure-only CRs trigger ~40% inapplicable checklist items**

The BA Closure Checklist contains 13 items. For CR-023 (infrastructure-only, no UI, no routes, no API contract changes, no AI output), the following items required explicit "N/A" assessment:
- data-testid contract changes → none
- server error code removals → none
- client-server contract parity → none
- keep-in-mind.md promotion/retirement → the two active entries were not resolved by this CR
- AI disclaimer compliance → not applicable (no AI output surface)

Scanning and dismissing inapplicable items adds ceremony without safety value. The checklist was designed for product-feature CRs with learner-facing changes. An infrastructure CR (observability, config, tooling) produces a structurally different risk surface. A CR-type signal ("infrastructure / product-feature / educational-content") at the top of the closure checklist could gate which items apply, reducing scan time and preventing false-confidence from checking non-applicable boxes.

**Grounding:** Working through the BA Closure Checklist after CR-023 acceptance and spending time on items that were obviously N/A for an infrastructure-only change. `evolvability`

---

## Other Observations

**BA-023-O1 — The "challenge the prompt" tenet produced genuine value but depends on BA domain knowledge, not a structured protocol**

The BA Tenet requires asking "at least one clarifying or challenging question before proceeding." I challenged the user's framing ("traces of traces is not actually a loop — server-side spans go directly to the collector"), which reframed the problem from aesthetic concern to concrete operational gaps. This reframe shaped the CR scope materially: instead of removing the proxy span based on aesthetics, the CR was grounded in a specific rationale (no parent trace context = no diagnostic linking value).

But my ability to challenge the framing correctly depended on having sufficient OTel knowledge to distinguish server-side vs. client-side trace export paths. A BA with less domain knowledge would have accepted the "feels like too much" framing and produced a less grounded CR. The "challenge the prompt" tenet is healthy, but it doesn't tell the BA *what to verify technically* before forming the challenge. The Technical Sanity Check section of ba.md is the right place to name: "when a user describes a technical intuition ('this feels wrong'), run a concrete verification before accepting or challenging the intuition."

**BA-023-O2 — Force-promote candidate: BCK-023-E1 / TL-023-E1 / BA-023-E1 are the same finding from three angles — the observability principle is not documented anywhere**

The observability design principle that was this CR's intellectual core appears independently in findings from all three agents involved in CR-023. BCK-023-E1 identifies it from the implementation side (it will recur without documentation). TL-023-E1 identifies it from the planning side (plan rationale doesn't flow into persistent docs). BA-023-E1 identifies it from the requirements side (BA-authored principle has no pathway to architecture.md). Three agents found the same gap independently. Per the meta-improvement-protocol.md: "Unfixed carry-forward finding: same finding class appears across 3+ consecutive meta analyses → force-promote to High in the next synthesis regardless of re-assessed priority." This finding qualifies for force-promotion in the CR-023 synthesis. The specific fix target is `architecture.md` Architectural Invariants section or a new "Observability Design Principles" subsection.

**BA-023-O3 — BA's pre-requirement analysis investment is invisible to the CR artifact**

This CR involved substantial BA pre-requirement work: reading 4 route files, reading the metrics library, mapping the current observability state per route, and synthesizing a purpose-driven design principle. None of this analysis is captured in the CR artifact beyond its effect on the Business Context section. The CR records what was decided, not the analysis that produced the decision. If a future BA reads CR-023, they see the conclusions but not the route-by-route comparison table or the reasoning that produced the "proxy has no parent context" insight. The investigation report mechanism (INVESTIGATION-XXX.md) exists for this purpose, but the BA Decision Matrix says to skip it when "scope is a straightforward enhancement and root cause is already explicit in user-provided evidence." This CR technically met the skip criteria (no investigation report was created), but the analytical work was non-trivial. A lightweight analysis note inside the CR (or as a referenced appendix) would make the reasoning portable.

---

## Lens Coverage (Mandatory)

- **Portability Boundary**: BA-023-E1 (observability design principle) and BA-023-M2 (reversal risk annotation) are directly portable to any project that uses distributed tracing and requirement handoffs. BA-023-M1 (negative assertion grep requirement) is a general BA practice applicable to any project where BA makes absence claims. BA-023-U1 (deleted contracts definition) is cross-project policy for BA acceptance. BA-023-S1 (infrastructure CR BA scope) is project-class specific but patterns to any project with separate product and infrastructure CRs.

- **Collaboration Throughput**: BA-023-C1 (no BA sign-off protocol for TL-driven descopes) and BA-023-M1 (AC-4 error cascading into TL pre-planning work) both represent serialization costs. The AC-4 error forced TL to do an import audit, present options to the user, record the decision, and document it in three places — all work that would have been unnecessary if BA had run the grep before writing the AC. BA-023-M2 (reversal risk annotation) partially mitigated this by prompting the TL to run the audit, but the mitigation was accidental, not systematic.

- **Evolvability**: BA-023-E1 (principle with no persistence path) is the highest evolvability debt — it compounds with every observability CR. BA-023-W1 (checklist CR-type scoping) is medium evolvability cost — the checklist grows as the project grows, and infrastructure CRs will become more common. BA-023-U1 (deleted contracts classification) creates doc maintenance cost if the product domain grows to include more instrumentation/infrastructure patterns that don't fit the current examples.

---

## Prior Findings: Assessment

- **BCK-023-C1** (structural conflict: "Do NOT modify test files" + DoD pnpm test) → **Validated** — The conflict is correctly identified. From the BA perspective, the BC handoff scope gate is a Tech Lead artifact. BA-authored ACs (including AC-7: "pnpm test passes") create the downstream pressure. If the TL had run the mock cascade check (TL-023-M1) before writing the scope gate, the conflict would not have existed. Root cause is TL pre-delegation, as TL-023-M1 correctly identifies.
- **BCK-023-E1** (no documented observability design principle) → **Extended** — BA-023-E1 provides the BA-layer perspective: the principle was authored at requirements time, not implementation time. The fix must address both the requirements-to-architecture pathway and the plan-to-architecture pathway. Fixing only the plan-side (TL-023-E1) leaves the BA-side gap open.
- **BCK-023-M1** (test mock cascade undocumented) → **Validated** — This is a Backend + TL gap. BA has no direct role in mock infrastructure. No BA finding to add.
- **BCK-023-M2** (safeMetric test-vs-production divergence undocumented) → **Validated** — This is Backend-owned. BA contribution: if the divergence were documented in backend.md, a future BA doing Technical Sanity Check might reference it when writing ACs that involve metric calls.
- **BCK-023-M3** (nvm sourcing incomplete in Runtime Preflight) → **Noted** — User stated this is environmental and low priority. Per TL-023 assessment: valid with caveat. No additional BA finding.
- **BCK-023-R1** (Assumptions section duplicates TL plan) → **Validated** — BA observes the same redundancy from the receiving side: BA handoff also receives duplicate evidence in the tech-lead-to-ba.md that mirrors the plan. Not a high-priority BA concern.
- **BCK-023-S1** (metrics.ts Backend-owned, mocks Testing-owned — structural gap) → **Validated** — The trigger matrix fix (TL-023-S1) is the right resolution. From BA perspective: when BA authors an AC requiring a new metric instrument, BA should note in the handoff whether a test mock cascade is expected.
- **BCK-023-U1** ("Do NOT modify test files" implies no cascade) → **Extended** — BA-023-U1 shows the ambiguity problem extends to acceptance criteria graduation. Both the TL handoff and BA acceptance policy use examples-based definitions where principle-based definitions would be clearer.
- **BCK-023-W1** (Pre-Replacement Check redundant when TL attestation present) → **Partially Refuted** — TL-023-R1 and BCK-023-W1 correctly identify self-attestation as low-value. But BA-023-R1 notes the Pre-Replacement Check retains genuine value at the cross-role boundary (BA replacing ba-to-tech-lead.md, requiring confirmation that prior CR closed by a different agent). Streamlining proposal should preserve cross-role checks and target same-role self-attestation only.
- **TL-023-M1** (pre-delegation mock cascade check missing) → **Validated** — BA-023-M1 is the upstream cause: the TL wouldn't need the mock cascade check if the BA had run the grep before writing the AC. Both fixes are independently valuable.
- **TL-023-M2** (pre-planning stop has no artifact pathway) → **Validated** — The AC-4 descope decision was scattered across plan, tech-lead-to-ba.md, and session memory. BA confirmed this at acceptance: finding TL-023-M2's stop-decision record across 3 artifacts before forming the AC evidence annotation was effortful. A single stop-decision section in the plan would have been easier to reference.
- **TL-023-S1** (Testing Handoff Trigger Matrix missing metric infrastructure row) → **Validated** — BA can add upstream signal: when authoring ACs for new metric instruments, BA should note the mock cascade expectation in the handoff so TL can make the trigger decision at planning, not at verification.
- **TL-023-E1** (TL plan rationale not portable to persistent docs) → **Extended via BA-023-E1** — The principle was authored at BA requirements time, not TL plan time. The fix must address both entry points.
- **TL-023-E2** (adversarial review dimensions regenerated per CR) → **Noted** — BA has no direct role in adversarial review checklists. BA-side complement: BA acceptance graduation criteria have the same problem — the "deleted contracts" example set is not a maintained library of acceptance dimension types.
- **TL-023-O1** (targeted risk note was causally effective) → **Extended via BA-023-M2** — The note worked because BA added it by intuition. Should be formalized as a named annotation type. TL-023-O1 correctly identifies the effect; BA-023-M2 identifies the root mechanism that should make it systematic.
- **TL-023-C1** (no synchronous scope-narrowing decision protocol) → **Validated** — BA-023-C1 is the BA-side of the same gap: no protocol defines whether BA must co-sign an AC descope. Both findings point to the same missing workflow rule.

---

## Top 5 Findings (Ranked)

1. BA-023-M1 | BA writes "dead code" AC without running caller grep — file reads are insufficient for negative assertions; root cause of AC-4 error and TL pre-planning audit cost | `ba.md` / Technical Sanity Check + BA Decision Matrix | `evolvability`, `collaboration`
2. BA-023-E1 | BA-authored observability design principle ("instrument product operations not infrastructure plumbing") has no pathway from CR Business Context to persistent docs; third independent finding of this gap across Backend, TL, and BA | `architecture.md` / Architectural Invariants or new Observability Design Principles section | `portability`, `evolvability`
3. BA-023-C1 | No protocol for BA formal sign-off (or mandatory notification before) when TL descopes a BA-authored AC during pre-planning; BA learned of AC-4 descope at acceptance, not planning | `workflow.md` / BA-Tech Lead Clarification Loop + `ba.md` / Required Outputs | `collaboration`, `evolvability`
4. BA-023-M2 | "Reversal Risk" annotation in BA handoff was causally effective but produced by intuition, not protocol; no named annotation field in the BA handoff template for "verify assumption before implementing AC-X" | `ba-to-tech-lead.md` template / Risk Notes section | `collaboration`, `portability`
5. BA-023-U1 | "Deleted contracts" category in BA graduated verification uses examples (testids, files, APIs) not principles; instrumentation removal lands in ambiguous territory requiring judgment rather than rule-following | `ba.md` / Acceptance Verification + `workflow.md` / Acceptance Phase | `evolvability`

(Max 5. Rank by impact. Phase 2 synthesis reads this section only — not the full file.)
