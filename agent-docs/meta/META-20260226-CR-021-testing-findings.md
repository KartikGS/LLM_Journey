# Meta Findings: Testing Agent — CR-021

**Date:** 2026-02-26
**CR Reference:** CR-021 — Frontier and Adaptation Response Streaming: E2E Test Coverage
**Role:** Testing
**Prior findings reviewed:** none (Testing is first in the downstream chain for CR-021)

---

## Conflicting Instructions

**T-C1 — "Retain if adequate" vs. the key concern's intent:**
The Task 1 assessment table in the handoff (`tech-lead-to-testing.md`) wrote: "Extend to `{ timeout: 30000 }` if 15s is **insufficient**; retain if adequate." Simultaneously, the same row labelled the 15s timeout a "**Key concern**" and explained that the button re-enables only after full stream completes — meaning in a live streaming run, 15s could fail.

Two plausible readings:
1. "Insufficient" = the test **fails** (times out) in your E2E run → only then extend.
2. "Insufficient" = 15s does not provide adequate headroom for the **live streaming path** → extend proactively since that path exists even if not exercised today.

I used reading 1 (retained 15s because the test passed). The system-level outcome confirmed reading 2 was the Tech Lead's intent (the timeout was externally updated to 30s). This conflict cost analysis time and produced a suboptimal initial decision.

- **Affected doc:** `tech-lead-to-testing.md` / Task 1 Assessment table + `TEMPLATE-tech-lead-to-testing.md` (no conditional-default distinction in the assessment table format)
- **Lens:** `portability` (timeout ambiguity recurs in any streaming CR), `evolvability` (a clearer table format would prevent the same hesitation)

---

## Redundant Information

**T-R1 — Runtime preflight cross-referenced correctly but in three locations:**
`tooling-standard.md` is the declared canonical source for the runtime preflight procedure. Both `testing.md` and `testing-strategy.md` cross-reference it by name without duplicating content. This is correct behavior. However, the cross-reference in `testing-strategy.md` includes an inline summary sentence ("Run preflight per that section") while `testing.md` includes the full cross-reference sentence with the canonical tag. Minor inconsistency in phrasing that could cause a new agent to question which cross-reference is authoritative. Not a blocking issue.

- **Affected doc:** `testing-strategy.md` / Runtime Preflight section; `testing.md` / Runtime Preflight section
- **Lens:** `evolvability` (low: already correctly cross-referenced; phrasing alignment is polish only)

---

## Missing Information

**T-M1 — API key availability not listed in Known Environmental Caveats:**
The handoff's "Known Environmental Caveats" section mentioned Node.js runtime and pnpm but did not state whether `FRONTIER_API_KEY` / `ADAPTATION_API_KEY` would be present in the test environment. The first signal I received was the server log showing `upstream_auth 401` mid-run. Because both routes hit the fallback path, the live streaming path (the core behavioral change in CR-021) was never exercised. I had to classify this after the fact and flag it as an out-of-scope risk.

This is a systematic gap: every CR that touches provider-backed routes should include API key availability in the environmental caveats, since absence means the live path is silently bypassed.

- **Affected doc:** `agent-docs/conversations/tech-lead-to-testing.md` / Known Environmental Caveats; `agent-docs/conversations/TEMPLATE-tech-lead-to-testing.md` (no "API key availability" field)
- **Lens:** `portability` (cross-project: API key availability is always relevant for provider-backed routes), `collaboration` (prevents false confidence in test coverage when the live path is the key change), `evolvability` (a standard "Live-path availability" field in the handoff template reduces per-CR authoring burden)

**T-M2 — Expected test count delta not provided in handoff:**
`pnpm test` returned 162 passed vs CR-019 baseline of 158. I inferred the +4 delta from git status (modified Backend/Frontend test files), but the handoff gave no indication that parallel agents had added new tests in the same CR. Without this, any delta is unexplained from inside the Testing session — requiring the agent to either ignore it, independently trace it, or flag it unnecessarily. A single line ("Backend and Frontend agents added N unit/component tests in this CR; expect suite count to increase") would eliminate this judgment call entirely.

