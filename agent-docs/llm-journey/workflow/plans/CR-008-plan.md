# Technical Plan - CR-008: Health Check Hardening (Rate Limiting + CR Status Governance)

## Technical Analysis
- Health check found a security-critical middleware defect: rate-limit state is not incremented per request, so configured thresholds are not enforced.
- Current quality gates (`pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`) are green, which indicates a test-coverage gap rather than runtime stability.
- Documentation health check found CR status vocabulary drift (`Done`, `Completed`, `Implemented`) that can create ambiguity in BA closure and reporting.

## Discovery Findings
- Pre-plan probes and validation:
  - `middleware.ts` currently stores `recent` timestamps back to map without appending `now`, making limit growth ineffective.
  - `__tests__/middleware.test.ts` currently validates helper utilities only; no route-level rate-limit behavior assertions exist.
  - `agent-docs/requirements/README.md` now defines canonical status model; historical CRs still include legacy labels.
- Resolved wildcards:
  - No package additions required.
  - No architecture redesign required; fix is localized to middleware logic + targeted tests + docs clarification.
- Validated assumptions:
  - `pnpm` is the required package manager.
  - Existing middleware route config for `/api/telemetry-token` and `/api/otel/trace` remains the intended policy baseline.

## Configuration Specifications
- No config file changes planned.
- Preserve security posture:
  - Keep CSP/HSTS behavior unchanged.
  - Keep existing `isE2E` and localhost bypass semantics unchanged.
- Preserve quality posture:
  - Do not weaken lint/type/test gates.
  - Full verification sequence remains `test -> lint -> tsc -> build`.

## Critical Assumptions
- Middleware rate limiting is intended to be active for non-localhost, non-E2E traffic.
- In-memory rate-limit behavior (reset on redeploy) is acceptable for current threat model.
- Testing agent can assert middleware behavior without requiring feature-code testability changes.

## Proposed Changes
- Backend scope:
  - `middleware.ts`: fix rate-limit state mutation so current request timestamp is recorded in rolling window.
- Testing scope:
  - `__tests__/middleware.test.ts`: add deterministic tests for both allow-path and block-path.
  - Verify bypass behavior remains intact (`E2E`/localhost).
- Documentation scope:
  - `agent-docs/requirements/README.md`: add explicit legacy status mapping for historical CR interpretation without retroactive rewrites.

## Architectural Invariants Check
- [x] **Observability Safety**: unchanged; no telemetry failure-boundary behavior modified.
- [x] **Security Boundaries**: strengthened; intended rate-limit control is restored and covered by tests.
- [x] **Historical Artifact Integrity**: preserved; legacy CRs remain immutable while interpretation is standardized.

## Delegation & Execution Order
| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | Backend | Fix middleware rate-limit state mutation in `middleware.ts` without altering policy thresholds/bypass rules. |
| 2 | Testing | Add middleware rate-limit coverage in `__tests__/middleware.test.ts` and validate allow/block/bypass behavior. |
| 3 | Testing | Run full quality gates and classify any residual failures. |

## Delegation Graph (MANDATORY)
- **Execution Mode**: Sequential
- **Dependency Map**:
  - Step 2 depends on Step 1 output: yes.
  - Required artifact: backend patch merged so new assertions represent intended behavior.
  - Step 3 depends on Step 2 output: yes.
  - Required artifact: updated middleware tests.
- **Parallel Groups**:
  - None (tasks are dependency-coupled).
- **Handoff Batch Plan**:
  - First handoff: Backend (`agent-docs/conversations/tech-lead-to-backend.md`).
  - Follow-up handoff: Testing (`agent-docs/conversations/tech-lead-to-testing.md`) after backend completion.
- **Final Verification Owner**:
  - Testing Agent.

## Operational Checklist
- [x] **Environment**: no new hardcoded values.
- [x] **Observability**: no new telemetry dependencies.
- [x] **Artifacts**: no generated artifact changes expected.
- [x] **Rollback**: revert middleware fix and test additions as isolated commits if regression appears.

## Definition of Done (Technical)
- [ ] Middleware rate limits are actually enforced for protected routes.
- [ ] Negative-space verified: below-threshold requests still pass.
- [ ] Middleware rate-limit tests are present and deterministic.
- [ ] `pnpm test` exits `0`.
- [ ] `pnpm lint` exits `0`.
- [ ] `pnpm exec tsc --noEmit` exits `0`.
- [ ] `pnpm build` exits `0`.
- [ ] CR status legacy mapping is documented for historical interpretation.

## Risks & Mitigations
- Risk: test flakiness due to shared in-memory rate-limit state.
  - Mitigation: isolate/reset relevant state per test setup.
- Risk: accidental behavior drift in middleware security logic beyond rate-limit fix.
  - Mitigation: keep patch minimal and scoped; run full gate sequence.
- Risk: confusion about legacy CR labels persists.
  - Mitigation: enforce canonical labels for all new CR updates and use explicit mapping in requirements guide.
