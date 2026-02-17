# Testing Strategy

This document describes the testing philosophy, structure, and guarantees for this project.

The goal of the test suite is **system stability and correctness**, not model quality or performance benchmarking.

---

## Testing Philosophy

This project follows a layered testing approach. **Critically, tests are not just written to be passed; they are tools for identifying flaws in the system, validating architectural assumptions, and highlighting documentation gaps.** 

- **Truth over Conformity**: If a test fails because of a false premise in the requirements or a missing dependency in another component, the testing agent MUST report the discrepancy rather than "forcing" the test to pass.
- **Reporting > Completion**: Identifying a flaw in the system or a false environmental assumption is a more valuable outcome than a passing test. If a discrepancy is found, **STOP implementation** and report it. Clearing the blocker is the primary task.
- **Unit tests** validate isolated logic and pure functions.
- **Integration tests** validate interaction between subsystems.
- **E2E tests** validate user-critical flows using Playwright.

### Testability as a Requirement
A feature is not "Done" unless it is testable. If a component lacks unique selectors (`data-testid`, `id`) or accessibility attributes required for robust testing, it is considered a **bug** in the implementation, not a missing feature in the test suite.

The test suite prioritizes:
- Correct rendering and responses
- Stability of critical paths
- Resilience to observability and infrastructure failures

### Hydration & Lifecycle Awareness
In React/Next.js environments, a test failing to find a selector may be a symptom of **hydration failure** rather than a missing element. 
- If a component appears "empty" or stuck in a loading state in specific browsers (like WebKit), check the browser console for TLS errors, CSP violations, or HSTS redirects.
- If the environment forces HTTPS while the dev server is HTTP, hydration will fail as JS chunks are blocked. This must be reported as an environmental blocker.

---

## Test Strategy Overview

### Unit Tests
- Focus on deterministic, isolated logic
- Fast to run, minimal mocking
- Failures should clearly identify the faulty unit

### Integration Tests
- Validate orchestration across multiple components
- Assert **behavioral outcomes**, not implementation details
- Enforce system-level guarantees (auth, observability, error handling)

### E2E Tests
- Validate real user flows in a browser environment
- Implemented using Playwright
- Focus on critical paths: landing page, transformer interaction, and navigation
- **Production Readiness Requirement**: 
    - [ ] Configurable URLs via environment variables.
    - [ ] Artifact retention (screenshots/videos) for debugging.
    - [ ] Tagging for smoke and critical regression runs.

---

## Tooling

This project uses:

- **Jest** — test runner and mocking
- **React Testing Library** — UI and interaction testing
- **Playwright** — End-to-end browser testing

Configuration lives in:
- `/jest.config.ts`

### Running Tests
- Run all tests: `pnpm test`
- Watch mode: `pnpm test:watch`
- Run all E2E tests: `pnpm test:e2e`
- Run a single E2E spec: `pnpm test:e2e -- __tests__/e2e/<spec>.spec.ts`
- Run focused E2E by grep: `pnpm test:e2e -- --grep "<pattern|@tag>"`
- Run critical E2E tests: `pnpm playwright test --grep @critical`
- Run smoke E2E tests: `pnpm playwright test --grep @smoke`

Note: `agent-docs/tooling-standard.md` includes a quick command canon, but this file is canonical for E2E triage/classification policy.

### Runtime Preflight
Before verification commands, run `node -v` once per session and classify any version mismatch against `/agent-docs/tooling-standard.md` as `environmental`.

### E2E Reproducibility Rule
When reporting E2E outcomes for handoff evidence, always include:
- exact command string used,
- target scope (spec path or grep expression),
- execution mode (sandboxed vs local-equivalent/unsandboxed),
- browser matrix covered (chromium/firefox/webkit),
- pass/fail summary by browser.

### E2E Triage Ladder (Before Declaring Blocked)
If E2E fails, classify using this sequence:
1. Re-run with the exact handoff command (no substitutions).
2. Re-run with explicit spec targeting (`pnpm test:e2e -- __tests__/e2e/<spec>.spec.ts`).
3. Confirm there is no stale server/process conflict on port `3001`.
4. If startup/runtime differs in constrained execution, run a local-equivalent/unsandboxed verification.
5. Inspect Playwright artifacts (`error-context.md`, screenshots, video) before classifying root cause.
6. Declare `blocked` only after at least two reproducible runs in different execution contexts or after deterministic proof of missing contract.

