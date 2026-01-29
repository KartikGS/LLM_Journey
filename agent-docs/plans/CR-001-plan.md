# Execution Plan - CR-001-E2E-Testing

This plan outlines the steps to implement a Playwright-based E2E testing suite for the LLM Journey project.

## 1. Environment Discovery & Initialization

- [ ] Verify `pnpm` is available.
- [ ] Install `@playwright/test` as a dev dependency.
- [ ] Initialize Playwright using `npx playwright install --with-deps`.

## 2. Configuration

- [ ] Create `playwright.config.ts` in the root directory.
  - Set `webServer` to run `npm run dev` (port 3001 as seen in `package.json`).
  - Set `testDir` to `./__tests__/e2e`.
  - Configure browsers (Chromium, Firefox, Webkit).
- [ ] Update `package.json` with `"test:e2e": "playwright test"`.

## 3. Test Implementation

### 3.1 Landing Page (`__tests__/e2e/landing-page.spec.ts`)
- [ ] Navigate to `/`.
- [ ] Assert title is "LLM Journey".
- [ ] Assert 10 journey stage cards are present.
- [ ] Assert "Start Your Journey →" link exists and points to `/transformer`.

### 3.2 Transformer Interaction (`__tests__/e2e/transformer.spec.ts`)
- [ ] Navigate to `/transformer`.
- [ ] Select a sample input (e.g., "Speak, speak.").
- [ ] Assert textarea contains the sample text.
- [ ] Click the send button.
- [ ] Assert "Generating..." is visible.
- [ ] Assert final output is displayed (handling the non-deterministic nature).

### 3.3 Observability Verification
- [ ] In the Transformer test, intercept requests to `/api/otel/trace`.
- [ ] Assert that at least one request is made during the generation flow.

### 3.4 Navigation Flow (`__tests__/e2e/navigation.spec.ts`)
- [ ] Verify navigation from Home to Transformer.
- [ ] Verify navigation from Transformer to LLM page.

## 4. Documentation & Cleanup

- [ ] Update `agent-docs/testing-strategy.md` with instructions on running E2E tests.
- [ ] Ensure all tests pass with `pnpm test:e2e`.

## 5. Risks & Mitigations

- **Slow ONNX loading**: Using `expect(...).toBeVisible({ timeout: 30000 })` for the generation results.
- **Port Conflict**: Ensure port 3001 is used (matches `package.json`).
