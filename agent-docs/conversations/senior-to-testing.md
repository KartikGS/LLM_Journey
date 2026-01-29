# Handoff: Stabilize E2E Suite & Mock Infrastructure

**From**: Senior Developer Agent
**To**: Testing Sub-Agent
**Status**: Pending

## Objective
The E2E suite is currently failing due to two main reasons:
1.  **OTel collector dependency**: The proxy `/api/otel/trace` is failing because the local Docker stack (in `/observability`) isn't running.
2.  **WebKit flakiness**: WebKit is failing assertions because it's too fast for the application hydration/metadata loading.

## Tasks

### 1. Mock OTel in Tests
Modify `__tests__/e2e/transformer.spec.ts` to mock the OTel trace endpoint.
- Use `page.route('**/api/otel/trace', route => route.fulfill({ status: 202 }))`.
- This removes the dependency on the local Docker observability stack during tests.

### 2. Stabilize WebKit Interactions
Update `__tests__/e2e/navigation.spec.ts` and `__tests__/e2e/transformer.spec.ts`:
- **Wait for readiness**: Before interacting with the transformer input, ensure it is NOT disabled: `await expect(page.locator('textarea#chat')).toBeEnabled({ timeout: 10000 })`.
- **Defensive Clicks**: In WebKit, navigation links might be flaky. Ensure we wait for the page to be ready:
  ```typescript
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const startLink = page.getByRole('link', { name: 'Start Your Journey →' });
  await startLink.click();
  await page.waitForURL('**/transformer', { timeout: 10000 });
  ```

### 3. Verify
- Run `pnpm test:e2e --project=chromium`
- Run `pnpm test:e2e --project=firefox`
- Run `pnpm test:e2e --project=webkit`

## Definition of Done
- All E2E tests pass across all browsers.
- No dependency on live `/api/otel/trace` upstream.
- A final report in `agent-docs/conversations/testing-to-senior.md`.
