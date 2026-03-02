# CR-024: Generation Route Body Size Enforcement

## Status
`Done`

## Business Context

**User Need:** Generation routes (`/api/frontier/base-generate`, `/api/adaptation/generate`) do not enforce body size at the stream level. When a request arrives without a `Content-Length` header, the middleware body size check is bypassed entirely, and `req.json()` reads the full body into memory with no byte cap. Zod schema validation runs after parse — meaning a large payload is already allocated before any rejection can occur.

**Expected Value:** Close the body size enforcement gap so generation routes behave consistently with the documented `maxBodySize: 8192` policy regardless of header presence.

**Product End User audience:** Software engineers learning through Stage 1 and Stage 2 interactions. No visible change to learner experience — this is a backend correctness fix.

## Why This Gap Exists (Historical)

This is not an oversight from CR-012 (when the routes were created). The routes were created as a narrative/UX CR — body enforcement was not in scope.

The gap was introduced in **CR-018** (Generation API Hardening Parity), which explicitly set `contentLengthRequired: false` for generation routes in `middleware.ts` and wrote a test asserting this behavior:

```
it('passes when content-length header is absent for /api/frontier/base-generate', ...)
```

The reasoning at the time: JSON clients reliably send `Content-Length`, so the header-based middleware check catches the common case, and Zod provides a second line of defense. This was a deliberate simplification.

What CR-018 did not account for: `req.json()` reads unbounded bytes before Zod runs. A client that sends no `Content-Length` and a body well above 8192 bytes will cause full memory allocation before Zod can reject the content. The AC in CR-018 verified "the config exists in middleware" — not "enforcement is robust against missing headers."

## Functional Requirements

1. Both generation routes must reject requests whose actual body exceeds 8192 bytes, regardless of whether the `Content-Length` header is present, absent, or inconsistent with the actual body size.
2. Rejection must return a `4xx` response. The specific status code (411, 413, or 400) is a Tech Lead decision based on implementation approach.
3. The implementation approach is left to the Tech Lead. Two valid options exist:
   - **Option A:** Set `contentLengthRequired: true` in middleware for generation routes — returns 411 for any request without `Content-Length`. Simple, but changes existing behavior for no-body requests.
   - **Option B:** Add stream-level enforcement inside the route handlers before `req.json()` — rejects only when the body actually exceeds the limit. More targeted, no behavior change for no-body requests.
4. The existing middleware test at `__tests__/middleware.test.ts:246` (`'passes when content-length header is absent'`) asserts behavior that may change under Option A. The Tech Lead must explicitly decide whether this test expectation is updated or preserved as part of the chosen approach.

## Acceptance Criteria

