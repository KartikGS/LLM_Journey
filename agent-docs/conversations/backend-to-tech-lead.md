# Report: Backend → Tech Lead

## Subject
`CR-015 - Adaptation Page: New /api/adaptation/generate Endpoint`

## Status
`completed`

---

## [CR-014 Historical Note]
Prior CR-014 backend-to-tech-lead content replaced per Conversation File Freshness Rule. CR-014 status was `completed`. Artifacts preserved in `agent-docs/requirements/CR-014-hf-router-migration.md` and `agent-docs/plans/CR-014-plan.md`.

---

## Preflight: Assumptions

1. `FRONTIER_API_KEY` env var name confirmed in `app/api/frontier/base-generate/route.ts` line 100 — correct, reused as-is.
2. `parseTimeout()` pattern from `base-generate/route.ts` (lines 84–95) is clear; implemented locally as specified (no cross-file import).
3. Featherless-ai router returns standard OpenAI chat completions format `{ choices: [{ message: { content: string } }] }` — confirmed by handoff spec.
4. `.env.example` already updated by Tech Lead — not modified.

## Preflight: Adjacent Risks

1. **System prompt security**: `ADAPTATION_SYSTEM_PROMPT` must not appear in response payload, logger calls, or OTel span attributes. Audited all code paths — the constant is only used in `buildMessages()` to construct the outgoing provider request body, and is not referenced anywhere in response construction, logger calls, or span attribute assignments.
2. **Node runtime**: `node -v` reports `v16.20.1` (below documented minimum of v20.x). nvm fallback to `v18.19.0` activated for this session — pnpm runs on v18.19.0. Classified as **environmental mismatch** (pre-existing from CR-014).
3. **Outer catch fallback strategy**: The top-level `catch` fires only for truly unexpected post-parse errors where `strategy` is not in scope. Uses `'full-finetuning'` as sentinel strategy — same "safety net" pattern as `base-generate/route.ts`.

## Preflight: Open Questions

- none

## Preflight Status
`clear-to-implement`

---

## Scope Check

- Handoff source: `agent-docs/conversations/tech-lead-to-backend.md`
- Files created:
  - `app/api/adaptation/generate/route.ts`
  - `__tests__/api/adaptation-generate.test.ts`
- Scope compliance:
  - [x] All created files are in Backend ownership or explicitly delegated.
  - [x] Test file created under explicit Tech Lead delegation (handoff: "Test scope: delegated to Backend Agent for unit tests only").
  - [x] `.env.example` NOT modified (already updated by Tech Lead as stated in handoff).
  - [x] `app/api/frontier/base-generate/route.ts` NOT modified (frozen per handoff).

## Changes Made

**`app/api/adaptation/generate/route.ts`** (new):
- POST handler at `/api/adaptation/generate`.
- Zod schema with `prompt` (string, 1–2000 chars) and `strategy` (enum: `full-finetuning | lora-peft | prompt-prefix`).
- Validation: returns `invalid_strategy` (400) for bad strategy, `invalid_prompt` (400) for bad prompt — distinguished via `parsed.error.issues`.
- Per-strategy config loading: reads `ADAPTATION_API_URL`, `FRONTIER_API_KEY`, and strategy-specific model ID env var. Missing/invalid config → immediate fallback.
- `buildMessages()`: returns `[system, user]` for `prompt-prefix`, `[user]` for other strategies.
- Local `extractChatOutput()`: chat completions format only (`choices[0].message.content`).
- Local `parseTimeout()`: same clamped parsing as `base-generate`.
- Strategy-specific deterministic fallback text from `FALLBACK_TEXT` record (exact strings from handoff spec).
- OTel span `adaptation.generate` with attributes: `adaptation.strategy`, `adaptation.configured`, `adaptation.model_id`, `adaptation.mode`, `adaptation.reason_code` (fallback paths), `adaptation.upstream_status` (non-OK HTTP).
- Response shape matches `base-generate` contract exactly (`mode`, `output`, `reason`, `metadata`). `metadata` uses `AdaptationModelMetadata` type `{ strategy, modelId }`.

**`__tests__/api/adaptation-generate.test.ts`** (new):
- 22 unit tests covering all 18 rows from the handoff test table (some rows produce multiple tests for per-strategy coverage).

## Verification Results

