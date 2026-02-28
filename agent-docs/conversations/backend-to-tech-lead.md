# Report: Backend -> Tech Lead

## Subject
`CR-023 — Purpose-Driven Observability Refinement`

## Status
`completed`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing Backend handoff context: `CR-022`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-022-plan.md` ✓ (confirmed by TL pre-replacement check attestation in `tech-lead-to-backend.md`)
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-022-adaptation-page-upgrade-and-cleanup.md` status is `Done` ✓ (confirmed by TL pre-replacement check attestation; prior backend report shows `status: completed`)
- Result: replacement allowed for new CR context.

---

## [Preflight: Assumptions]

- **Assumption 1**: `safeMetric` is exported from `lib/otel/metrics.ts`.
  - **Verification**: Confirmed at line 20 of `lib/otel/metrics.ts`. Export present and correctly typed as `export function safeMetric(fn: () => void)`.
- **Assumption 2**: `performance.now()` is available in the Next.js API route runtime.
  - **Verification**: Confirmed by existing usage in `app/api/otel/trace/route.ts` and both generation routes. No additional import required.
- **Assumption 3**: `strategy` variable is in scope at the latency recording point in the adaptation route.
  - **Verification**: Confirmed — `const { prompt, strategy } = parsed.data;` declared before the inner fetch try block.
- **Assumption 4**: The proxy integration test mock for `@/lib/otel/metrics` does not include `safeMetric`.
  - **Verification**: Confirmed — `safeMetric` was absent from the mock; added per handoff.

## [Preflight: Adjacent Risks]

- **Risk 1 — Node.js runtime mismatch (environmental)**: Active shell runtime was v16.20.1 on session start (below required v20.x). Not tracked in `project-log.md`. Resolved by sourcing nvm manually. Runtime after activation: `v20.20.0` ✓.
- **Risk 2 — Generation route safeMetric compliance**: All existing metric calls in both generation routes are already wrapped in `safeMetric()`. No bare calls found.

## [Preflight: Out-of-Scope Flags]

- **Flag: Additional `getTelemetryTokenErrorsCounter` call site**: Beyond the known `lib/otel/token.ts:20` reference, `__tests__/lib/otel/telemetryToken.test.ts:3` also references it (test mock). Since AC-4 is descoped and the counter is NOT being removed, this reference remains valid and harmless.
- **Span assertion coverage**: All span assertions in `__tests__/integration/otel-proxy.test.ts` are covered by the handoff removal list. No unexpected span assertions found.

## [Preflight Status]
`clear-to-implement`

---

## [Scope Check]
- Handoff source: `agent-docs/conversations/tech-lead-to-backend.md`
- Files modified:
  - `lib/otel/metrics.ts`
  - `app/api/otel/trace/route.ts`
  - `__tests__/integration/otel-proxy.test.ts` (explicitly delegated in handoff)
  - `app/api/frontier/base-generate/route.ts`
  - `app/api/adaptation/generate/route.ts`
  - `__tests__/api/frontier-base-generate.test.ts` (scope extension — see below)
  - `__tests__/api/adaptation-generate.test.ts` (scope extension — see below)
- Scope compliance:
  - [x] All modified files are in Backend ownership or explicitly delegated/approved.
  - [x] Two test files modified under scope extension approved by Human User in-session (see Deviations).

## [Changes Made]

- **`lib/otel/metrics.ts`**: Added `frontierGenerateUpstreamLatency` and `adaptationGenerateUpstreamLatency` module-level variables (both `Histogram | null`). Added `getFrontierGenerateUpstreamLatencyHistogram()` and `getAdaptationGenerateUpstreamLatencyHistogram()` exported getter functions following the established lazy-init pattern.
- **`app/api/otel/trace/route.ts`**: Removed `SpanStatusCode`, `SpanKind` imports and `getTracer` import entirely. Added `safeMetric` to metrics import. Removed `const tracer = getTracer()` and the entire `tracer.startActiveSpan(...)` wrapper — handler body flattened. Removed `const startTime = performance.now()`. Removed success-path `logger.info` call. Removed all `span.*` calls (setAttribute, setStatus, addEvent, recordException, end). Wrapped all 11 metric instrument calls in `safeMetric()`. Removed `span.end()` from finally block; `clearTimeout(timeout)` retained. Removed pre-existing commented-out `logger.warn` line (debug artifact per DoD checklist).
- **`__tests__/integration/otel-proxy.test.ts`**: Removed `mockSpan` and `mockTracer` declarations. Removed `jest.mock('@/lib/otel/tracing', ...)` block. Added `safeMetric: (fn: () => void) => fn()` to the `@/lib/otel/metrics` mock. Removed span assertions from happy path, 401, 413, 500 upstream, and connection error tests.
- **`app/api/frontier/base-generate/route.ts`**: Added `getFrontierGenerateUpstreamLatencyHistogram` to metrics import. Added `const upstreamFetchStart = performance.now()` immediately before the inner fetch try block. Added `safeMetric(() => getFrontierGenerateUpstreamLatencyHistogram().record(performance.now() - upstreamFetchStart, { route: ROUTE_PATH }))` immediately before `streamingActive = true`.
- **`app/api/adaptation/generate/route.ts`**: Added `getAdaptationGenerateUpstreamLatencyHistogram` to metrics import. Added `const upstreamFetchStart = performance.now()` immediately before the inner fetch try block. Added `safeMetric(() => getAdaptationGenerateUpstreamLatencyHistogram().record(performance.now() - upstreamFetchStart, { strategy }))` immediately before `streamingActive = true`.
- **`__tests__/api/frontier-base-generate.test.ts`**: Added `getFrontierGenerateUpstreamLatencyHistogram: () => ({ record: jest.fn() })` to the `@/lib/otel/metrics` mock factory. (scope extension approved by user)
- **`__tests__/api/adaptation-generate.test.ts`**: Added `getAdaptationGenerateUpstreamLatencyHistogram: () => ({ record: jest.fn() })` to the `@/lib/otel/metrics` mock factory. (scope extension approved by user)

