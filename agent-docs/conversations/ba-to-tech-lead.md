# BA to Tech Lead Handoff

## Subject
`CR-021 — Frontier and Adaptation Response Streaming`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing BA handoff context: `CR-020`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-020-plan.md`
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-020-cr-process-hardening-and-artifact-organization.md` status is `Done`
- Result: replacement allowed for new CR context.

## Objective
Implement token-by-token streaming for both the frontier base generation pipeline and the adaptation generation pipeline. Both currently buffer the full response before returning it, creating a poor UX — Product End Users stare at a spinner for up to ~8 seconds. Streaming eliminates perceived wait time, delivers a live "watch the model think" experience, and reinforces the educational concept that LLMs generate token-by-token. The ONNX/tiny transformer browser inference path is explicitly out of scope.

## Linked Artifacts
- CR: `agent-docs/requirements/CR-021-frontier-response-streaming.md`

## Audience & Outcome Check
- Human User intent: add token-by-token streaming to both the frontier chat (Stage 1) and the adaptation chat (Stage 2). ONNX/browser inference excluded.
- Product End User audience: software engineers learning LLM architecture via Stage 1 (Transformers page) and Stage 2 (Model Adaptation page).
- Expected learner outcome: progressive token rendering makes both demos feel live and interactive, reinforcing token-by-token generation mechanics. Across all three adaptation strategies, learners see the model responding in real time.

## Clarified Requirement Summary
**Frontier** (`/api/frontier/base-generate` + `FrontierBaseChat.tsx`):
- Modify API route to return a streaming response (SSE or `ReadableStream`) rather than buffered JSON.
- Modify component to render tokens progressively into `data-testid="frontier-output"`.
- Add blinking cursor during streaming; remove on completion.
- Retain "Querying frontier endpoint..." loader until first token arrives.

**Adaptation** (`/api/adaptation/generate` + `AdaptationChat.tsx`):
- Same streaming migration. Applies across all three strategies (`full-finetuning`, `lora-peft`, `prompt-prefix`).
- Modify component to render tokens progressively into `data-testid="adaptation-chat-output"`.
- Add blinking cursor during streaming; remove on completion.
- Retain "Querying adaptation endpoint..." loader until first token arrives.

**Both**:
- Submit and input disabled for full streaming duration in each component.
- Handle upstream failure: preserve pre-stream fallback/error behavior; define mid-stream error surface (Tech Lead decision).

## Critical Design Decisions Requiring Tech Lead Resolution (Before Sub-Agent Handoff)

### 1. Mid-Stream Error Handling (Highest Priority — applies to both routes)
The current `{mode: 'fallback', output: staticText}` JSON response pattern cannot be sent retroactively once streaming starts. The Tech Lead must define the mid-stream error surface for both routes before Frontend/Backend sub-agents begin implementation. The design should be consistent across both pipelines.

### 2. Upstream Format Difference
Frontier uses `/v1/completions` (plain text); adaptation uses `/v1/chat/completions` (chat messages format). Both are OpenAI-compatible and support `stream: true`, but the streamed chunk shape differs (`choices[0].text` vs `choices[0].delta.content`). The streaming reader must handle both formats.

### 3. Timeout Semantics (both routes)
`timeoutMs: 8000` in both `FRONTIER_GENERATION_CONFIG` and `ADAPTATION_GENERATION_CONFIG` was designed for buffered responses. Both must be explicitly re-evaluated for streaming semantics.

### 4. Upstream Streaming Confirmation (all four models)
Confirm `stream: true` is supported by the featherless-ai router for all four configured models:
- `meta-llama/Meta-Llama-3-8B` (frontier + adaptation prompt-prefix)
- `meta-llama/Meta-Llama-3-8B-Instruct` (adaptation full-finetuning)
- `swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA` (adaptation lora-peft)

If any model is unsupported, a graceful degradation path is required for that specific strategy.

## Acceptance Criteria Mapping
- [ ] AC-1: Frontier API route delivers tokens progressively; first token arrives before full response completes.
- [ ] AC-2: `FrontierBaseChat` renders tokens progressively into `data-testid="frontier-output"`.
- [ ] AC-3: Adaptation API route delivers tokens progressively for all three strategies.
- [ ] AC-4: `AdaptationChat` renders tokens progressively into `data-testid="adaptation-chat-output"`.
- [ ] AC-5: Blinking cursor visible in frontier output during streaming; removed on completion.
- [ ] AC-6: Blinking cursor visible in adaptation output during streaming; removed on completion.
- [ ] AC-7: Frontier "Querying..." loader shown until first token; does not persist after streaming begins.
- [ ] AC-8: Adaptation "Querying..." loader shown until first token; does not persist after streaming begins.
- [ ] AC-9: `frontier-submit` and `frontier-input` disabled for full streaming duration; re-enabled on completion/error.
- [ ] AC-10: `adaptation-chat-submit` and `adaptation-chat-input` disabled for full streaming duration; re-enabled on completion/error.
- [ ] AC-11: Upstream failure (pre- and mid-stream) surfaces a meaningful error/fallback indication on both components.
- [ ] AC-12: All existing `data-testid` contracts preserved without rename (frontier + adaptation — full list in CR).
- [ ] AC-13: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` all pass.

## Constraints
- Scope: Frontier pipeline + adaptation pipeline (server-side API routes only). ONNX/browser inference explicitly out of scope.
- No new packages without Tech Lead review and Standard Kit governance.
- Rate limiting (20 req/min on each generation route) must not be weakened.
- `FRONTIER_API_KEY` must remain server-side only (used by both routes).
- TypeScript strict mode must remain satisfied.
- All existing `data-testid` contracts must be preserved.

## Risk Analysis
- One of the four adaptation models may not support streaming — must be verified per-model before sub-agent implementation.
- Mid-stream error handling is architecturally novel for this codebase; must not be left to sub-agents to guess.
- E2E tests asserting on `frontier-output` or `adaptation-chat-output` content may be timing-sensitive with streaming. Tech Lead should evaluate Testing handoff trigger per the Testing Handoff Trigger Matrix in `workflow.md`.
- The two different upstream formats (`/v1/completions` vs `/v1/chat/completions`) produce different SSE chunk shapes — the streaming reader(s) must account for both.

## Rationale (Why)
Streaming is the highest-impact UX improvement available to both demos with no change to educational content or scope. It transforms passive "wait and see" interactions into active "watch the model think" experiences across two stages of the journey. The implementation is tightly scoped to two API routes and two components. A shared streaming utility is a natural extraction opportunity — left as a Tech Lead decision.

## Evidence Expectations for Tech Lead Handoff
- Confirmation that featherless-ai supports `stream: true` for all four configured models (or documented per-model fallback plan).
- Explicit design decision for mid-stream error handling — consistent across both pipelines — recorded in the plan.
- One-line evidence per AC with file/line or command references.
- Classification of any testing handoff triggers per the Testing Handoff Trigger Matrix in `workflow.md`.