- **Affected doc:** `agent-docs/conversations/TEMPLATE-tech-lead-to-testing.md` (no "expected test count delta" or "parallel agent test additions" field)
- **Lens:** `portability` (applies to any multi-agent CR where sub-agents add tests in parallel), `collaboration` (parallel test additions are invisible to Testing without explicit note)

---

## Unclear Instructions

**T-U1 — "Adequate" is context-dependent and not grounded by the handoff:**
The word "adequate" in "retain if adequate" has no anchored definition in the handoff or in `testing-strategy.md`. Adequate for what? For the current test environment (fallback-only)? For the live streaming environment (which we cannot test without an API key)? For a CI environment with real API keys?

The assessment table format (in `TEMPLATE-tech-lead-to-testing.md`) uses columns: `Assertion | Concern | Decision needed`. There is no column for "default action" vs "conditional action" or for "environment precondition required to validate this decision." Adding a "Validation Condition" column would make the conditional nature of the decision explicit.

- **Affected doc:** `agent-docs/conversations/TEMPLATE-tech-lead-to-testing.md` / Assessment targets table format
- **Lens:** `portability` (any timeout decision for provider-backed behavior has the same ambiguity), `evolvability` (table format change is low-cost, high-clarity gain)

---

## Responsibility / Scope Concerns

**T-S1 — Testing checklist item "Is the CI pipeline green?" is not observable from this role:**
`testing.md` / Checklist contains: "Is the CI pipeline green?" The Testing Agent executes locally via `pnpm test`, `pnpm lint`, etc. — there is no CI pipeline observable from this session. The item creates false obligation: an agent either ignores it (undocumented skip) or attempts to verify via `gh run view` or similar (out of scope for a sub-agent without explicit delegation). In neither case does the checklist item produce value.

- **Affected doc:** `agent-docs/roles/sub-agents/testing.md` / Checklist
- **Lens:** `portability` (CI observability varies by project), `evolvability` (the item should either reference a specific command or be removed/reworded as "Verification gates pass: pnpm test, lint, tsc, build")

---

## Engineering Philosophy Concerns

**T-E1 — No live-path vs fallback-path coverage concept in testing strategy:**
The testing strategy (`testing-strategy.md` / Provider-Backed E2E Determinism) correctly notes: "Default policy: prefer deterministic local behavior (for example fallback-mode path) unless the CR explicitly requires live-provider verification." This policy is sound for stability, but it creates a blind spot: when a CR's core change **is** the live-path behavior (as in CR-021 where streaming is only exercised on the live path), the E2E suite systematically skips the changed behavior.

There is no mechanism in the testing strategy, handoff template, or DoD checklist to flag "live-path coverage required for this CR" vs "fallback-path coverage sufficient." The distinction is significant: assertions like `frontierOutput.toContainText('$')` pass identically in both paths (the `$` prefix fires when `hasFirstToken = true`, which SSE streaming and the fallback JSON path both set). The E2E suite cannot distinguish whether the new streaming code path was actually exercised.

This is a conscious trade-off (stability over live-path coverage), but it is undocumented as a trade-off.

- **Affected doc:** `agent-docs/testing-strategy.md` / Provider-Backed E2E Determinism section
- **Lens:** `portability` (cross-project: live-path vs fallback-path coverage is a universal concern for provider-backed APIs), `evolvability` (documenting the trade-off prevents the same confusion in future CRs)

---

## Redundant Workflow Steps

**T-W1 — Pre-replacement check is satisfied by reading the artifact being replaced:**
The Pre-Replacement Check for `testing-to-tech-lead.md` requires:
- Evidence 1: prior CR's plan artifact exists.
- Evidence 2: prior CR is closed.

In practice, the tech-lead-to-testing.md handoff already contains the completed Pre-Replacement Check (the Tech Lead fills it in before issuing the handoff). So the Testing Agent satisfies the gate by reading the Tech Lead's own attestation — without independently verifying `project-log.md` or the plan file. The circularity reduces safety value: the gate is satisfied by trusting the very handoff that initiates the replacement, not by independent verification.

