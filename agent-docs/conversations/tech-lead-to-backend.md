# Handoff: Tech Lead → Backend Agent

## Subject
`CR-021 — Frontier and Adaptation Response Streaming: Backend Implementation`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior content: `CR-019`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-019-plan.md` ✓
- Evidence 2 (prior CR closed): CR-019 status `Completed` per `agent-docs/project-log.md` ✓
- Result: replacement allowed.

## Exact Artifact Paths (Mandatory)
- Requirement: `agent-docs/requirements/CR-021-frontier-response-streaming.md`
- Plan: `agent-docs/plans/CR-021-plan.md`
- Upstream report (if sequential): N/A — this is Step 1
- Report back to: `agent-docs/conversations/backend-to-tech-lead.md`

---

## Objective

Migrate both generation routes from buffered JSON responses to SSE (Server-Sent Events) streaming. After this change, the frontier and adaptation routes return `Content-Type: text/event-stream` and relay upstream tokens progressively to the client as they arrive. Pre-stream error paths remain unchanged (still return JSON fallback).

---

## Rationale (Why)

Both routes currently buffer the full upstream response (`await upstreamResponse.json()`) before sending anything to the client — causing up to ~8s of blank spinner for Product End Users. Streaming eliminates perceived wait time and makes the "watch the model think" educational experience tangible. This is the highest-impact UX change available without altering educational content.

The Tech Lead has already updated `lib/config/generation.ts` (`timeoutMs: 8000` → `30000`) to cover streaming duration.

---

## Known Environmental Caveats (Mandatory)

- **Node.js runtime**: System may be below `>=20.x` documented minimum. Run `node -v` first. If below v20, activate via `nvm use 20`. If nvm unavailable, classify as `environmental` and document — do not skip verification.
- **pnpm**: Use `pnpm` exclusively. Never `npm` or `yarn`.
- **Port**: Dev server on `3001`. Not required for lint/type/unit verification.
- **E2E**: Not in scope for this step. Testing Agent handles E2E in Step 3.

---

## SSE Protocol (Tech Lead Defined — Must Implement Exactly)

The routes must emit the following typed SSE events. Do not invent additional event types.

**Normal streaming flow:**
```
event: start
data: {"mode":"live","metadata":{...}}

event: token
data: {"text":" hello"}

event: token
data: {"text":" world"}

event: done
data: {}
```

**Mid-stream error:**
```
event: error
data: {"code":"timeout","message":"Streaming was interrupted: provider timed out."}
```

**`start` event data shape:**
- Frontier: `{"mode":"live","metadata":{"label":"Frontier Base Model","modelId":"...","assistantTuned":false,"adaptation":"none","note":"Pretrained on internet-scale text; not assistant fine-tuned."}}`
- Adaptation: `{"mode":"live","metadata":{"strategy":"<strategyId>","modelId":"..."}}`

**`token` event data shape:** `{"text":"<raw token string>"}` — preserve whitespace as received from upstream.

**`done` event data shape:** `{}` — no payload needed.

**`error` event data shape:** `{"code":"<FallbackReasonCode>","message":"<human-readable message>"}`.

**Client detection:** The client determines streaming vs non-streaming by `response.headers.get('content-type')`. If it contains `text/event-stream`, read as SSE. If `application/json`, parse as existing fallback/error JSON. Do not change the HTTP status code of the pre-stream fallback path (still 200 for fallback, 400 for validation errors).

---

## Upstream SSE Chunk Format (Both Pipelines)

The featherless-ai router returns standard OpenAI SSE format:

```
data: {"id":"...","choices":[{"text":" hello","finish_reason":null}]}