## [Verification Results]

- **Command**: `node -v`
  - **Scope**: session-level preflight
  - **Execution Mode**: local-equivalent/unsandboxed (nvm activated manually)
  - **Result**: `PASS — v20.20.0`

- **Command**: `pnpm exec tsc --noEmit`
  - **Scope**: full project
  - **Execution Mode**: local-equivalent/unsandboxed
  - **Result**: `PASS — no TypeScript errors`

- **Command**: `pnpm lint --file app/api/otel/trace/route.ts --file lib/otel/metrics.ts --file app/api/frontier/base-generate/route.ts --file app/api/adaptation/generate/route.ts`
  - **Scope**: targeted (Backend-owned files per tooling-standard.md)
  - **Execution Mode**: local-equivalent/unsandboxed
  - **Result**: `PASS — No ESLint warnings or errors` (deprecation warning for `next lint` CLI is pre-existing, CR-021)

- **Command**: `pnpm test`
  - **Scope**: full suite (18 suites, 165 tests)
  - **Execution Mode**: local-equivalent/unsandboxed
  - **Result**: `PASS — 165 passed, 0 failed`

- **Command**: `pnpm build`
  - **Scope**: full production build
  - **Execution Mode**: local-equivalent/unsandboxed
  - **Result**: `PASS — all 7 routes compiled successfully` (`require-in-the-middle` warning is pre-existing, CR-021)

### DoD Grep Evidence

- **AC-1**: `grep -n "startActiveSpan\|SpanKind\|SpanStatusCode\|getTracer" app/api/otel/trace/route.ts` → **no matches** ✓
- **AC-2**: All 11 metric calls in `app/api/otel/trace/route.ts` wrapped in `safeMetric()` at lines 34, 44, 53, 60, 70, 73, 82, 101, 106, 113, 118 — no bare calls ✓
- **AC-3**: `grep -n "logger.info" app/api/otel/trace/route.ts` → **no matches** ✓
- **AC-4**: DESCOPED — not verified, not touched ✓
- **AC-5**: `getFrontierGenerateUpstreamLatencyHistogram().record(...)` present at line 322 of `app/api/frontier/base-generate/route.ts`, positioned immediately before `streamingActive = true` ✓
- **AC-6**: `getAdaptationGenerateUpstreamLatencyHistogram().record(..., { strategy })` present at line 319–322 of `app/api/adaptation/generate/route.ts`, positioned immediately before `streamingActive = true`, includes `strategy` dimension ✓
- **AC-7**: `pnpm test` — PASS (165/165). `pnpm lint` — PASS. `pnpm exec tsc --noEmit` — PASS. `pnpm build` — PASS ✓

## [Out-of-Scope Requests Detected]
- `none`

## [Blockers]
- `none`

## [Failure Classification]
- `CR-related`: none.
- `pre-existing`: Worker-process teardown warning during test suite teardown (project-log.md, CR-021). `require-in-the-middle` critical dependency warning in `pnpm build` (project-log.md, CR-021). Deprecation warning for `next lint` CLI (pre-existing, CR-021).
- `environmental`: Node.js runtime was v16.20.1 on session start; resolved via nvm before verification. Not tracked in project-log.md — recommend adding as Next Priority (see Follow-up).
- `non-blocking warning`: none.

## [Deviations]

- **Minor deviation — removed pre-existing commented-out logger.warn**: `app/api/otel/trace/route.ts` contained a commented-out `// logger.warn({ sessionId }, 'Unauthorized telemetry trace attempt');` line pre-CR. Removed per DoD checklist ("No debug artifacts — commented-out code blocks — in any modified file"). No behavioral impact.

- **Scope extension — test mock updates approved by Human User**: The handoff scoped "Do NOT modify: any other test file." Adding histogram getter calls to the generation routes caused `TypeError` propagation in two test files whose `safeMetric` mock is `(fn) => fn()` (no error handling). Backend raised this as a blocker; Human User approved scope extension in-session to add 1-line mock entries to `__tests__/api/frontier-base-generate.test.ts` and `__tests__/api/adaptation-generate.test.ts`. **Scope extension approved by user.**

## [Ready for Next Agent]
`yes`

## [Follow-up Recommendations]
- **nvm sourcing (environmental)**: Shell profile does not auto-source nvm; requires manual activation each session (`v16.20.1` is the default without it). Recommend adding nvm init to `.bashrc`/`.zshrc`. Suggest adding as `[S]` Next Priority in `project-log.md`.
