# Technical Plan - CR-021: Frontier and Adaptation Response Streaming

## Technical Analysis

Both generation routes currently buffer the full upstream response before returning:
- `await upstreamResponse.json()` blocks until all tokens are received
- Returns `NextResponse.json({mode, output, ...})` atomically

Streaming requires:
1. Adding `stream: true` to both upstream fetch request bodies
2. Piping the upstream SSE response through to the client via `ReadableStream`
3. Parsing upstream SSE chunks (format differs per pipeline) and re-emitting typed events
4. Frontend components replacing `await response.json()` with a streaming reader

Key challenges:
- **Protocol design**: Define SSE event types the client and server agree on before any sub-agent touches code
- **Mid-stream error surface**: Once a streaming response starts, a JSON fallback body cannot be retroactively sent
- **Timeout semantics**: `timeoutMs: 8000` was sized for buffered responses; streaming changes the temporal contract
- **Format divergence**: Frontier uses `/v1/completions` (chunks: `choices[0].text`); adaptation uses `/v1/chat/completions` (chunks: `choices[0].delta.content`)
- **Existing tests**: Both route test files mock `upstreamResponse.json()`; they must be updated alongside the route changes

## Discovery Findings

### Routes
- Frontier: `app/api/frontier/base-generate/route.ts`
  - Upstream fetch: lines 298–306 (AbortController + `fetch()`)
  - Buffers response: lines 373–392 (`upstreamResponse.json()`)
  - Output cap constant: `FRONTIER_OUTPUT_MAX_CHARS = 4000` (line 21)
- Adaptation: `app/api/adaptation/generate/route.ts`
  - Upstream fetch: lines 262–271
  - Buffers response: lines 338–357 (`upstreamResponse.json()`)
  - Output cap: `ADAPTATION_OUTPUT_MAX_CHARS = 4000` (via `ADAPTATION_GENERATION_CONFIG.outputMaxChars`)

### Config (Tech Lead can edit directly — `lib/config/`)
- `lib/config/generation.ts`:
  - `FRONTIER_GENERATION_CONFIG.timeoutMs: 8000`
  - `ADAPTATION_GENERATION_CONFIG.timeoutMs: 8000`
  - Tech Lead direct change planned: both → `30000`

### Components (Feature code → delegate)
- `app/foundations/transformers/components/FrontierBaseChat.tsx`
  - `await response.json()` at line 89
  - Loader at line 280 ("Querying frontier endpoint...")
  - Output at line 284–289 (conditional render with `hasGeneratedText`)
- `app/models/adaptation/components/AdaptationChat.tsx`
  - `await response.json()` at line 154
  - Loader at line 417 ("Querying adaptation endpoint...")
  - Output at line 422–427 (conditional render with `hasGeneratedText`)

### Shared server utility
- `lib/server/generation/shared.ts`: `FallbackReasonCode`, `mapProviderFailure`, `extractProviderErrorMessage`
- New file required: `lib/server/generation/streaming.ts` (SSE parsing helper — Backend Agent creates)

### Existing tests (update required — explicitly delegated to Backend Agent)
- `__tests__/api/frontier-base-generate.test.ts`: mocks `global.fetch` with buffered JSON response; streaming changes the response contract
- `__tests__/api/adaptation-generate.test.ts`: same pattern

### E2E tests (evaluate for streaming impact — Testing Agent)
- `__tests__/e2e/transformer.spec.ts`: line 62–66 tests `frontierSubmit` → `frontierSubmit.toBeEnabled({ timeout: 15000 })` and `frontierOutput.toContainText('$')`. With streaming:
  - The `$` prefix is still rendered in the output area (same component code path)
  - The 15s timeout for `frontier-submit` re-enable may be sufficient or may need extending depending on stream duration
  - The `Mode: (live|fallback)` status assertion needs to account for streaming status lifecycle
- No E2E test for adaptation chat found in `__tests__/e2e/` — Testing Agent to confirm and add coverage if needed

