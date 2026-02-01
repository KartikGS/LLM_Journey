# Technical Plan - CR-004: E2E Suite Stabilization and Browser Compatibility Fix

## 1. Technical Analysis
- **Resource Contention**: The Next.js dev server is being overloaded by high parallelization in Playwright (`fullyParallel: true` + default worker count). The telemetry proxy (`/api/otel/trace`) is rate-limiting test requests, causing failures.
- **Webkit Compatibility**: Webkit strictly enforces `upgrade-insecure-requests` from CSP, breaking the connection to the non-SSL local dev server (localhost:3001).
- **Observability**: The `BrowserGuard` component renders a blank div during the environment audit, making failures indistinguishable from slow loads in test artifacts.

## 2. Critical Assumptions
- `process.env.NODE_ENV === 'development'` is reliable for detecting when to relax security/rate-limiting.
- Playwright's `workers` reduction will significantly reduce dev server latency/timeouts.

## 3. Proposed Changes

### `middleware.ts` (Infra)
- **Granular Environment Flags**:
    ```typescript
    const isProd = process.env.NODE_ENV === 'production';
    const isE2E = process.env.E2E === 'true';
    ```
- **Conditional CSP**: Dynamically construct `cspHeader`. Include `upgrade-insecure-requests` and `Strict-Transport-Security` **only** if `isProd && !isE2E`.
- **Rate Limit Bypass**: 
    ```typescript
    const ip = getClientIp(request);
    const isLocalhost = ip === '127.0.0.1' || ip === '::1';
    if (isE2E || isLocalhost) {
        // Bypass 429 logic
    }
    ```

### `playwright.config.ts` (Testing)
- **Worker Configuration**: Set `workers: process.env.CI ? undefined : 2` (or 1) to balance speed and reliability locally.

### `components/ui/browser-support-fallback.tsx` (Frontend)
- **Loading UI**: Add a centered, subtle "Checking environment compatibility..." text to the `isSupported === null` state.

## 4. Delegation & Execution Order

| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | Infra | Modify `middleware.ts` for conditional CSP and rate-limit bypass. |
| 2 | Testing | Update `playwright.config.ts` to reduce worker count for local runs. |
| 3 | Frontend | Update `BrowserGuard` in `browser-support-fallback.tsx` with a loading indicator. |
| 4 | Testing | Verify the fix by running `pnpm test:e2e`. |

## 5. Operational Checklist
- [ ] **Environment**: No hardcoded values for rate-limit bypass.
- [ ] **Observability**: `BrowserGuard` transition is visible in E2E videos.
- [ ] **Rollback**: Git revert changes if security regressions are detected in staging.

## 6. Definition of Done (Technical)
- [ ] `pnpm test:e2e` passes consistently (3 consecutive runs).
- [ ] Webkit screenshots/videos show the application UI.
- [ ] No `429 Too Many Requests` for telemetry endpoints during local test runs.
