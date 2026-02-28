# CR-023: Purpose-Driven Observability Refinement

## Status
`Done`

## Business Context
**User Need:** The four API routes each have different purposes, but their observability instrumentation was not designed with those purposes in mind. Two concrete bug classes and one design-level gap were identified in an audit:

1. **Bug — crash risk**: The proxy route (`/api/otel/trace`) calls four metric instruments without `safeMetric()` wrapping. Every other instrumented route wraps metric calls safely. A metric instrument failure in the proxy will throw bare and can affect request handling — the opposite of the telemetry failure boundary invariant stated in `architecture.md`.

2. **Bug — dead code** *(BA analysis error — see Notes)*: `getTelemetryTokenErrorsCounter()` was assessed as never called. This was incorrect — the counter is a live signal in `lib/otel/token.ts:20`. AC-4 was descoped before implementation. See Notes.

3. **Design gap — wrong primitive for the proxy**: The proxy route creates a server-side span for every telemetry upload. The proxy's purpose is security/control (gate-keeping, payload enforcement, upstream health). It has no parent trace context from clients (telemetry uploads do not carry trace propagation headers). Every proxy span is a disconnected root span. The metrics and logs already cover all operational signals (volume, error rates, payload size, upstream latency). The span adds trace volume with no proportional diagnostic value — "traces about traces" with nothing to link to.

4. **Design gap — missing latency signal on the high-value paths**: The generation routes (`/api/frontier/base-generate`, `/api/adaptation/generate`) call external AI providers — the most latency-variable and failure-prone operations in the system. Neither route records upstream latency. The proxy route (lower stakes, stable infrastructure target) has an upstream latency histogram; the AI provider calls (higher stakes, external SLA dependency) do not. This is inverted priority.

**Expected Value:**
- Proxy route is robustly instrumented with the right primitives: metrics + logs with `safeMetric()` safety, no span noise.
- Metrics library is clean: no dead definitions.
- Generation routes gain the most actionable latency signal in the system: how long does the AI provider actually take, and does it vary by strategy?
- The codebase becomes a more accurate reference implementation: each route demonstrates observability choices matched to its operational purpose.

**Execution Mode:** Standard

## Functional Requirements

### 1. Proxy Route — Remove Span, Fix Safety, Remove Noise
1. Remove `tracer.startActiveSpan()` and all span-related code from `app/api/otel/trace/route.ts`. This includes: all span attribute sets, span event adds, span status sets, `span.end()` calls, and any `SpanKind` / `SpanStatusCode` / `getTracer` imports that exist solely for the span.
2. Wrap all four metric instrument calls in the proxy route with `safeMetric()` — consistent with every other instrumented route in the codebase.
3. Remove `logger.info(...)` on the success path from the proxy route. The request counter already captures volume. Success logging at `info` level on a high-frequency infrastructure route is noise. Error- and warn-level logging for security rejections and upstream failures is preserved unchanged.

### 2. Metrics Library — Remove Dead Definition
4. Remove `getTelemetryTokenErrorsCounter()` and its backing `telemetryTokenErrors` module-level variable from `lib/otel/metrics.ts`. There is no error path in the telemetry-token route to count. No call site exists anywhere in the codebase.

### 3. Generation Routes — Add Upstream Latency Histograms
5. Record upstream latency (in milliseconds) in `app/api/frontier/base-generate/route.ts` after the AI provider `fetch()` completes on the success path (i.e., after `upstreamResponse` is obtained and before the streaming relay begins). Fallback paths where no upstream call completes do not record latency.
6. Record upstream latency (in milliseconds) in `app/api/adaptation/generate/route.ts` after the AI provider `fetch()` completes on the success path. Include `strategy` as a dimension on the recorded value so latency can be broken down per strategy. Fallback paths without a completed upstream call do not record latency.
7. Add the necessary histogram getter(s) to `lib/otel/metrics.ts` to support items 5–6. Whether to use a shared histogram with a `route` dimension or separate per-route histograms is a Tech Lead implementation decision.