### Featherless-ai streaming support
- Both endpoints (`/v1/completions` and `/v1/chat/completions`) are OpenAI-compatible
- OpenAI-compatible SSE streaming (`stream: true`) is a standard feature of these endpoints
- Assumption: all four configured models support streaming via the featherless-ai router via HuggingFace Router
- Graceful degradation: if upstream does not return `Content-Type: text/event-stream`, Backend Agent treats as `invalid_provider_response` and falls back to existing JSON fallback

### Contract inventory
- Routes: no change (same route paths)
- `data-testid` contracts: all preserved per AC-12
  - Frontier: `frontier-form`, `frontier-input`, `frontier-submit`, `frontier-output`, `frontier-status`
  - Adaptation: `adaptation-chat`, `adaptation-chat-tab-{full-finetuning,lora-peft,prompt-prefix}`, `adaptation-chat-input`, `adaptation-chat-submit`, `adaptation-chat-form`, `adaptation-chat-output`, `adaptation-chat-status`
- Accessibility: `role="status"` + `aria-live="polite"` on status elements preserved; no semantic contract changes

## Implementation Decisions (Tech Lead Owned)

### D-1: SSE Protocol (Mid-Stream Error Surface)

**Decision**: Use typed SSE events. The route returns `Content-Type: text/event-stream`.

**Events emitted by our routes to the client:**

```
event: start
data: {"mode":"live","metadata":{...}}

event: token
data: {"text":" hello"}

event: done
data: {}
```

On mid-stream error:
```
event: error
data: {"code":"timeout","message":"Streaming was interrupted: provider timed out."}
```

**Pre-stream errors** (missing config, non-OK upstream, request validation failure): unchanged — still return `NextResponse.json()` with the existing fallback/error shape. The client detects streaming vs non-streaming by checking `response.ok` and `response.headers.get('content-type')`.

**Client routing logic:**
1. If HTTP status is not 200 → parse as JSON (existing error/fallback path, no change)
2. If HTTP 200 and `Content-Type` contains `text/event-stream` → read as SSE stream:
   - `start`: update `mode` state and `modelId`; transition loader to output area
   - `token`: append `text` to `output` state; show cursor
   - `done`: remove cursor; finalize `statusText` from `mode`
   - `error`: set `status = 'error'`; set `statusText` from error message; remove cursor; stop streaming

**Fallback mode in streaming context**: There is no streaming fallback. Fallback only triggers pre-stream. Once streaming begins (`start` event), the mode is always `live`.

### D-2: Upstream SSE Chunk Format

Each route parses its own upstream chunk format:
- Frontier (`/v1/completions`): extract `choices[0].text` from each parsed chunk JSON
- Adaptation (`/v1/chat/completions`): extract `choices[0].delta.content` from each parsed chunk JSON

Both skip `[DONE]` terminator lines and skip chunks where the relevant field is empty/null.

### D-3: Timeout Semantics

**Decision**: `timeoutMs: 8000` → `30000` (30 seconds) for both configs.

Rationale: For streaming, the AbortController timeout must cover connection establishment AND total stream duration. 8s is too short for streaming generation (tokens arrive progressively over several seconds). 30s provides a reasonable upper bound for an educational demo without leaving users stuck for excessive time.

This is a **Tech Lead direct change** to `lib/config/generation.ts` (permitted file: `lib/config/`).

### D-4: Output Cap Enforcement

The 4000-character cap is enforced server-side during streaming:
- Backend Agent tracks accumulated character count across `token` events
- Once cap is reached, emit `event: done` and close the stream (do not emit further tokens)
- This mirrors the existing `extractedOutput.slice(0, MAX_CHARS)` behavior in the buffered route

### D-5: Cursor Behavior

Per AC-5, AC-6: the blinking cursor element is rendered client-side during active streaming and removed on `done` or `error`.

The existing cursor span (`<span className="animate-pulse inline-block w-2 h-4 bg-emerald-300 ml-1 align-middle" />`) is currently shown permanently once `hasGeneratedText = true`. Frontend Agent changes this to only render during the `isStreaming` state (new state variable replacing the old all-in-one `isLoading`).

### D-6: Loading State Transition

Per AC-7, AC-8: "Querying..." loader shown until first token, then transitions to progressive output.

