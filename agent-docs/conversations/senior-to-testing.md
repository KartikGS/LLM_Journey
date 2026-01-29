# Task: Refine E2E Testing Suite (CR-002)

**Context**: [CR-002-plan.md](../plans/CR-002-plan.md) and [CR-002-e2e-refinement.md](../requirements/CR-002-e2e-refinement.md)

## Objective
Polishing the E2E testing suite for better debugging and environment flexibility.

## Steps for Testing Agent:
1. **Config Update**:
   - Update `playwright.config.ts` to use `process.env.PLAYWRIGHT_BASE_URL` with a fallback to `http://localhost:3001`.
   - Update `use` block to include `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, and `trace: 'on-first-retry'`.
2. **Tagging**:
   - Add `@critical` tag to the `describe` or `test` blocks in `transformer.spec.ts` and `landing-page.spec.ts`.
3. **Internal Documentation**:
   - Add a comment in `transformer.spec.ts` explaining that observability-based E2E tests should be kept rare to minimize flakiness and runtime cost.
4. **Testing Strategy Update**:
   - Update `agent-docs/testing-strategy.md` to describe the tagging system (e.g., how to run `@critical` tests) and the artifact retention policy.

## Verification:
- Run `pnpm test:e2e` to confirm no regressions.

Please report back once the configuration is updated and documentation is synced.