## Non-Functional Requirements
- **Safety**: Metric calls must never crash a request handler — `safeMetric()` wrapping is mandatory for all metric calls across all routes. This CR enforces this on the proxy route; the generation routes already comply.
- **Telemetry failure boundary**: Per `architecture.md`, telemetry failures must never crash or degrade user-facing functionality. The proxy route's metric safety fix directly enforces this invariant.
- **No behavioral change**: This CR makes no changes to any API response shape, HTTP status codes, or fallback logic. All existing functional behavior is preserved.
- **No new npm packages**: All required OTel histogram infrastructure (`Histogram`, `getMeter()`) already exists in `lib/otel/metrics.ts`.

## System Constraints & Invariants
- **Constraint Mapping**:
  - `architecture.md` (Observability Safety): "Telemetry must never block, crash, or degrade user-facing functionality." The `safeMetric()` wrapping fix directly enforces this.
  - `tooling-standard.md`: TypeScript strict mode, ESLint, Prettier — all must remain passing.
  - `technical-context.md`: No route paths, `data-testid` contracts, or API response contracts are changed.
- **Design Intent**: This is an observability-only cleanup. No functional logic changes. No new routes. No API contract changes. The only user-visible effect is the absence of proxy spans from the trace store — which is the intended outcome.
- **Preserved logging**: Error- and warn-level logs in the proxy route (oversized payload rejection, misconfiguration, upstream errors) are intentional security/operational signals and must not be removed.

