# Investigation Report: E2E Failure Baseline (CR-010)

**Date**: 2026-02-14
**Status**: For Review
**Linked CR**: CR-010

---

## Executive Summary
The current E2E pipeline is failing before browser tests execute in this environment because Playwright cannot start the project web server on port `3001` (`listen EPERM`). In addition, one navigation assertion appears stale (`/transformer` vs `/foundations/transformers`) and is likely to fail in a valid runtime.

## Observed Symptoms
- Local run (`pnpm test:e2e`) executes fully with `18` tests: `12 passed`, `6 failed`.
- `__tests__/e2e/landing-page.spec.ts` fails in all browsers on `locator('div.grid > a')` count (`expected 10`, `received 0`).
- `__tests__/e2e/transformer.spec.ts` fails in all browsers waiting for `getByText('Generating...')`.
- OTEL proxy logs repeated upstream refusal: `ECONNREFUSED 127.0.0.1:4318`.

## Investigated Areas
- **Playwright startup config** (`playwright.config.ts`): Uses `webServer.command = 'pnpm dev'` and waits for `http://localhost:3001`.
- **Runtime startup command** (`package.json`): `dev` script is `next dev -p 3001`.
- **Route + selector alignment**:
  - Home page CTA route is `/foundations/transformers` (`app/page.tsx`).
  - Navigation spec already expects `/foundations/transformers` (`__tests__/e2e/navigation.spec.ts`).
  - Landing page spec still expects `/transformer` (`__tests__/e2e/landing-page.spec.ts`).

## Root Cause Analysis (RCA)
1. **Landing-page selector drift**: `div.grid > a` no longer matches current rendered structure, causing deterministic count failures.
2. **Route assertion drift**: Landing spec still asserts legacy `/transformer` path while current CTA contract is `/foundations/transformers`.
3. **Transformer transient-state fragility**: Test requires immediate visibility of `"Generating..."`, but actual UI timing/state transitions do not guarantee that exact text window.
4. **Observability upstream dependency mismatch**: OTEL proxy attempts forwarding to `127.0.0.1:4318`; collector is unavailable in default local run, producing noisy errors that should remain non-fatal under architecture failure-boundary rules.

## Suggested Strategies
- **Strategy A (Tech Lead + Testing)**: Replace stale landing-page route/selector assertions with current DOM and route contracts.
- **Strategy B (Tech Lead + Testing)**: Rework transformer E2E to assert stable generation outcomes instead of brittle transient UI text.
- **Strategy C (Tech Lead)**: Clarify OTEL collector availability expectations in E2E so proxy upstream refusal is treated consistently with failure-boundary intent.

## Verification Plan
- Primary: `pnpm test:e2e` local full-suite rerun after test updates.
- Focused check: `pnpm test:e2e -- __tests__/e2e/landing-page.spec.ts`.
- Regression check: `pnpm test:e2e -- __tests__/e2e/navigation.spec.ts`.
- Regression check: `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts`.
- Closure evidence should include exact command + pass/fail result lines in Tech Lead handoff.