New state variable: `isStreaming` (boolean) — true from submit until `done`/`error` event.
New state variable: `hasFirstToken` — true once first `token` event arrives.

State machine:
- Submit: `isStreaming = true`, `hasFirstToken = false`, `output = ''`, show loader
- First token: `hasFirstToken = true`, loader disappears, output area shows accumulating tokens + cursor
- Done: `isStreaming = false`, cursor removed, status updated
- Error: `isStreaming = false`, cursor removed, error status shown

### D-7: Test Delegation

API route unit/integration tests (`__tests__/api/`) are explicitly delegated to Backend Agent.
This is a tech-lead exception: the route changes break the existing tests structurally (mock shape changes from buffered JSON to SSE stream), and it is most efficient for the Backend Agent to update them alongside the route implementation.

## Critical Assumptions

1. Featherless-ai router via HuggingFace Router supports OpenAI SSE streaming (`stream: true`) for all four configured models.
2. The HuggingFace Router SSE wire format follows standard OpenAI SSE: lines of `data: {...}` with `data: [DONE]` as the terminator.
3. No new npm packages are required — `ReadableStream`, `TextDecoder`, and SSE parsing are built-in to Node.js 20+ and the browser.
4. Next.js 15 App Router supports returning a `ReadableStream` from a Route Handler with `Content-Type: text/event-stream` (confirmed standard behavior).

## Proposed Changes

### Tech Lead direct (this session, before Backend handoff)
- `lib/config/generation.ts`: `timeoutMs: 8000` → `30000` in both configs

### Backend Agent (Step 1)
- CREATE `lib/server/generation/streaming.ts`: SSE relay utility
  - `parseCompletionsChunk(line: string): string | null` — extracts `choices[0].text`
  - `parseChatChunk(line: string): string | null` — extracts `choices[0].delta.content`
  - `createSSEStream(...)`: `ReadableStream` factory that takes upstream response, chunk parser, and metadata; emits typed events to client
- MODIFY `app/api/frontier/base-generate/route.ts`:
  - Add `stream: true` to `buildProviderRequestBody()` output
  - Replace `upstreamResponse.json()` path with SSE relay using `createSSEStream()` + `parseCompletionsChunk`
  - Pre-stream error paths unchanged (still return `NextResponse.json()` fallback)
  - Remove `extractProviderOutput()` (no longer needed for streaming path)
- MODIFY `app/api/adaptation/generate/route.ts`:
  - Same streaming migration with `parseChatChunk`
- MODIFY `__tests__/api/frontier-base-generate.test.ts`: update mocks for streaming response
- MODIFY `__tests__/api/adaptation-generate.test.ts`: update mocks for streaming response

### Frontend Agent (Step 2 — after Backend report reviewed)
- MODIFY `app/foundations/transformers/components/FrontierBaseChat.tsx`:
  - Replace `await response.json()` with SSE stream reader
  - Add `isStreaming` + `hasFirstToken` state
  - Update output area render: loader until `hasFirstToken`, then progressive output + cursor during `isStreaming`, cursor removed on done/error
  - All `data-testid` contracts preserved
- MODIFY `app/models/adaptation/components/AdaptationChat.tsx`:
  - Same streaming client implementation

### Testing Agent (Step 3 — after Frontend report reviewed)
- Review `__tests__/e2e/transformer.spec.ts` for streaming timing impact
  - Evaluate whether 15s timeout for `frontierSubmit.toBeEnabled` is sufficient (may need extension to 30s+ for streaming)
  - Verify `frontierOutput.toContainText('$')` still valid (output format unchanged structurally)
  - Verify `Mode: (live|fallback)` status assertion timing (status updates asynchronously on `start` event)
- Add or update adaptation E2E coverage if missing
- Run full E2E suite and report

## Contract Delta Assessment

- Route contracts changed: **No** — same route paths
- `data-testid` contracts changed: **No** — AC-12 preserved (all existing testids kept)
- Accessibility/semantic contracts changed: **No** — `role="status"` + `aria-live="polite"` preserved on status elements
- Testing handoff required per workflow matrix: **Yes** — behavioral contract of output elements changes (progressive vs atomic content delivery); E2E tests with timing assertions on `frontier-output` and `adaptation-chat-output` may need updating

