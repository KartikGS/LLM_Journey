# Technical Plan - CR-024: Generation Route Body Size Enforcement

## Technical Analysis

The two generation routes (`/api/frontier/base-generate`, `/api/adaptation/generate`) currently call `req.json()` without any byte cap. The middleware enforces an 8192-byte limit via the `Content-Length` header, but `contentLengthRequired: false` means requests without that header bypass enforcement entirely — `req.json()` then allocates arbitrary memory.

**The gap**: A client can send `POST /api/frontier/base-generate` with a 1MB body and omit `Content-Length`. Middleware passes it. `req.json()` allocates 1MB. Zod validation runs only after full allocation and parse.

**Existing infrastructure**: `lib/security/contentLength.ts` already exports `readStreamWithLimit()`, the exact utility needed. It is already used in production by the otel proxy route (`app/api/otel/trace/route.ts`). It reads the request body stream up to a byte limit and returns a `Uint8Array`, allowing `JSON.parse()` to parse from the pre-read buffer without a second stream read.

---

## Discovery Findings

- `middleware.ts`: Both generation routes have `contentLengthRequired: false`, `maxBodySize: 8_192`. Middleware passes requests without `Content-Length` header unconditionally (per `validateContentLength` in `lib/security/contentLength.ts`: when `!contentLength && !required → { valid: true, length: 0 }`).
- `lib/security/contentLength.ts`: `readStreamWithLimit(req, limit, contentLength, timeoutMs?)` already exists and is tested (`__tests__/lib/security/readStreamWithLimit.test.ts`).
- `app/api/otel/trace/route.ts`: Production precedent — uses `readStreamWithLimit` with `contentLength` from validated header, returns 413 plain text on oversized body. Pattern is proven.
- `__tests__/middleware.test.ts:246`: Test `'passes when content-length header is absent for /api/frontier/base-generate'` — asserts middleware does not reject a header-less request. This test remains valid under Option B (middleware behavior is unchanged).
- `__tests__/api/frontier-base-generate.test.ts`, `__tests__/api/adaptation-generate.test.ts`: Existing tests use `createRequest` helper with `JSON.stringify(body)` — all send bodies well under 8192 bytes. No existing test covers the oversized-no-header case.
- No ADR exists for this pattern; otel proxy established it as a project convention.

**Route/selector/semantic contracts**: No changes — backend-only fix.

---

## Configuration Specifications

- `MAX_BODY_SIZE = 8192` — mirrors `maxBodySize: 8_192` in middleware `API_CONFIG`. Defined as a local constant in each route file with a comment referencing the middleware policy. Not extracted to `lib/config/generation.ts` (body size limits are security policy, not generation config).
- **`declaredLength` parameter for `readStreamWithLimit`**: When `Content-Length` header is absent, pass `MAX_BODY_SIZE` as `contentLength`. This makes the stream check equivalent to `offset + value.length > 8192`, which is correct. When header is present, pass its parsed value — the `limit` parameter (8192) still enforces the cap regardless.
- **Response for 413**: `new NextResponse('Payload Too Large', { status: 413 })` — plain text, matching middleware and otel proxy conventions. Does not modify the `RequestErrorResponse` typed union in either route.
- **Span handling on 413 early return**: Set `span.setStatus({ code: SpanStatusCode.ERROR, message: 'Payload Too Large' })`. Do NOT call the fallbacks counter — 413 is a rejection, not a fallback. The span ends in the existing `finally` block (`if (!streamingActive) span.end()`).
- **No timeout for body read**: Omit `timeoutMs` argument — route handlers did not previously have body-read timeouts. Out of CR-024 scope.

---

## Implementation Decisions (Tech Lead Owned)

**Decision: Option B — stream-level enforcement in route handlers.**

Options considered:
- **Option A**: Set `contentLengthRequired: true` in middleware. Returns 411 for any request without `Content-Length`. Simple one-liner. Requires updating middleware test at line 246.
- **Option B**: Add `readStreamWithLimit` call in both route handlers before `req.json()`. Returns 413 only when the body actually exceeds 8192 bytes. No middleware changes.

**Chosen: Option B.**

Rationale:
1. `readStreamWithLimit` already exists in `lib/security/contentLength.ts` and is in production use (otel proxy). Zero new infrastructure required.
2. Preserves the "no Content-Length header is acceptable" behavior for generation routes. `browser fetch` with JSON bodies usually sends Content-Length, but library/tool clients often don't. Requiring it would 411 any such client without a security benefit (the limit is still enforced by the stream).
3. The middleware test at line 246 remains valid — no test changes needed in `middleware.test.ts`.
4. Route-level enforcement via `readStreamWithLimit` is strictly stronger: it catches bodies regardless of header presence, and also catches lying headers (Content-Length says 100, body is 200 — the stream limit fires at 100 bytes).
5. Pattern matches the otel proxy, creating consistency across the API surface.

---

## Critical Assumptions

