# Technical Plan — CR-023: Purpose-Driven Observability Refinement

## Technical Analysis

Four API routes have mismatched observability primitives relative to their operational purposes:

1. **Proxy route** (`/api/otel/trace`): Wraps its entire handler in a `startActiveSpan`. The proxy is a security/control boundary with no parent trace context — every span is a disconnected root, providing no linking value. Metrics + logs already cover all signals. Additionally, none of its metric calls are wrapped in `safeMetric()`, violating the Observability Safety invariant in `architecture.md`. A metric instrument failure here can crash request handling — the opposite of the telemetry failure boundary guarantee.

2. **Generation routes** (`/api/frontier/base-generate`, `/api/adaptation/generate`): Call external AI providers — the most latency-variable and failure-prone operations in the system. Neither records upstream latency. The proxy (stable infrastructure target) has a latency histogram; the AI provider calls (external SLA dependency) do not. This is inverted priority.

**AC-4 scope clarification (Tech Lead determination):**
The BA handoff flagged `getTelemetryTokenErrorsCounter` as dead code. Discovery audit disproves this: the counter is imported and called in `lib/otel/token.ts:20` within `generateTelemetryToken()` — it fires when `TELEMETRY_SECRET` is not set (a real misconfiguration error path). Confirmed by human user: **AC-4 is descoped from CR-023.** The counter is a live, meaningful signal and is not touched.

## Discovery Findings

- `app/api/otel/trace/route.ts`: 10+ bare metric calls without `safeMetric()` wrapping. The entire POST handler is wrapped in `tracer.startActiveSpan(...)`. `startTime` variable is only used by `logger.info(...)` on the success path — both will be removed together.
- `__tests__/integration/otel-proxy.test.ts`: Asserts on `mockTracer.startActiveSpan`, `mockSpan.setStatus`, `mockSpan.end`, `mockSpan.recordException`. All must be removed with the span. The `safeMetric` export is NOT currently in the metrics mock for this test — must be added.
- `lib/otel/metrics.ts`: No existing `safeMetric` import in the proxy route file (must be added to the import). `safeMetric` IS already exported from `lib/otel/metrics.ts`. Histogram infrastructure (`Histogram`, `getMeter()`) exists — no new packages required.
- `app/api/frontier/base-generate/route.ts`: `safeMetric` already imported and used. `performance.now()` available. Insert latency timer immediately before the inner `try { upstreamResponse = await fetch(...) }` block.
- `app/api/adaptation/generate/route.ts`: Same pattern as frontier. `strategy` variable is in scope at the latency recording point.
- `getTelemetryTokenErrorsCounter` call sites: `lib/otel/token.ts:20` (active) — not removed per AC-4 descope decision.
- Contract inventory: No routes changed, no `data-testid` attributes changed, no accessibility contracts changed.

## Implementation Decisions (Tech Lead Owned)

**Decision 1: Histogram naming — separate per-route vs. shared with `route` dimension.**
Options considered: (A) single `generation_upstream_latency` histogram with `route` dimension; (B) separate `frontier_generate.upstream_latency` and `adaptation_generate.upstream_latency` histograms.
**Chosen: Option B (separate per-route histograms).** Consistent with existing counter naming convention (`frontier_generate.requests`, `frontier_generate.fallbacks`, `adaptation_generate.requests`, `adaptation_generate.fallbacks`). Each route's metrics are fully namespaced independently.

**Decision 2: Latency recording position in generation routes.**
The CR specifies "after `upstreamResponse` is obtained and before the streaming relay begins." The notes further specify "success path leading to streaming." Non-OK HTTP responses and wrong content-type responses are fallback paths and do NOT record latency.
**Chosen: Record immediately before `streamingActive = true`.** Timer starts immediately before the inner `try { upstreamResponse = await fetch(...) }` block. Recording happens after all fallback checks pass, just before `createSseRelayStream`. Timed-out/connection-failed paths (caught in the inner catch) do not record — no timer reference is passed into the catch block.

