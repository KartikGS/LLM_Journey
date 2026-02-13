# Technical Plan - CR-007: Pipeline Stabilization for Test, Lint, and Build

## Technical Analysis
- Current state is partially healthy: `pnpm lint` is already green, while `pnpm test` and `pnpm build` fail due to TypeScript/module resolution regressions introduced by prior route and UI animation changes.
- Failures are narrow and deterministic:
  - Stale import in `__tests__/components/BaseLLMChat.test.tsx` still points to `@/app/transformer/...` instead of current `@/app/foundations/transformers/...`.
  - Framer Motion variant typing in `app/ui/navbar.tsx` causes strict TypeScript failure (`TS2322`) during typecheck/build.
- This is a stabilization CR, so the correct strategy is minimal, reversible patches that restore baseline without changing architecture, behavior contracts, or quality standards.

## Discovery Findings
- Pre-plan probes:
  - `rg` confirmed stale import in `__tests__/components/BaseLLMChat.test.tsx`.
  - `rg` and file inspection confirmed variant objects in `app/ui/navbar.tsx` are inferred too broadly in one branch, triggering Framer Motion literal-union mismatch.
- Resolved wildcards:
  - No package additions/updates required.
  - No route redesign required; this is path/type stabilization only.
- Validated assumptions:
  - `pnpm` is configured and required by project standards.
  - Known failures from investigation report align with current file state.

## Configuration Specifications
- No config changes are planned.
- Enforced standards remain unchanged:
  - Keep strict TypeScript checks active.
  - Keep ESLint rules unchanged.
  - Do not introduce compatibility shims unless explicitly escalated as deviation.

## Critical Assumptions
- `BaseLLMChat` canonical module location remains under `app/foundations/transformers/components/BaseLLMChat`.
- Navbar animation behavior is preserved while tightening types (type-only stabilization, not UX redesign).
- No additional hidden breakpoints emerge after fixing the two known blockers.

## Proposed Changes
- `__tests__/components/BaseLLMChat.test.tsx` (Testing Agent)
  - Update stale import to the current canonical path.
  - Keep test intent and assertions unchanged.
- `app/ui/navbar.tsx` (Frontend Agent)
  - Normalize/explicitly type motion variants so `transition.type` is inferred as valid Framer Motion literal union.
  - Preserve existing animation semantics, reduced-motion handling, and navbar behavior.
- No changes to architecture/security/telemetry paths.

## Architectural Invariants Check
- [x] **Observability Safety** preserved: no telemetry pipeline or failure-boundary behavior changed.
- [x] **Security Boundaries** preserved: no CSP/auth/token/rate-limit logic changed.
- [x] **Workflow/Quality** preserved: no weakening of lint/type gates; fixes target correctness under existing standards.

## Delegation & Execution Order
| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | Testing | Patch stale test import in `__tests__/components/BaseLLMChat.test.tsx` and run targeted test validation. |
| 2 | Frontend | Fix `app/ui/navbar.tsx` Framer Motion variant typing without changing behavior. |
| 3 | Testing | Run full verification: `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`; classify any residual failures as CR-related vs pre-existing. |

### Testing Sequence Decision
- Implementation-first for this CR.
- Rationale: failures are already deterministic and localized; writing new failing tests first adds no additional signal for stale import/type regression already captured by existing pipeline commands.

## Operational Checklist
- [x] **Environment**: No hardcoded values introduced.
- [x] **Observability**: No tracing/logging/metrics contract changes required.
- [x] **Artifacts**: No new generated artifacts expected.
- [x] **Rollback**: Revert only the two file-level patches if unexpected regression appears.

## Definition of Done (Technical)
- [ ] `__tests__/components/BaseLLMChat.test.tsx` uses canonical module path and related tests pass.
- [ ] `app/ui/navbar.tsx` compiles cleanly under strict TypeScript with Framer Motion typing.
- [ ] `pnpm test` exits `0`.
- [ ] `pnpm lint` exits `0`.
- [ ] `pnpm exec tsc --noEmit` exits `0`.
- [ ] `pnpm build` exits `0`.
- [ ] Any temporary workaround (if unavoidable) is explicitly documented as deviation with rollback path.

## Risks & Mitigations
- Risk: Additional stale imports may surface after first fix.
  - Mitigation: Run full `pnpm exec tsc --noEmit` and `pnpm test` after delegated changes; treat any new failures as part of stabilization scope if directly related.
- Risk: Framer Motion type fix could accidentally change animation behavior.
  - Mitigation: constrain changes to typing/inference; verify reduced-motion and menu open/close behavior remain unchanged.

## Execution Audit Note
- Existing files under `agent-docs/conversations/` contain prior CR handoffs/reports (CR-002/CR-004/CR-006 context). New CR-007 handoffs will be created fresh to avoid stale instruction reuse once user approves this plan.