- [x] **AC-1:** A POST to `/api/frontier/base-generate` or `/api/adaptation/generate` with an actual body exceeding 8192 bytes returns a `4xx` response, regardless of whether the `Content-Length` header is present, absent, or set below the actual body size. — `readStreamWithLimit(req, MAX_BODY_SIZE, declaredLength)` enforces 8192 cap at stream level before Zod; absent header sets `declaredLength = MAX_BODY_SIZE`, so cap applies regardless. New 413 tests confirm enforcement (`frontier-base-generate.test.ts`, `adaptation-generate.test.ts`, `describe('Body Size Enforcement')`). TL adversarial grep: `grep -n "readStreamWithLimit" app/api/frontier/base-generate/route.ts → lines 4, 173`; `app/api/adaptation/generate/route.ts → lines 4, 158`.
- [x] **AC-2:** The rejection described in AC-1 occurs without forwarding the request to the upstream AI provider (no external API call is made for rejected bodies). — Graduated per specific cited TL adversarial evidence: stream-read block at frontier lines 171–179 and adaptation lines 156–164 precedes upstream `fetch()` in both handlers; mocked-fetch test confirms no fetch calls triggered on 413 path. `agent-docs/conversations/tech-lead-to-ba.md:52`.
- [x] **AC-3:** Test coverage added for the previously untested case: no `Content-Length` header + body > 8192 bytes → `4xx`, for both routes. — `describe('Body Size Enforcement')` added to both `__tests__/api/frontier-base-generate.test.ts` and `__tests__/api/adaptation-generate.test.ts`. `createOversizedStreamRequest` helper: 8200-byte `ReadableStream` body, no Content-Length header. Both pass at 413. `agent-docs/conversations/tech-lead-to-ba.md:53`.
- [x] **AC-4:** Existing tests for valid requests and oversized bodies with correct `Content-Length` continue to pass (no regression). — 165 prior tests all pass; 167 total, 0 failures. `pnpm test` PASS. `agent-docs/conversations/tech-lead-to-ba.md:54`.
- [x] **AC-5:** `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, and `pnpm build` pass. — `pnpm lint` (targeted on modified files) PASS; `pnpm exec tsc --noEmit` PASS; `pnpm test` 167/167 PASS; `pnpm build` 7 routes PASS. Runtime: v20.20.0 via nvm (pre-existing v16/v18 session-start mismatch; proceed-and-classify exception per `tooling-standard.md`, tracked in project-log). `agent-docs/conversations/tech-lead-to-ba.md:55`.
- [x] **AC-6:** No route path, response contract shape, `data-testid`, or accessibility semantics are changed. — Graduated per specific cited TL adversarial evidence: `grep -n "req.json" app/api/frontier/base-generate/route.ts → 0 matches`; `grep -n "req.json" app/api/adaptation/generate/route.ts → 0 matches`. `middleware.ts` and `__tests__/middleware.test.ts` unchanged. 413 is additive (new response for previously unhandled path). `agent-docs/conversations/tech-lead-to-ba.md:56`.

## Constraints

- No new npm packages.
- TypeScript strict mode must remain satisfied.
- The `maxBodySize` threshold (8192 bytes) must not change — this CR enforces the existing policy, it does not redefine it.
- If Option A is chosen, the middleware test at line 246 must be updated in the same CR — do not leave a passing test that asserts behavior the code no longer exhibits.

## Risks & Assumptions

| Item | Type | Notes |
|---|---|---|
| Option A may 411 legitimate clients that omit Content-Length | Risk | Uncommon for browser fetch with JSON body, but verify before choosing |
| Option B requires reading the stream before `req.json()` | Risk | Tech Lead should confirm whether Next.js App Router allows re-reading a partially consumed stream or whether the full body must be read first |
| Existing no-body + no-header test behavior | Assumption | Option B preserves the existing test; Option A changes it — Tech Lead to decide explicitly |

## Rollback Plan

Revert the enforcement change in the affected route(s) or middleware config. No data migration or infrastructure change required.

## Execution Mode

`[S]` — Small. Backend-only. Two route files (and/or middleware config). Single-session. No contract or UI changes.

## Dependencies

- Blocks: none
- Blocked by: none

## Technical Analysis (filled by Tech Lead)

**Complexity:** Low
**Estimated Effort:** S
**Affected Systems:** `app/api/frontier/base-generate/route.ts`, `app/api/adaptation/generate/route.ts`, `__tests__/api/frontier-base-generate.test.ts`, `__tests__/api/adaptation-generate.test.ts`
**Implementation Approach:** Option B — stream-level enforcement. Both routes use `readStreamWithLimit(req, MAX_BODY_SIZE, declaredLength)` before `JSON.parse`. Absent Content-Length header → `declaredLength = MAX_BODY_SIZE`. No middleware changes. `readStreamWithLimit` reused from `lib/security/contentLength` (existing production utility).

## Deviations Accepted (filled at closure by BA)
- **Minor — `@ts-expect-error` directive omitted from test helper**: Handoff suggested suppressing `duplex: 'half'` with `@ts-expect-error`; TypeScript accepted it natively in this project's strict config, making the directive cause TS2578. Removed from both test files. No AC intent change, no contract change, no security impact. Accepted.