1. `readStreamWithLimit` in the route handler context reads from `req.body?.getReader()`. This is valid — Next.js App Router `NextRequest.body` is a `ReadableStream<Uint8Array>`. Confirmed by otel proxy production usage.
2. Existing `createRequest` test helper in both route test files creates requests well under 8192 bytes — no existing tests regress under the new enforcement path.
3. A `new NextRequest(url, { body: 'large string' })` in tests: string body creates a readable stream in Next.js test environment. `readStreamWithLimit` reads it correctly, as confirmed by the existing unit tests for the utility.
4. The existing `finally` block handles span.end() correctly for the new 413 path — `streamingActive` is `false` on the 413 early return, so `span.end()` is called. No extra span management needed.

---

## Proposed Changes

### 1. `app/api/frontier/base-generate/route.ts`

- Add `readStreamWithLimit` to existing `@/lib/security/contentLength` import.
- Add `const MAX_BODY_SIZE = 8192;` constant near top of file.
- Replace the `try { rawBody = await req.json() } catch { ... }` block with:
  1. Read `Content-Length` header: `const contentLengthHeader = req.headers.get('content-length');`
  2. `const declaredLength = contentLengthHeader !== null ? Number(contentLengthHeader) : MAX_BODY_SIZE;`
  3. `const { body: rawBytes, error: streamError } = await readStreamWithLimit(req, MAX_BODY_SIZE, declaredLength);`
  4. If `streamError`: set span ERROR status, return `new NextResponse('Payload Too Large', { status: 413 })` for 413, or `new NextResponse('Bad Request', { status: 400 })` for other errors.
  5. Replace `rawBody = await req.json()` with `rawBody = JSON.parse(new TextDecoder().decode(rawBytes));`
  6. Keep existing `catch` block for JSON.parse failure → `invalid_json` 400 response.

### 2. `app/api/adaptation/generate/route.ts`

Identical change pattern to item 1.

### 3. `__tests__/api/frontier-base-generate.test.ts` *(explicitly delegated to Backend)*

Add a new test case in the appropriate describe block:
- Request with no `Content-Length` header and body > 8192 bytes → route returns 413.
- Pattern: construct `NextRequest` using a `ReadableStream` body (prevents auto Content-Length) with `'x'.repeat(8200)` as payload. Assert `res.status === 413`.

### 4. `__tests__/api/adaptation-generate.test.ts` *(explicitly delegated to Backend)*

Same new test case for the adaptation route. Body must be > 8192 bytes. Assert `res.status === 413`.

**No changes to**: `middleware.ts`, `__tests__/middleware.test.ts`, `lib/security/contentLength.ts`, any frontend or E2E files.

---

## Contract Delta Assessment (Mandatory)

No contract changes — backend-only scope.

- Route contracts changed? No — same paths, no new routes.
- `data-testid` contracts changed? No.
- Accessibility/semantic contracts changed? No.
- Testing handoff required per workflow matrix? No — no route/selector/accessibility contract changes. Backend handles quality gates.

---

## Architectural Invariants Check

- [x] Observability Safety: 413 path uses `span.setStatus(ERROR)` and allows `span.end()` via existing `finally` block. No metric calls on 413 path (correct — it is not a fallback). Telemetry does not block/crash user-facing functionality.
- [x] Security Boundaries: All external inputs treated as untrusted. This CR strengthens the boundary — request payload bytes are now explicitly capped at stream level regardless of header.
- [x] Contract Preservation: No route paths, response shapes for existing status codes, `data-testid`, or accessibility semantics changed.
- [x] TypeScript Strict Mode: New code uses established types. `TextDecoder().decode()` returns `string`; `JSON.parse()` returns `unknown` — matches existing `let rawBody: unknown` declaration.

---

## Delegation & Execution Order

| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | Backend | Implement stream-level enforcement in both route handlers + add new tests for no-header oversized body case |

**Test delegation:** Creating/modifying test files (`__tests__/api/frontier-base-generate.test.ts`, `__tests__/api/adaptation-generate.test.ts`) is explicitly delegated to Backend for this [S] CR.

## Delegation Graph (MANDATORY)

- **Execution Mode**: Sequential (single agent, single session)
- **Dependency Map**: N/A — single sub-agent
- **Handoff Batch Plan**: Single handoff to Backend
- **Final Verification Owner**: Backend runs full quality gates and reports pass/fail

---

## Operational Checklist

- [x] **Environment**: No hardcoded values (8192 is an explicit policy constant with comment).
- [x] **Observability**: Span status set on 413 path. No metrics regression. No new metric needed for this CR.
- [x] **Artifacts**: No new files. `.gitignore` not affected.
- [x] **Rollback**: Remove the `readStreamWithLimit` block from both route handlers and restore `req.json()` call. One-file-level revert per route.

---

## Definition of Done (Technical)

- [ ] AC-1: POST to either generation route with body > 8192 bytes returns 413 regardless of `Content-Length` header state (absent, present-but-lying, or present-and-accurate).
- [ ] AC-2: The 413 rejection occurs before any upstream AI provider fetch call — no external API call is made for rejected bodies.
- [ ] AC-3: New test added for each route: no `Content-Length` header + body > 8192 bytes → 413.
- [ ] AC-4: All existing tests in `frontier-base-generate.test.ts` and `adaptation-generate.test.ts` continue to pass.
- [ ] AC-5: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` all pass.
- [ ] AC-6: No route path, response contract shape for existing codes, `data-testid`, or accessibility semantics changed.
