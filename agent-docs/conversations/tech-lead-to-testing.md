# Tech Lead → Testing Agent Handoff

**CR:** CR-018 — Generation API Hardening Parity
**Date:** 2026-02-25
**Status:** Ready for Testing Agent execution

---

## Context

CR-018 closed a governance drift gap between the generation API routes and the OTEL boundary.
Backend Agent has completed implementation. Tech Lead adversarial diff review passed all ACs.
This handoff covers the test coverage required to satisfy AC-7.

**No E2E handoff is required** — AC-9 is confirmed clean (no route paths, `data-testid`s, or
accessibility semantics changed by Backend).

---

## What Backend Delivered (Verified)

Six files were created or modified:

| File | Change |
|---|---|
| `lib/server/generation/shared.ts` | NEW — shared utility module |
| `app/api/frontier/base-generate/route.ts` | Imports shared module + metrics; removes local duplicates |
| `app/api/adaptation/generate/route.ts` | Imports shared module + metrics; removes local duplicates |
| `middleware.ts` | Adds `API_CONFIG` entries for both generation routes |
| `lib/otel/metrics.ts` | Adds 4 new counter getters |
| `agent-docs/api/adaptation-generate.md` | NEW — API contract doc (no tests required) |

All 134 pre-existing tests pass at Backend handoff. Your job is to **add** new tests only.
Do not modify or delete any existing test.

---

## Required Test Files

### 1. `__tests__/middleware.test.ts`

**Read the file first** to understand the existing pattern:
- Tests use `jest.resetModules()` + dynamic `require()` to reset in-memory rate limit state between tests
- Existing coverage: `/api/telemetry-token` (threshold 10), `/api/otel/trace` (threshold 30)
- `validateContentLength` is mocked at `@/lib/security/contentLength`

Add a **new `describe` block** at the bottom of the file for generation route middleware controls.
Cover both `/api/frontier/base-generate` and `/api/adaptation/generate` (they share identical config,
so parameterise or duplicate as fits the existing file style).

#### Required tests (8 minimum):

**Rate limit — threshold edge (per route):**
```
it('allows request N=20 and blocks request N+1=21 for /api/frontier/base-generate')
it('allows request N=20 and blocks request N+1=21 for /api/adaptation/generate')
```
- Make 20 requests from the same non-localhost IP → all should pass (not 429)
- Make a 21st request → must return 429

**Rate limit — window reset:**
```
it('resets rate limit after window expires for generation routes')
```
- Send 20 requests, advance fake time by >60 000 ms (jest fake timers / Date.now mock),
  send one more → must pass (not 429)

**Localhost bypass:**
```
it('does not rate-limit localhost IPs on generation routes')
```
- Use IP `127.0.0.1` or `::1`; send 25+ requests → none should be 429

**E2E bypass:**
```
it('does not rate-limit when E2E=true on generation routes')
```
- Set `process.env.E2E = 'true'`; send 25+ requests from a non-localhost IP → none should be 429
- Restore env after test

**Body size — pass at limit:**
```
it('passes a body of exactly 8192 bytes for /api/adaptation/generate')
```
- `content-length: 8192` → must not return 413

**Body size — reject over limit:**
```
it('rejects a body of 8193 bytes for /api/adaptation/generate')
```
- `content-length: 8193` → must return 413

**Body size — absent header passes (contentLengthRequired: false):**
```
it('passes when content-length header is absent for /api/frontier/base-generate')
```
- No `content-length` header → must not return 413

---

### 2. `__tests__/api/frontier-base-generate.test.ts`

**Read the file first** to understand how it mocks `@opentelemetry/api`, Zod, and fetch.

Add the following **at the top of the mocks section** (before or after the OTel mock, following
the existing ordering convention):

```typescript
// --- Metrics mock ---
const mockAdd = jest.fn();
jest.mock('@/lib/otel/metrics', () => ({
    safeMetric: (fn: () => void) => fn(),
    getFrontierGenerateRequestsCounter: () => ({ add: mockAdd }),
    getFrontierGenerateFallbacksCounter: () => ({ add: mockAdd }),
}));
```

Add `beforeEach(() => mockAdd.mockClear())` inside the existing `beforeEach` or as a sibling.

#### Required tests (7 minimum):

**Metrics emission — request counter:**
```
it('increments frontier_generate.requests counter on every POST')
```
- Any valid request (configured or unconfigured) → `mockAdd` called with `(1)` and no label
  argument on at least one call (the request counter call)

**Metrics emission — fallback on missing config:**
```
it('increments frontier_generate.fallbacks with reason_code missing_config when not configured')
```
- Ensure `FRONTIER_API_URL` / `FRONTIER_MODEL_ID` / `FRONTIER_API_KEY` are unset
- `mockAdd` must be called with `(1, { reason_code: 'missing_config' })`

**Metrics emission — fallback on timeout:**
```
it('increments frontier_generate.fallbacks with reason_code timeout on AbortError')
```
- Configured route; `fetch` throws `Object.assign(new Error('aborted'), { name: 'AbortError' })`
- `mockAdd` called with `(1, { reason_code: 'timeout' })`

