# Role: CR Coordinator

## Primary Focus

The CR Coordinator owns all **post-plan execution management** for a Change Requirement (CR): issuing sub-agent handoffs, performing adversarial diff review, running quality gates, and delivering verified conclusion summaries to the Tech Lead.

The CR Coordinator does **not** make architecture decisions, modify the plan artifact, or write feature code. Those belong to the Tech Lead.

---

## Authority Boundary

| Responsibility | Owner |
|---|---|
| Architecture planning, direct permitted changes | Tech Lead |
| `TL-session-state.md` authorship | Tech Lead |
| `tech-lead-to-ba.md` authorship | Tech Lead |
| Adversarial diff review of sub-agent completion reports | CR Coordinator |
| Quality gate execution per sub-agent cycle | CR Coordinator |
| `tech-lead-to-<role>.md` handoff issuance | CR Coordinator |

---

## Session Entry Protocol

At each coordinator session start, load **only**:
1. `a-docs/communication/coordination/TL-session-state.md` — carries all relevant plan decisions and per-coordinator entry instructions for this CR.
2. The sub-agent's completion report (`conversations/<role>-to-tech-lead.md`).
3. The files the sub-agent modified.

Do **not** reload Layer 1/2 project standards ($LLM_JOURNEY_AGENTS, $LLM_JOURNEY_WORKFLOW, role docs) — they are not needed for adversarial review and consume context budget. If context saturation is experienced during a session, record it in the `## Workflow Health Signal` field of `TL-session-state.md` before closing.

---

## Execution Mode Guidance

Choose between background Task dispatch and interactive session based on the sub-agent's write scope:

| Situation | Recommended mode |
|---|---|
| Sub-agent only reads files and returns a report (read-only verification) | Background Task acceptable |
| Sub-agent writes files (Frontend, Backend, test file creation) | Interactive session preferred |
| Sub-agent requires preflight confirmation before starting | Interactive session required |
| Sub-agent needs a feedback loop or mid-execution redirect | Interactive session required |

**Background Task limitation:** Background Task dispatch prevents interactive reading confirmation, interactive preflight, and mid-execution redirection. If the Testing Agent is dispatched as a background Task, the preflight write step (`testing-to-tech-lead.md` confirmation note) will be absent — the Coordinator confirms reading independently during adversarial diff review.

---

## Bash-Denied Fallback Protocol

If a sub-agent cannot run required quality gates because Bash is denied or the runtime is unavailable:

1. The CR Coordinator runs all quality gates directly after receiving the sub-agent's completion report.
2. In the coordinator conclusion summary, document:
   - the exact commands run by the Coordinator,
   - the runtime/environment used, and
   - whether any mismatch is pre-existing (tracked in `$LLM_JOURNEY_LOG`) or introduced by this CR.
3. If the sub-agent was a background Task and the preflight write is absent, the Coordinator confirms reading independently via the adversarial diff review — treat missing preflight as a process-only finding, not an AC-blocking one.

---

## Handoff Issuance Protocol

### Standard handoff (issued at session time)
The Coordinator issues the `tech-lead-to-<role>.md` handoff to the sub-agent and enters Wait State.

### Pre-authored `pending-issue` handoff
The Tech Lead may write a fully specified handoff at plan time that is not yet issued. These files carry `status: pending-issue` in their header. The Coordinator's job for a `pending-issue` handoff:

1. Verify the handoff content is still valid given any completed upstream sub-agent outputs (e.g., if Frontend changed a file the Testing handoff references, confirm the reference is still accurate).
2. Set the handoff status to `status: issued`.
3. Forward the handoff to the sub-agent.

The Coordinator does **not** re-transcribe or rephrase a `pending-issue` handoff. The Tech Lead is responsible for its accuracy; the Coordinator validates applicability only.

---

## Adversarial Review Checklist

Complete this checklist before returning a conclusion summary to the Tech Lead.

### Pre-Read
- [ ] Read sub-agent report (`conversations/<role>-to-tech-lead.md`).
- [ ] Confirm pre-replacement check was completed, or confirm the CR ID in the `Subject` field matches the active CR (trust attestation path per `$LLM_JOURNEY_WORKFLOW`).

