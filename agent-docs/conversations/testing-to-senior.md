# Report: E2E Testing Suite Refinement (CR-002)

## Summary
The E2E testing suite has been refined for better environment flexibility, enhanced debugging capabilities, and organized test execution via tagging.

## Accomplishments
- **Config Refinement**:
    - Updated `playwright.config.ts` to use `process.env.PLAYWRIGHT_BASE_URL` with a fallback to `http://localhost:3001`.
    - Enabled artifact retention: screenshots on failure, videos on failure, and traces on first retry.
- **Tagging & Organization**:
    - Added `@critical` tags to core functional tests in `landing-page.spec.ts` and `transformer.spec.ts`.
    - Added `@smoke` tags to navigation tests in `navigation.spec.ts`.
- **Policy Documentation**:
    - Embedded internal comments in `transformer.spec.ts` regarding the rarity and purpose of observability-based E2E tests.
    - Updated `agent-docs/testing-strategy.md` with instructions for running tagged tests and our policy on test artifacts and observability validation.

## Verification Results
- **Full Suite (Chromium)**: 4/4 tests PASSED.
- **Critical Tests**: `pnpm playwright test --grep @critical` successfully executed the 2 critical tests.
- **Smoke Tests**: `pnpm playwright test --grep @smoke` successfully executed the navigation tests.

## Artifacts & Debugging
- Playwright is now configured to store failure artifacts in `test-results/` (ignored by git but useful for local and CI triage).

## Knowledge Transfer
- To run critical tests only: `pnpm playwright test --grep @critical`
- To run smoke tests only: `pnpm playwright test --grep @smoke`
- To override the base URL: `PLAYWRIGHT_BASE_URL=https://your-preview-link.com pnpm test:e2e`
