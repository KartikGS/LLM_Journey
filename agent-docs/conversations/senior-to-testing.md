# Handoff: Senior Developer to Testing Agent (CR-004 - REVISED STRATEGY)

## Objective
Restore Webkit happy-path tests and implement a **Synthetic Fallback Test** using CSP mocking.

## Context
Initial reports indicate that Webkit (Safari) *does* support WASM in our current environment. We should no longer skip functional tests for Webkit. However, we still need to verify the `BrowserGuard` works. We will do this by synthetically creating an "Unsupported" environment in a dedicated test.

## Tasks
1. **Restore Happy Path**:
   - Ensure `navigation.spec.ts` and `transformer.spec.ts` run for all projects (`chromium`, `firefox`, `webkit`). No more `test.skip` based on `browserName`.
2. **Implement Synthetic Fallback Test**:
   - Create `__tests__/e2e/fallback-detection.spec.ts`.
   - In a `beforeEach` or within a specific test case, use `page.route('**/*', (route) => { ... })` to intercept requests.
   - For the main application navigation (the initial HTML), get the response and **modify the headers**.
   - **Crucial**: Remove `'wasm-unsafe-eval'` from the `Content-Security-Policy` header.
   - Assert that `page.locator('#browser-support-fallback')` becomes visible.
   - Assert the heading text: "High-Performance Environment Required".
3. **Execution**:
   - Run `pnpm test:e2e` and ensure 100% pass across all browser projects.

## Constraints
- **Isolation**: Ensure the `page.route` mocking only applies to the specific fallback detection test and doesn't leak into others.
- **Locators**: Use the ID `#browser-support-fallback`.

## Definition of Done
- All standard functional tests pass on `chromium`, `firefox`, and `webkit`.
- The new `fallback-detection.spec.ts` passes by successfully mocking a restrictive CSP.
- 100% success rate in `pnpm test:e2e`.
