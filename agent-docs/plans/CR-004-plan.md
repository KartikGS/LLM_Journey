# Technical Plan - CR-004: Browser Support Fallback and E2E Alignment (Revised)

## 1. Technical Analysis
- **Discovery**: Contrary to our initial assumption, Webkit (Playwright's Safari environment) *does* support WASM and our current CSP configuration. Therefore, treating Webkit as a "Fallback" environment is incorrect and will cause happy-path tests to fail if we skip them.
- **Problem**: We still need to verify that `BrowserGuard` works for *truly* unsupported environments (e.g. browsers with restrictive CSP or missing WASM).
- **Solution**: 
    1. Restore `webkit` as a functional testing project.
    2. Implement a **Synthetic Fallback Test** using Playwright's `page.route`. This test will intercept the response and modify the `Content-Security-Policy` header to remove `wasm-unsafe-eval`, thereby forcing a detection failure and proving the `BrowserGuard` visibility.

## 2. Proposed Changes
### Component: `components/ui/browser-support-fallback.tsx`
- No changes needed (already refined by Frontend Agent).

### E2E Tests:
- **`__tests__/e2e/navigation.spec.ts` & `__tests__/e2e/transformer.spec.ts`**:
    - Ensure these run for all projects (`chromium`, `firefox`, `webkit`).
- **`__tests__/e2e/fallback-detection.spec.ts` (NEW)**:
    - Dedicated test file to verify the fallback UI.
    - Logic: Use `page.route` to mock a restrictive CSP.
    - Assert: `#browser-support-fallback` is visible and content is correct.

## 3. Delegation & Execution Order

| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | **Testing Agent** | Restore standard tests for all projects. Create `fallback-detection.spec.ts` with CSP mocking logic. |
| 2 | **Senior Developer** | Verify all Green across Chromium, Firefox, and Webkit (Happy Path) + Fallback detection test. |

## 4. Operational Checklist
- [x] **Environment**: No hardcoded values.
- [ ] **Observability**: Ensure CSP mocking doesn't interfere with other tests (scope it to the specific test file).
- [ ] **Artifacts**: No new artifacts requiring `.gitignore`.
- [ ] **Rollback**: Revert changes in `layout.tsx` and E2E specs.

## 5. Definition of Done (Technical)
- [ ] `BrowserGuard` correctly identifies WASM-incapable environments via synthetic CSP blocking.
- [ ] Happy path tests pass on Chromium, Firefox, AND Webkit.
- [ ] `pnpm test:e2e` passes 100%.
