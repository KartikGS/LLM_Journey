# Handoff: Senior Developer to Testing Agent (CR-004)

## Objective
Update E2E tests to handle the Browser Support Fallback UI and verify it in the `webkit` project.

## Context
The Frontend Agent has completed the refinement of the `BrowserGuard` in `components/ui/browser-support-fallback.tsx`. 
- The guard uses the ID `#browser-support-fallback`.
- The primary heading is "High-Performance Environment Required".
- The background involves dynamic animations.

## Tasks
1. **Verification Logic**:
   - In `__tests__/e2e/navigation.spec.ts` and `__tests__/e2e/transformer.spec.ts`:
     - Access `browserName` from the test context.
     - If `browserName === 'webkit'`:
       - Assert that `page.locator('#browser-support-fallback')` is visible.
       - Assert that the text "High-Performance Environment Required" is present.
       - Use `test.skip()` to skip the standard "happy path" interactions that require WASM.
     - For other browsers (`chromium`, `firefox`), ensure the standard tests run and pass.
2. **Execution**:
   - Run `pnpm test:e2e` and ensure all projects (`chromium`, `firefox`, `webkit`) pass. Note: `webkit` is expected to show the fallback, while others show the app.

## Constraints
- **Project Structure**: Do NOT remove the `webkit` project from `playwright.config.ts`.
- **Locators**: Use the ID `#browser-support-fallback`.

## Definition of Done
- `pnpm test:e2e` completes with 100% success.
- `webkit` tests specifically verify the fallback UI.
- `chromium` and `firefox` continue to verify main app functionality.
- No flaky tests introduced.
