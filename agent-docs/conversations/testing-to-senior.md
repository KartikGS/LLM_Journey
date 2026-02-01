## BLOCKER / FEEDBACK

### Environmental Blocker: WebKit TLS/HSTS Issues (CR-004)
- **Status**: HALTED (Environmental)
- **Details**: Updated E2E tests as requested (in `navigation.spec.ts`, `transformer.spec.ts`, and `landing-page.spec.ts`). However, WebKit tests are failing due to a hard-coded HSTS/HTTPS requirement in the test environment. 
    - The browser forces `https://127.0.0.1:3001` even when `http` is specified.
    - Since the dev server is HTTP, TLS handshakes fail.
    - This prevents JS chunks from loading, which prevents `BrowserGuard` from hydrating.
    - Result: WebKit shows a permanent empty div (initial state of `BrowserGuard`) instead of the fallback UI or the app.
- **Actions taken**: 
    - Removed `Strict-Transport-Security` from `next.config.ts`.
    - Attempted to change ports (3002, 45678) but the environment seems to force HTTPS globally for local IPs.
- **Request**: We need either an HTTPS-capable dev environment for E2E testing OR a way to disable the HTTPS upgrade in the Playwright WebKit configuration for this environment.
- **Verification of Tests**: The tests have been updated with the correct logic. They are currently failing on `toBeVisible` for the fallback ID because the component never hydrates to show it.
