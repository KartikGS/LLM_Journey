# Handoff: Implement E2E Testing Suite

**From**: BA Agent
**To**: Senior Developer Agent
**Context**: [CR-001-E2E-Testing](../requirements/CR-001-e2e-testing.md)

## Task Overview
Implement a Playwright-based E2E testing suite for the LLM Journey project. The goal is to provide a safety net for core user flows, including landing page navigation and the interactive Transformer demo.

## Key Requirements
1. **Tooling**: Use Playwright (`@playwright/test`).
2. **Infrastructure**:
   - Add a `playwright.config.ts` that handles the Next.js dev server.
   - Use `pnpm test:e2e` as the entry point.
3. **Test Cases**:
   - **Landing Page**: Check title, check 10 stage cards, check CTA link.
   - **Transformer Page**: Select sample input, click send, verify "Generating..." state, verify final text output.
   - **Observability**: Intercept network requests to `/api/otel/trace` and assert that at least one trace is sent during inference.
4. **Resilience**: Handle potential slowness of ONNX WASM loading by using appropriate `expect(...).toBeVisible({ timeout: ... })`.

## Technical Constraints (from Architecture/Strategy)
- Tests should live in `__tests__/e2e/`.
- Use `data-testid` where necessary if existing CSS classes are too unstable (though preference is for accessible selectors).
- Do not mock the ONNX runtime for E2E tests; we want to test the real integration.

## Success Criteria
- `pnpm test:e2e` passes locally.
- Test report shows clear failure reasons.
- Documentation updated in `testing-strategy.md` to reflect how to run E2E tests.

## Recommended Execution
1. Install dependencies.
2. Initialize Playwright config.
3. Implement landing page test.
4. Implement transformer interactivity test (handle async state).
5. Implement trace interception test.
6. Verify everything with `pnpm test:e2e`.

Please review the full CR in `agent-docs/requirements/CR-001-e2e-testing.md` before starting.
