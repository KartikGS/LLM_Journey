# Handoff: Tech Lead → Backend Agent

## Subject
`CR-023 — Purpose-Driven Observability Refinement`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing Backend handoff context: `CR-022`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-022-plan.md` ✓
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-022-adaptation-page-upgrade-and-cleanup.md` status is `Done` ✓
- Result: replacement allowed for new CR context.

---

## Exact Artifact Paths (Mandatory)
- Requirement: `agent-docs/requirements/CR-023-purpose-driven-observability-refinement.md`
- Plan: `agent-docs/plans/CR-023-plan.md`
- Upstream report (if sequential): N/A — single agent
- Report back to: `agent-docs/conversations/backend-to-tech-lead.md`

---

## Objective

Correct three observability issues across four API routes:

1. **Proxy route** (`app/api/otel/trace/route.ts`): Remove the span entirely (no parent trace context; metrics + logs fully cover all signals). Wrap all bare metric calls in `safeMetric()` (crash-risk fix enforcing the architecture.md Observability Safety invariant). Remove the success-path `logger.info` call (noise on a high-frequency infrastructure route).

2. **Generation routes** (`app/api/frontier/base-generate/route.ts`, `app/api/adaptation/generate/route.ts`): Record upstream AI provider latency (in milliseconds) on the streaming success path. Add supporting histogram getters to `lib/otel/metrics.ts`.

3. **Proxy integration test** (`__tests__/integration/otel-proxy.test.ts`): Remove span-related mocks and assertions made redundant by the span removal. Add `safeMetric` to the metrics mock.

**AC-4 from the CR is descoped**: `getTelemetryTokenErrorsCounter` is an active signal in `lib/otel/token.ts` — do not touch it.

---

## Rationale (Why)

The proxy is a security/control boundary. It gates, validates, and forwards telemetry payloads. It has no parent trace context — browser clients do not propagate trace headers in telemetry uploads. Every proxy span is a disconnected root span: trace volume with nothing to link to. Metrics and structured logs already cover all operational signals (volume, error rates, payload size, upstream latency). The span is instrumenting the infrastructure, not a product operation — removing it is a deliberate design decision, documented in the CR.

The `safeMetric()` gap is a concrete crash risk. All other instrumented routes in this codebase already use `safeMetric()`. The proxy was the only exception. A metric instrument failure in the proxy (the telemetry failure boundary itself) currently throws bare and can affect request handling — directly violating the invariant in `architecture.md`: "Telemetry must never block, crash, or degrade user-facing functionality."

The generation routes call external AI providers — the most latency-variable and failure-prone operations in the system. The proxy (stable infrastructure target) has a latency histogram; the AI provider calls do not. This is inverted priority. Adding upstream latency histograms to the generation routes provides the most actionable latency signal in the system.

---

## Known Environmental Caveats

- **Node.js runtime**: System runtime may be below `>=20.x`. Run `node -v` first. If below 20.x, activate via `nvm use 20`. If nvm unavailable, classify as `environmental` in your report.
- **pnpm**: Use `pnpm` exclusively. Never `npm` or `yarn`.
- **Live-path availability**: `no` — API key is not required. All metric/span changes are testable without live credentials. The existing fallback-path test coverage is sufficient.

---

## Constraints

### Technical Constraints
- **No new npm packages** — all required OTel histogram infrastructure (`Histogram`, `getMeter()`) already exists in `lib/otel/metrics.ts`.
- **TypeScript strict mode** must remain satisfied — `pnpm exec tsc --noEmit` must pass.
- **Error- and warn-level logs in the proxy route must not be removed** — they are intentional security/operational signals.
- **Upstream latency must only be recorded when `fetch()` completes with a response on the streaming success path** — timed-out or connection-failed paths do not record latency.
- **AC-4 is descoped**: Do not touch `getTelemetryTokenErrorsCounter` or its backing variable in `lib/otel/metrics.ts`. Do not touch `lib/otel/token.ts`.
- **No API response contracts, `data-testid` attributes, or route paths are changed.**

### Ownership Constraints
- **Files in scope** (explicit delegation):
  - `lib/otel/metrics.ts`
  - `app/api/otel/trace/route.ts`
  - `__tests__/integration/otel-proxy.test.ts` — explicitly delegated for span-assertion cleanup
  - `app/api/frontier/base-generate/route.ts`
  - `app/api/adaptation/generate/route.ts`
- **Do NOT modify**: Any frontend component, any other test file, `lib/otel/token.ts`, any config file.

---

## Assumptions To Validate (Mandatory)