### E2E Failure Classification Heuristics
- `Process from config.webServer exited early`: environment/process startup class until reproduced in local-equivalent run.
- Selector missing while app is clearly rendered: likely contract or test regression.
- Selector missing while app is stuck on compatibility/guard screen: environment/runtime gate until proven persistent across contexts.
- Browser-specific only failures: classify by browser scope and do not generalize to full E2E failure.

### Provider-Backed E2E Determinism
For E2E flows that can hit external model providers:
- Default policy: prefer deterministic local behavior (for example fallback-mode path) unless the CR explicitly requires live-provider verification.
- If live-provider behavior is required by CR:
  - document environment prerequisites in handoff/report, and
  - classify provider/network flakiness separately from UI contract regressions.

### E2E Selector Reliability Ladder (Mandatory)
Use the highest reliable contract available for assertions:
1. `data-testid` or explicit test contract IDs for structural page landmarks.
2. Role + accessible name (`getByRole`) for interactive user controls.
3. Stable URL/href/state contracts for navigation and lifecycle checks.
4. Raw structural CSS selectors only when no explicit contract exists.

If level 4 is used, report why levels 1-3 were unavailable in the testing handoff report.

### Contract Registry
- Prefer documenting durable route/selector/semantic contracts in `agent-docs/testing-contract-registry.md` so CR handoffs can reference a stable baseline.

### Prohibited Brittle Assertions (Default)
- Hard dependency on transient loading copy (for example exact `"Generating..."` visibility windows) unless the CR explicitly defines that copy as product contract.
- Strict DOM shape selectors tied to layout internals (for example `div.grid > a`) when semantic/test-id contracts exist.
- Timing-only waits without behavior/state confirmation.

### Command Sequencing Rule (Pipeline Verification)
For final CR verification evidence, run quality gates in sequence, not in parallel:
1. `pnpm test`
2. `pnpm lint`
3. `pnpm exec tsc --noEmit`
4. `pnpm build`

Reason: some projects include generated `.next/types` entries in `tsconfig` and concurrent `tsc` + `build` execution can produce false negatives from transient type-generation state.

### Tech Lead Verification Matrix (Canonical)
- `Always required`:
  - `pnpm test`
  - `pnpm lint`
  - `pnpm exec tsc --noEmit`
  - `pnpm build`
- `Conditionally required`:
  - `pnpm test:e2e` only when CR scope changes route/selector/semantic contracts, changes browser-sensitive behavior, or explicitly requests E2E evidence.
- Source of truth for trigger decision:
  - `agent-docs/workflow.md` -> `Testing Handoff Trigger Matrix (Mandatory)`.

### Command Evidence Standard (for handoff reports)
When citing verification evidence, use this normalized format:
- Command: `[exact command]`
- Scope: `[full suite | specific spec/grep | impacted routes/components]`
- Execution Mode: `[sandboxed | local-equivalent/unsandboxed]`
- Browser Scope (if E2E): `[chromium/firefox/webkit or narrowed scope]`
- Result: `[PASS/FAIL + key counts or failure summary]`

---

## Abuse-Protection Coverage Checklist

When testing middleware/API abuse protection (rate limiting, throttling, quotas), include this checklist unless the Tech Lead explicitly narrows scope:

- **Threshold edge**: verify allow-path up to limit `N` and block-path at `N+1`.
- **Window reset/expiry**: verify requests are re-allowed after the configured window elapses.
- **State isolation**: prevent module-level state leakage between tests (for example, reset module registry + re-import, or approved explicit reset hook).
- **Bypass and exemptions**: verify expected bypasses (for example localhost/E2E) remain intact.
- **Contract headers**: assert response header contracts only when explicitly in scope (for example `Retry-After`, CSP/HSTS). Do not assert headers that are not implemented.

If any checklist item is out of scope, report it as an explicit risk in `testing-to-tech-lead.md`.

---

## Pipeline Stabilization Playbook (Regression Repair CRs)

Use this order when a CR objective is to restore a broken pipeline:
1. Fix test-path/module-resolution regressions first (fast signal restoration).
2. Fix feature/type regressions next (strict compile/build blockers).
3. Run full quality gates once at the end for closure evidence.

### Ownership Guidance
- Testing Agent: test-path fixes and full gate execution/reporting.
- Frontend/Backend Agent: feature/type fixes in owned code.
- Tech Lead: sequencing decision, integration review, and final BA handoff classification.

---

## E2E Refinement & Artifacts

To support CI/CD and debugging, the E2E suite follows these policies:

### Artifact Retention
- **Screenshots**: Captured on failure (`only-on-failure`).
- **Videos**: Retained on failure (`retain-on-failure`).
- **Traces**: Collected on the first retry of a failed test (`on-first-retry`).