data: [DONE]
```

For `/v1/completions` (Frontier): token text is at `choices[0].text`
For `/v1/chat/completions` (Adaptation): token text is at `choices[0].delta.content`

**Parsing rules:**
- Lines starting with `data: ` — strip prefix, parse JSON
- Skip if line is `data: [DONE]` — this terminates the stream (emit `event: done`)
- Skip if line is empty or does not start with `data: `
- Skip if `choices[0].text` (or `.delta.content`) is empty string, null, or undefined
- On JSON parse failure for a chunk — skip the chunk, do not abort the stream

---

## Constraints

### Technical
- **Pre-stream error paths are unchanged.** If config is missing, upstream returns non-OK, or request is invalid: still return `NextResponse.json()` with the existing fallback/error shape. Do not change these paths.
- **Output cap**: Track accumulated character count across `token` events. Once accumulated text reaches 4000 chars, emit `event: done` and close the stream. Do not emit further tokens beyond the cap.
- **AbortController**: Keep the existing `AbortController` + `clearTimeout` pattern. `timeoutMs` is now 30000 (already updated in config). The AbortController fires if no upstream response starts within the timeout.
- **Mid-stream abort**: If the AbortController fires after streaming has started, emit `event: error` with `code: 'timeout'` before closing the stream.
- **OTel span**: `span.end()` must be called in `finally` after the entire stream completes (not before). For the live streaming path, increment the fallback counter only on mid-stream error — not on successful stream completion.
- **`FRONTIER_API_KEY`** must never appear in response payloads, log fields, or span attributes.
- **No new npm packages.** `ReadableStream`, `TextDecoder`, and SSE parsing are built-in.
- **TypeScript strict mode.** All types must be explicit; no implicit `any`.

### Ownership
- You own: `lib/server/generation/streaming.ts` (new), `app/api/frontier/base-generate/route.ts`, `app/api/adaptation/generate/route.ts`, `__tests__/api/frontier-base-generate.test.ts`, `__tests__/api/adaptation-generate.test.ts`
- **API route unit tests are explicitly delegated to Backend Agent** for this CR (exception to default Testing Agent ownership — the mock shape changes structurally alongside the route).
- Do NOT modify: `lib/config/generation.ts` (Tech Lead-owned, already updated), `lib/server/generation/shared.ts` (no changes needed), any frontend component.

---

## Assumptions To Validate (Mandatory)

1. **Featherless-ai streaming**: `stream: true` is supported by the featherless-ai router via HuggingFace Router for the OpenAI-compatible SSE format at both endpoints. If the upstream does not return `Content-Type: text/event-stream`, treat as `invalid_provider_response` fallback. Document finding in preflight note.
2. **Next.js streaming**: Returning `new Response(readableStream, { headers: { 'Content-Type': 'text/event-stream', ... } })` from a Next.js 15 App Router Route Handler works without additional config. Confirm `next.config.js` has no response-buffering settings that would break this.
3. **`ReadableStream` in Node 20+**: Available without polyfill in the test/runtime environment.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

- If featherless-ai does not support streaming for a specific model, flag with the model name and propose a per-model fallback before implementing.
- If Next.js 15 requires a different streaming API, flag immediately — this is a plan-level assumption.
- Do not add authentication changes, new rate-limiting logic, or new route paths.
- Do not modify `FrontierBaseChat.tsx` or `AdaptationChat.tsx` — Frontend Agent scope.

---

## Scope

### New File

**`lib/server/generation/streaming.ts`**

Create with at minimum these exports:

```typescript
/**
 * SSE chunk parsers for generation routes.
 * CR-021: shared parsing logic for frontier (/v1/completions) and adaptation (/v1/chat/completions).
 */

/** Extracts token text from a /v1/completions SSE data line. Returns null to skip. */
export function parseCompletionsChunk(line: string): string | null { ... }

