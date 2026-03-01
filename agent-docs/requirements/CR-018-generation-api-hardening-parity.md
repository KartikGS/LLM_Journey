# CR-018: Generation API Hardening Parity

## Status
`Done`

## Business Value

This CR closes hardening drift between generation APIs and the existing OTEL proxy boundary so new and existing routes are governed by comparable expectations for abuse protection, observability resilience, and contract traceability.

Human User intent: address route-duplication and parity questions raised for adaptation/frontier generation routes and OTEL telemetry controls.

Product End User audience: software engineers learning through Stage 1 (`/foundations/transformers`) and Stage 2 (`/models/adaptation`) interactions.

Expected outcome for Product End User: stable, predictable generation interactions with no contract regressions while backend reliability and diagnostics improve.

## Scope

1. Preserve separate public generation route contracts (`/api/frontier/base-generate`, `/api/adaptation/generate`) for product-stage semantics.
2. Reduce server-side duplication between the two generation routes through shared internal logic where behavior is equivalent.
3. Add explicit abuse-protection policy parity for generation routes (rate/body constraints) aligned with existing middleware pattern.
4. Add route-level observability parity for generation routes (non-blocking metrics in addition to existing spans/logs).
5. Ensure API contract documentation parity for all modified generation/telemetry routes covered by this CR.
6. Add/adjust tests to verify new hardening controls and observability safety invariants.

## Acceptance Criteria

- [x] **AC-1 (Route contract preservation):** `/api/frontier/base-generate` and `/api/adaptation/generate` remain separate public endpoints with existing request/response envelope semantics preserved for current consumers. — Verified: [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/frontier/base-generate/route.ts:19), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:18), [frontier-base-generate.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/api/frontier-base-generate.test.ts:281), [adaptation-generate.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/api/adaptation-generate.test.ts:194).
- [x] **AC-2 (Duplication reduction):** Shared internal server utility (or equivalent shared module) is used by both generation routes for duplicated logic, and duplicated server-side route-local helper logic is reduced without behavior regression. — Verified: [shared.ts](/home/kartik/Metamorphosis/LLM_Journey/lib/server/generation/shared.ts:10), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/frontier/base-generate/route.ts:11), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:11), [frontier-base-generate.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/api/frontier-base-generate.test.ts:39), [adaptation-generate.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/api/adaptation-generate.test.ts:53).
- [x] **AC-3 (Abuse controls parity):** Generation routes have explicit middleware/API boundary constraints (rate limit + payload size policy) with documented thresholds and controlled status responses. — Verified: [middleware.ts](/home/kartik/Metamorphosis/LLM_Journey/middleware.ts:30), [middleware.ts](/home/kartik/Metamorphosis/LLM_Journey/middleware.ts:36), [middleware.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/middleware.test.ts:190), [middleware.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/middleware.test.ts:241).
- [x] **AC-4 (Observability parity):** Generation routes emit route-level metrics for request volume and failure/fallback outcomes using non-blocking instrumentation (telemetry failures must not break route responses). — Verified: [metrics.ts](/home/kartik/Metamorphosis/LLM_Journey/lib/otel/metrics.ts:20), [metrics.ts](/home/kartik/Metamorphosis/LLM_Journey/lib/otel/metrics.ts:128), [metrics.ts](/home/kartik/Metamorphosis/LLM_Journey/lib/otel/metrics.ts:167), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/frontier/base-generate/route.ts:266), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:210).
- [x] **AC-5 (Security containment):** Secrets and protected prompt material remain server-only; no API key, auth header value, or hidden system-prompt text appears in response payloads, logs, or span attributes. — Verified: [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:27), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:335), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/frontier/base-generate/route.ts:380), [frontier-base-generate.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/api/frontier-base-generate.test.ts:370), [adaptation-generate.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/api/adaptation-generate.test.ts:497), [adaptation-generate.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/api/adaptation-generate.test.ts:508).
- [x] **AC-6 (Contract docs parity):** API contract docs under `agent-docs/api/` are present and updated for all routes modified by this CR (minimum: adaptation route contract added; frontier/telemetry contracts updated if changed). — Verified: [README.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/api/README.md:6), [adaptation-generate.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/api/adaptation-generate.md:1), [adaptation-generate.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/api/adaptation-generate.md:103).
- [x] **AC-7 (Test coverage):** New/updated tests cover hardening and observability-safety behavior for touched routes, including at least one negative-path assertion per new abuse-control rule. — Verified: [middleware.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/middleware.test.ts:190), [middleware.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/middleware.test.ts:241), [frontier-base-generate.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/api/frontier-base-generate.test.ts:305), [adaptation-generate.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/api/adaptation-generate.test.ts:431).
- [x] **AC-8 (Quality gates):** `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build` pass under compliant runtime. — Verified: `pnpm test` (17/17 suites, 159/159 tests passed), `pnpm lint` (no ESLint warnings/errors), `pnpm exec tsc --noEmit` (exit 0), `pnpm build` (exit 0; production build completed with pre-existing OTel warning).
- [x] **AC-9 (Contract stability):** No route-path, `data-testid`, or accessibility-semantic contracts are changed by this CR. — Verified: [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/frontier/base-generate/route.ts:19), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:18), and `git diff --name-only` contains no UI page/component contract files.

