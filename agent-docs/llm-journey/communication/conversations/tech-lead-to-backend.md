# Handoff: Tech Lead → Backend Agent

## Subject
`CR-024 — Generation Route Body Size Enforcement`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing Backend handoff context: `CR-023`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-023-plan.md` ✓
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-023-purpose-driven-observability-refinement.md` status is `Done` ✓
- Result: replacement allowed for new CR context.

---

## Exact Artifact Paths (Mandatory)
- Requirement: `agent-docs/requirements/CR-024-generation-route-body-size-enforcement.md`
- Plan: `agent-docs/plans/CR-024-plan.md`
- Upstream report (if sequential): N/A — single agent
- Report back to: `agent-docs/llm-journey/communication/conversations/backend-to-tech-lead.md`

---

## Objective

Close the body size enforcement gap on both generation routes. When a POST request arrives at `/api/frontier/base-generate` or `/api/adaptation/generate` without a `Content-Length` header, the middleware body size check is skipped and `req.json()` reads the full body into memory with no byte cap. This CR replaces `req.json()` with a stream-level byte-capped read using the existing `readStreamWithLimit` utility, enforcing the 8192-byte policy regardless of header presence.

---

## Rationale (Why)

The middleware is configured with `contentLengthRequired: false` for generation routes — intentionally, to avoid 411-ing clients that omit `Content-Length`. But this means the header-based size check in middleware is bypassed for those clients. `req.json()` then reads an unbounded body before Zod validation can reject it.

`readStreamWithLimit` in `lib/security/contentLength.ts` already exists, is already tested, and is already used in production by the otel proxy route. Wiring it into the generation routes closes the gap without changing any middleware behavior, any client-facing contracts, or any existing tests.

This is a security correctness fix, not a behavioral change for well-formed clients.

---

## Known Environmental Caveats

- **Node.js runtime**: System runtime may be below `>=20.x`. Run `node -v` first. If below 20.x, activate via `nvm use 20`. If nvm unavailable, classify as `environmental` in your report.
- **pnpm**: Use `pnpm` exclusively. Never `npm` or `yarn`.
- **Live-path availability**: `no` — no API key required. All changes are testable via the fallback path and unit test infrastructure.

---

## Constraints

### Technical Constraints
- **No new npm packages.**
- **`maxBodySize` threshold stays at 8192** — enforce the existing policy, do not redefine it.
- **TypeScript strict mode** must remain satisfied — `pnpm exec tsc --noEmit` must pass.
- **No route path, response contract for existing status codes, `data-testid`, or accessibility semantics changed.**
- **Do NOT change `middleware.ts`** or `__tests__/middleware.test.ts`. The middleware test at line 246 (`'passes when content-length header is absent for /api/frontier/base-generate'`) remains valid and must continue to pass.

### Ownership Constraints
- **Files in scope** (explicit delegation):
  - `app/api/frontier/base-generate/route.ts`
  - `app/api/adaptation/generate/route.ts`
  - `__tests__/api/frontier-base-generate.test.ts` — test changes explicitly delegated to Backend
  - `__tests__/api/adaptation-generate.test.ts` — test changes explicitly delegated to Backend
- **Do NOT modify**: `middleware.ts`, `__tests__/middleware.test.ts`, `lib/security/contentLength.ts`, any frontend component, any E2E test, any config file.

---

## Assumptions To Validate (Mandatory)

- **Live-path availability**: `no` — API key not required.
- **Assumption 1**: `readStreamWithLimit` is exported from `lib/security/contentLength.ts`. Confirmed during TL discovery. Verify the import path before writing.
- **Assumption 2**: `new NextRequest(url, { body: ReadableStream })` is accepted in the test environment (same pattern used in `__tests__/lib/security/readStreamWithLimit.test.ts`). Confirm before writing oversized-body test helper.
- **Assumption 3**: Existing route test helper `createRequest` sends bodies well under 8192 bytes. Confirm by inspecting test file before adding new test cases — no existing test should be affected by the route change.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

- If you find any other route that calls `req.json()` without a byte cap, flag it in your report as a follow-up candidate — do not fix it in this CR.
- If the `readStreamWithLimit` function behaves differently than expected in the route handler context (e.g., `req.body` is null in a particular test setup), flag it immediately rather than working around it.
- Do not add a body-read timeout — this is out of scope for CR-024.

