# Change Requirement: CR-002-E2E-Refinement

**Status**: Draft
**Owner**: Senior Developer Agent
**Scope**: [S][TEST]
**Target Agent**: Testing Agent

## 1. Problem Statement
The initial E2E testing suite works locally but lacks the robustness and flexibility required for CI/CD environments and long-term maintenance. Debugging failures is difficult without visual artifacts, and the hardcoded URL prevents testing against preview environments.

## 2. User Story
As a developer, I want my E2E tests to provide rich debugging information on failure and to be configurable for different deployment environments.

## 3. Scope of Work

### 3.1 Playwright Configuration Update
- Update `playwright.config.ts`:
    - Add `screenshot: 'only-on-failure'`.
    - Add `video: 'retain-on-failure'`.
    - Set `trace: 'on-first-retry'`.
    - Set `baseURL` to `process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001'`.

### 3.2 Test Tagging & Documentation
- Tag critical tests with `@critical` (e.g., Transformer Page generation).
- Add documentation/comments in `transformer.spec.ts` explaining the rarity and purpose of observability-heavy tests.
- Update `agent-docs/testing-strategy.md` to reflect the new tagging system and artifact policy.

## 4. Acceptance Criteria
- [ ] `playwright.config.ts` uses environment variable for `baseURL`.
- [ ] `playwright.config.ts` is configured for screenshot, video, and trace artifacts.
- [ ] At least one test is tagged with `@critical`.
- [ ] Documentation explains the policy for observability E2E tests.
- [ ] `pnpm test:e2e` still passes.

## 5. Execution Mode
**Standard Path**: Incremental polish of existing testing infrastructure.