**Metrics emission — fallback on upstream 429:**
```
it('increments frontier_generate.fallbacks with reason_code quota_limited on upstream 429')
```
- `fetch` resolves with `ok: false, status: 429`
- `mockAdd` called with `(1, { reason_code: 'quota_limited' })`

**Metrics emission — NO fallback counter on live success:**
```
it('does not call fallbacks counter on a successful live response')
```
- `fetch` resolves with valid OpenAI-shaped JSON payload
- `mockAdd` must NOT be called with any `{ reason_code: ... }` argument

**Security containment — API key not in response:**
```
it('does not expose FRONTIER_API_KEY in the response body on any fallback path')
```
- Set `process.env.FRONTIER_API_KEY = 'sk-secret-frontier-key'`
- Trigger a fallback (e.g. upstream error)
- Stringify the JSON response body and assert it does NOT contain `'sk-secret-frontier-key'`

**Security containment — API key not in span attributes:**
```
it('does not set FRONTIER_API_KEY as a span attribute')
```
- Capture all `span.setAttribute` calls via mock/spy
- Assert none of the values passed to `setAttribute` contain the API key string

---

### 3. `__tests__/api/adaptation-generate.test.ts`

**Read the file first** — same approach as frontier test.

Add metrics mock (same pattern, different getter names):

```typescript
const mockAdd = jest.fn();
jest.mock('@/lib/otel/metrics', () => ({
    safeMetric: (fn: () => void) => fn(),
    getAdaptationGenerateRequestsCounter: () => ({ add: mockAdd }),
    getAdaptationGenerateFallbacksCounter: () => ({ add: mockAdd }),
}));
```

Add `beforeEach(() => mockAdd.mockClear())` inside the existing `beforeEach` or as a sibling.

#### Required tests (8 minimum):

**Metrics emission — request counter:**
```
it('increments adaptation_generate.requests counter on every POST')
```

**Metrics emission — fallback on missing config:**
```
it('increments adaptation_generate.fallbacks with reason_code missing_config when not configured')
```
- One or more of `ADAPTATION_API_URL`, `FRONTIER_API_KEY`, plus the strategy-specific model ID
  (`ADAPTATION_FULL_FINETUNE_MODEL_ID`, `ADAPTATION_LORA_MODEL_ID`, or
  `ADAPTATION_PROMPT_PREFIX_MODEL_ID`) unset

**Metrics emission — fallback on timeout:**
```
it('increments adaptation_generate.fallbacks with reason_code timeout on AbortError')
```

**Metrics emission — fallback on upstream 401:**
```
it('increments adaptation_generate.fallbacks with reason_code upstream_auth on upstream 401')
```
- `fetch` resolves with `ok: false, status: 401`
- `mockAdd` called with `(1, { reason_code: 'upstream_auth' })`

**Metrics emission — NO fallback counter on live success:**
```
it('does not call fallbacks counter on a successful live response')
```

**Security containment — API key not in response:**
```
it('does not expose FRONTIER_API_KEY in the response body on any fallback path')
```
- Same pattern as frontier: set env var to a known string, trigger fallback, check JSON body

**Security containment — system prompt not in response:**
```
it('does not expose ADAPTATION_SYSTEM_PROMPT content in the response body')
```
- `ADAPTATION_SYSTEM_PROMPT` is defined server-side only.
  Its value is `'You are a helpful assistant. Answer the following question clearly and concisely.\n\n'`
- Trigger any fallback or success path for strategy `prompt-prefix`
- Stringify the full JSON response body and assert it does NOT contain
  `'You are a helpful assistant'`

**Security containment — system prompt not in span attributes:**
```
it('does not set ADAPTATION_SYSTEM_PROMPT content as a span attribute')
```
- Capture all `span.setAttribute` calls via mock/spy
- Assert none of the values contain the system prompt string

---

## Quality Gates (Run in Order)

```bash
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

All must exit 0. If any gate fails, fix before reporting back. Do not report partial success.

---

## Definition of Done

- [ ] All pre-existing 134 tests still pass
- [ ] 8 middleware tests added and passing
- [ ] 7 frontier metrics/security tests added and passing
- [ ] 8 adaptation metrics/security tests added and passing
- [ ] `pnpm lint` clean
- [ ] `pnpm exec tsc --noEmit` clean
- [ ] `pnpm build` clean

---

## Reporting Back

When done, update `agent-docs/conversations/testing-to-tech-lead.md` with:

```
CR: CR-018
Status: completed | blocked

Tests added:
  middleware.test.ts: <N> new tests
  frontier-base-generate.test.ts: <N> new tests
  adaptation-generate.test.ts: <N> new tests

Total test count: <N> (was 134)

Quality gates:
  pnpm test: pass | fail
  pnpm lint: pass | fail
  pnpm exec tsc --noEmit: pass | fail
  pnpm build: pass | fail

Deviations from spec: none | <describe>
Blockers: none | <describe>
```
