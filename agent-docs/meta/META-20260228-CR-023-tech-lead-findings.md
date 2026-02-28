# Meta Findings: Tech Lead — CR-023

**Date:** 2026-02-28
**CR Reference:** CR-023 — Purpose-Driven Observability Refinement
**Role:** Tech Lead
**Prior findings reviewed:** `agent-docs/meta/META-20260228-CR-023-backend-findings.md`

---

## Conflicting Instructions

**TL-023-C1 — No defined protocol for synchronous scope-narrowing decisions that originate during TL discovery**

When TL discovery revealed that `getTelemetryTokenErrorsCounter` was an active call site (not dead code as BA stated), the TL faced a genuine branch: initiate a BA Feedback Protocol loop, or present two options directly to the user in the same session. The TL chose in-session user consultation because the decision was contained and low-risk. But no protocol document defines when in-session user consultation is appropriate vs. when a formal BA handoff iteration is required. The two paths exist — BA Feedback Protocol (formal, adds a handoff round-trip) and TL-direct-to-user (informal, no artifact) — but the decision rule between them is not written.

The gap matters because choosing the wrong path has asymmetric costs: unnecessary BA round-trip for a low-risk scope call (serialization waste), or bypassing BA for a decision that should have formal requirement sign-off (authority gap). The TL acted correctly here, but by judgment, not by protocol.

**Grounding:** The moment after running `grep -rn "getTelemetryTokenErrorsCounter"` and finding `lib/otel/token.ts:20`. The decision to present two options to the user rather than halt and route to BA was a judgment call with no protocol backing. `collaboration`, `evolvability`

---

## Redundant Information

**TL-023-R1 — Pre-Replacement Check ceremony is redundant when TL attestation is already present in the outgoing file**

The handoff protocol requires a Pre-Replacement Check before replacing any conversation file. For `tech-lead-to-ba.md`, TL must confirm: plan artifact exists + prior CR closed. Both conditions were trivially satisfied (the TL just created the plan artifact and closed the prior CR). The check documents self-attestation as evidence. The form is structurally correct but adds no independent verification for S-class CRs where the TL performed the work and is the only agent involved.

BCK-023-W1 identified the same pattern for `backend-to-tech-lead.md`. The TL-level instance is the same: the Read is forced by the Write tool constraint (legitimate), but the Pre-Replacement Check section that follows it documents a zero-content attestation. For S-class CRs with a single execution agent, this could be reduced to "TL self-certifies — plan artifact created this session, prior CR confirmed closed [evidence]" as a one-liner rather than a multi-field section.

**Grounding:** Writing the Pre-Replacement Check in `tech-lead-to-ba.md` and recognizing the evidence was identical to what TL had just done. `evolvability`

---

## Missing Information

**TL-023-M1 — TL pre-delegation checklist has no "which test files mock the module being extended?" step**

Before writing the Backend handoff, the TL performed discovery on source files (route files, metrics.ts, token.ts) but did not run `grep -rn "jest.mock('@/lib/otel/metrics'" __tests__/` to find all test files that mock the module Backend would be extending. If TL had run this grep, it would have returned `frontier-base-generate.test.ts` and `adaptation-generate.test.ts` with closed factory mock objects. The TL would have recognized the cascade risk immediately and either (a) included those files in Backend's authorized scope, or (b) added a Testing Agent to the delegation graph.

Instead, the gap surfaced as a blocker during Backend verification, required a scope extension request, and needed user intervention. The cascade was structurally predictable from the TL's position — not from Backend's. Backend had no signal to look for it; TL had full visibility into what Backend was about to add and where.

This is a TL-owned gap. Backend correctly identified BCK-023-C1 as a conflict in the handoff, but the root cause is a missing step in the TL discovery/pre-delegation phase.

**Grounding:** Choosing the pre-delegation checklist items during planning (read route files, read metrics.ts, read token.ts, read test files for modified routes) and NOT including "grep for jest.mock of the module being extended." The omission was not noticed until the Backend blocker report arrived. `collaboration`, `evolvability`

**TL-023-M2 — The pre-planning stop has no defined artifact or documentation pathway**

When TL discovery overturns a BA assumption (AC-4 false-dead-code claim), the stop itself leaves no artifact. The decision was captured inside `CR-023-plan.md` under "Critical Assumptions" and in the plan's rationale text. The `ba-to-tech-lead.md` handoff was not updated (it was kept as-is for BA review). The `tech-lead-to-ba.md` noted AC-4 as DESCOPED. But no artifact records: (a) the false assumption that triggered the stop, (b) the options that were considered, (c) the user decision, (d) the protocol path taken (in-session vs. BA loop).

