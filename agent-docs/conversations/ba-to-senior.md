# Handoff: BA → Senior Developer

## Objective
Stabilize the E2E test suite by addressing resource contention and Webkit compatibility issues identified during manual E2E runs.

## Linked CR
- [CR-004: E2E Suite Stabilization and Browser Compatibility Fix](../requirements/CR-004.md)

## Rationale
Current flakiness prevents reliable CI signals. Webkit is completely broken due to a CSP/HTTP conflict, which hides potential Safari-specific regressions.

## Suggested Technical Fixes (derived from [Analysis Report](../reports/E2E-issue-analysis.md))
1.  **Middleware**:
    - Wrap `upgrade-insecure-requests;` and `Strict-Transport-Security` in a dev-environment check.
    - Exempt `127.0.0.1` and `::1` from the telemetry rate limiter to prevent test interruption.
2.  **Playwright Config**:
    - Reduce workers for local runs (e.g., `workers: process.env.CI ? 2 : 1`).
    - Audit `fullyParallel` settings for heavy spec files.
3.  **BrowserGuard**:
    - Improve the "loading" state visibility to help differentiate between "hanging" and "slow load."

## Verification Mapping
- **AC 1 (Passes consistently)**: Run `pnpm test:e2e` three times consecutively; all must pass.
- **AC 2 (Webkit load)**: Verify Webkit screenshot in `playwright-report` shows the Landing Page hero section.
- **AC 3 (Rate limit)**: Verify no 429 errors appear in `pnpm dev` console during a full test run.

## Constraints
- Do NOT disable CSP in production.
- Do NOT remove `wasm-unsafe-eval` as it is required for transformer features.

## Risks
- Minor drift between dev/prod configurations for security headers.
