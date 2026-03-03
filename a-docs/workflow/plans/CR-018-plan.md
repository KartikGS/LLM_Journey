# Technical Plan - CR-018: Generation API Hardening Parity

## Technical Analysis

The project applies strong middleware abuse-control (rate limiting + body-size enforcement) and route-level metrics to the OTEL proxy boundary, but neither generation API (`/api/frontier/base-generate`, `/api/adaptation/generate`) has equivalent treatment. Three drift patterns are present:

1. **Logic duplication**: `parseTimeout`, `extractProviderErrorMessage`, `mapProviderFailure`, and `FallbackReasonCode` are copied verbatim between both generation routes.
2. **Missing middleware controls**: `API_CONFIG` in `middleware.ts` has no entries for generation routes. No rate limiting or body-size enforcement applies at the middleware layer.
3. **Missing route-level metrics**: `lib/otel/metrics.ts` has metrics for `otel_proxy.*` and `telemetry_token.*`, but no equivalent counters for generation request volume or fallback outcomes.
4. **Missing contract doc**: `agent-docs/api/adaptation-generate.md` does not exist; `frontier-base-generate.md` exists and is current.

All fixes are backend-only (server lib, middleware, API routes, agent-docs). No route paths, `data-testid`, or accessibility contracts change.

---

## Discovery Findings

### Duplication Inventory (Shared Utility Candidates)

| Function / Type | In `base-generate/route.ts` | In `adaptation/generate/route.ts` | Action |
|---|---|---|---|
| `FallbackReasonCode` type | Lines 26–34 | Lines 44–52 | Extract to shared |
| `parseTimeout(rawTimeout)` | Lines 85–96 | Lines 91–102 | Extract to shared |
| `extractProviderErrorMessage(payload)` | Lines 247–265 | Lines 189–207 | Extract to shared |
| `mapProviderFailure(status, msg)` | Lines 267–296 | Lines 209–238 | Extract to shared |

**Not shared (route-specific divergence retained as-is):**
- `buildProviderRequestBody` (frontier, multi-provider) vs `buildMessages` (adaptation, chat-only)
- `extractProviderOutput` (frontier) vs `extractChatOutput` (adaptation, chat-only)
- `loadFrontierConfig` vs `loadAdaptationConfig` — different env vars and provider logic
- `createFallbackResponse` — different metadata shapes and fallback-text sources
- Response type definitions — different metadata shapes

### Middleware Gap

`API_CONFIG` in `middleware.ts` covers:
- `/api/telemetry-token` → 10 req/min, 1 MB body, contentLengthRequired: false
- `/api/otel/trace` → 30 req/min, 1 MB body, contentLengthRequired: true

Missing entries for both generation routes.

### Metrics Gap

`lib/otel/metrics.ts` has: `telemetry_token.*` (requests, errors) and `otel_proxy.*` (requests, size, latency, errors).

Missing: any counters for `frontier_generate.*` or `adaptation_generate.*`.

### Test Coverage Gaps

- `__tests__/middleware.test.ts` tests rate-limit behavior only for `/api/telemetry-token`. No generation-route entries.
- `__tests__/api/frontier-base-generate.test.ts`: no middleware boundary tests, no metrics emission assertions, no explicit security containment negative assertions.
- `__tests__/api/adaptation-generate.test.ts`: same gaps.

### Contract Documentation Gap

- `agent-docs/api/frontier-base-generate.md` — exists, current. No change needed unless frontier contract changes (it does not in this CR).
- `agent-docs/api/adaptation-generate.md` — **does not exist**. Required by AC-6.

### E2E Contract Probe

- No route paths change.
- No `data-testid` attributes change.
- No accessibility/semantic contracts change.
- **Testing Handoff Trigger Matrix verdict**: No E2E handoff required (backend-only scope with stable contracts).

---

## Configuration Specifications

### Shared Generation Utility Module

**Location**: `lib/server/generation/shared.ts`