**Decision 3: ADR requirement.**
The proxy span removal is a documented design decision (security/control boundary, no parent trace context, metrics+logs sufficient). Decision test: this is not introducing a new top-level concept — it removes inappropriate use of an existing primitive. The rationale is documented in CR-023 itself.
**Chosen: No ADR.** The CR artifact is the permanent record of this design decision.

**Decision 4: Test file delegation.**
The proxy integration test updates are mechanically caused by the proxy route span removal (Backend scope). The BA handoff explicitly states "The Backend sub-agent must update these tests to remove span assertions. This is expected scope, not a deviation."
**Chosen: Delegate proxy test updates to Backend agent explicitly.**

## Critical Assumptions

- `safeMetric` is exported from `lib/otel/metrics.ts` — confirmed at line 20.
- `performance.now()` is available in the Next.js API route runtime — confirmed by existing usage in both generation routes and the proxy route.
- `strategy` variable is in scope at the latency recording point in the adaptation route — confirmed: `const { prompt, strategy } = parsed.data;` is declared before the fetch block.
- No live API key is required for most changes — metric wrapping, span removal, and histogram addition are all testable without live credentials (existing fallback-path coverage in test suite).

## Proposed Changes

### `lib/otel/metrics.ts`
Add two new histogram module variables and getter functions:
- `let frontierGenerateUpstreamLatency: Histogram | null = null;`
- `let adaptationGenerateUpstreamLatency: Histogram | null = null;`
- `getFrontierGenerateUpstreamLatencyHistogram()` → metric name `frontier_generate.upstream_latency`, unit `ms`
- `getAdaptationGenerateUpstreamLatencyHistogram()` → metric name `adaptation_generate.upstream_latency`, unit `ms`

### `app/api/otel/trace/route.ts`
1. Remove imports: `SpanStatusCode`, `SpanKind` from `@opentelemetry/api`; `getTracer` from `@/lib/otel/tracing`
2. Add `safeMetric` to the `@/lib/otel/metrics` import
3. Remove `const tracer = getTracer();` and the `tracer.startActiveSpan(...)` wrapper — flatten the handler body
4. Remove `const startTime = performance.now();` (only used by `logger.info` being removed)
5. Wrap all metric calls in `safeMetric()`:
   - `getOtelProxyRequestsCounter().add(1)`
   - All `getOtelProxyErrorsCounter().add(1, {...})` calls (5 occurrences)
   - `getOtelProxyRequestSizeHistogram().record(...)`
   - `getOtelProxyUpstreamLatencyHistogram().record(...)`
6. Remove all `span.*` calls: `setAttribute`, `setStatus`, `addEvent`, `recordException`, `end`
7. Remove `logger.info(...)` on success path (line 144-147)
8. Remove `span.end()` from `finally` block; the `clearTimeout(timeout)` remains

### `__tests__/integration/otel-proxy.test.ts`
1. Remove `mockSpan` object and `mockTracer` object declarations
2. Remove `jest.mock('@/lib/otel/tracing', ...)` block
3. Add `safeMetric: (fn: () => void) => fn()` to the `@/lib/otel/metrics` mock
4. Remove span assertions from each test case:
   - Happy path: remove `mockTracer.startActiveSpan` assertion, `mockSpan.setStatus` assertion, `mockSpan.end` assertion
   - 401 missing token: remove `mockTracer.startActiveSpan` not-called assertion
   - 413 content-length: remove `mockSpan.setStatus` ERROR assertion
   - 500 upstream: remove `mockSpan.setStatus` ERROR assertion
   - Connection error: remove `mockSpan.recordException` assertion
5. All HTTP status, metrics counter, and fetch assertions remain unchanged

