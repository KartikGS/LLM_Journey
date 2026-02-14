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
- Run critical E2E tests: `pnpm playwright test --grep @critical`
- Run smoke E2E tests: `pnpm playwright test --grep @smoke`

### Command Sequencing Rule (Pipeline Verification)
For final CR verification evidence, run quality gates in sequence, not in parallel:
1. `pnpm test`
2. `pnpm lint`
3. `pnpm exec tsc --noEmit`
4. `pnpm build`

Reason: some projects include generated `.next/types` entries in `tsconfig` and concurrent `tsc` + `build` execution can produce false negatives from transient type-generation state.

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

E2E tests that assert on observability signals (e.g., intercepting `/app/api/otel/trace`) should be:
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
