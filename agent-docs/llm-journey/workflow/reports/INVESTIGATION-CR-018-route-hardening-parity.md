# Investigation Report: Route Hardening Parity for Generation APIs (CR-018)

**Date**: 2026-02-25
**Status**: For Review
**Linked CR**: CR-018

---

## Executive Summary
The project currently applies strong abuse-control and telemetry instrumentation to `/api/otel/trace`, but newer generation endpoints (`/api/frontier/base-generate`, `/api/adaptation/generate`) do not yet follow the same hardening pattern. This creates avoidable policy drift across API routes and increases long-term maintenance risk.

## Observed Symptoms
- Substantial duplicated route logic remains across generation endpoints (validation/fallback/upstream-failure handling patterns are near-parallel).
- Middleware hardening config is explicit for telemetry routes only (`/api/otel/trace`, `/api/telemetry-token`), not generation routes.
- Generation routes emit spans/logs but do not expose route-level metrics counters/histograms equivalent to OTEL proxy metrics.
- API contract docs policy requires matching route docs for new/modified APIs, but adaptation route contract documentation is missing under `agent-docs/api/`.

## Investigated Areas
- **Generation route behavior**
  - `app/api/frontier/base-generate/route.ts`
  - `app/api/adaptation/generate/route.ts`
- **OTEL boundary baseline**
  - `app/api/otel/trace/route.ts`
  - `middleware.ts`
  - `lib/otel/metrics.ts`
- **Testing evidence**
  - `__tests__/api/frontier-base-generate.test.ts`
  - `__tests__/api/adaptation-generate.test.ts`
  - `__tests__/integration/otel-proxy.test.ts`
- **Contract governance**
  - `agent-docs/api/README.md`
  - `agent-docs/api/frontier-base-generate.md`

## Root Cause Analysis (RCA)
1. **Feature-first route growth**: Generation endpoints were introduced incrementally for product learning stages, which preserved learner value but allowed security/observability controls to evolve unevenly across routes.
2. **Asymmetric governance enforcement**: OTEL proxy has explicit abuse-control and metrics treatment as a designated boundary, while generation APIs rely mostly on route-local validation and tests without equivalent boundary policy.
3. **Contract documentation lag**: Route implementation progressed faster than API contract artifact updates, creating traceability risk for future changes.

## Suggested Strategies
- **Strategy A (Recommended): Hardening parity CR**
  - Keep separate public endpoints for product semantics.
  - Add shared server generation-core utility for duplicated internal logic.
  - Add middleware abuse controls and route-level metrics parity for generation APIs.
  - Restore API contract documentation parity for modified/new routes.
- **Strategy B: Keep current architecture, add only docs/tests**
  - Lower implementation cost but leaves hardening asymmetry in runtime controls.
- **Strategy C: Merge generation endpoints**
  - Reduces route count but conflicts with current product-stage contracts and learning clarity.

## Verification Plan
- Route behavior + contract stability:
  - `pnpm test -- __tests__/api/frontier-base-generate.test.ts`
  - `pnpm test -- __tests__/api/adaptation-generate.test.ts`
- Hardening/telemetry boundary behavior:
  - `pnpm test -- __tests__/integration/otel-proxy.test.ts`
  - Add and run focused middleware/security tests for generation-route abuse controls.
- Full gate closure sequence:
  - `pnpm test`
  - `pnpm lint`
  - `pnpm exec tsc --noEmit`
  - `pnpm build`
