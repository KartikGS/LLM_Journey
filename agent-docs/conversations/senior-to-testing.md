# Handoff: Senior Developer to QA / Test Engineer

## Context
The E2E suite is experiencing flake and failures specifically on Webkit and due to high parallelization on the dev server.

## Task
1. **Reduce Worker Count**:
   - Modify `playwright.config.ts`.
   - Set `workers: process.env.CI ? undefined : 2` (or 1).
   - *Note*: I am granting you temporary write access to `playwright.config.ts` for this stabilization task.

2. **Verification**:
   - Once the Infra and Frontend agents have completed their tasks, run the full E2E suite.
   - Command: `pnpm test:e2e`.
   - Success Criteria: 3 consecutive passing runs.
   - Specifically verify that Webkit tests show the application UI instead of a blank screen.

## Report
Please provide your report in `agent-docs/conversations/testing-to-senior.md`.
Include the results of the test runs.
