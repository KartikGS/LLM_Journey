# Backend Development Standards

## Stack
-   Next.js API Routes (Route Handlers)
-   Node.js Runtime

## Guidelines
-   Default to JSON responses for product-facing APIs (`NextResponse.json`).
-   Allowed exceptions: proxy/status/streaming endpoints may return status-only or non-JSON bodies when contract-appropriate.
-   Use `NextResponse` for all responses.
-   Handle relevant HTTP status codes explicitly (for example `200`, `202`, `204`, `400`, `401`, `404`, `415`, `429`, `500`, `503`, `504`).
-   Treat endpoint-level request hardening as backend scope: payload-size limits, `content-length` checks, and route-specific validation/auth controls where applicable.
-   If a security change is global/platform-wide (middleware/header/runtime policy), coordinate via Infra ownership and explicit Tech Lead delegation.
-   Document new or changed route contracts in `/agent-docs/api/`.
-   Follow the [Development Standards](./development-standards.md).
-   When creating or modifying utilities in `lib/server/`, apply the Leaf Utility Isolation principle documented in Development Standards — keep them dependency-free.
-   After any function extraction task, audit the source file for newly unused imports and constants and remove them before running lint.

## Observability

### OTel Span Lifecycle During Streaming

Streaming routes require a non-obvious span lifecycle pattern. Do not call `span.end()` immediately after the route handler returns — the span must remain open for the duration of the stream.

**Required pattern:** Use a `streamingActive` flag to defer `span.end()` until the stream fully resolves.

```ts
// In the route handler:
let streamingActive = false;
try {
  streamingActive = true;
  const stream = new ReadableStream({ ... });
  // Pass span into streaming callbacks — do NOT call span.end() here
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
} catch (err) {
  if (!streamingActive) {
    span.recordException(err);
    span.end();  // Only end here if streaming never started
  }
  throw err;
} finally {
  // Do NOT call span.end() in finally — the stream may still be open
}
```

The span is ended via callbacks (`onDone`, `onMidStreamError`) that fire inside the `ReadableStream` controller after the last byte is flushed. Reference implementation: `lib/server/generation/streaming.ts`.

### SSE Client-Side Parsing

When parsing SSE streams on the client using `TextDecoder`, always pass `{ stream: true }` to prevent multi-byte character corruption across chunk boundaries:

```ts
const decoder = new TextDecoder('utf-8', { stream: true });
// In the ReadableStream pump loop:
const text = decoder.decode(value, { stream: true });
```

Omitting `{ stream: true }` causes characters split across chunks (e.g., multi-byte Unicode) to be decoded independently, producing replacement characters (`\uFFFD`).

## Client-Server Contract Parity

When a CR removes a server-emitted error code, error enum value, or any named contract member from a route handler:

1. **Flag in preflight**: Note the removal in the preflight report and name any client-side components known to handle that code (e.g., `AdaptationChat.tsx`).
2. **Scope decision**: Removing the client-side handler for the removed server code is the correct long-term action, but may be out of scope for the current Backend CR if the client file is Frontend-owned. The Tech Lead decides scope.
3. **Out-of-scope ghost handlers must be tracked**: If client cleanup is out of scope, create a follow-up tracking item in the completion report so it is not silently left. Do not leave client-side code that handles codes the server no longer emits without a tracking record.

> **Why this matters:** A client handler for a removed server code (ghost handler) is dead code that creates a false mental model of the contract. It does not cause a runtime error today but produces confusion during future contract changes and makes the codebase harder to reason about for developer-users.

## Verification Scope

Check the handoff DoD before applying any default here. If the DoD specifies a verification scope (e.g., full-suite `pnpm test`), that takes precedence. The role-doc default applies only when the DoD is silent on verification scope.

Default when the DoD is silent: run the scoped spec for the changed module only.