Two options: (a) require Testing to independently re-read `project-log.md` and plan file (adds 2 reads, restores independent verification), or (b) acknowledge in the protocol that sub-agents may trust the Tech Lead's attestation in the handoff (cheaper, explicit about the trust model). Currently neither is stated.

- **Affected doc:** `agent-docs/workflow.md` / Conversation File Freshness Rule / Pre-Replacement Check
- **Lens:** `collaboration` (adding 2 independent reads per session is low-cost but multiplies across all sub-agents in every CR), `evolvability` (clarifying the trust model once removes ambiguity permanently)

---

## Other Observations

**T-O1 — Transformer.spec.ts timeout externally changed during session:**
A system reminder noted that `transformer.spec.ts` was modified externally (timeout changed from 15s to 30s) while I was still writing the completion report. This surfaced a process gap: I had made a documented decision (retain 15s, document risk), and that decision was immediately overridden. The handoff instruction ("retain if adequate") and the external change are inconsistent in outcome. This suggests the handoff instruction should have been "extend to 30s unconditionally" given the streaming context, rather than making it empirical-run-dependent when the live path is systematically unavailable.

This is not a protocol violation (the user/Tech Lead can override in-session), but it highlights that the empirical-run decision model doesn't work when the live path is inaccessible. The decision would be better made by the Tech Lead at handoff-writing time, not delegated to the Testing Agent's runtime observation.

- **Affected doc:** `agent-docs/conversations/tech-lead-to-testing.md` / Task 1 Assessment (CR-021 specific); `TEMPLATE-tech-lead-to-testing.md` / Assessment targets format
- **Lens:** `portability`, `evolvability`

---

## Lens Coverage (Mandatory)

- **Portability Boundary:** The most portable findings are T-M1 (API key availability), T-U1 (timeout adequacy anchoring), T-E1 (live-path vs fallback-path coverage concept), and T-W1 (pre-replacement check trust model). All apply across projects with provider-backed APIs and multi-agent workflows. T-S1 (CI pipeline checklist) is similarly portable. Project-specific findings: T-O1 (transformer.spec.ts timeout) is CR-021-scoped.

- **Collaboration Throughput:** T-M2 (test count delta) and T-M1 (API key caveats) are the highest collaboration-friction findings — both result in unexplained observations that Testing must resolve independently during execution, burning context on discovery that the Tech Lead could have stated in two lines. T-W1 (pre-replacement check circularity) introduces 2 extra file reads per session if independently verified; clarifying the trust model removes this.

- **Evolvability:** T-U1 and T-C1 point to the same root: the assessment table format in `TEMPLATE-tech-lead-to-testing.md` lacks a "validation condition" column and a clear conditional-vs-default distinction. A one-time template change would prevent this class of ambiguity in all future CRs. T-E1 requires adding one paragraph to `testing-strategy.md` — low cost, high ongoing clarity value.

---

## Top 5 Findings (Ranked)

1. T-M1 | API key availability missing from handoff env caveats — live streaming path silently bypassed in E2E | `TEMPLATE-tech-lead-to-testing.md` / Known Environmental Caveats | `portability` `collaboration` `evolvability`
2. T-E1 | No live-path vs fallback-path coverage concept — streaming behavior untestable without this distinction | `testing-strategy.md` / Provider-Backed E2E Determinism | `portability` `evolvability`
3. T-C1 | "Insufficient" has two plausible readings — caused suboptimal retain-15s decision overridden externally | `TEMPLATE-tech-lead-to-testing.md` / Assessment targets table | `portability` `evolvability`
4. T-U1 | "Adequate" is not anchored to an environment or path — assessment table needs a Validation Condition column | `TEMPLATE-tech-lead-to-testing.md` / Assessment targets format | `portability` `evolvability`
5. T-M2 | Expected test count delta absent from handoff — parallel agent test additions invisible to Testing | `TEMPLATE-tech-lead-to-testing.md` (no delta/parallel-additions field) | `portability` `collaboration`