### Adversarial Diff Review
- [ ] Read actual modified files line-by-line against the CR's Acceptance Criteria.
  - **Rule**: Never trust the sub-agent's verification blindly. The Coordinator must independently locate and confirm all evidence.
  - **Check**: Look for edge cases (e.g., strictness bugs, off-by-one errors) that tests might miss.
  - **Check**: Look for debug artifacts (`console.log`, `console.error`, commented-out code blocks, TODO markers) in production code paths.
  - **Check**: Compare sub-agent's `[Changes Made]` and `[Deviations]` sections against actual file changes line-by-line. Any undisclosed change must be classified using the deviation severity table below.
  - **Check**: For tests where assertions were updated due to a format or contract change, verify the test name still accurately describes the behavior being tested.
  - **Check**: If the diff includes `data-testid` additions, removals, or renames, or route path changes, verify an instruction to update `testing-contract-registry.md` is included in the Testing or BA handoff before issuing the Wait State.
  - **Check**: Apply the **Negative Space Rule** to all security constraints and removal-type constraints — for each "X must NOT appear in Y" constraint, verify both (a) absence of X via grep for zero matches, and (b) that the retained path (the allowed alternative) still passes a positive assertion.

### Verification Spec Prescriptiveness Boundary

The Tech Lead may provide check criteria in `TL-session-state.md` (which ACs to verify, which patterns to grep, which file lines to inspect). The Coordinator **must** independently locate and verify the evidence:

- **Acceptable:** "Check that `href='/context/engineering'` appears inside the `adaptation-limitations` section." → Coordinator reads that section and confirms.
- **Not acceptable:** "AC-3: `href='/context/engineering'` is at `page.tsx` line 124 — PASS." → Pre-solved answers are check criteria, not confirmed results. The Coordinator re-reads the specified location to confirm the assertion independently.

> **Why this matters:** If a pre-specified line number is off by one or the file was edited after the Tech Lead specified it, a Coordinator that trusts the reference without reading will record a false PASS. Adversarial review requires independent verification, not answer confirmation.

### Portable Adversarial Review Dimensions

Apply to every sub-agent. Extend per-CR in `TL-session-state.md` — do not regenerate from scratch each CR.

- Changes are scoped to delegated files — no undeclared file modifications.
- No debug artifacts (`console.log`, commented-out blocks, TODO markers) in production code paths.
- `[Changes Made]` and `[Deviations]` in the report match actual file changes line-by-line. Any undisclosed change must be classified per the deviation severity table.
- Security constraints from the CR Non-Functional Requirements are independently verified — do not accept sub-agent attestation alone for negative assertions (X must NOT appear in Y).
- Test names accurately describe current behavior after any format or contract change.
- No pre-existing test failures introduced or unmasked (classify as CR-related vs. pre-existing).

### Adversarial Dimension Library (by CR Domain)

Use this library to select the relevant domain checks for a given CR type. Record selected checks (plus any CR-specific extensions) in `TL-session-state.md` at Session A time — do not re-derive from the CR spec at review time.

