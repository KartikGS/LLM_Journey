# Change Requirement: CR-001-E2E-Testing

**Status**: Completed
**Owner**: BA Agent
**Scope**: [L][TEST]
**Target Agent**: Senior Developer

## 1. Problem Statement
The LLM Journey project lacks end-to-end (E2E) testing. While unit and integration tests are planned or partially implemented, there is no verification of critical user flows in a real browser environment. This is especially important given the project's reliance on client-side ONNX runtime and complex UI interactions.

## 2. User Story
As a developer, I want to ensure that the core user flows of the LLM Journey platform remain functional as we add new features and optimize the inference engine.

## 3. Scope of Work

### 3.1 Tooling Setup
- Install `@playwright/test` and required browsers.
- Configure Playwright to work with Next.js (support for local dev server).
- Add `pnpm test:e2e` to `package.json`.
- Organize tests in `__tests__/e2e/`.

### 3.2 Critical Paths for Validation
1. **Landing Page**:
   - Verify page title is "LLM Journey".
   - Verify all 10 journey stages (Transformer to Evaluation) are present as links.
   - Verify "Start Your Journey" button navigates to `/transformer`.

2. **Transformer Stage (Interactive)**:
   - Navigate to `/transformer`.
   - Select a sample input (e.g., "Speak, speak.").
   - Trigger generation via the "Send" button.
   - Verify the UI indicates loading state ("Generating...").
   - Verify the response area updates with generated text.

3. **Navigation Flow**:
   - Verify navigation between stages (e.g., Transformer → LLM).

4. **Observability Verification**:
   - Verify that browser-side generation triggers at least one trace export request to `/api/otel/trace`.

## 4. Acceptance Criteria
- [ ] Playwright is installed and configured.
- [ ] `pnpm test:e2e` executes all tests successfully.
- [ ] Tests cover landing page, transformer interactivity, and basic navigation.
- [ ] Tests use appropriate selectors (e.g., `role`, `data-testid`) for robustness.
- [ ] A basic E2E report is generated after test runs.

## 5. Assumptions & Risks
- **Assumption**: The local machine has necessary dependencies for Playwright browsers.
- **Risk**: ONNX model loading might be slow in CI/headless environments, requiring adjusted timeouts.
- **Risk**: Character-level model output is non-deterministic; test should verify *presence* of text, not exact content.

## 6. Execution Mode
**Standard Path**: This is a foundational testing task that requires careful setup but follows industry patterns.