For a low-risk descope, this is acceptable. For a high-stakes scope narrowing (e.g., discovering that a "dead" function is a critical safety invariant), the informal capture path is inadequate. The protocol should define a stop-artifact (even a single section in the plan) that records the discovery evidence, the options, and the resolution, in a way that is readable to BA at acceptance.

**Grounding:** Writing the plan and realizing that the AC-4 discovery decision was scattered across the plan rationale, the tech-lead-to-ba.md handoff, and session memory — no consolidated stop-decision record exists. `evolvability`, `collaboration`

---

## Unclear Instructions

**TL-023-U1 — The DoD "no test modifications" scope gate is ambiguous about its underlying assumption**

The TL wrote "Do NOT modify: any other test file" in the Backend handoff, intending it as a scope boundary. The underlying assumption was that the existing test mocks would remain valid after Backend's changes. This assumption was false, but nothing in the TL handoff template or tech-lead.md prompts the TL to state the assumption explicitly alongside the constraint.

The constraint reads as a hard prohibition. Its falsifiable assumption reads as invisible. When the assumption fails, Backend faces a trap — the correct reading of an incorrect constraint. BCK-023-U1 identified this from Backend's perspective. From the TL's perspective, the gap is: the TL handoff should articulate the assumption (e.g., "existing mocks cover all metric calls — if a new getter is not mocked and causes test failures, raise a blocker before proceeding"), not just the constraint.

**Grounding:** Re-reading the Backend handoff after receiving the blocker report and seeing that the constraint made no reference to the assumption it was premised on. `collaboration`, `evolvability`

---

## Responsibility / Scope Concerns

**TL-023-S1 — Testing Handoff Trigger Matrix has no row for "Backend CR adds new exported getter to shared metric infrastructure"**

The trigger matrix (if one exists in `workflow.md`) defines when a Testing Agent handoff is required alongside a Backend handoff. CR-023 had no Testing Agent because all test changes were assumed to be within Backend's delegated scope. But metric infrastructure additions have a structural property: the code is Backend-owned; the test mocks that must change are Testing-owned.

A trigger row covering this pattern would look like:
- Condition: Backend CR adds or renames exported functions in `lib/otel/metrics.ts` (or equivalent shared infrastructure module)
- Check: are there Testing-owned test files that mock this module with a closed factory?
- If yes: either expand Backend scope explicitly (naming the test files) or add a Testing Agent handoff

This trigger row doesn't exist. Its absence means every observability CR that adds metric getters will default to the same trap: Backend scope gate prevents test file modification; DoD requires passing tests; conflict surfaces at verification time.

**Grounding:** Designing the delegation graph (single Backend, no Testing) and not having a checklist prompt that would have caught the mock cascade before the handoff was written. `collaboration`, `evolvability`

---

## Engineering Philosophy Concerns

**TL-023-E1 — The observability rationale in the CR plan is a portable design principle that will be lost on archival**

The CR-023 plan and Backend handoff both explain why proxy span removal was correct: "The proxy is a security/control boundary. It has no parent trace context — every span it creates is a disconnected root with no diagnostic linking value. Metrics and logs are sufficient where tracing cannot link." This is a concrete, articulable observability design principle — not CR-specific reasoning.

The principle can be stated generically: **Traces add value when they link. A span with no parent context and no expected children is trace noise — prefer metrics and logs for infrastructure plumbing that does not participate in an end-to-end distributed trace.** This prevents the same class of mistake in any future route without requiring a correction CR.

BCK-023-E1 identified this from Backend's perspective. From the TL's perspective, the additional loss is that the decision rationale that *the TL wrote into the plan* is not connected to any persistent architecture/design doc. TL-authored rationale text in plans is archived with the CR; it does not flow forward into reusable agent guidance.

**Grounding:** Writing the plan rationale section explaining proxy span removal and recognizing it was a principled design argument, then writing no cross-reference to `architecture.md` and having no mechanism to do so as part of the planning workflow. `portability`, `evolvability`

**TL-023-E2 — Adversarial review dimensions are still not portable across CR types (TL-022-03 regression)**

The adversarial review for CR-023 involved CR-specific checks: all 11 metric calls wrapped, no bare calls remaining, timer declared before inner fetch try block, recording position relative to `streamingActive` flag, fallback paths do NOT record latency. These are correct and thorough. They were invented fresh for this CR type (infrastructure refactoring + metric addition).

TL-022-03 identified this as "portable adversarial dimensions" — an observation that adversarial review checklists are regenerated per CR rather than drawn from a maintained library of dimension types. This finding is unaddressed after one synthesis cycle. The adversarial review for CR-023 confirms the pattern continues: TL produces good adversarial dimensions, they live in `tech-lead-to-ba.md`, and the next TL session starts from zero.

