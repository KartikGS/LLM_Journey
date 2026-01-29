# Execution Plan - CR-002-E2E-Refinement

This plan covers the transition of the E2E suite to a production-ready state with better debugging and environment flexibility.

## 1. Configuration Refinement
- [ ] Modify `playwright.config.ts`:
    - Inject `process.env.PLAYWRIGHT_BASE_URL` with fallback to `localhost:3001`.
    - Enable `screenshot`, `video`, and `trace` in the `use` block.

## 2. Test Suite Enhancement
- [ ] Apply `@critical` tag to the Transformer generation test.
- [ ] Apply `@critical` or `@smoke` tags to landing page and basic navigation.
- [ ] Add comments in `transformer.spec.ts` regarding the cost/rarity of observability assertions.

## 3. Documentation Update
- [ ] Update `agent-docs/testing-strategy.md` to include:
    - How to run specific tags (`pnpm playwright test --grep @critical`).
    - Policy on failure artifacts.
    - Policy on observability testing frequency.

## 4. Verification
- [ ] Run `pnpm test:e2e` to ensure configuration changes don't break local execution.
- [ ] Verify environment variable override works (optional/dry-run).