- **Live-path availability**: `no` — API key not required for this CR.
- Assumption 1: `safeMetric` is exported from `lib/otel/metrics.ts`. Confirmed during TL discovery (line 20). Verify before writing proxy route import.
- Assumption 2: `performance.now()` is available in the Next.js API route runtime. Confirmed by existing usage in both generation routes and the proxy route. No additional import required.
- Assumption 3: `strategy` variable is in scope at the latency recording point in the adaptation route. Confirmed: `const { prompt, strategy } = parsed.data;` is declared before the fetch block.
- Assumption 4: The proxy integration test mock for `@/lib/otel/metrics` does NOT currently include `safeMetric`. Confirmed during TL discovery — must be added.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

- If you discover any import or call site of `getTelemetryTokenErrorsCounter` beyond what is already known (`lib/otel/token.ts:20`), flag it before proceeding.
- If any existing test in `__tests__/integration/otel-proxy.test.ts` asserts on span behavior that is not covered by the removal list in this handoff, flag it rather than silently removing it.
- Do not add safeMetric wrapping to the generation routes — they already comply. Flag if you find any unwrapped metric calls in those files.

---

## Scope: Files to Modify

### 1. `lib/otel/metrics.ts` — Add histogram getters (do this first)

Add two new module-level variables and their getter functions, following the established pattern exactly. Place them in the "Pre-defined metrics for frontier/adaptation generation" sections:

```ts
// Pre-defined metrics for frontier generation latency
let frontierGenerateUpstreamLatency: Histogram | null = null;

// Pre-defined metrics for adaptation generation latency
let adaptationGenerateUpstreamLatency: Histogram | null = null;
```

```ts
/**
 * Histogram for frontier base-generate upstream AI provider latency
 */
export function getFrontierGenerateUpstreamLatencyHistogram(): Histogram {
    if (!frontierGenerateUpstreamLatency) {
        frontierGenerateUpstreamLatency = getMeter().createHistogram('frontier_generate.upstream_latency', {
            description: 'Upstream AI provider latency for frontier base-generate requests in milliseconds',
            unit: 'ms',
        });
    }
    return frontierGenerateUpstreamLatency;
}

/**
 * Histogram for adaptation generate upstream AI provider latency
 */
export function getAdaptationGenerateUpstreamLatencyHistogram(): Histogram {
    if (!adaptationGenerateUpstreamLatency) {
        adaptationGenerateUpstreamLatency = getMeter().createHistogram('adaptation_generate.upstream_latency', {
            description: 'Upstream AI provider latency for adaptation generate requests in milliseconds',
            unit: 'ms',
        });
    }
    return adaptationGenerateUpstreamLatency;
}
```

`Histogram` is already imported at line 1. No new imports needed in this file.

---

### 2. `app/api/otel/trace/route.ts` — Proxy route refactor

#### 2a. Remove imports
From `@opentelemetry/api` import: remove `SpanStatusCode`, `SpanKind`. The `metrics` import (if any) is not present in this file — nothing to remove there.
Remove the entire `import { getTracer } from '@/lib/otel/tracing';` line.

#### 2b. Update metrics import
Add `safeMetric` to the existing `@/lib/otel/metrics` import block:
```ts
import {
    safeMetric,
    getOtelProxyRequestsCounter,
    getOtelProxyRequestSizeHistogram,
    getOtelProxyUpstreamLatencyHistogram,
    getOtelProxyErrorsCounter,
} from '@/lib/otel/metrics';
```

#### 2c. Refactor POST handler
Remove `const tracer = getTracer();` and the entire `tracer.startActiveSpan('otel_proxy.forward_traces', { kind: SpanKind.INTERNAL }, async (span) => { ... })` wrapper. Flatten the handler body so the `try/catch/finally` block is at the top level of the `POST` function.

Remove `const startTime = performance.now();` — it is only used by the `logger.info` success call being removed.

Wrap ALL metric instrument calls in `safeMetric()`. There are approximately 10 call sites across the handler:

| Current (bare) | After (safeMetric-wrapped) |
|---|---|
| `getOtelProxyRequestsCounter().add(1)` | `safeMetric(() => getOtelProxyRequestsCounter().add(1))` |
| `getOtelProxyErrorsCounter().add(1, { error_type: 'payload_too_large' })` | `safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'payload_too_large' }))` |
| `getOtelProxyErrorsCounter().add(1, { error_type: 'empty_payload' })` | `safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'empty_payload' }))` |
| `getOtelProxyErrorsCounter().add(1, { error_type: 'misconfigured' })` | `safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'misconfigured' }))` |
| `getOtelProxyErrorsCounter().add(1, { error_type: 'payload_too_large' })` (stream) | `safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'payload_too_large' }))` |
| `getOtelProxyErrorsCounter().add(1, { error_type: 'body_timeout' })` | `safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'body_timeout' }))` |
| `getOtelProxyRequestSizeHistogram().record(body.byteLength, {...})` | `safeMetric(() => getOtelProxyRequestSizeHistogram().record(body.byteLength, {...}))` |
| `getOtelProxyUpstreamLatencyHistogram().record(upstreamLatency, {...})` | `safeMetric(() => getOtelProxyUpstreamLatencyHistogram().record(upstreamLatency, {...}))` |
| `getOtelProxyErrorsCounter().add(1, { error_type: 'upstream_error' })` | `safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'upstream_error' }))` |
| `getOtelProxyErrorsCounter().add(1, { error_type: 'upstream_timeout' })` | `safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'upstream_timeout' }))` |
| `getOtelProxyErrorsCounter().add(1, { error_type: 'connection_error' })` | `safeMetric(() => getOtelProxyErrorsCounter().add(1, { error_type: 'connection_error' }))` |

