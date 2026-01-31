# Handoff: Senior Developer to Testing Agent (CR-004)

## Objective
Update E2E tests to handle the Browser Support Fallback UI and verify it in the `webkit` project.

## Context
The `Frontend Agent` is refining the `BrowserGuard` in `components/ui/browser-support-fallback.tsx`. This guard shows a fallback UI when WASM execution is blocked (as happens in our Playwright `webkit` environment). We need to align our tests to expect this behavior.

## Tasks
1. **Verfication Logic**:
   - In `__tests__/e2e/navigation.spec.ts` and `__tests__/e2e/transformer.spec.ts`:
     - Access `browserName` from the test context.
     - If `browserName === 'webkit'`:
       - Assert that `page.locator('#browser-support-fallback')` is visible.
       - Assert that the text "Unsupported Browser" (or similar from the component) is present.
       - Use `test.skip()` or conditional logic to skip the standard "happy path" interactions that would fail due to missing app logic.
     - For other browsers (`chromium`, `firefox`), ensure the standard tests run and pass.
2. **Execution**:
   - Run `pnpm test:e2e` and ensure all projects (`chromium`, `firefox`, `webkit`) pass according to their respective logic (supported vs fallback).

## Constraints
- **Project Structure**: Do NOT remove the `webkit` project from `playwright.config.ts`. It is now our "Fallback verification" platform.
- **Locators**: Use the ID `#browser-support-fallback` which the Frontend Agent is adding.

## Definition of Done
- `pnpm test:e2e` completes with 100% success.
- `webkit` tests specifically verify the fallback UI.
- `chromium` and `firefox` continue to verify main app functionality.
- No flaky tests introduced.
