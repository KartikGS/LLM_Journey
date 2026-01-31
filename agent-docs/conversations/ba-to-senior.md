# Handoff: CR-004 - Browser Support Fallback and E2E Alignment

## Objective
Implement a "Browser Support" fallback page and align the Playwright E2E configuration to match our architectural decision of supporting only modern browsers (Chrome 95+, FF 102+, Safari 17.4+).

## Context
Our use of WASM (via `onnxruntime-web`) and strict CSP (`wasm-unsafe-eval`) causes failures on older browsers. Currently, E2E tests in Safari are failing because they expect the full app to load. We need to detect this incompatibility and show a fallback page, then update our tests to verify this behavior.

## Requirements

### 1. Implementation
- **Detection Logic**: Create a component that checks for WebAssembly support in the current environment. Note that the CSP `wasm-unsafe-eval` is the primary blocker; a simple `typeof WebAssembly !== "undefined"` might pass, but actual initialization might fail. A small trier-block for WASM init is recommended.
- **Fallback UI**: Create a "Browser Support" page found in `components/ui/browser-support-fallback.tsx`. It should:
    - Match the project's dark/premium aesthetic.
    - Explain the requirement for WASM-capable modern browsers.
    - Explicitly list supported versions.
- **Integration**: Wrap or inject this guard in `app/layout.tsx`.

### 2. Testing Alignment
- **Playwright Config**: 
    - Keep `chromium` and `firefox` as functional testing projects.
    - Use `webkit` (Safari) as the "Fallback" testing project.
- **Test Logic**:
    - In `navigation.spec.ts` and `transformer.spec.ts`:
        - `test.skip()` happy path tests if the project is `webkit`.
        - Add a specific test case for `webkit` that asserts the visibility of the "Browser Support" fallback message.

## Definition of Done
- [ ] Users on unsupported browsers see the fallback UI.
- [ ] Users on supported browsers see the full LLM Journey experience.
- [ ] `pnpm test:e2e` completes with 100% success (Verifying happy path on Chrome/FF and Fallback on Safari).
- [ ] Updated `agent-docs/plans/CR-004-plan.md` created by Senior Dev.