## Constraints

- Preserve learner-facing route separation between frontier-base and adaptation strategy interactions.
- Do not weaken ADR-0001 telemetry proxy boundary guarantees (validation, constrained forwarding, failure isolation).
- No dependency installation unless explicitly approved in a follow-up scope decision.
- Keep telemetry and logging non-blocking and avoid high-cardinality metric dimensions.
- If any route/path/test-id/accessibility contract change becomes necessary, pause and escalate for explicit scope update.

## Risks & Assumptions

| Item | Type | Notes |
|---|---|---|
| Over-tight limits can block legitimate usage | Risk | Thresholds must be explicit and tested at edge (`N`, `N+1`, window reset) |
| Metrics cardinality growth | Risk | Avoid unbounded labels (prompt text/user identifiers) |
| Shared-module refactor can expand scope | Scope | Refactor is limited to equivalent duplicated logic only |
| Existing product-route semantics are required | Assumption | Separate public endpoints remain intentional for stage clarity |

## Execution Mode

`Heavy` (`[L]`): cross-cutting backend + middleware + observability + testing + contract-documentation alignment with security/telemetry constraints.

## Verification Mapping

- AC-1/AC-2: diff evidence + route behavior tests for both generation endpoints.
- AC-3: middleware/API abuse-control tests (threshold edge + reset behavior).
- AC-4: metric emission assertions and telemetry-failure non-blocking assertions.
- AC-5: explicit negative assertions/audit evidence that prohibited data does not leak.
- AC-6: `agent-docs/api/` contract-file evidence for touched routes.
- AC-7: targeted tests for new controls + affected existing suites.
- AC-8: full gate command evidence in canonical order.
- AC-9: contract stability statement in Tech Lead handoff.

## Baseline Failure Snapshot (Required for Regression/Incident CRs)

- **Date**: 2026-02-25
- **Command(s)**: N/A — enhancement/governance hardening CR (not a failing incident baseline)
- **Execution Mode**: N/A
- **Observed Result**: Current system is functional; issue is parity/governance drift across route hardening patterns.

## Post-Fix Validation Snapshot

- **Date**: 2026-02-25
- **Command(s)**: `node -v`; `pnpm test`; `pnpm lint`; `pnpm exec tsc --noEmit`; `pnpm build`
- **Execution Mode**: sandboxed
- **Observed Result**: `node -v` reports `v18.19.0` (below policy `>=20.x`, pre-existing and tracked in `project-log.md`); all quality-gate commands passed successfully.

## Environment Variable Changes

- None required by BA scope at draft time (Tech Lead may propose optional threshold envs if justified).

## Dependencies

- Blocks: none
- Blocked by: none

## Notes

- Linked investigation: `agent-docs/reports/INVESTIGATION-CR-018-route-hardening-parity.md`.
- BA recommendation: preserve separate external route contracts; pursue internal logic convergence + hardening parity.
- Keep-in-mind review completed: active warning (`Diagnostic Fallback UIs`) is unrelated to CR-018 scope and remains open.

## Technical Analysis (filled by Tech Lead — required for M/L/H complexity; optional for [S])
**Complexity:** [Low | Medium | High]
**Estimated Effort:** [S | M | L]
**Affected Systems:**
**Implementation Approach:**

## Deviations Accepted (filled at closure by BA)
- No implementation deviations reported by Tech Lead.
- `Tech Lead Recommendation #1` (module-layer placement of record-narrowing helper) — Reviewed; no explicit CR constraint impact. Accepted as no-op for this CR.
- `Tech Lead Recommendation #2` (add generation latency/output histograms) — Reviewed; no explicit CR constraint impact. Accepted as follow-up backlog candidate.
