## Testing Philosophy

- Unit tests validate isolated logic and components
- Integration tests validate component interaction
- E2E tests validate user-critical flows

The project currently prioritizes:
- Correct rendering
- Basic user interaction
- Stability of critical paths

# Testing

This project uses **Jest** and **React Testing Library** for unit and integration testing.

## Unit Tests

We use Jest for unit testing. The configuration is located in `jest.config.ts`.

### Running Tests

- Run all tests: `pnpm test`
- Run tests in watch mode: `pnpm test:watch`

### Test Structure

Tests are organized in the `__tests__` directory, mirroring the source structure where possible.

#### Coverage Areas

We currently have test coverage for:

- **Middleware**: Verification of middleware logic (`middleware.test.ts`).
- **Library Modules** (`__tests__/lib`):
  - **LLM**: Utilities for language model interaction.
  - **OpenTelemetry (otel)**: Instrumentation and telemetry helpers.
  - **Security**: Security-critical functions (e.g., redaction, validation).
  - **Utils**: General helper functions.

## Integration Tests

For integration testing, we use Jest and React Testing Library. These tests harness multiple subsystems to verify interaction.

### Integration Test Invariants

Integration tests in this project enforce the following system guarantees:

- **Observability must never break user-facing functionality**
  - Failures in metrics, tracing, or logging must not cause API routes or UI flows to fail.
  - Example: the `telemetry-token` API continues to return `200` even if metric recording throws.

- **LLM orchestration is validated as a pipeline**
  - Tokenization, inference loop, sampling, and telemetry are tested together.
  - Numerical correctness or model quality is out of scope.

- **User-facing flows are validated via behavior, not implementation**
  - Tests assert observable outcomes (responses, UI state, side effects).
  - Internal method calls are not tested unless they cross a subsystem boundary.

### Mocking Philosophy

Mocks are applied only at **external or non-deterministic boundaries**.

- **Real implementations are preferred** for:
  - Business logic
  - Orchestration flow
  - State transitions

- **Mocks are used for**:
  - ONNX runtime (browser/WASM dependency)
  - External APIs or services beyond local control
  - Observability backends (metrics, tracing exporters)

#### Infrastructure Helpers

Infrastructure helpers (for example, `safeMetric`) are mocked to preserve their
**semantic behavior**, not just their call signature.

- The wrapped function is executed
- Errors thrown inside the helper are swallowed
- Tests validate system resilience rather than helper internals

### Key Coverage Areas

- **API Routes**: `__tests__/api` (e.g., `telemetry-token`)
- **LLM Orchestration**: `__tests__/lib/llm` verifies interaction between the ONNX runtime, tokenizer, sampling logic, and OpenTelemetry
- **UI Components**: `__tests__/components` verifies interaction between UI state, user input, and LLM client services

### Non-goals

The following are intentionally out of scope for this test suite:

- Verifying numerical correctness of model outputs
- Benchmarking LLM performance
- End-to-end browser automation (planned with Playwright)
- Testing OpenTelemetry SDK internals

## Future Plans

- E2E testing using Playwright
- Evals for LLMs
