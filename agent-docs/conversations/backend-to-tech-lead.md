# Report: Backend -> Tech Lead

## Subject
`CR-024 — Generation Route Body Size Enforcement`

## Status
`completed`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing Backend handoff context: `CR-023`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-023-plan.md` ✓ (attested in TL incoming handoff)
- Evidence 2 (prior CR closed): prior `backend-to-tech-lead.md` shows `status: completed` ✓
- Result: replacement allowed for new CR context.

---

## [Preflight: Assumptions]

- **Assumption 1**: `readStreamWithLimit` is exported from `lib/security/contentLength.ts`.
  - **Status**: ✅ CONFIRMED — exported at line 64. Signature: `readStreamWithLimit(req: NextRequest, limit: number, contentLength: number, timeoutMs?: number)`.

- **Assumption 2**: `new NextRequest(url, { body: ReadableStream })` is accepted in the test environment.
  - **Status**: ✅ CONFIRMED — `duplex: 'half'` accepted by TypeScript without suppression; new 413 tests pass.

- **Assumption 3**: Existing `createRequest` helper sends bodies well under 8192 bytes.
  - **Status**: ✅ CONFIRMED — maximum observed body is `'a'.repeat(2001)` (~2012 bytes). All 165 prior tests continued to pass.

- **Import status**: Neither route previously imported from `@/lib/security/contentLength`. A new import line was added to both files.

- **Metric mock cascade check**: This CR adds no new exported functions to `lib/otel/metrics.ts`. No cascade condition applies.

## [Preflight: Adjacent Risks]

- **Risk 1 — Node.js runtime**: System default was v16.20.1. Resolved by activating nvm. Runtime after activation: v20.20.0 ✓.
- **Risk 2 — ReadableStream body in tests**: `req.body?.getReader()` was non-null in the test environment. New 413 tests passed correctly.

## [Preflight: Open Questions]
- none

## [Preflight Status]
`clear-to-implement`

---

## [Scope Check]
- Handoff source: `agent-docs/conversations/tech-lead-to-backend.md`
- Files modified:
  - `app/api/frontier/base-generate/route.ts`
  - `app/api/adaptation/generate/route.ts`
  - `__tests__/api/frontier-base-generate.test.ts` (explicitly delegated)
  - `__tests__/api/adaptation-generate.test.ts` (explicitly delegated)
- Scope compliance:
  - [x] All modified files are in Backend ownership or explicitly delegated.
  - [x] Test files modified only under explicit delegation from handoff.

## [Changes Made]

- **`app/api/frontier/base-generate/route.ts`**: Added `import { readStreamWithLimit } from '@/lib/security/contentLength'`. Added `const MAX_BODY_SIZE = 8192` constant. Replaced `try { rawBody = await req.json() }` block with stream-level read: reads `content-length` header, computes `declaredLength` (falls back to `MAX_BODY_SIZE` when header absent), calls `readStreamWithLimit(req, MAX_BODY_SIZE, declaredLength)`, returns 413/400 on stream error, then parses body via `JSON.parse(new TextDecoder().decode(rawBytes))`.

- **`app/api/adaptation/generate/route.ts`**: Identical change pattern. Added `readStreamWithLimit` import and `MAX_BODY_SIZE` constant. Replaced `req.json()` block with stream-level read.

- **`__tests__/api/frontier-base-generate.test.ts`**: Added `describe('Body Size Enforcement')` block with `createOversizedStreamRequest` helper (8200-byte ReadableStream body, no Content-Length header) and `it('returns 413 for body exceeding 8192 bytes with no Content-Length header')` test.

- **`__tests__/api/adaptation-generate.test.ts`**: Same new describe block and test case targeting the adaptation route URL.

## [Verification Results]

- **Command**: `node -v`
  - **Scope**: session-level preflight
  - **Execution Mode**: local-equivalent/unsandboxed (nvm activated manually)
  - **Result**: `PASS — v20.20.0`

- **Command**: `pnpm test`
  - **Scope**: full suite (18 suites, 167 tests)
  - **Execution Mode**: local-equivalent/unsandboxed
  - **Result**: `PASS — 167 passed, 0 failed`

- **Command**: `pnpm lint --file app/api/frontier/base-generate/route.ts --file app/api/adaptation/generate/route.ts`
  - **Scope**: targeted (Backend-owned files per tooling-standard.md)
  - **Execution Mode**: local-equivalent/unsandboxed
  - **Result**: `PASS — No ESLint warnings or errors` (deprecation warning for `next lint` CLI is pre-existing, CR-021)

- **Command**: `pnpm exec tsc --noEmit`
  - **Scope**: full project
  - **Execution Mode**: local-equivalent/unsandboxed
  - **Result**: `PASS — no TypeScript errors`

- **Command**: `pnpm build`
  - **Scope**: full production build
  - **Execution Mode**: local-equivalent/unsandboxed
  - **Result**: `PASS — all 7 routes compiled successfully` (`require-in-the-middle` warning is pre-existing, CR-021)

### DoD Grep Evidence

- **`grep -n "req.json" app/api/frontier/base-generate/route.ts`** → **no matches** ✓
- **`grep -n "req.json" app/api/adaptation/generate/route.ts`** → **no matches** ✓
- **`grep -n "readStreamWithLimit" app/api/frontier/base-generate/route.ts`** → matches at lines 4, 173 ✓
- **`grep -n "readStreamWithLimit" app/api/adaptation/generate/route.ts`** → matches at lines 4, 158 ✓

### AC Verification

- **AC-1**: POST to either generation route with body > 8192 bytes returns 413 regardless of Content-Length state — enforced at stream level before Zod parsing. `readStreamWithLimit` fires when `offset + value.length > MAX_BODY_SIZE`. ✓
- **AC-2**: 413 rejection occurs in the stream-read block (lines 171–178 frontier, 156–163 adaptation), which precedes the upstream `fetch()` call. No external API call is made for rejected bodies. ✓
- **AC-3**: New test added in `describe('Body Size Enforcement')` in both test files. Tests pass (167 total). ✓
- **AC-4**: All 165 prior tests continue to pass. ✓
- **AC-5**: `pnpm lint` PASS, `pnpm exec tsc --noEmit` PASS, `pnpm test` PASS (167/167), `pnpm build` PASS. ✓
- **AC-6**: No route paths, response contract shapes for existing status codes, `data-testid`, or accessibility semantics changed. ✓

## [Out-of-Scope Requests Detected]
- `none`

## [Out-of-Scope Flags (per handoff)]
- **Remaining `req.json()` calls in other routes**: `grep -rn "req\.json()" app/api/` → **no matches**. All API routes are now covered. No follow-up candidates identified.

## [Blockers]
- `none`

## [Failure Classification]
- `CR-related`: none.
- `pre-existing`: Worker-process teardown warning during test suite teardown (project-log.md, CR-021). `require-in-the-middle` critical dependency warning in `pnpm build` (project-log.md, CR-021). Deprecation warning for `next lint` CLI (pre-existing, CR-021).
- `environmental`: Node.js runtime was v16.20.1 on session start (same as CR-023); resolved via nvm. Pre-existing condition, not newly tracked.
- `non-blocking warning`: none.

## [Deviations]

- **Minor deviation — removed `@ts-expect-error` from test helpers**: The handoff template included `// @ts-expect-error duplex required for streaming body in some environments` on the `duplex: 'half'` option. TypeScript in this project's configuration accepts `duplex` without suppression; the directive caused a `TS2578: Unused '@ts-expect-error' directive` error under `pnpm exec tsc --noEmit`. Removed the directive from both test files. No behavioral impact — `duplex: 'half'` is still passed.

## [Ready for Next Agent]
`yes`

## [Follow-up Recommendations]
- **nvm sourcing (environmental)**: Shell profile does not auto-source nvm (same condition as CR-023). nvm init should be added to `.bashrc`/`.zshrc`. Recommend adding as `[S]` Next Priority in `project-log.md` if not already tracked.