### `app/api/frontier/base-generate/route.ts`
1. Add import: `getFrontierGenerateUpstreamLatencyHistogram` from `@/lib/otel/metrics`
2. Declare `const upstreamFetchStart = performance.now();` immediately before the inner try block that calls `fetch()`
3. After all fallback checks pass (after content-type check), immediately before `streamingActive = true`, add:
   ```ts
   safeMetric(() => getFrontierGenerateUpstreamLatencyHistogram().record(
       performance.now() - upstreamFetchStart,
       { route: ROUTE_PATH }
   ));
   ```

### `app/api/adaptation/generate/route.ts`
1. Add import: `getAdaptationGenerateUpstreamLatencyHistogram` from `@/lib/otel/metrics`
2. Declare `const upstreamFetchStart = performance.now();` immediately before the inner try block that calls `fetch()`
3. After all fallback checks pass (after content-type check), immediately before `streamingActive = true`, add:
   ```ts
   safeMetric(() => getAdaptationGenerateUpstreamLatencyHistogram().record(
       performance.now() - upstreamFetchStart,
       { strategy }
   ));
   ```

## Contract Delta Assessment

No contract changes — backend-only scope. No route paths, `data-testid` attributes, API response shapes, or accessibility semantics are changed. Testing handoff is **not required** per the workflow Testing Handoff Trigger Matrix.

## Architectural Invariants Check

- [x] **Observability Safety**: `safeMetric()` wrapping on all metric calls in proxy route directly enforces `architecture.md` invariant — "Telemetry must never block, crash, or degrade user-facing functionality."
- [x] **Security Boundaries**: No changes to auth logic, CSP, or payload validation. Proxy security rejection paths (401, 413, 415, 400, 503) preserved unchanged.
- [x] **Telemetry failure boundary**: The proxy route IS the failure boundary. Removing the span and adding `safeMetric()` strengthens this — a metric instrument failure can no longer crash the handler.

## Delegation & Execution Order

| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | Backend | All implementation: metrics.ts additions → proxy route refactor → proxy test cleanup → generation route latency additions |

**Single sub-agent, sequential within session** (as BA suggested). All changes are Backend-domain. Test updates are explicitly delegated to Backend.

## Delegation Graph

- **Execution Mode**: Sequential (single sub-agent)
- **Dependency Map**: `lib/otel/metrics.ts` histogram getters must exist before the generation route files import them. Backend should complete metrics.ts changes first within their session.
- **Handoff Batch Plan**: Single handoff to Backend. No follow-up handoffs.
- **Final Verification Owner**: Backend agent runs all quality gates: `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`.

## Operational Checklist

- [x] **Environment**: No hardcoded values. Metric names follow existing convention.
- [x] **Observability**: Changes improve observability correctness — no signal loss, two new signals added.
- [x] **Artifacts**: No new files requiring `.gitignore`. No new env vars.
- [x] **Rollback**: Revert the 5 modified files. Changes are isolated to observability instrumentation with no functional behavior impact.

## Definition of Done (Technical)

- [ ] AC-1: `grep -n "startActiveSpan\|SpanKind\|SpanStatusCode\|getTracer" app/api/otel/trace/route.ts` returns no matches
- [ ] AC-2: All metric instrument calls in `app/api/otel/trace/route.ts` are wrapped in `safeMetric()` — code review confirms no bare metric calls
- [ ] AC-3: `grep -n "logger.info" app/api/otel/trace/route.ts` returns no matches
- [ ] AC-4: **DESCOPED** — `getTelemetryTokenErrorsCounter` is a live signal in `lib/otel/token.ts`; not removed
- [ ] AC-5: `getFrontierGenerateUpstreamLatencyHistogram().record(...)` call exists in `app/api/frontier/base-generate/route.ts`, positioned after all fallback checks, immediately before `streamingActive = true`
- [ ] AC-6: `getAdaptationGenerateUpstreamLatencyHistogram().record(..., { strategy })` call exists in `app/api/adaptation/generate/route.ts`, same positioning requirement, includes `strategy` dimension
- [ ] AC-7: `pnpm test` passes, `pnpm lint` passes, `pnpm exec tsc --noEmit` passes, `pnpm build` passes
