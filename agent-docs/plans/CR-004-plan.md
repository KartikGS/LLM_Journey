# Technical Plan - CR-004: Browser Support Fallback and E2E Alignment

## 1. Technical Analysis
- **Current State**: The application requires WASM and strict CSP (`wasm-unsafe-eval`). Older browsers or browsers with restricted WASM (like Safari in certain modes or older versions) fail to initialize the model, leading to a broken experience and failing E2E tests.
- **Key Challenges**: 
    - Detecting WASM support accurately (simple feature detection vs. execution check).
    - Ensuring the guard runs early enough to prevent subsequent errors but late enough to be client-side.
    - Aligning E2E tests to expect the fallback on specific environments (Webkit) while maintaining the happy path on others (Chromium, Firefox).

## 2. Proposed Changes
### Frontend
- **`components/ui/browser-support-fallback.tsx`**: 
    - Create a client-side component `BrowserGuard`.
    - Logic: Use a `useEffect` to try initializing a minimal WASM instance or check `WebAssembly.validate`.
    - UI: A full-screen overlay or redirect-like view with dark mode aesthetics, explaining the requirements.
- **`app/layout.tsx`**:
    - Import and use `BrowserGuard` to wrap the main application content or conditionally render based on support.

### Testing
- **`playwright.config.ts`**:
    - Ensure `webkit` is clearly marked or handled as a legacy/fallback target if necessary, or just keep it as is but update tests.
- **`tests/navigation.spec.ts` & `tests/transformer.spec.ts`**:
    - Implement conditional logic based on `browserName`.
    - If `webkit`, assert that the fallback message/component is visible.
    - If `chromium` or `firefox`, proceed with standard happy path tests.

## 3. Delegation & Execution Order
| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | Frontend | Create `BrowserGuard` component and UI in `components/ui/browser-support-fallback.tsx`. |
| 2 | Frontend | Integrate `BrowserGuard` into `app/layout.tsx`. |
| 3 | Testing | Update Playwright config and spec files to handle the fallback UI in `webkit`. |

## 4. Operational Checklist
- [ ] **Environment**: No hardcoded values for version numbers (use constants).
- [ ] **Observability**: Log if the browser is detected as unsupported for telemetry.
- [ ] **Artifacts**: No new artifacts requiring `.gitignore` updates expected.
- [ ] **Rollback**: Revert changes to `layout.tsx` and `playwright.config.ts`.

## 5. Definition of Done (Technical)
- [ ] `BrowserGuard` successfully detects lack of WASM support.
- [ ] Fallback UI appears on Safari/Webkit in E2E tests.
- [ ] Happy path tests still pass on Chrome and Firefox.
- [ ] `pnpm test:e2e` passes 100%.
