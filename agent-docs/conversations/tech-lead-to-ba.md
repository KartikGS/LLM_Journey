# Handoff: Tech Lead -> BA Agent

## Subject
`CR-023 — Purpose-Driven Observability Refinement`

## Status
`verified`

## Pre-Replacement Check (Conversation Freshness)
- Prior content: `CR-022` (`Adaptation Page Upgrade and Cleanup`)
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-022-plan.md` ✓
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-022-adaptation-page-upgrade-and-cleanup.md` status is `Done` ✓
- Result: replacement allowed.

---

## Exact Artifact Paths
- Requirement: `agent-docs/requirements/CR-023-purpose-driven-observability-refinement.md`
- Plan: `agent-docs/plans/CR-023-plan.md`
- Sub-agent report: `agent-docs/conversations/backend-to-tech-lead.md`

---

## Technical Summary

CR-023 delivered three observability correctness fixes across four API routes. All changes are server-side infrastructure only — no API contracts, route paths, `data-testid` attributes, or user-visible behavior changed.

**Proxy route (`app/api/otel/trace/route.ts`):**
- Removed the `startActiveSpan` wrapper and all span-related code (`SpanKind`, `SpanStatusCode`, `getTracer` imports; all `span.setAttribute`, `span.setStatus`, `span.addEvent`, `span.recordException`, `span.end` calls). The proxy is a security/control boundary with no parent trace context — every span was a disconnected root with no diagnostic linking value.
- Wrapped all 11 bare metric instrument calls in `safeMetric()`, enforcing the Observability Safety invariant from `architecture.md`: telemetry failures must never crash request handling.
- Removed the success-path `logger.info` call (noise on a high-frequency infrastructure route). Error- and warn-level log calls preserved unchanged.

**Metrics library (`lib/otel/metrics.ts`):**
- Added `getFrontierGenerateUpstreamLatencyHistogram()` → metric `frontier_generate.upstream_latency` (unit: ms)
- Added `getAdaptationGenerateUpstreamLatencyHistogram()` → metric `adaptation_generate.upstream_latency` (unit: ms)
- `getTelemetryTokenErrorsCounter` preserved — confirmed active call site in `lib/otel/token.ts:20`.

**Generation routes:**
- `app/api/frontier/base-generate/route.ts`: Records upstream AI provider latency (ms) on the streaming success path — after all fallback checks pass, immediately before `streamingActive = true`. Uses `safeMetric()` wrapping.
- `app/api/adaptation/generate/route.ts`: Same pattern, with `strategy` as an additional dimension.

**Test updates (proxy integration test + two generation route unit tests):**
- `__tests__/integration/otel-proxy.test.ts`: Removed `mockSpan`, `mockTracer`, tracing mock block, and all span assertions. Added `safeMetric: (fn) => fn()` to metrics mock.
- `__tests__/api/frontier-base-generate.test.ts` and `__tests__/api/adaptation-generate.test.ts`: Added 1-line histogram getter mock entry each. Required because the test `safeMetric` mock is a pass-through without error handling — unmocked getter calls would throw unhandled TypeErrors. Scope extension approved by user.

**AC-4 descoped (pre-planning):** `getTelemetryTokenErrorsCounter` discovered to be a live signal in `lib/otel/token.ts` — not dead code. Retained as-is.

**Scope boundaries preserved:** No route paths changed. No `data-testid` contracts changed. No API response shapes changed. No new npm packages installed.

---

## Evidence of AC Fulfillment

- [ ] AC-1: `app/api/otel/trace/route.ts` contains no `startActiveSpan`, `SpanKind`, `SpanStatusCode`, or `getTracer` usage — Evidence: `grep -n "startActiveSpan\|SpanKind\|SpanStatusCode\|getTracer" app/api/otel/trace/route.ts` → **0 matches** (TL independently verified).
- [ ] AC-2: All metric instrument calls in `app/api/otel/trace/route.ts` are wrapped in `safeMetric()` — Evidence: Code review of route file: 11 metric calls at lines 34, 44, 53, 60, 70, 73, 82, 101, 106, 113, 118 — all wrapped. No bare calls present.
- [ ] AC-3: `app/api/otel/trace/route.ts` contains no `logger.info(...)` call — Evidence: `grep -n "logger.info" app/api/otel/trace/route.ts` → **0 matches** (TL independently verified).
- [ ] AC-4: **DESCOPED** — `getTelemetryTokenErrorsCounter` is an active signal; retained unchanged.
- [ ] AC-5: `getFrontierGenerateUpstreamLatencyHistogram().record(...)` present in `app/api/frontier/base-generate/route.ts` at lines 324–327, positioned after content-type check (line 305), immediately before `streamingActive = true` (line 330). Timer declared at line 227.
- [ ] AC-6: `getAdaptationGenerateUpstreamLatencyHistogram().record(..., { strategy })` present in `app/api/adaptation/generate/route.ts` at lines 321–324, positioned after content-type check (line 301), immediately before `streamingActive = true` (line 327). `strategy` dimension confirmed.
- [ ] AC-7: All quality gates pass — see Verification Commands below.

---

## Verification Commands

- **Command**: `pnpm exec tsc --noEmit`
- **Scope**: full project
- **Execution Mode**: local-equivalent/unsandboxed (Node v20.20.0 via nvm)
- **Result**: PASS — no TypeScript errors