**Grounding:** Composing the Adversarial Diff Review section and having to derive the relevant checks from the CR spec rather than from a library of known review dimensions. `portability`, `evolvability`

---

## Redundant Workflow Steps

**TL-023-W1 — Adversarial grep verification during TL review duplicates evidence already in Backend report**

During TL adversarial review, TL ran `grep -n "startActiveSpan\|SpanKind\|SpanStatusCode\|getTracer" app/api/otel/trace/route.ts` to independently verify AC-1 and `grep -n "logger.info" app/api/otel/trace/route.ts` to verify AC-3. The Backend report already contained these grep commands and their results (0 matches). TL ran them again from scratch and got the same results.

The independent re-run has genuine value for high-stakes correctness claims — it prevents a Backend agent from reporting a false-negative grep. But for O(1) deterministic greps (no regex ambiguity, no file-system state), the TL re-run confirms the same source of truth that Backend already consulted. The safety value is real but marginal. If Backend is trusted to run `pnpm build` and `pnpm test` (complex, multi-step processes with real failure modes), the trust model should extend to simple targeted greps that Backend reports verbatim with the exact command.

**Grounding:** Running the two grep verifications, getting 0 matches both times (matching Backend's report), and noting that I had added no information. `evolvability`, `collaboration`

---

## Other Observations

**TL-023-O1 — AC-4 descope discovery confirmed that the "flag risk" note in the BA handoff was effective**

The `ba-to-tech-lead.md` handoff included a targeted risk note under AC-4: "Before removing, run `grep -rn 'getTelemetryTokenErrorsCounter'` across the codebase. If a call site is found, flag it to the BA before proceeding." This note was the direct cause of TL running the audit during discovery. The audit found `lib/otel/token.ts:20`. The escalation pathway worked.

This is a positive signal about the risk-annotation mechanism in BA handoffs: when BA anticipates a reversal risk and names the exact verification step, the TL executes it. The mechanism works. The pattern is worth explicitly naming in the BA handoff template ("Reversal Risk" or "Pre-check Required" annotation) so it appears reliably rather than only when BA happens to anticipate the risk.

**Grounding:** Reading the AC-4 section of `ba-to-tech-lead.md`, seeing the explicit note, running the grep, finding the call site. The note was the only reason the grep ran. `portability`, `evolvability`

**TL-023-O2 — S-class CR single-session model worked without coordinator-role friction (H-01 regression check)**

CR-022 synthesis fix item H-01 identified a Coordinator role gap when multi-agent CRs needed cross-agent tracking. CR-023 was `[S]` (single Backend sub-agent), so the coordinator-role question did not arise. No regression observed; the issue simply wasn't exercised. H-01 remains open and relevant for `[M]` or `[L]` CRs.

**TL-023-O3 — BCK-023-O1 confirms M-01 (targeted linting) is fixed and durable**

Backend confirmed `pnpm lint --file` pattern worked in CR-023 without friction. M-01 from CR-022 synthesis is a confirmed successful fix. No further action needed on this item.

---

## Lens Coverage (Mandatory)

- **Portability Boundary**: TL-023-E1 (observability design principle) and TL-023-E2 (adversarial review dimensions) are cross-project portable and belong in role docs or a reusable guide, not in per-CR artifacts. TL-023-M1 (pre-delegation checklist for mock cascade) is a general technique applicable to any project using module-level jest.mock — belongs in `tech-lead.md` discovery phase guidance as a portable check. TL-023-C1 (synchronous scope-narrowing protocol) is a general coordination pattern; the rule for when in-session user consultation is appropriate should be in `workflow.md` as portable policy.

- **Collaboration Throughput**: TL-023-M1 and TL-023-S1 are the TL-side and workflow-side faces of the same BCK-023-C1 structural conflict. Both serialize CR execution through a scope extension + user override that should have been resolved before delegation. The fix (pre-delegation mock cascade check) eliminates this serialization entirely for the common case. TL-023-C1 (no synchronous stop protocol) also serializes indirectly — without a defined protocol, the TL must pause and wait for user response before deciding which path to take, even for low-risk decisions.

- **Evolvability**: TL-023-E2 (adversarial dimension portability) and TL-023-E1 (observability principle preservation) both represent the same architectural debt pattern: TL-authored reasoning that is correct, context-appropriate, and worth preserving, but has no mechanism to flow into persistent guidance. Every future TL re-derives the same conclusions at CR time. Fixing this would reduce per-CR planning cost for observability CRs and reduce adversarial review cold-start time. TL-023-M2 (stop artifact) is a lower-priority evolvability item — the informal capture is acceptable for most cases, but a defined single-section format would help BA at acceptance.

---

## Prior Findings: Assessment

- **BCK-023-C1** ("Do NOT modify test files" + `pnpm test` = structural conflict) → **Extended** — TL is the root cause, not Backend. The constraint was written by TL without running the mock-cascade check that would have revealed it was false. BCK-023-C1 is correctly categorized as a conflict; TL-023-M1 extends it to establish that the discovery failure originated at the TL pre-delegation phase.
- **BCK-023-E1** (No documented observability design principle) → **Validated** — TL-authored plan rationale for proxy span removal is a concrete portable principle. The finding is correct. TL-023-E1 extends: the loss is TL-side, not just implementation-side — plan rationale has no mechanism to flow forward into persistent docs.
- **BCK-023-S1** (lib/otel/metrics.ts Backend-owned, test mocks Testing-owned — recurring structural gap) → **Validated** — TL-023-S1 extends with the specific trigger-matrix fix that would resolve the structural gap at the planning phase rather than at verification time.
- **BCK-023-M2** (safeMetric test-vs-production divergence undocumented) → **Validated** — The divergence was visible during TL adversarial review (reading test mock implementations). TL had the context to document this during planning and did not. Correct fix target: `backend.md` Observability section + `testing-strategy.md`.
- **BCK-023-M3** (nvm sourcing incomplete in Runtime Preflight) → **Validated with caveat** — User explicitly stated this is an environmental variable and not worth documenting. Low priority; may warrant a note in `tooling-standard.md` if it recurs across sessions.
- **BCK-023-R1** (Assumptions section duplicates TL plan) → **Validated** — TL confirmed: the "Assumptions To Validate" section in the Backend handoff was populated with evidence already in `CR-023-plan.md`. For S-class CRs with pre-confirmed assumptions, this section is ceremony. The question is whether to remove the section or make it conditional on whether assumptions were confirmed pre-delegation.
- **BCK-023-U1** ("Do NOT modify test files" implies no cascade, never stated) → **Extended** — TL-023-U1 frames this as a missing assumption statement in the TL handoff template. The fix is not just wording clarity — the TL should run the cascade check and either confirm "mocks are comprehensive" or name the cascade risk explicitly.
- **BCK-023-W1** (Pre-Replacement Check redundant with TL attestation present) → **Validated** — Same pattern observed at TL level. Both instances point to a conditional streamlining opportunity for S-class CRs.
- **BCK-023-E2** (architecture.md not in Backend required readings) → **Validated** — TL did not include `architecture.md` in Backend's context-loading list. The Telemetry Safety Invariant was referenced in the handoff by name (not by file path). Backend followed the invariant because the handoff told them to, not because they read it. A cross-reference in the handoff is a weaker enforcement path than having `architecture.md` in required readings.
- **BCK-023-O1** (M-01 targeted linting confirmed working) → **Confirmed** — M-01 fix is durable.
- **TL-022-03** (portable adversarial dimensions — prior TL finding) → **Not addressed** — TL-023-E2 confirms the same pattern continues after one synthesis cycle. Force-promote candidate for next synthesis if not addressed.
- **CR-022 H-01** (Coordinator role gap) → **Not exercised** — S-class CR single-agent model. No regression; not applicable.
- **CR-022 M-02** (Negative Space Rule) → **Used but not formalized** — Enforced via handoff DoD specification (grep commands for absence verification). If it's now in a standard doc, good; if not, it's still only in handoff artifacts.

---

## Top 5 Findings (Ranked)

1. TL-023-M1 | TL pre-delegation checklist missing "which test files mock the module being extended?" — TL-discoverable cascade that surfaced as Backend blocker instead | `roles/coordination/tech-lead.md` / discovery phase pre-delegation checklist | `collaboration`, `evolvability`
2. TL-023-S1 | Testing Handoff Trigger Matrix missing row for "Backend adds new exported getter to shared infrastructure module" — root structural gap for recurring mock cascade | `workflow.md` / Testing Handoff Trigger Matrix | `collaboration`, `evolvability`
3. TL-023-E1 | TL plan rationale contains portable observability design principle ("instrument product operations not infrastructure plumbing") with no mechanism to flow into persistent guidance | `agent-docs/development/architecture.md` / Observability | `portability`, `evolvability`
4. TL-023-C1 | No defined protocol for synchronous scope-narrowing decisions during TL discovery — TL must choose between in-session user consultation and formal BA Feedback Protocol by judgment, not by rule | `workflow.md` / Phase transitions; `roles/coordination/tech-lead.md` / discovery phase | `collaboration`, `evolvability`
5. TL-023-E2 | Adversarial review dimensions regenerated from scratch per CR — no maintained library of dimension types; TL-022-03 finding unaddressed after one synthesis cycle | `roles/coordination/tech-lead.md` / adversarial review | `portability`, `evolvability`

(Max 5. Rank by impact. Phase 2 synthesis reads this section only — not the full file.)