### Tagging System
- `@critical`: Tests that must pass for any deployment (e.g., model generation).
- `@smoke`: Quick navigation and rendering tests.

### Observability Testing Policy

E2E tests that assert on observability signals (e.g., intercepting `/api/otel/trace`) should be:
- **Rare**: Only implemented for high-value integration boundaries.
- **Robust**: Resilience to minor telemetry delays is required (e.g., using `waitForRequest`).
- **Isolated**: These tests are reserved for validating that the system-under-test correctly emits telemetry during core loops.

---

## Test Organization

Tests live in the `__tests__` directory and mirror the source structure where possible.

```
__tests__/
├── api/ # API route integration tests
├── integration/ # Cross-system integration tests
├── lib/ # Unit + integration tests for libraries
├── components/ # UI component tests
└── e2e/ # Playwright E2E tests
```

---

## Ephemeral Debugging Tools

To avoid polluting the permanent test suite and codebase:

- **Naming Convention**: Temporary tests created for environmental debugging MUST use the `.debug.spec.ts` or `.debug.ts` suffix.
- **Cleanup Requirement**: All `.debug.*` files MUST be deleted before the task is marked as "Done". 
- **Log Management**: Use temporary `console.log` statements in debug tests only; do not merge them into permanent spec files.

---

## Environmental Escalation Protocol

If the test environment (network, ports, global headers, browser quirks) prevents execution:

- **Document the Evidence**: Capture logs, screenshots, or minimal reproduction cases.
- **Consult Tooling Standard**: Check if the issue violates a fixed constraint (e.g., standard Port 3001).
- **Escalate, Don't Fix**: The Testing Agent is NOT authorized to modify `/next.config.ts`, `/package.json`, or server-side infrastructure.
- **Report**: Use `/agent-docs/conversations/testing-to-tech-lead.md` to request environment level changes.

---

## Mocking & Boundary Philosophy

Mocks are applied **only at external or non-deterministic boundaries**.

### Real implementations are preferred for:
- Business logic
- Orchestration flow
- State transitions

### Mocks are used for:
- ONNX runtime (browser/WASM dependency)
- External APIs or services beyond local control
- Observability exporters (metrics, tracing backends)

### Infrastructure Helpers

Helpers such as `safeMetric` are mocked to preserve **semantic behavior**:

- The wrapped function executes
- Errors are swallowed
- Tests validate system resilience, not helper internals

---

## Coverage Guarantees (Integration Invariants)

Integration tests enforce the following system-level guarantees:

### Observability Safety
- Failures in metrics, tracing, or logging **must not break user-facing functionality**
- Example: the `telemetry-token` API returns `200` even if metric recording throws

### LLM Orchestration
- Tokenization, inference loop, sampling, and telemetry are validated together
- Numerical correctness and model quality are intentionally out of scope

### Resilience & Edge Cases
- Failures in non-critical paths (e.g., metrics, tracing, fallback UI) must be handled gracefully.
- Tests should verify that the system fails safely and provides informative feedback (like the `BrowserGuard`).
- **Policy**: If an edge case is identified but not yet implemented (e.g., "What if WASM fails mid-session?"), the Testing Agent should document it as a potential risk in the `testing-to-tech-lead.md` report.

---

## Key Coverage Areas

- **API Routes**: `__tests__/api`  
  Example: telemetry-token route integration tests

- **LLM Orchestration**: `__tests__/lib/llm`  
  Verifies interaction between the ONNX runtime, tokenizer, sampling logic, and OpenTelemetry

- **UI Components**: `__tests__/components`  
  Verifies interaction between UI state, user input, and LLM client services

---

## Integration Tests: OpenTelemetry Proxy

The OpenTelemetry trace proxy (`app/api/otel/trace/route.ts`) is treated as a **network and security boundary**.

Integration tests live at:

`__tests__/integration/otel-proxy.test.ts`

### Guarantees
- Valid trace payloads are accepted and forwarded
- Invalid requests (auth, payload size, content-type) are rejected correctly
- Upstream failures are handled gracefully (no crashes)
- No observational fan-out (1 request → 1 proxy span)

### Mocked Boundaries
- Upstream collector (`global.fetch`)
- Observability exporters (metrics and tracing backends)

### Limitations
- Does NOT validate OTLP schema correctness
- Does NOT test OpenTelemetry SDK internals
- Does NOT guarantee upstream collector processing

---

## Non-goals

The following are intentionally out of scope:

- Numerical correctness of LLM outputs
- LLM performance benchmarking
- OpenTelemetry SDK internals

---

## Future Plans

- LLM evaluations and quality metrics
- Visual regression testing
