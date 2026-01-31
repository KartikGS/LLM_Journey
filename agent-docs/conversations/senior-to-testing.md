# Handoff: Senior Developer to Testing Agent (CR-004)

## Objective
Update E2E tests to handle the new Browser Support Fallback UI.

## Context
A `BrowserGuard` is being added to `app/layout.tsx`. On `webkit` (Safari), this guard is expected to show a fallback UI because it lacks the necessary WASM support for our application. We need to update our tests to verify this behavior rather than failing on the main app load.

## Tasks
1. **Playwright Alignment**:
   - Verify `playwright.config.ts` projects include `chromium`, `firefox`, and `webkit`.
2. **Test Updates**:
   - In `__tests__/e2e/navigation.spec.ts` and `__tests__/e2e/transformer.spec.ts`:
     - Detect the `browserName`.
     - If `browserName === 'webkit'`:
       - Assert that the "Browser Support" fallback UI is visible.
       - Use `test.skip()` or conditional logic to skip standard "happy path" tests that require full app functionality (like interacting with the transformer).
     - For other browsers (`chromium`, `firefox`), ensure happy path tests still pass.

## Constraints
- Do not remove the `webkit` project; use it to verify the fallback.
- Ensure tests use proper locators for the fallback UI (e.g., `#browser-support-fallback`).

## Definition of Done
- `pnpm test:e2e` passes with 100% success.
- `webkit` tests specifically verify the fallback UI.
- `chromium` and `firefox` continue to verify main app functionality.