## Acceptance Criteria
- [x] AC-1: `app/api/otel/trace/route.ts` contains no `startActiveSpan`, `SpanKind`, `SpanStatusCode`, or `getTracer` usage. Verifiable: `grep -n "startActiveSpan\|SpanKind\|SpanStatusCode\|getTracer" app/api/otel/trace/route.ts` returns no matches. — Verified: BA independent re-read of route.ts lines 1–13 (imports) and full file body; no `@opentelemetry/api` span primitives present.
- [x] AC-2: All metric instrument calls in `app/api/otel/trace/route.ts` are wrapped in `safeMetric()`. — Verified: BA independent re-read of route.ts; 11 metric calls at lines 34, 44, 53, 60, 70, 73, 82, 101, 106, 113, 118 — all inside `safeMetric(() => ...)`, no bare calls.
- [x] AC-3: `app/api/otel/trace/route.ts` contains no `logger.info(...)` call. Error- and warn-level logger calls remain present. — Verified: BA independent re-read; logger calls at lines 45 (warn), 61 (error), 71 (warn), 114 (error), 119 (error). No `logger.info`.
- [x] AC-4: **DESCOPED before implementation** — `getTelemetryTokenErrorsCounter` confirmed live in `lib/otel/token.ts:20`; counter retained. BA analysis error (checked route file only, not delegated utility). Not a deviation — pre-planning discovery.
- [x] AC-5: A call to a frontier upstream latency histogram recorder exists in `app/api/frontier/base-generate/route.ts`, positioned after the AI provider `fetch()` succeeds and before the streaming relay begins. The recorded value is the elapsed milliseconds of the upstream call. — Verified: source audit via system-supplied diff; `upstreamFetchStart` at line 226, `getFrontierGenerateUpstreamLatencyHistogram().record(performance.now() - upstreamFetchStart, { route: ROUTE_PATH })` at lines 322–325, after all fallback checks, before `streamingActive = true` at line 328.
- [x] AC-6: A call to an adaptation upstream latency histogram recorder exists in `app/api/adaptation/generate/route.ts`, positioned after the AI provider `fetch()` succeeds and before the streaming relay begins. The call includes `strategy` as a label/dimension. — Verified: source audit via system-supplied diff; `upstreamFetchStart` at line 222, `getAdaptationGenerateUpstreamLatencyHistogram().record(performance.now() - upstreamFetchStart, { strategy })` at lines 319–322; `strategy` dimension confirmed.
- [x] AC-7: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` all pass. — Verified: TL specific command outputs (none marked assumed); tsc → PASS; targeted lint on all 4 modified files → PASS (per-domain Backend verification, `tooling-standard.md`); `pnpm test` → 165 passed/0 failed; `pnpm build` → PASS.

## Verification Mapping
- **Development Proof**:
  - AC-1, AC-2, AC-3: Code review of `app/api/otel/trace/route.ts` diff — confirm span removal, safeMetric wrapping, no info log.
  - AC-4: Code review of `lib/otel/metrics.ts` diff — confirm dead getter and variable removed.
  - AC-5, AC-6: Code review of both generation route diffs — confirm latency recording position and dimensions.
  - AC-7: Full quality gate run.
- **AC Evidence Format (for closure)**:
  - `[x] <AC text> — Verified: <file-or-command>, <result>`
- **User Validation**: The primary signal is code review — confirm each route has observability matched to its purpose. Secondary: confirming `pnpm test` passes (existing proxy route tests may need updating to remove span assertions).

## Baseline Failure Snapshot
N/A — this is a purposeful refinement, not a regression fix. No failing tests being corrected.

## Post-Fix Validation Snapshot (Filled at Closure)
- **Date**: 2026-02-28
- **Command(s)**: `pnpm exec tsc --noEmit`, `pnpm lint --file app/api/otel/trace/route.ts --file lib/otel/metrics.ts --file app/api/frontier/base-generate/route.ts --file app/api/adaptation/generate/route.ts`, `pnpm test`, `pnpm build`
- **Execution Mode**: local-equivalent/unsandboxed (Node v20.20.0 via nvm)
- **Observed Result**: All pass — 18 suites, 165 tests (0 failed); tsc exit 0; targeted lint clean; build clean. Pre-existing `require-in-the-middle` warning and `next lint` CLI deprecation warning unrelated to CR scope.

## Dependencies
- Blocks: None
- Blocked by: None

## Notes
- **Proxy route test impact**: Existing unit tests for `app/api/otel/trace/route.ts` may currently assert on span behavior. The Backend sub-agent must update these tests to remove span assertions. This is expected scope, not a deviation.
- **Metrics.ts import cleanup**: Any file that imports `getTelemetryTokenErrorsCounter` (if any) must have that import removed. Audit with `grep -rn "getTelemetryTokenErrorsCounter"` before removal.
- **Latency recording scope**: Upstream latency must only be recorded when the `fetch()` actually completes with a response (success path leading to streaming). Timed-out or connection-failed paths already handle their fallback via error counters and span attributes — do not double-count with a latency record on an aborted call.
- **No span on proxy is intentional**: The proxy route deliberately has no span after this CR. This is a documented design decision: the proxy is a security/control boundary with no parent trace context. Its operational health is fully covered by its metrics and structured logs.
- **BA analysis correction — AC-4**: The BA original claim that `getTelemetryTokenErrorsCounter` was "never called anywhere" was incorrect. The actual call site is `lib/otel/token.ts:20`, inside `generateTelemetryToken()`, which fires when `TELEMETRY_SECRET` is not set — a legitimate configuration error signal. The BA checked the telemetry-token route file only and did not inspect the utility library it delegates to. TL correctly identified this during pre-planning and descoped AC-4 before implementation. The counter is a live, valid operational signal and should remain.

## Technical Analysis (filled by Tech Lead — required for M/L/H complexity; optional for [S])
**Complexity:**
**Estimated Effort:**
**Affected Systems:**
**Implementation Approach:**

## Deviations Accepted (filled at closure by BA)
- **Commented-out `logger.warn` line removed from proxy route** — Pre-existing commented-out block removed as part of span cleanup. No behavioral impact (line was inactive). No AC intent change, no contract change. Severity: **Minor**. Accepted.
- **Scope extension: test mock updates for new histogram getters** (`__tests__/api/frontier-base-generate.test.ts`, `__tests__/api/adaptation-generate.test.ts`) — Adding histogram mock entries to keep tests passing after new getter additions. Inherent consequence of adding metric getters to routes whose tests use pass-through `safeMetric` mocks. No behavioral assertion changes. Severity: **Minor**. Accepted.
