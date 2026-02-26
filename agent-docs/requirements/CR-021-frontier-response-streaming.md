# CR-021: Frontier and Adaptation Response Streaming

## Status
`Done`

## Business Context
**User Need:** Both the frontier base chat and the adaptation chat currently block the Product End User for the full generation duration (~up to 8s) before displaying any output. This creates a poor interactive experience and undercuts the educational demos' credibility — learners stare at a spinner rather than watching the model "think."

**Expected Value:** Token-by-token streaming eliminates perceived wait time and gives learners immediate feedback that generation is in progress. It matches the interactive feel of modern LLM interfaces and keeps learners engaged during Stage 1 (Transformers) and Stage 2 (Model Adaptation) of the LLM Journey. It also demonstrates a real production streaming pattern as an educational signal.

**Execution Mode:** Standard

## Functional Requirements
1. The frontier API route (`/api/frontier/base-generate`) returns a streaming response to the client as the upstream provider generates tokens, rather than buffering the full response before responding.
2. The adaptation API route (`/api/adaptation/generate`) returns a streaming response to the client as the upstream provider generates tokens, rather than buffering the full response before responding. This applies across all three strategies (`full-finetuning`, `lora-peft`, `prompt-prefix`).
3. `FrontierBaseChat` reads the streaming response progressively and renders tokens into the output area as they arrive.
4. `AdaptationChat` reads the streaming response progressively and renders tokens into the output area as they arrive.
5. A typing/cursor indicator is visible in both components during active streaming and is removed on completion.
6. The existing loading states ("Querying frontier endpoint..." / "Querying adaptation endpoint...") persist until the first token arrives in each respective component.
7. Submit and input remain disabled for the full duration of streaming in both components.
8. On upstream failure (pre-stream or mid-stream), the user receives a meaningful error or fallback indication in both components — exact mid-stream error UX is delegated to Tech Lead design (see Constraints).

## Non-Functional Requirements
- Performance: First token must appear in each output area within the connection timeout window. No additional full-response latency introduced beyond what the upstream provider's first-token latency dictates.
- Security: Streaming implementation must not bypass existing payload-size limits or rate-limiting middleware on either route. The `FRONTIER_API_KEY` used by both routes must remain server-side only.
- Accessibility: Streaming output areas must remain readable to screen readers on completion. Dynamic content announcements during streaming are acceptable, but full text must be accessible after generation ends.

## System Constraints & Invariants
- **Constraint Mapping**:
  - `tooling-standard.md`: TypeScript strict mode, ESLint, Prettier — all must remain passing.
  - `architecture.md` (Security Boundaries): All external inputs remain untrusted; payload size constraints must not be weakened on either route.
  - `architecture.md` (Observability Safety): Telemetry (if used in these routes) must not block or degrade the streaming response.
  - `ADR-0001`: OTel proxy architecture is unaffected by this CR.
  - `technical-context.md`: Generation route rate limiting (20 req/min) must not be weakened on either route.
- **Design Intent**: Standard feature extension — adding streaming support to two existing, parallel pipelines. Not a core architectural pivot. The ONNX/tiny transformer browser inference path is explicitly out of scope.
- **Fallback Constraint (Critical)**: The current `{mode: 'fallback', output: staticText}` JSON response pattern applies to both routes and cannot be sent retroactively once streaming starts. The Tech Lead must define the mid-stream error surface for both routes before sub-agents begin implementation.
- **Upstream Format Difference**: Frontier uses `/v1/completions` (plain text format); adaptation uses `/v1/chat/completions` (chat messages format). Both are OpenAI-compatible and support `stream: true`, but the streamed chunk shape differs. Tech Lead must handle both response formats.
- **Timeout Constraint**: The current `timeoutMs: 8000` in both `FRONTIER_GENERATION_CONFIG` and `ADAPTATION_GENERATION_CONFIG` was designed for buffered responses. For streaming, this needs explicit re-evaluation for each route. Do not inherit current values silently.
- **Upstream Streaming Confirmation**: Confirm `stream: true` is supported by the featherless-ai router for all four configured models (`meta-llama/Meta-Llama-3-8B`, `meta-llama/Meta-Llama-3-8B-Instruct`, `swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA`, `meta-llama/Meta-Llama-3-8B`) before implementation begins. If any model is unsupported, a graceful degradation path is required for that strategy.