**Exports**:
- `type FallbackReasonCode = 'missing_config' | 'invalid_config' | 'quota_limited' | 'timeout' | 'upstream_auth' | 'upstream_error' | 'invalid_provider_response' | 'empty_provider_output'`
- `parseTimeout(rawTimeout: string | undefined): number` — constants DEFAULT=8000, MIN=1000, MAX=20000 embedded in the function (same as both routes today)
- `extractProviderErrorMessage(payload: unknown): string | null`
- `mapProviderFailure(status: number, providerMessage: string | null): { code: FallbackReasonCode; message: string }`

Routes must import from this module and remove their local definitions. All existing behavior is preserved exactly — this is a pure extraction.

### Middleware Generation Route Config

Add to `API_CONFIG` in `middleware.ts`:

```typescript
'/api/frontier/base-generate': {
    rateLimit_windowMs: ONE_MINUTE,
    rateLimit_max: 20,       // interactive learner endpoint; 20/min is generous for legitimate use
    contentLengthRequired: false,  // JSON POST — browsers don't guarantee Content-Length
    maxBodySize: 8_192,      // 8 KB — generous for a max-2000-char prompt JSON body
},
'/api/adaptation/generate': {
    rateLimit_windowMs: ONE_MINUTE,
    rateLimit_max: 20,       // same policy as frontier
    contentLengthRequired: false,
    maxBodySize: 8_192,
},
```

**Rationale for thresholds**:
- Rate limit 20/min: A typical learner session involves 3–5 prompts per minute; 20/min is 4–6× a typical session peak. Still blocks automated abuse.
- Body size 8 KB: Prompt cap is 2000 chars (≈2 KB JSON with headers). 8 KB is 4× theoretical max — protective but not brittle.
- `contentLengthRequired: false`: Generation routes receive standard browser JSON POST requests. Unlike the OTEL proxy (which requires explicit Content-Length for stream-read safety), generation routes use `req.json()` internally. Enforcement when header is present is sufficient.

### Metrics to Add (lib/otel/metrics.ts)

Add four new lazy-initialized metric getters following the exact pattern of existing getters:

```typescript
// Frontier generation metrics
getFrontierGenerateRequestsCounter(): Counter
  → metric name: 'frontier_generate.requests'
  → description: 'Total number of frontier base-generate requests'
  → unit: '1'

getFrontierGenerateFallbacksCounter(): Counter
  → metric name: 'frontier_generate.fallbacks'
  → description: 'Total number of frontier base-generate fallback outcomes'
  → unit: '1'
  → attribute dimension: { reason_code: FallbackReasonCode } — 8 bounded values, safe

// Adaptation generation metrics
getAdaptationGenerateRequestsCounter(): Counter
  → metric name: 'adaptation_generate.requests'
  → description: 'Total number of adaptation generate requests'
  → unit: '1'

getAdaptationGenerateFallbacksCounter(): Counter
  → metric name: 'adaptation_generate.fallbacks'
  → description: 'Total number of adaptation generate fallback outcomes'
  → unit: '1'
  → attribute dimension: { reason_code: FallbackReasonCode } — 8 bounded values, safe
```

**Cardinality note**: `reason_code` is a bounded 8-value enum — not high cardinality. No prompt text, user identifier, or model-specific label should appear as a dimension.

### Metric Call Sites in Routes

Use the existing `safeMetric(() => ...)` wrapper (from `lib/otel/metrics.ts`) for all metric calls so telemetry failures cannot break route responses.

**In `base-generate/route.ts` POST handler**:
- At entry (after span start, before any early return): `safeMetric(() => getFrontierGenerateRequestsCounter().add(1))`
- At each fallback return point: `safeMetric(() => getFrontierGenerateFallbacksCounter().add(1, { reason_code: reasonCode }))`

**In `adaptation/generate/route.ts` POST handler**:
- At entry: `safeMetric(() => getAdaptationGenerateRequestsCounter().add(1))`
- At each fallback return point: `safeMetric(() => getAdaptationGenerateFallbacksCounter().add(1, { reason_code: reasonCode }))`