/** Extracts token text from a /v1/chat/completions SSE data line. Returns null to skip. */
export function parseChatChunk(line: string): string | null { ... }
```

Stream relay logic (`ReadableStream` factory) may also be extracted here to avoid duplicating logic across both routes. Follow the structure and error-handling patterns of the existing route files — deviations are listed in your preflight note and take precedence over implied patterns.

### Files to Modify

**`app/api/frontier/base-generate/route.ts`**
- Add `stream: true` to the HuggingFace provider branch in `buildProviderRequestBody()`. Leave the `openai` branch unchanged.
- After upstream fetch succeeds and `upstreamResponse.ok` is true:
  - Verify `upstreamResponse.headers.get('content-type')` contains `text/event-stream`. If not, return `invalid_provider_response` fallback JSON.
  - Return a streaming response piping upstream SSE → typed client events per the protocol above.
  - Use `parseCompletionsChunk` for token extraction.
  - Emit `event: start` with frontier metadata before first token.
  - Emit `event: token` for each non-empty token string.
  - Track accumulated character count; emit `event: done` and close once 4000 chars reached.
  - On upstream `[DONE]`: emit `event: done`.
  - On mid-stream error/abort: emit `event: error` and close.
- All pre-stream error paths unchanged.
- `extractProviderOutput()` is no longer on the live path — remove it only after confirming no other callers (grep first).

**`app/api/adaptation/generate/route.ts`**
- Same streaming migration. Use `parseChatChunk` for token extraction.
- Emit `event: start` with `{"mode":"live","metadata":{"strategy":"<strategyId>","modelId":"<modelId>"}}`.
- Enforce 4000-char cap.
- All pre-stream error paths unchanged.

**`__tests__/api/frontier-base-generate.test.ts`**
- Update `global.fetch` mock for the live path to return a mock SSE stream response (a `Response` with `body` as a `ReadableStream` emitting SSE lines, `content-type: text/event-stream`).
- Required new test cases:
  - Live streaming path: mock emits `start` + 2–3 `token` events + `done`; verify route returns a `text/event-stream` response with correct typed events.
  - Output cap: mock emits enough tokens to exceed 4000 chars; verify stream closes at cap.
  - Mid-stream error (AbortError after `upstreamResponse.ok`): verify `event: error` is emitted.
  - Non-streaming upstream response (missing `text/event-stream` content-type on OK response): verify `invalid_provider_response` fallback JSON returned.
- Existing pre-stream tests (missing config, timeout before connect, non-OK upstream, validation errors): keep and update as needed.

**`__tests__/api/adaptation-generate.test.ts`**
- Same pattern. Cover all three strategies for the streaming live path.

---

## Definition of Done

- [ ] `lib/server/generation/streaming.ts` created with `parseCompletionsChunk` and `parseChatChunk` exports.
- [ ] Frontier route: `stream: true` in HuggingFace request body; live path returns `text/event-stream`; typed SSE events match the protocol above; pre-stream fallback paths unchanged.
- [ ] Adaptation route: same. Applies for all three strategies.
- [ ] Output cap (4000 chars) enforced server-side in both streaming routes.
- [ ] OTel span ends after stream completes; `FRONTIER_API_KEY` absent from all response payloads, logs, span attributes.
- [ ] Route unit tests updated: streaming live path covered; pre-stream paths retained; output cap + mid-stream error + non-SSE-upstream cases added.
- [ ] `pnpm lint` passes with zero errors.
- [ ] `pnpm exec tsc --noEmit` passes with zero errors.
- [ ] `pnpm test` passes. All tests outside the two modified test files remain green.

---

## Clarification Loop (Mandatory)

Before implementation, post a preflight note to `agent-docs/conversations/backend-to-tech-lead.md` covering:
- Assumptions confirmed or invalidated.
- Adjacent risks not in current scope.
- Open questions (flag before implementing if they affect contracts or scope).

---

## Verification

Run in sequence. Report each using the Command Evidence Standard:

```
node -v
pnpm lint
pnpm exec tsc --noEmit
pnpm test
```

For each:
- **Command**: `[exact command]`
- **Scope**: `[full suite | targeted]`
- **Execution Mode**: `[sandboxed | local-equivalent/unsandboxed]`
- **Result**: `[PASS/FAIL + key counts or failure summary]`

---

## Report Back

Write completion report to `agent-docs/conversations/backend-to-tech-lead.md` using `agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md`.

Status vocabulary: `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`

Report must include:
- Preflight note (assumptions confirmed/invalidated).
- Summary of each file changed.
- Verification evidence (Command Evidence Standard format).
- Deviations from this spec (if any), classified per the Deviation Protocol.
- Any SSE protocol observations for the Frontend Agent (e.g., if chunk timing or format differs from plan assumptions).