---

## Scope: Files to Modify

### 1. `app/api/frontier/base-generate/route.ts`

#### 1a. Add import
Add `readStreamWithLimit` to the existing `lib/security/contentLength` import. If no such import exists yet, add:
```ts
import { readStreamWithLimit } from '@/lib/security/contentLength';
```

#### 1b. Add constant
Near the top of the file (with the other route-level constants like `PROMPT_MAX_CHARS`):
```ts
const MAX_BODY_SIZE = 8192; // mirrors middleware maxBodySize policy for this route
```

#### 1c. Replace the body-reading block
The current code:
```ts
let rawBody: unknown;

try {
    rawBody = await req.json();
} catch {
    span.setStatus({ code: SpanStatusCode.ERROR, message: 'Invalid JSON body' });
    return NextResponse.json<RequestErrorResponse>(
        {
            error: {
                code: 'invalid_json',
                message: 'Request body must be valid JSON.',
            },
        },
        { status: 400 }
    );
}
```

Replace with:
```ts
const contentLengthHeader = req.headers.get('content-length');
const declaredLength = contentLengthHeader !== null ? Number(contentLengthHeader) : MAX_BODY_SIZE;

const { body: rawBytes, error: streamError } = await readStreamWithLimit(req, MAX_BODY_SIZE, declaredLength);
if (streamError) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: streamError.message });
    return new NextResponse(
        streamError.status === 413 ? 'Payload Too Large' : 'Bad Request',
        { status: streamError.status }
    );
}

let rawBody: unknown;

try {
    rawBody = JSON.parse(new TextDecoder().decode(rawBytes));
} catch {
    span.setStatus({ code: SpanStatusCode.ERROR, message: 'Invalid JSON body' });
    return NextResponse.json<RequestErrorResponse>(
        {
            error: {
                code: 'invalid_json',
                message: 'Request body must be valid JSON.',
            },
        },
        { status: 400 }
    );
}
```

**Note on `declaredLength`:** When `Content-Length` is absent, `declaredLength = MAX_BODY_SIZE`. This makes `readStreamWithLimit`'s secondary check (`offset + value.length > declaredLength`) equivalent to the primary limit check (`offset + value.length > MAX_BODY_SIZE`). Both fire at 8193 bytes — correct behavior. When `Content-Length` is present, the declared value is passed; the primary `limit` parameter (8192) still enforces the cap even if the header overstates the body size.

**Note on span/metrics for 413 path:** Set `span.setStatus(ERROR)` — already in the block above. Do NOT call `getFrontierGenerateFallbacksCounter()` on the 413 path. A 413 rejection is not a fallback. The existing `finally` block handles `span.end()` correctly since `streamingActive` remains `false`.

---

### 2. `app/api/adaptation/generate/route.ts`

Identical change pattern to item 1. Same import, same `MAX_BODY_SIZE` constant, same body-reading block replacement.

The only difference is the import line — adaptation route does not currently import from `lib/security/contentLength`. Add:
```ts
import { readStreamWithLimit } from '@/lib/security/contentLength';
```

---

### 3. `__tests__/api/frontier-base-generate.test.ts` *(explicitly delegated)*

Read the file before editing.

Add a new test case covering AC-3. Suggested placement: new `describe` block or inline with existing request-validation tests. The test must:

1. Create a `NextRequest` **without** a `Content-Length` header and with a body exceeding 8192 bytes. Use a `ReadableStream` body to avoid the runtime auto-setting `Content-Length`:

```ts
function createOversizedStreamRequest(url: string): NextRequest {
    const payload = 'x'.repeat(8200); // > 8192 bytes
    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            controller.enqueue(new TextEncoder().encode(payload));
            controller.close();
        },
    });
    return new NextRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No Content-Length header — intentional
        body: stream,
        // @ts-expect-error duplex required for streaming body in some environments
        duplex: 'half',
    });
}
```

2. Assert the response status is 413:

```ts
it('returns 413 for body exceeding 8192 bytes with no Content-Length header', async () => {
    const req = createOversizedStreamRequest('http://localhost/api/frontier/base-generate');
    const res = await POST(req);
    expect(res.status).toBe(413);
});
```