**Fallback return points in each route** (Backend Agent must place counter at each):
- Config missing/invalid fallback
- Fetch network failure fallback
- Upstream non-OK status fallback
- Unreadable provider payload fallback
- Empty provider output fallback
- Unhandled catch-all fallback

---

## Implementation Decisions (Tech Lead Owned)

1. **Shared utility location**: `lib/server/generation/shared.ts` (under `lib/` — non-feature generic utility, Tech Lead-permitted zone). Not `lib/utils/` since this is generation-domain-specific server logic, not a generic utility.

2. **Execution order (TDD availability)**: Sequential mode — Backend implements first, Testing writes tests against confirmed implementation. TDD is structurally unavailable; Implementation-First approach is required and explicitly stated here.

3. **Rate limit thresholds**: 20 req/min per generation route (not 30 like OTEL proxy — generation calls are heavier upstream, so a lower ceiling is appropriate). Body size 8 KB (vs 1 MB for OTEL proxy — prompts are small, so a tight limit is accurate).

4. **`contentLengthRequired: false`** for generation routes: Generation routes use `req.json()` for body reading, not the stream-based `readStreamWithLimit` pattern. The middleware body-size check against Content-Length header when present provides protection without requiring the browser to send the header.

5. **Metrics dimension policy**: Only `reason_code` is used as a dimension on fallback counters. No strategy, model ID, or prompt-derived labels to avoid cardinality growth.

6. **`FallbackReasonCode` import**: Both routes will import from `lib/server/generation/shared.ts`. The type is no longer locally defined.

7. **No new environment variables for thresholds**: Rate limits and body sizes are hardcoded in middleware config. Optional future enhancement (not in scope): make thresholds configurable via env. Not introducing for this CR.

---

## Critical Assumptions

1. `lib/server/generation/shared.ts` does not yet exist — Backend Agent creates it.
2. Browsers sending requests to generation routes may omit `Content-Length` header (standard for JSON POST in fetch API without explicit header). `contentLengthRequired: false` is correct.
3. Existing `safeMetric` wrapper in `lib/otel/metrics.ts` is sufficient for non-blocking metric calls — no new wrapper needed.
4. The `FallbackReasonCode` values in both routes are identical (confirmed by read) — extraction is safe.
5. All `parseTimeout`/`extractProviderErrorMessage`/`mapProviderFailure` implementations are byte-for-byte identical (confirmed by read) — extraction preserves behavior.

---

## Proposed Changes

### New Files
- `lib/server/generation/shared.ts` — shared generation utility module (Backend Agent)
- `agent-docs/api/adaptation-generate.md` — adaptation route contract doc (Backend Agent, Tech Lead-delegated)

### Modified Files
- `app/api/frontier/base-generate/route.ts` — import shared utilities, add request + fallback metric calls (Backend Agent)
- `app/api/adaptation/generate/route.ts` — import shared utilities, add request + fallback metric calls (Backend Agent)
- `middleware.ts` — add generation route entries to `API_CONFIG` (Backend Agent)
- `lib/otel/metrics.ts` — add 4 generation metric getter functions (Backend Agent)
- `__tests__/middleware.test.ts` — add generation route rate-limit and body-size tests (Testing Agent)
- `__tests__/api/frontier-base-generate.test.ts` — add metrics emission tests + security containment negative assertions (Testing Agent)
- `__tests__/api/adaptation-generate.test.ts` — add metrics emission tests + security containment negative assertions (Testing Agent)

---

## Contract Delta Assessment

- Route contracts changed? **No** — `/api/frontier/base-generate` and `/api/adaptation/generate` paths and response envelopes are preserved. AC-9 satisfied by design.
- `data-testid` contracts changed? **No** — backend-only scope.
- Accessibility/semantic contracts changed? **No** — backend-only scope.
- Testing handoff required per workflow matrix? **Conditional — yes**: Not for E2E (no contract changes), but a Testing Agent handoff IS required for comprehensive test coverage of new hardening controls (AC-7). This is addressed in Step 2 of the delegation plan.

---