## Acceptance Criteria
- [x] AC-1: The frontier API route delivers tokens progressively (SSE or `ReadableStream`). The client receives the first token before the full response is complete under normal upstream conditions. — Verified: `app/api/frontier/base-generate/route.ts` streaming path returns `new Response(stream, {'Content-Type':'text/event-stream',...})`; `__tests__/api/frontier-base-generate.test.ts` verifies SSE live path; E2E `transformer.spec.ts` asserts output contains `'$'` within 30s.
- [x] AC-2: `FrontierBaseChat` renders tokens progressively into `data-testid="frontier-output"`. The full response does not appear atomically after a delay. — Verified: `FrontierBaseChat.tsx` line 116 `setOutput((prev) => prev + text)` accumulates incrementally; lines 381–391 `hasGeneratedText || hasFirstToken` condition activates output area on first token (BA independent read confirmed).
- [x] AC-3: The adaptation API route delivers tokens progressively for all three strategies. The client receives the first token before the full response is complete under normal upstream conditions. — Verified: `app/api/adaptation/generate/route.ts` uses `parseChatChunk` across all strategy branches; `__tests__/api/adaptation-generate.test.ts` covers all three strategies in SSE live-path tests.
- [x] AC-4: `AdaptationChat` renders tokens progressively into `data-testid="adaptation-chat-output"`. The full response does not appear atomically after a delay. — Verified: `AdaptationChat.tsx` line 182 `setOutput((prev) => prev + text)`; lines 515–525 same `hasGeneratedText || hasFirstToken` render condition (BA independent read confirmed); E2E `adaptation.spec.ts` asserts output contains `'$'`.
- [x] AC-5: A blinking cursor or equivalent typing indicator is visible in the frontier output area during active streaming, and is removed when generation completes. — Verified: `FrontierBaseChat.tsx` line 388 `{isStreaming && hasFirstToken && <span className="animate-pulse ..."/>}`; removed via `setIsStreaming(false)` in `finally` at line 264 (BA independent read confirmed).
- [x] AC-6: A blinking cursor or equivalent typing indicator is visible in the adaptation output area during active streaming, and is removed when generation completes. — Verified: `AdaptationChat.tsx` lines 522–524 same conditional cursor; removed via `setIsStreaming(false)` in `finally` at line 325 (BA independent read confirmed).
- [x] AC-7: The "Querying frontier endpoint..." loading state is displayed from submit until the first token arrives; it does not persist after streaming begins. — Verified: `FrontierBaseChat.tsx` line 376 `{isStreaming && !hasFirstToken ? <Loader2 ...>Querying frontier endpoint...</span>}`; transitions when `setHasFirstToken(true)` fires on first `token` SSE event (BA independent read confirmed).
- [x] AC-8: The "Querying adaptation endpoint..." loading state is displayed from submit until the first token arrives; it does not persist after streaming begins. — Verified: `AdaptationChat.tsx` line 510 same `isStreaming && !hasFirstToken` guard; transitions on first token (BA independent read confirmed).
- [x] AC-9: `data-testid="frontier-submit"` and `data-testid="frontier-input"` remain disabled for the full streaming duration and are re-enabled on completion or error. — Verified: `FrontierBaseChat.tsx` line 342 textarea `disabled={isStreaming}`, line 349 button `disabled={isStreaming}`; `finally { setIsStreaming(false) }` at line 264 re-enables on both done and error (BA independent read confirmed); E2E `transformer.spec.ts` asserts disabled → re-enabled `{timeout: 30000}`.
- [x] AC-10: `data-testid="adaptation-chat-submit"` and `data-testid="adaptation-chat-input"` remain disabled for the full streaming duration and are re-enabled on completion or error. — Verified: `AdaptationChat.tsx` line 477 `disabled={isStreaming}` on textarea, line 483 on submit button; `finally { setIsStreaming(false) }` at line 325 (BA independent read confirmed); E2E `adaptation.spec.ts` asserts disabled → re-enabled `{timeout: 30000}`.
- [x] AC-11: On upstream failure before streaming begins, both components show a meaningful error or fallback indication (equivalent to current fallback/error display behavior). Mid-stream failure UX meets the Tech Lead's agreed design. — Verified: pre-stream non-200 paths unchanged in both components (lines 160–186 frontier, lines 224–250 adaptation); mid-stream `error` SSE event handled at `FrontierBaseChat.tsx` lines 124–131 and `AdaptationChat.tsx` lines 188–195 — sets `status='error'`, updates statusText, clears output (BA independent read confirmed). `FRONTIER_API_KEY` not present in any SSE event payload in `lib/server/generation/streaming.ts` (BA independent read confirmed).
- [x] AC-12: Existing `data-testid` contracts are preserved without rename. — Verified (BA independent read):
  - Frontier: `frontier-status` (line 302), `frontier-form` (line 329), `frontier-input` (line 335), `frontier-submit` (line 347), `frontier-output` (line 363) — all present, none renamed.
  - Adaptation: `adaptation-chat` (line 330), `adaptation-chat-tab-full-finetuning/lora-peft/prompt-prefix` (TAB_CONFIGS lines 31/46/61, rendered at line 345), `adaptation-chat-status` (line 434), `adaptation-chat-form` (line 462), `adaptation-chat-input` (line 470), `adaptation-chat-submit` (line 481), `adaptation-chat-output` (line 497) — all present, none renamed or added.