- **Command**: `pnpm lint --file app/api/otel/trace/route.ts --file lib/otel/metrics.ts --file app/api/frontier/base-generate/route.ts --file app/api/adaptation/generate/route.ts`
- **Scope**: targeted (Backend-owned files)
- **Execution Mode**: local-equivalent/unsandboxed
- **Result**: PASS — no ESLint warnings or errors (pre-existing `next lint` CLI deprecation warning unrelated to CR scope)

- **Command**: `pnpm test`
- **Scope**: full suite (18 suites, 165 tests)
- **Execution Mode**: local-equivalent/unsandboxed
- **Result**: PASS — 165 passed, 0 failed

- **Command**: `pnpm build`
- **Scope**: full production build
- **Execution Mode**: local-equivalent/unsandboxed
- **Result**: PASS — all 7 routes compiled successfully (`require-in-the-middle` critical dependency warning is pre-existing, tracked CR-021)

---

## Failure Classification Summary
- **CR-related**: none
- **Pre-existing**: Worker-process teardown warning during test suite teardown (CR-021). `require-in-the-middle` build warning (CR-021). `next lint` CLI deprecation warning (pre-existing, CR-021).
- **Environmental**: none
- **Non-blocking warning**: none

---

## Adversarial Diff Review

**Proxy route (`app/api/otel/trace/route.ts`):**
- Confirmed: all 11 metric call sites are wrapped in `safeMetric()`. No bare calls remain. TL independently ran grep — 0 matches for `startActiveSpan`, `SpanKind`, `SpanStatusCode`, `getTracer`, and `logger.info`.
- Confirmed: `clearTimeout(timeout)` in `finally` block is preserved. AbortController timeout handling is intact.
- Confirmed: all error classification paths (401, 413, 415, 400, 503, 504, 502) produce the same HTTP status codes as before. No functional behavior changed.
- Confirmed: error- and warn-level logger calls are all present and unchanged.
- Minor deviation: pre-existing commented-out `logger.warn` line removed from proxy route. The DoD explicitly required no debug artifacts (commented-out blocks). No behavioral impact. Classified minor per deviation rubric.

**Generation routes (latency recording):**
- AC-5 position confirmed: `upstreamFetchStart` declared at line 227 (before inner fetch try block). Histogram recording at lines 324–327, after the `!contentType.includes('text/event-stream')` fallback check (line 305), before `streamingActive = true` (line 330). Timeout/connection-error catch block does NOT reference `upstreamFetchStart` — fallback paths correctly excluded.
- AC-6 position confirmed: same structure in adaptation route. `strategy` dimension present. `upstreamFetchStart` declared before inner fetch try block. Histogram recording before `streamingActive = true`.
- Negative Space check: latency is NOT recorded on fallback paths (missing config, timeout/abort, non-OK upstream, wrong content-type). All confirmed by reading the code paths — no histogram record call in any fallback branch.

**`lib/otel/metrics.ts`:**
- Two histogram variables added (lines 47–51). Two getter functions added (lines 183–207). Follow the established lazy-init pattern exactly. Naming consistent with `frontier_generate.*` / `adaptation_generate.*` convention.
- `getTelemetryTokenErrorsCounter` and `telemetryTokenErrors` variable: both present and unchanged ✓

**Test files:**
- Proxy test: `mockSpan`, `mockTracer`, and tracing mock block removed. `safeMetric: (fn) => fn()` added to metrics mock. All behavioral assertions (HTTP status, metric counters, fetch interactions) retained. Confirmed via system-supplied diff.
- Generation test mocks: 1-line histogram mock entries added per test file. No behavioral assertions modified. Scope extension justified — mock `safeMetric` is a pass-through without error handling; unmocked getter calls would throw unhandled TypeErrors in the test environment.

**Residual risks**: none identified.

---

## Technical Retrospective

**Trade-off: Latency recorded on streaming-success path only.** Non-OK HTTP responses and wrong content-type responses do complete the `fetch()` call, but latency is not recorded for them. This is the correct interpretation per the CR spec ("success path leading to streaming"). Fallback outcomes already have error counters and span attributes in the generation routes' own spans. Recording latency only on the streaming path keeps the histogram semantically clean — it measures actual inference operation latency, not failed upstream calls.

**Trade-off: Scope extension for two unit test files.** The extension was necessary and correct (mock `safeMetric` is pass-through without error handling). Predictable consequence pattern: when adding new metric getters to routes whose tests use a pass-through `safeMetric` mock, those test files must be updated. Worth noting for future histogram additions.

---

## Tech Lead Recommendations (Conditional)
- none

---

## Deployment Notes
- No new environment variables. No config changes. No new packages. No API contract changes.
- Proxy route span removal has no observable effect on callers — the proxy never emitted spans that clients depended on (no parent context existed).
- Generation route latency histograms are additive — new metric instruments registered at runtime; no breaking change to existing consumers.
- All 7 routes compiled successfully. All 165 tests pass.

---

## Link to Updated Docs
- Requirement: `agent-docs/requirements/CR-023-purpose-driven-observability-refinement.md`
- Plan: `agent-docs/plans/CR-023-plan.md`
- Backend report: `agent-docs/conversations/backend-to-tech-lead.md`

---

*Report created: 2026-02-28*
*Tech Lead Agent — Single Session (S-class CR)*
