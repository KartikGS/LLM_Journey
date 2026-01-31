# Technical Plan - CR-004: Browser Support Fallback and E2E Alignment

## 1. Technical Analysis
The project uses ONNX Web which requires WASM and strict CSP (`wasm-unsafe-eval`). Older browsers or browsers with restrictive security settings (like some Safari versions or "Lockdown Mode") fail to initialize WASM. Currently, E2E tests in Safari (`webkit`) are failing because they expect the full application to load.

A `BrowserGuard` component and integration in `layout.tsx` already exist, but they need refinement to ensure robust detection and a premium UI. The E2E tests haven't been updated to handle the `webkit` project as a "Fallback" testing project.

## 2. Proposed Changes
### Component: `components/ui/browser-support-fallback.tsx`
- **Detection Refinement**: Verify and refine the `checkWasmSupport` logic. The current implementation attempts to create a `WebAssembly.Module` which is correct for catching `wasm-unsafe-eval` issues.
- **UI Polish**: Ensure the fallback UI meets the project's high aesthetic standards (gradients, micro-animations, modern typography).

### E2E Tests: `__tests__/e2e/navigation.spec.ts` & `__tests__/e2e/transformer.spec.ts`
- **Conditional Logic**: Update tests to skip functional flows when `project.name === 'webkit'`.
- **Fallback Verification**: Add test cases to verify that the "Unsupported Browser" message is visible in `webkit`.

### Configuration: `playwright.config.ts`
- No changes needed to the config itself, but the project `webkit` will now be treated as the environment to test the fallback.

## 3. Delegation & Execution Order

| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | **Frontend Agent** | Refine `components/ui/browser-support-fallback.tsx`. Ensure detection logic is robust and UI is premium/dynamic. |
| 2 | **Testing Agent** | Update `navigation.spec.ts` and `transformer.spec.ts` to skip functional tests in `webkit` and add fallback verification. |
| 3 | **Senior Developer** | Verify all Green across Chromium, Firefox, and Webkit (Fallback). |

## 4. Operational Checklist
- [x] **Environment**: No hardcoded values.
- [ ] **Observability**: Ensure fallback page doesn't break OTel initialization.
- [ ] **Artifacts**: No new artifacts requiring `.gitignore`.
- [ ] **Rollback**: Revert changes in `layout.tsx` and E2E specs.

## 5. Definition of Done (Technical)
- [ ] `BrowserGuard` correctly identifies WASM-incapable environments.
- [ ] Fallback UI is displayed on Webkit/Safari in E2E tests.
- [ ] Functional tests pass on Chromium and Firefox.
- [ ] Fallback tests pass on Webkit.
- [ ] `pnpm test:e2e` passes 100%.