- [x] AC-13: Quality gates pass: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build`. — Verified: `pnpm test` 162 passed/0 failures; `pnpm lint` no errors; `pnpm exec tsc --noEmit` exit 0; `pnpm build` PASS (pre-existing OTel warning unrelated); `pnpm test:e2e` 30/30 passed — all local-equivalent/unsandboxed Node v20.20.0.

## Verification Mapping
- **Development Proof**:
  - AC-1, AC-3: Tech Lead provides evidence of streaming response (e.g., `curl` showing chunked transfer, or network panel showing progressive chunks for both routes).
  - AC-2, AC-4–AC-10: Manual browser verification — dev tools network tab showing chunked responses; UI showing progressive text with cursor for both components.
  - AC-11: Manual test of forced upstream failure on each route confirming error state is visible.
  - AC-12: Tech Lead confirms no `data-testid` renames in diff.
  - AC-13: `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build` all exit 0.
- **AC Evidence Format (for closure)**:
  - `[x] <AC text> — Verified: <file-or-command>, <result>`
- **User Validation**: Submit a prompt in the frontier chat and in the adaptation chat (each strategy) and observe tokens appearing progressively rather than all at once after a delay.

## Baseline Failure Snapshot
N/A — this is a new feature (streaming), not a regression.

## Post-Fix Validation Snapshot (Filled at Closure)
- **Date**: 2026-02-26
- **Command(s)**: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build`, `pnpm test:e2e`
- **Execution Mode**: local-equivalent/unsandboxed (Node v20.20.0 via nvm)
- **Observed Result**: All pass — 162 unit tests, lint clean, tsc exit 0, build clean (pre-existing OTel warning only), 30/30 E2E passed (chromium/firefox/webkit).

## Dependencies
- Blocks: None
- Blocked by: Tech Lead confirmation that featherless-ai router supports `stream: true` for all four configured models.

## Notes
- **Out of scope**: ONNX/tiny transformer browser inference (Web Worker path). The in-browser ONNX runtime is a fundamentally different execution model and is excluded from this CR.
- **UX recommendation (BA)**: For both components, keep existing loader until first token arrives, then transition to inline progressive rendering with blinking cursor. Remove cursor on completion. This aligns with project principle #5 (Premium-but-Readable UX) and the existing glassmorphism aesthetic.
- **Shared utility opportunity**: Both routes follow the same buffered → streaming migration pattern. Tech Lead may choose to extract a shared streaming utility — this is a Tech Lead implementation decision, not a CR requirement.
- **Mid-stream error design**: The most architecturally novel aspect of this CR. Must be resolved before sub-agent handoff; sub-agents must not guess the design.
- No new packages expected. If a streaming utility library is required, Tech Lead must approve per Standard Kit governance.

## Technical Analysis (filled by Tech Lead — required for M/L/H complexity; optional for [S])
**Complexity:**
**Estimated Effort:**
**Affected Systems:**
**Implementation Approach:**

## Deviations Accepted (filled at closure by BA)
- **Frontend Agent modified `__tests__/components/FrontierBaseChat.test.tsx` without declaring it as a deviation in the Frontend report** — Severity: **Minor** (no AC intent change, no route/API/testid/accessibility contract change, no security/architecture invariant impact; change was necessary and correct — live-path test required SSE mock update to remain valid against new streaming component logic). Accepted. Process note: Frontend Agent should declare any out-of-declared-scope file changes as deviations in future reports.