Remove ALL `span.*` calls:
- All `span.setAttribute(...)` calls
- All `span.setStatus(...)` calls
- All `span.addEvent(...)` calls
- `span.recordException(err as Error)`
- `span.end()` (in `finally` block)

Remove the success-path `logger.info(...)` call only (lines approximately 144–147: `logger.info({ latencyMs: ... }, 'OTEL proxy: Traces forwarded successfully')`). Preserve all `logger.warn(...)` and `logger.error(...)` calls — they are security/operational signals.

The `finally` block should retain only `clearTimeout(timeout)` after `span.end()` is removed.

The `upstreamStart` / `upstreamLatency` variables for the upstream latency histogram **remain** — they are still used by `getOtelProxyUpstreamLatencyHistogram().record(upstreamLatency, {...})`.

---

### 3. `__tests__/integration/otel-proxy.test.ts` — Span assertion cleanup

Read the file before editing (required by Write-Before-Read constraint).

#### 3a. Remove tracing mock and span mocks
Remove the `mockSpan` object declaration block (approximately lines 40–47).
Remove the `mockTracer` object declaration block (approximately lines 49–53).
Remove the entire `jest.mock('@/lib/otel/tracing', ...)` block (approximately lines 56–58).

#### 3b. Add `safeMetric` to the metrics mock
The current `jest.mock('@/lib/otel/metrics', ...)` block does not include `safeMetric`. Add it as a pass-through:
```ts
jest.mock('@/lib/otel/metrics', () => ({
    safeMetric: (fn: () => void) => fn(),
    getOtelProxyRequestsCounter: jest.fn(() => mockRequestsCounter),
    getOtelProxyErrorsCounter: jest.fn(() => mockErrorsCounter),
    getOtelProxyRequestSizeHistogram: jest.fn(() => mockRequestSizeHistogram),
    getOtelProxyUpstreamLatencyHistogram: jest.fn(() => mockUpstreamLatencyHistogram),
}));
```

#### 3c. Remove span assertions from each test case

**Happy path test** (section 1): Remove the tracing assertions block:
```ts
// Remove these three assertions:
expect(mockTracer.startActiveSpan).toHaveBeenCalledWith(
    'otel_proxy.forward_traces',
    expect.anything(),
    expect.any(Function)
);
expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: 1 }); // OK
expect(mockSpan.end).toHaveBeenCalled();
```
All other assertions in the happy path (HTTP 202, fetch called, metrics recorded) remain.

**401 missing token test**: Remove:
```ts
expect(mockTracer.startActiveSpan).not.toHaveBeenCalled();
```

**413 content-length test**: Remove:
```ts
expect(mockSpan.setStatus).toHaveBeenCalledWith(expect.objectContaining({ code: 2 })); // ERROR
```

**500 upstream test**: Remove:
```ts
expect(mockSpan.setStatus).toHaveBeenCalledWith(
    expect.objectContaining({
        code: 2,
        message: 'Upstream returned 500'
    })
);
```

**Connection error test**: Remove:
```ts
expect(mockSpan.recordException).toHaveBeenCalled();
```

All HTTP status assertions, metrics counter assertions, and fetch call assertions in all test cases remain unchanged.

---

### 4. `app/api/frontier/base-generate/route.ts` — Add upstream latency recording

#### 4a. Add import
Add `getFrontierGenerateUpstreamLatencyHistogram` to the existing `@/lib/otel/metrics` import:
```ts
import {
    safeMetric,
    getFrontierGenerateRequestsCounter,
    getFrontierGenerateFallbacksCounter,
    getFrontierGenerateUpstreamLatencyHistogram,
} from '@/lib/otel/metrics';
```

#### 4b. Add timer start
Immediately before the inner try block that calls `fetch()` (the block beginning `let upstreamResponse: Response; try {`), declare:
```ts
const upstreamFetchStart = performance.now();
```