**Environmental note:** System Node.js v16.20.1 — below documented minimum (>=20.x). Classified as **environmental mismatch** (pre-existing). Verification ran under Node.js v18.19.0 via `~/.nvm/versions/node/v18.19.0`.

**1. `pnpm test`** — PASS

```
PASS __tests__/api/adaptation-generate.test.ts
  Integration: Adaptation Generate API
    ✓ should return 400 invalid_prompt for empty prompt (9 ms)
    ✓ should return 400 invalid_prompt for prompt exceeding 2000 chars (2 ms)
    ✓ should return 400 invalid_strategy for unknown strategy (2 ms)
    ✓ should return fallback with missing_config for full-finetuning when env vars absent (2 ms)
    ✓ should return fallback with missing_config for lora-peft when env vars absent (1 ms)
    ✓ should return fallback with missing_config for prompt-prefix when env vars absent (5 ms)
    ✓ should return live mode response for full-finetuning when configured (2 ms)
    ✓ should return live mode response for lora-peft when configured (2 ms)
    ✓ should return live mode response for prompt-prefix when configured (2 ms)
    ✓ should include system message as first message for prompt-prefix strategy (2 ms)
    ✓ should NOT include system message for full-finetuning strategy (1 ms)
    ✓ should route to full-finetuning model ID (1 ms)
    ✓ should route to lora-peft model ID (1 ms)
    ✓ should route to prompt-prefix model ID (1 ms)
    ✓ should return fallback with quota_limited when upstream returns 429 (1 ms)
    ✓ should return fallback with upstream_auth when upstream returns 401 (1 ms)
    ✓ should return fallback with upstream_error when upstream returns 503 (1 ms)
    ✓ should return fallback with timeout when fetch is aborted (2 ms)
    ✓ should return fallback with empty_provider_output when provider returns empty content (1 ms)
    ✓ should return exact fallback text for full-finetuning strategy (1 ms)
    ✓ should return exact fallback text for lora-peft strategy (1 ms)
    ✓ should return exact fallback text for prompt-prefix strategy

Test Suites: 17 passed, 17 total
Tests:       133 passed, 133 total
Snapshots:   0 total
Time:        2.702 s
```

New tests: 22 (≥18 required). Total: 133 (was 111 baseline; 133 ≥ 111 ✓).

**2. `pnpm lint`** — PASS
`✔ No ESLint warnings or errors` (pre-existing `next lint` deprecation notice — unrelated to CR).

**3. `pnpm exec tsc --noEmit`** — PASS
Exit code 0, no output.

**DoD checklist:**
- [x] POST `/api/adaptation/generate` routes to correct model per strategy (AC-9) — verified by "correct model routing" tests for all 3 strategies
- [x] `prompt-prefix` strategy prepends system prompt server-side; system prompt NOT in response payload (AC-7, AC-9) — verified by system prompt injection test; response payloads checked in all live tests
- [x] All 3 strategies return strategy-specific deterministic fallback text when unconfigured (AC-8) — verified by missing_config and fallback text tests
- [x] Request validation rejects: invalid strategy (400 `invalid_strategy`), empty prompt (400 `invalid_prompt`), prompt >2000 chars (400 `invalid_prompt`)
- [x] OTel span `adaptation.generate` emitted with `adaptation.strategy` attribute — instrumented in POST handler
- [x] Unit tests: 22 new tests covering all rows in handoff test table (≥18 ✓)
- [x] `pnpm test` passes — 133 total tests, no regressions
- [x] `pnpm lint` passes — ✔ No ESLint warnings or errors
- [x] `pnpm exec tsc --noEmit` passes — exit code 0

## Out-of-Scope Requests Detected
none

## Blockers
none

## Failure Classification
- `CR-related`: none
- `pre-existing`: none
- `environmental`: System Node.js v16.20.1 below documented minimum (>=20.x); verified under Node v18.19.0 (nvm). Not a CR regression.
- `non-blocking warning`: `next lint` deprecation notice — pre-existing, unrelated to this CR.

## Deviations
none

## Ready for Next Agent
yes

## Follow-up Recommendations
- The `toRecord()` utility is locally duplicated in `route.ts` and `base-generate/route.ts`. If a third route needs it, consider extracting to `lib/server/`. Out of scope for this CR.

---
*Report created: 2026-02-23*
*Backend Agent*