## Architectural Invariants Check

- [x] **Observability Safety**: All metric calls wrapped in `safeMetric()`. Middleware failures return early without crashing route. Telemetry does not block generation responses. ADR-0001 boundary preserved.
- [x] **Security Boundaries**: `FRONTIER_API_KEY` and `ADAPTATION_SYSTEM_PROMPT` remain server-only. Middleware body-size enforcement reduces attack surface. Rate limiting bounds abuse.
- [x] **Component Rendering Strategy**: No component changes — backend-only.
- [x] **Threat Model (In-Scope)**: Excessive request payloads (addressed by body size) and client-side telemetry abuse (OTEL proxy unchanged) are in scope. This CR adds payload and rate protection for generation routes.

---

## Delegation & Execution Order

| Step | Agent | Task Description |
|---|---|---|
| 1 | Backend | Create shared utility, update middleware, update metrics, update both generation routes, create adaptation contract doc |
| 2 | Testing | Write new tests for middleware generation entries, metrics emission, security containment; run full quality gates |

---

## Delegation Graph

- **Execution Mode**: Sequential
- **Dependency Map**:
  - Step 2 (Testing) depends on Step 1 (Backend) — Testing Agent needs confirmed implementation to test against metric function names, middleware config keys, and exact route behavior.
- **Parallel Groups**: None.
- **Handoff Batch Plan**:
  - Issue Backend handoff now. Enter Wait State.
  - After Backend completion report is reviewed: issue Testing handoff.
- **Final Verification Owner**: Testing Agent runs full quality gates (`pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`). Tech Lead reviews completion reports and runs adversarial diff check before BA handoff.

**TDD Note**: Sequential mode with Backend first means TDD is structurally unavailable. Backend implements first; Testing Agent writes comprehensive test coverage afterward. Stated explicitly per workflow.md exception rule.

---

## Operational Checklist

- [x] **Environment**: No hardcoded secrets. Thresholds are hardcoded constants (not env-dependent for this CR).
- [x] **Observability**: All new metric calls are non-blocking via `safeMetric`. Spans and logs unchanged.
- [x] **Artifacts**: No new tool-generated artifacts requiring `.gitignore` updates.
- [x] **Rollback**: Revert `middleware.ts` entry removes rate/body enforcement. Revert `lib/otel/metrics.ts` removes metric getters. Revert route imports restores local definitions. Changes are modular and independently reversible.

---

## Definition of Done (Technical)

- [ ] AC-1: `/api/frontier/base-generate` and `/api/adaptation/generate` route paths and response envelopes unchanged. Confirmed by test stability.
- [ ] AC-2: `lib/server/generation/shared.ts` created; `parseTimeout`, `extractProviderErrorMessage`, `mapProviderFailure`, `FallbackReasonCode` imported by both routes; no local duplicates remain.
- [ ] AC-3: Middleware `API_CONFIG` has entries for both generation routes with documented rate/body thresholds; rate-limit and body-size test coverage present.
- [ ] AC-4: `lib/otel/metrics.ts` has 4 new generation metric getters; both routes call request + fallback counters via `safeMetric`; metric emission tests present; non-blocking failure test present.
- [ ] AC-5: No `FRONTIER_API_KEY`, `ADAPTATION_SYSTEM_PROMPT`, or auth header values in response payloads, log fields, or span attributes; explicit negative-assertion tests confirm containment.
- [ ] AC-6: `agent-docs/api/adaptation-generate.md` created following contract template; `frontier-base-generate.md` updated if any frontier contract detail changes (none expected).
- [ ] AC-7: New/updated tests cover middleware threshold edge + window reset (generation routes), metric emission under success + fallback, security containment negative assertions.
- [ ] AC-8: `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` all pass.
- [ ] AC-9: No route-path, `data-testid`, or accessibility-semantic contract changes — confirmed by contract delta assessment.

---

## Workflow Health Signal

- This is a `[L]` CR by BA classification. Sequential two-agent mode with intermediate Wait States. No context saturation expected at plan time given focused backend scope.