#### 4c. Add latency recording on streaming success path
After all fallback checks pass (after the `!contentType.includes('text/event-stream')` check that returns a fallback), and immediately before `streamingActive = true`, add:
```ts
safeMetric(() => getFrontierGenerateUpstreamLatencyHistogram().record(
    performance.now() - upstreamFetchStart,
    { route: ROUTE_PATH }
));
```

The insertion point is at the start of the streaming success block, before `span.setAttribute('frontier.mode', 'live')`.

---

### 5. `app/api/adaptation/generate/route.ts` — Add upstream latency recording

#### 5a. Add import
Add `getAdaptationGenerateUpstreamLatencyHistogram` to the existing `@/lib/otel/metrics` import:
```ts
import {
    safeMetric,
    getAdaptationGenerateRequestsCounter,
    getAdaptationGenerateFallbacksCounter,
    getAdaptationGenerateUpstreamLatencyHistogram,
} from '@/lib/otel/metrics';
```

#### 5b. Add timer start
Immediately before the inner try block that calls `fetch()`, declare:
```ts
const upstreamFetchStart = performance.now();
```

#### 5c. Add latency recording on streaming success path
After all fallback checks pass (after the `!contentType.includes('text/event-stream')` check), immediately before `streamingActive = true`, add:
```ts
safeMetric(() => getAdaptationGenerateUpstreamLatencyHistogram().record(
    performance.now() - upstreamFetchStart,
    { strategy }
));
```

The `strategy` variable is already in scope at this point from `const { prompt, strategy } = parsed.data;`.

---

## Definition of Done

- [ ] AC-1: `grep -n "startActiveSpan\|SpanKind\|SpanStatusCode\|getTracer" app/api/otel/trace/route.ts` returns no matches
- [ ] AC-2: All metric instrument calls in `app/api/otel/trace/route.ts` are wrapped in `safeMetric()` — no bare metric calls outside `safeMetric()`
- [ ] AC-3: `grep -n "logger.info" app/api/otel/trace/route.ts` returns no matches
- [ ] AC-4: **DESCOPED** — not verified, not touched
- [ ] AC-5: `getFrontierGenerateUpstreamLatencyHistogram().record(...)` call exists in `app/api/frontier/base-generate/route.ts`, positioned immediately before `streamingActive = true`
- [ ] AC-6: `getAdaptationGenerateUpstreamLatencyHistogram().record(..., { strategy })` call exists in `app/api/adaptation/generate/route.ts`, positioned immediately before `streamingActive = true`, includes `strategy` dimension
- [ ] AC-7: `pnpm test` passes, `pnpm lint` passes, `pnpm exec tsc --noEmit` passes, `pnpm build` passes
- [ ] No `span.*` calls, `getTracer`, `SpanKind`, or `SpanStatusCode` remain in `app/api/otel/trace/route.ts`
- [ ] No debug artifacts (console.log, commented-out blocks, TODO markers) in any modified file

---

## Clarification Loop (Mandatory)

Before implementation, Backend posts preflight note in `agent-docs/conversations/backend-to-tech-lead.md` covering:
- Assumptions confirmed (or any that failed validation)
- Adjacent risks not covered by current scope
- Open questions (if any — pause and wait for TL response before implementing if non-trivial)

---

## Verification

Run in sequence. Report each using the Command Evidence Standard:

```
node -v
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

Format for each:
- **Command**: `[exact command]`
- **Scope**: `[full suite | targeted]`
- **Execution Mode**: `[sandboxed | local-equivalent/unsandboxed]`
- **Result**: `[PASS/FAIL + key counts or failure summary]`

AC-1, AC-2, AC-3 verification evidence must include the grep commands from the Definition of Done items with their output.

---

## Execution Checklist (Mandatory)

Before starting:
- [ ] Read this handoff completely
- [ ] Read the plan at `agent-docs/plans/CR-023-plan.md`
- [ ] Read `lib/otel/metrics.ts` before modifying it
- [ ] Read `app/api/otel/trace/route.ts` before modifying it
- [ ] Read `__tests__/integration/otel-proxy.test.ts` before modifying it
- [ ] Read `app/api/frontier/base-generate/route.ts` before modifying it
- [ ] Read `app/api/adaptation/generate/route.ts` before modifying it
- [ ] Write preflight note to `backend-to-tech-lead.md`

Before reporting:
- [ ] All Definition of Done items verified
- [ ] Full quality gate run completed (`pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`)
- [ ] Completion report written to `backend-to-tech-lead.md`

---

## Scope Extension Control

If any feedback expands implementation beyond this handoff scope, mark it `scope extension requested` in your report. Wait for explicit `scope extension approved` before implementing expanded work.

---

## Report Back

Write completion report to `agent-docs/conversations/backend-to-tech-lead.md` using `agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md`.

Status vocabulary: `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`
