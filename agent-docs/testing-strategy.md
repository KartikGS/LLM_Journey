# Testing Strategy

This document describes the testing philosophy, structure, and guarantees for this project.

The goal of the test suite is **system stability and correctness**, not model quality or performance benchmarking.

---

## 1. Testing Philosophy

This project follows a layered testing approach:

- **Unit tests** validate isolated logic and pure functions
- **Integration tests** validate interaction between subsystems
- **E2E tests** validate user-critical flows using Playwright

The test suite prioritizes:
- Correct rendering and responses
- Stability of critical paths
- Resilience to observability and infrastructure failures

---

## 2. Test Strategy Overview

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

---

## 3. Tooling

This project uses:

- **Jest** — test runner and mocking
- **React Testing Library** — UI and interaction testing
- **Playwright** — End-to-end browser testing

Configuration lives in:
- `jest.config.ts`

### Running Tests
- Run all tests: `pnpm test`
- Watch mode: `pnpm test:watch`
- Run all E2E tests: `pnpm test:e2e`
- Run critical E2E tests: `pnpm playwright test --grep @critical`
- Run smoke E2E tests: `pnpm playwright test --grep @smoke`

---

## 4. E2E Refinement & Artifacts

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
1. **Rare**: Only implemented for high-value integration boundaries.
2. **Robust**: Resilience to minor telemetry delays is required (e.g., using `waitForRequest`).
3. **Isolated**: These tests are reserved for validating that the system-under-test correctly emits telemetry during core loops.

---

## 5. Test Organization

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

## 5. Mocking & Boundary Philosophy

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

## 6. Coverage Guarantees (Integration Invariants)

Integration tests enforce the following system-level guarantees:

### Observability Safety
- Failures in metrics, tracing, or logging **must not break user-facing functionality**
- Example: the `telemetry-token` API returns `200` even if metric recording throws

### LLM Orchestration
- Tokenization, inference loop, sampling, and telemetry are validated together
- Numerical correctness and model quality are intentionally out of scope

### Behavior-First Validation
- Tests assert observable behavior (responses, UI state, side effects)
- Internal method calls are not asserted unless crossing a subsystem boundary

---

## 7. Key Coverage Areas

- **API Routes**: `__tests__/api`  
  Example: telemetry-token route integration tests

- **LLM Orchestration**: `__tests__/lib/llm`  
  Verifies interaction between the ONNX runtime, tokenizer, sampling logic, and OpenTelemetry

- **UI Components**: `__tests__/components`  
  Verifies interaction between UI state, user input, and LLM client services

---

## 8. Integration Tests: OpenTelemetry Proxy

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

## 9. Non-goals

The following are intentionally out of scope:

- Numerical correctness of LLM outputs
- LLM performance benchmarking
- OpenTelemetry SDK internals

---

## 10. Future Plans

- LLM evaluations and quality metrics
- Visual regression testing
