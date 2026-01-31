# CR-004: Browser Support Fallback and E2E Alignment

## Status
Clarified

## Business Context
**User Need:** Users on unsupported browsers currently experience silent failures or broken UI due to CSP/WASM restrictions. We need a graceful way to inform them and ensure our automated tests accurately reflect this boundary.
**Expected Value:** Improved UX for legacy users and a reliable, passing E2E test suite.

## Functional Requirements
1. **Detection Logic**: Implement a client-side check to determine if the browser supports necessary features (WASM with `wasm-unsafe-eval`).
2. **Fallback UI**: Create a premium-looking "Unsupported Browser" screen.
    - Display clear explanation of why the site won't work.
    - List supported browsers: Chrome 95+, Firefox 102+, Safari 17.4+.
3. **Redirection/State Management**: Ensure the fallback takes precedence over any interactive components on unsupported browsers.

## Non-Functional Requirements
- **Performance**: Detection script must be lightweight and non-blocking.
- **Aesthetics**: The fallback page should maintain the "LLM Journey" premium design language (vibrant gradients, clear typography).

## Acceptance Criteria
- [ ] Clients on unsupported browsers see the fallback page instead of a broken Transformer.
- [ ] Clients on supported browsers (Chrome 120+, FF 130+) can still use all features.
- [ ] `playwright.config.ts` updated to split tests by project.
- [ ] E2E: Chromium and Firefox projects pass critical/smoke tests.
- [ ] E2E: Safari project (representing technical debt/legacy in this context) passes "Fallback Detection" test and is excluded from "Happy Path" tests.

## Dependencies
- None.

## Notes
- We are using Safari as the "legacy" representative in the test suite to verify the fallback logic, as it currently triggers the WASM/CSP failure in our environment.