## Architectural Invariants Check

- [x] **Observability Safety**: SSE relay streams the upstream response; OTel span ends after stream completes. Metrics (`safeMetric`) still called. Telemetry failures do not block streaming.
- [x] **Security Boundaries**: `FRONTIER_API_KEY` remains server-side only. Rate limiting (20 req/min middleware) is unaffected — middleware intercepts before the route handler. Payload-size constraints on the request body are unchanged.
- [x] **Threat Model**: Excessive payload protection unchanged. CSP unaffected. No new client-side dependencies.
- [x] **Component Rendering**: Existing Client Components remain Client Components (already `'use client'`). No RSC/CC boundary changes.

## Delegation & Execution Order

| Step | Agent | Task |
|------|-------|------|
| 0 | Tech Lead (direct) | Update `timeoutMs` in `lib/config/generation.ts` |
| 1 | Backend | Implement server-side SSE streaming for both routes; update route unit tests |
| 2 | Frontend | Implement client-side SSE reader in both components |
| 3 | Testing | Evaluate and update E2E tests for streaming timing/behavior |
| 4 | Tech Lead | Adversarial review, quality gates, BA handoff |

## Delegation Graph

- **Execution Mode**: Sequential
- **Dependency Map**:
  - Step 2 (Frontend) depends on Step 1 (Backend): Frontend needs the stable SSE protocol implemented and testable to verify the client reader works against the actual server
  - Step 3 (Testing) depends on Step 2 (Frontend): E2E tests must run against complete streaming UI
- **Handoff Batch Plan**:
  - Session A (current): Step 0 (direct) + Backend handoff → Wait State
  - Session B (after Backend complete): Review Backend report → Frontend handoff → Write TL-session-state.md → Wait State
  - Session C (after Frontend complete): Review Frontend report → Testing handoff → Wait State
  - Session D (after Testing complete): Adversarial review → Quality gates → BA handoff
- **Final Verification Owner**: Tech Lead (runs `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` in Session D)

**Two-session model note**: This CR has Backend AND Testing sub-agents — the two-session execution model applies (per `tech-lead.md`). Given sequential mode with three sub-agents, sessions are naturally bounded at each Wait State cycle.

## Operational Checklist

- [x] **Environment**: `timeoutMs` updated in config file (not hardcoded in route)
- [x] **Observability**: OTel spans and metrics preserved in both routes; span ends after stream completes
- [x] **Artifacts**: No new tooling artifacts; `.gitignore` unchanged
- [x] **Rollback**: Revert `lib/config/generation.ts` `timeoutMs` change + revert route/component changes (git revert is trivial)

## Definition of Done (Technical)

Corresponds to all 13 ACs from CR-021:

- [ ] AC-1: Frontier route returns SSE stream; first token arrives before full response completes
- [ ] AC-2: `FrontierBaseChat` renders tokens progressively into `data-testid="frontier-output"`
- [ ] AC-3: Adaptation route returns SSE stream for all three strategies
- [ ] AC-4: `AdaptationChat` renders tokens progressively into `data-testid="adaptation-chat-output"`
- [ ] AC-5: Blinking cursor visible in frontier output during streaming; removed on completion
- [ ] AC-6: Blinking cursor visible in adaptation output during streaming; removed on completion
- [ ] AC-7: Frontier "Querying..." loader shown until first token; transitions on first token
- [ ] AC-8: Adaptation "Querying..." loader shown until first token; transitions on first token
- [ ] AC-9: `frontier-submit` and `frontier-input` disabled for full streaming duration; re-enabled on done/error
- [ ] AC-10: `adaptation-chat-submit` and `adaptation-chat-input` disabled for full streaming duration; re-enabled on done/error
- [ ] AC-11: Pre-stream and mid-stream failures surface meaningful error/fallback indication on both components
- [ ] AC-12: All existing `data-testid` contracts preserved without rename
- [ ] AC-13: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` all pass

## Tech Lead Session State

`agent-docs/coordination/TL-session-state.md` will be written after Backend handoff is issued, capturing pending Frontend and Testing tasks for Session B+.