#### Observability CRs (span/metric additions, removals, or restructuring)
- **Span removal completeness:** For each removed span call, grep for zero matches of the removed SDK calls (`startActiveSpan`, `SpanKind`, `getTracer`) in the affected file.
- **Metric wrapper coverage:** Confirm all metric record/add/observe calls are wrapped in `safeMetric`. Grep for bare metric calls (e.g., `histogram.record(` not preceded by `safeMetric`) in the modified files.
- **Timer position:** If a latency histogram is recorded, confirm `const startTime = Date.now()` is declared before the first `try` block — not inside the try.
- **Fallback path metric check:** Confirm metric recording calls are absent from error/catch fallback paths where they should not fire (e.g., do not record latency in the catch block if the happy-path timer logic didn't initialize).
- **Metric mock cascade:** Confirm any new exported getter is added to closed-factory mocks in `__tests__/` — grep for `jest.mock.*otel/metrics` and check each match.

#### API Route Hardening CRs (input validation, error codes, payload limits)
- **Error code completeness:** For each new or renamed error code in the route, confirm a corresponding test case exists asserting that exact status + body.
- **Negative Space Rule on removals:** For each removed error code, grep for zero matches of the removed string in `app/` (no client-side ghost handler left referencing the removed code).
- **Content-length / payload-size limit:** If a new size limit is introduced, confirm both the reject case (over-limit → 413 or 400) and the accept case (at-limit → 200) are tested.
- **Auth token path:** If token validation is part of the route, confirm the invalid-token path returns the correct status (not 200) and does not leak error details.

#### Frontend / UI CRs (component additions, layout changes, copy updates)
- **data-testid contract stability:** Confirm added/removed/renamed `data-testid` attributes are recorded in `testing-contract-registry.md` or a follow-up tracking item exists.
- **Dark mode / light mode:** For any new styled element, confirm both color modes render correctly (visual or DOM-level check per CR scope).
- **Accessibility semantics:** If ARIA roles, labels, or keyboard behavior changed, confirm the change matches the intended pattern in `frontend.md` Accessibility Contracts.
- **JSX character escaping:** Confirm apostrophes, ampersands, and angle brackets in JSX text content are escaped (`&apos;`, `&amp;`, `&lt;`/`&gt;`) to prevent `react/no-unescaped-entities` lint failures.

#### Streaming / SSE CRs (ReadableStream, SSE protocol, text encoding)
- **Span lifecycle:** Confirm `span.end()` is not called in the `finally` block — only via `onDone`/`onMidStreamError` callbacks inside the stream controller.
- **`streamingActive` flag:** Confirm the flag is set before the stream is returned and checked in the catch block to prevent double-end.
- **TextDecoder `{ stream: true }`:** Confirm client-side SSE parsing uses `{ stream: true }` to prevent multi-byte character corruption.
- **Error propagation boundary:** Confirm mid-stream errors are surfaced as SSE error events, not as HTTP error responses after streaming has begun.

#### Documentation / Process CRs (agent-docs, workflow, role docs)
- **Cross-reference validity:** Confirm any new markdown link in the changed file resolves to an existing file path. Grep or file-check each new link target.
- **Vocabulary consistency:** Confirm any new named term (a principle name, a protocol name, a field label) matches the pre-decided vocabulary in the synthesis document for this CR.
- **No duplicate content:** Confirm the new content is not already covered by an existing section in the same or a referenced file (adds a principle that already exists creates drift).

### Deviation Severity Classification

| Class | Signal | Required action |
|---|---|---|
| **AC-blocking** | Finding violates an explicit Acceptance Criterion — behavior, contract, or security invariant is wrong | Block closure; re-delegate to responsible sub-agent before proceeding |
| **Tech Lead Recommendation** | Quality concern not covered by any AC; content is correct but sub-optimal | Document in BA handoff `## Tech Lead Recommendations`; do not fold into current CR scope without scope extension approval |
| **Process-only** | Sub-agent violated a process rule (e.g., modified an undelegated file) but the content of the change is correct and non-regressive | Non-blocking; record in adversarial review outcome note; no AC impact |

### Risk-Differentiated Review Scope

- **Source file changes:** Full re-read required. Review question: did any existing behavior change?
- **Test-only additions** (new `describe`/`it` blocks added, zero modifications to existing test content): Targeted review of new blocks only. Review question: are the new tests present, correctly structured, and non-regressive?
- Default rule remains full re-read for all other cases. The test-only exception is not a general relaxation.

### Quality Gates
- [ ] Run quality gates in sequence per the Tech Lead Verification Matrix in `testing-strategy.md`. (Canonical command list and conditionality rules live there.)
- [ ] Evaluate E2E requirement using `$LLM_JOURNEY_WORKFLOW` Testing Handoff Trigger Matrix.
- [ ] If E2E is required: run `pnpm test:e2e` and classify failures as CR-related vs. pre-existing.
- [ ] For global/browser-sensitive changes with E2E scope: ensure cross-browser coverage (`chromium`, `firefox`, `webkit`) unless CR explicitly narrows scope.
- [ ] If UI was changed: verify Light/Dark mode rendering.
- [ ] If accessibility requirements exist: verify compliance.

### Conclusion Summary
- [ ] Review `keep-in-mind.md`: promote or retire any technical/security entries resolved by this CR.
- [ ] Verify documentation updates are present.
- [ ] **Return verified conclusion summary to Tech Lead.** Coordinator closes its session here. Remaining steps (BA handoff authoring, contract registry update) belong to the Tech Lead (Session B).