**If `duplex: 'half'` causes a TypeScript error that the `@ts-expect-error` does not suppress cleanly, use `as unknown as NextRequest` cast on the options object instead.**

---

### 4. `__tests__/api/adaptation-generate.test.ts` *(explicitly delegated)*

Same new test case. Update the URL to `'http://localhost/api/adaptation/generate'` and call the `POST` import from the adaptation route. The `createOversizedStreamRequest` helper can be defined locally in this file as well (or extracted to a shared test util — your choice, but do not create a new shared file if this would be the only consumer).

```ts
it('returns 413 for body exceeding 8192 bytes with no Content-Length header', async () => {
    const req = createOversizedStreamRequest('http://localhost/api/adaptation/generate');
    const res = await POST(req);
    expect(res.status).toBe(413);
});
```

---

## Definition of Done

- [ ] **AC-1**: POST to either generation route with body > 8192 bytes returns 413 regardless of `Content-Length` header state (absent, present-but-understated, present-and-accurate-but-oversized).
- [ ] **AC-2**: The 413 rejection occurs before any `fetch()` call to the upstream AI provider — the body rejection happens in the stream-read block, which precedes the upstream fetch block.
- [ ] **AC-3**: New test added for each route: no `Content-Length` header + body > 8192 bytes → 413 (`frontier-base-generate.test.ts` and `adaptation-generate.test.ts`).
- [ ] **AC-4**: All existing tests in both route test files continue to pass (no regression).
- [ ] **AC-5**: `pnpm lint` passes, `pnpm exec tsc --noEmit` passes, `pnpm test` passes, `pnpm build` passes.
- [ ] **AC-6**: No route path, existing response contract shapes, `data-testid`, or accessibility semantics changed.
- [ ] Grep confirmation: `grep -n "req.json" app/api/frontier/base-generate/route.ts` and `grep -n "req.json" app/api/adaptation/generate/route.ts` both return **no matches**.
- [ ] `grep -n "readStreamWithLimit" app/api/frontier/base-generate/route.ts` and `grep -n "readStreamWithLimit" app/api/adaptation/generate/route.ts` both return matches.

---

## Clarification Loop (Mandatory)

Before implementation, Backend posts preflight note to `agent-docs/llm-journey/communication/conversations/backend-to-tech-lead.md` covering:
- Assumptions confirmed or invalidated
- Any adjacent risks discovered
- Open questions (if non-trivial — pause and await TL response before implementing)

---

## Verification

Run in sequence. Report each using the Command Evidence Standard:

```
node -v
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Format for each:
- **Command**: `[exact command]`
- **Scope**: `[full suite | targeted]`
- **Execution Mode**: `[sandboxed | local-equivalent/unsandboxed]`
- **Result**: `[PASS/FAIL + key counts or failure summary]`

DoD grep commands must be included in the completion report with their output.

---

## Execution Checklist (Mandatory)

Before starting:
- [ ] Read this handoff completely
- [ ] Read the plan at `agent-docs/plans/CR-024-plan.md`
- [ ] Read `app/api/frontier/base-generate/route.ts` before modifying it
- [ ] Read `app/api/adaptation/generate/route.ts` before modifying it
- [ ] Read `__tests__/api/frontier-base-generate.test.ts` before modifying it
- [ ] Read `__tests__/api/adaptation-generate.test.ts` before modifying it
- [ ] Read `lib/security/contentLength.ts` to confirm `readStreamWithLimit` signature
- [ ] Write preflight note to `backend-to-tech-lead.md`

Before reporting:
- [ ] All Definition of Done items verified
- [ ] Full quality gate run completed in sequence (`pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`)
- [ ] Completion report written to `backend-to-tech-lead.md` using the template

---

## Scope Extension Control

If any feedback expands implementation beyond this handoff scope, mark it `scope extension requested` in your report. Wait for explicit `scope extension approved` before implementing expanded work.

---

## Report Back

Write completion report to `agent-docs/llm-journey/communication/conversations/backend-to-tech-lead.md` using `agent-docs/llm-journey/communication/conversations/TEMPLATE-backend-to-tech-lead.md`.

Status vocabulary: `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`
