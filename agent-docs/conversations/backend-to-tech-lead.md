# Report: Backend -> Tech Lead

## Subject
`CR-021 - Frontier and Adaptation Response Streaming: Backend Implementation`

## [Status]
`completed`

## Pre-Replacement Check (Conversation Freshness)
- Prior content: `CR-019`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-019-plan.md` ✓
- Evidence 2 (prior CR closed): CR-019 status `Completed` per `agent-docs/project-log.md` AND prior file shows `status: completed` ✓
- Result: replacement allowed.

---

## [Preflight: Assumptions]

1. **Featherless-ai streaming support**: Cannot verify without live credentials. Verification built into route: if upstream returns OK but not `text/event-stream`, route falls back to `invalid_provider_response`. Implementation proceeds per handoff.
2. **Next.js 15 App Router streaming**: `next.config.ts` reviewed — no response-buffering settings. `compress: true` is HTTP gzip/brotli, not SSE buffering. `new Response(readableStream, ...)` from a Route Handler works without additional config. **Confirmed — no blocking config.**
3. **`ReadableStream` in test environment**: `jest.setup.ts` polyfills `global.ReadableStream` and `TextEncoder`/`TextDecoder`. **Confirmed.**
4. **`extractProviderOutput` callers**: Only used in `app/api/frontier/base-generate/route.ts`. Safe to remove. **Confirmed — no other callers.**
5. **`lib/server/generation/` directory**: Only `shared.ts` existed. `streaming.ts` is a new file. **Confirmed.**

## [Preflight: Adjacent Risks]

1. **Existing live-path tests**: Both test files mocked JSON responses for the live path. After streaming migration, JSON upstream responses hit `invalid_provider_response` fallback. All live-path tests required structural updates — covered by this CR's explicit test delegation to Backend.
2. **Pre-existing test failures from CR-019**: 4 previously failing tests (test drift from config centralization, never resolved by a Testing Agent) are now resolved as part of this full test update.
3. **Node.js runtime**: `v16.20.1` system default — below `>=20.x`. Pre-existing per project-log.md. `nvm use 20` activates `v20.20.0`; all verification gates run under Node 20. Classified as `environmental` (pre-existing).
4. **Timeout during streaming**: `clearTimeout` removed from fetch `finally` block — 30s `AbortController` timeout stays active during streaming for mid-stream abort. Each non-streaming return path calls `clearTimeout` explicitly; stream factory calls it in its own `finally`. Intentional per handoff.
5. **`ReadableStream` polyfill parity**: Node 16 uses `stream/web` polyfill; production Next.js 15 uses native Node 18+ implementation. Low-risk for standard SSE line parsing.

## [Preflight: Open Questions]
- none

## [Preflight Status]
`clear-to-implement`

---

## [Scope Check]
- Handoff source: `agent-docs/conversations/tech-lead-to-backend.md`
- Files modified / created:
  - `lib/server/generation/streaming.ts` (new)
  - `app/api/frontier/base-generate/route.ts`
  - `app/api/adaptation/generate/route.ts`
  - `__tests__/api/frontier-base-generate.test.ts` (explicitly delegated to Backend per handoff)
  - `__tests__/api/adaptation-generate.test.ts` (explicitly delegated to Backend per handoff)
- Scope compliance:
  - [x] All modified files are in Backend ownership or explicitly delegated.
  - [x] Test files modified only because handoff explicitly delegates test scope to Backend for this CR.
  - [x] `lib/config/generation.ts` not touched (Tech Lead-owned, already updated).
  - [x] `lib/server/generation/shared.ts` not touched (no changes needed per handoff).

---

## [Changes Made]

1. **`lib/server/generation/streaming.ts`** (new):
   - `parseCompletionsChunk(line: string): string | null` — extracts `choices[0].text` from `/v1/completions` SSE data lines; skips null/empty/unparseable.
   - `parseChatChunk(line: string): string | null` — extracts `choices[0].delta.content` from `/v1/chat/completions` SSE data lines; skips null/empty/unparseable.
   - `createSseRelayStream(options: SseRelayOptions): ReadableStream<Uint8Array>` — streams upstream SSE body, emits typed `start` / `token` / `done` / `error` events, enforces `outputMaxChars` cap, calls `clearTimeout` + `onDone`/`onMidStreamError` callbacks in `finally`.

2. **`app/api/frontier/base-generate/route.ts`**:
   - Added `stream: true` to HuggingFace provider request body in `buildProviderRequestBody()`.
   - Replaced buffered `await upstreamResponse.json()` + `extractProviderOutput()` live path with content-type check + `createSseRelayStream` returning `text/event-stream` response.
   - Added `invalid_provider_response` fallback when upstream returns OK but non-SSE content-type.
   - Moved `clearTimeout(timeoutHandle)` from fetch `finally` to explicit call sites (fetch catch, non-OK path, non-SSE path); streaming path clears timeout inside stream `finally`.
   - Added `streamingActive` flag — outer `finally` calls `span.end()` only for non-streaming paths; streaming path calls `span.end()` via `onDone`/`onMidStreamError` callbacks after stream completes.
   - Removed dead code: `extractProviderOutput`, `extractContentText`, `toRecord` import, `LiveModeResponse` type.

3. **`app/api/adaptation/generate/route.ts`**:
   - Same streaming migration. Added `stream: true` to request body.
   - Content-type check + `createSseRelayStream` with `parseChatChunk`.
   - `start` event emits `{ mode: 'live', metadata: { strategy, modelId } }`.
   - Enforces 4000-char cap (`ADAPTATION_OUTPUT_MAX_CHARS`).
   - Same `clearTimeout` restructuring and `streamingActive` span guard.
   - Removed dead code: `extractChatOutput`, `LiveModeResponse` type.

4. **`__tests__/api/frontier-base-generate.test.ts`**:
   - Added `mockSseStreamResponse()` and `parseSseResponse()` helpers.
   - Replaced JSON live-path mocks with SSE stream mocks.
   - Updated "HF upstream succeeds" → SSE streaming path test verifying `start`/`token`/`done` events.
   - Updated "HF request body format" → adds `stream: true` assertion.
   - Updated "live envelope when upstream provider succeeds" → now tests `invalid_provider_response` for non-SSE content-type on OK response.
   - Updated "does not call fallbacks counter on a successful live response" → uses SSE mock + stream drain.
   - Added: output cap test, mid-stream AbortError test, explicit non-SSE-upstream fallback test.
   - Updated span attribute security test to use SSE mock + stream drain.

5. **`__tests__/api/adaptation-generate.test.ts`**:
   - Same pattern. Added `mockSseStreamResponse()`, `mockChatSseResponse()`, `parseSseResponse()` helpers.
   - Replaced `mockLiveResponse()` (JSON) with `mockChatSseResponse()` (SSE) across all live-path tests.
   - Added: output cap test for `full-finetuning`, mid-stream AbortError test, non-SSE-upstream fallback test, `stream: true` request body assertion test.
   - Removed: `jest.isolateModules`-based output cap test (replaced with standard SSE-based cap test).
   - Updated security tests to drain SSE response before checking span attributes.

---

## [Verification Results]

- **Command**: `node -v`
  - **Scope**: runtime preflight
  - **Execution Mode**: local-equivalent/unsandboxed (nvm use 20)
  - **Result**: `PASS — v20.20.0` (system default is v16.20.1, pre-existing mismatch; nvm activated v20.20.0 for verification)

- **Command**: `pnpm lint`
  - **Scope**: full suite
  - **Execution Mode**: local-equivalent/unsandboxed (Node 20)
  - **Result**: `PASS — No ESLint warnings or errors`

- **Command**: `pnpm exec tsc --noEmit`
  - **Scope**: full suite
  - **Execution Mode**: local-equivalent/unsandboxed (Node 20)
  - **Result**: `PASS — exit code 0`

- **Command**: `pnpm test`
  - **Scope**: full suite
  - **Execution Mode**: local-equivalent/unsandboxed (Node 20)
  - **Result**: `PASS — 17 suites, 162 tests, 0 failures`
  - **Note**: Open-handle warning (worker force-exit) is pre-existing, unrelated to this CR.
  - **Behavioral evidence mapped to handoff DoD**:
    - Streaming live path (frontier + adaptation): `text/event-stream` response with `start`/`token`/`done` events — covered by per-strategy tests ✓
    - Output cap: tokens exceeding 4000 chars → stream closes with `done` — covered ✓
    - Mid-stream error: AbortError from body reader → `event: error` emitted + fallback counter incremented ✓
    - Non-SSE upstream (OK + `application/json`): `invalid_provider_response` fallback JSON returned ✓
    - Pre-stream paths unchanged: missing config, timeout before connect, non-OK upstream, validation errors — all retained and passing ✓

---

## [AC-Security Confirmation]
- `FRONTIER_API_KEY` remains env-read only in `loadFrontierConfig()` and `loadAdaptationConfig()`.
- `FRONTIER_API_KEY` used only in upstream `Authorization: Bearer ...` header — not emitted in SSE events, span attributes, or log fields.
- SSE `start` event metadata (frontier): `{ label, modelId, assistantTuned, adaptation, note }` — no secrets.
- SSE `start` event metadata (adaptation): `{ strategy, modelId }` — no secrets.
- `ADAPTATION_SYSTEM_PROMPT` absent from SSE events (verified by test).

---

## [Out-of-Scope Requests Detected]
- none

## [Blockers]
- none

## [Failure Classification]
- `CR-related`: none.
- `pre-existing`: Node v16.20.1 system default (below >=20.x). nvm v20.20.0 used for all gates. Pre-existing per project-log.md Next Priorities.
- `environmental`: Open-handle warning (pre-existing, also noted in CR-018/019 reports).
- `non-blocking warning`: `next lint` deprecation warning (deprecating `next lint` command in favor of ESLint CLI) — no action required for this CR.

---

## [Deviations]

1. **`clearTimeout` restructured from fetch `finally` to explicit call sites** *(Minor)*: The existing pattern had `finally { clearTimeout(timeoutHandle) }` in the inner fetch try-catch. This was restructured to call `clearTimeout` explicitly in each non-streaming return path and inside the stream's `finally`. Required to keep the `AbortController` active during streaming for mid-stream abort support, as specified in the handoff. Rationale logged per Deviation Protocol.

2. **`onMidStreamError` callback receives error code** *(Minor)*: `SseRelayOptions.onMidStreamError` takes `'timeout' | 'upstream_error'` instead of `() => void` to propagate the correct reason code to the fallback counter increment. Improves observability accuracy without changing any contract.

3. **Removed dead code from both routes** *(Minor — required by `backend.md` audit rule)*: `extractProviderOutput`, `extractContentText`, `toRecord` import (frontier); `extractChatOutput`, `LiveModeResponse` (both routes). Confirmed unused after streaming migration by grep + review.

---

## [SSE Protocol Observations for Frontend Agent]

- `start` event is always emitted before the first `token` event.
- `token` events preserve whitespace exactly as received from upstream (`choices[0].text` or `choices[0].delta.content`).
- `done` event is emitted either on upstream `[DONE]`, on output cap (4000 chars), or on natural stream end (`done: true` from reader). Exactly one `done` event per stream.
- `error` event is emitted on mid-stream read failure (AbortError → `code: 'timeout'`; other → `code: 'upstream_error'`). No `done` follows an `error`.
- Client detection: `response.headers.get('content-type')` containing `text/event-stream` → SSE; `application/json` → existing fallback JSON (unchanged contract).

---

## [Ready for Next Agent]
`yes`

## [Follow-up Recommendations]
- Frontend Agent should update `FrontierBaseChat.tsx` and `AdaptationChat.tsx` to consume the SSE stream per the protocol above.
- Testing Agent should add E2E coverage for the streaming response path (Step 3 per CR-021 plan).
- Tech Lead/Infra should validate streaming behavior in a Node >=20 production-equivalent environment (system default is still v16.20.1).
