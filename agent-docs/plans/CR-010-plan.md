# Technical Plan - CR-010: E2E Baseline Stabilization

## Technical Analysis
- Current E2E baseline fails for deterministic contract drift in test assertions, not for confirmed product-route regressions.
- Two critical failure clusters are in E2E specs:
  - `__tests__/e2e/landing-page.spec.ts`: stale selector (`div.grid > a`) and stale route expectation (`/transformer`).
  - `__tests__/e2e/transformer.spec.ts`: brittle transient-state assertion (`Generating...`) that is timing-sensitive.
- Observability upstream refusal (`ECONNREFUSED 127.0.0.1:4318`) is expected to remain non-fatal under architecture invariant (telemetry failure boundary).

## Discovery Findings
- Route contract in app code is `'/foundations/transformers'` (confirmed in `app/page.tsx`).
- Navigation E2E already aligns with the canonical route in `__tests__/e2e/navigation.spec.ts`.
- Landing E2E still asserts legacy route/selector patterns.
- Playwright config and command canon match standards:
  - `playwright.config.ts` web server on `http://localhost:3001`
  - `package.json` uses `test:e2e = E2E=true playwright test`
- Resolved wildcard: "stable behavioral signal" for transformer means asserting durable lifecycle outcomes (input accepted, submit action completes, response/output visible) instead of transient text timing.

## Configuration Specifications
- No config-file changes are planned.
- No security-header relaxation or runtime flag changes are allowed in this CR.

## Critical Assumptions
- Stage 1 canonical route remains `/foundations/transformers`.
- OTEL collector is optional for this CR validation; proxy upstream refusal is acceptable if UI behavior remains intact.
- Existing E2E environment can execute browser matrix on port `3001` in local-equivalent runtime.

## Proposed Changes
- Testing Agent updates E2E assertions in:
  - `__tests__/e2e/landing-page.spec.ts`
  - `__tests__/e2e/transformer.spec.ts`
- Keep `__tests__/e2e/navigation.spec.ts` as targeted regression verification (no expected edit unless drift is discovered during implementation).
- Add explicit verification evidence (exact commands + per-browser pass/fail summary) in testing report.
- No feature code, app routes, middleware, or telemetry pipeline behavior changes.

## Architectural Invariants Check
- [x] Observability Safety: telemetry/export failures must not crash or block user flows.
- [x] Security Boundaries: no weakening of security controls for test convenience.

## Delegation & Execution Order
| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | Testing | Update stale landing/transformer E2E assertions to canonical and stable contracts; run required targeted + full E2E commands; classify failures. |

## Delegation Graph (MANDATORY)
- **Execution Mode**: Sequential
- **Dependency Map**:
  - Step B depends on Step A output? no (single-step delegation)
- **Parallel Groups**:
  - none
- **Handoff Batch Plan**:
  - Sequential: issue first handoff to Testing agent only (`agent-docs/conversations/tech-lead-to-testing.md`), then wait for report.
- **Final Verification Owner**:
  - Tech Lead performs adversarial diff review and integration classification after Testing report.

## Testing Sequence Decision
- **Mode**: Implementation-first within Testing scope (test-contract stabilization).
- **Sequence**:
  1. Update unstable/stale E2E assertions.
  2. Run targeted commands:
     - `pnpm test:e2e -- __tests__/e2e/landing-page.spec.ts`
     - `pnpm test:e2e -- __tests__/e2e/navigation.spec.ts`
     - `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts`
  3. Run full suite:
     - `pnpm test:e2e`

## Operational Checklist
- [x] **Environment**: No new hardcoded values.
- [x] **Observability**: OTEL upstream refusal treated via failure-boundary classification, not as product regression.
- [x] **Artifacts**: No new generated artifacts expected.
- [x] **Rollback**: Revert only modified E2E spec assertions.

## Definition of Done (Technical)
- [ ] Landing page route assertion validates `/foundations/transformers`.
- [ ] Landing page selector assertions no longer depend on stale `div.grid > a` structure.
- [ ] Transformer assertion uses stable behavioral signal (not brittle `Generating...` timing text).
- [ ] Required targeted E2E commands pass across configured browsers.
- [ ] Full `pnpm test:e2e` evidence recorded with explicit failure classification (CR-related vs pre-existing vs environmental).
