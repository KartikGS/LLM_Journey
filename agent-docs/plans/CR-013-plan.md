# Technical Plan - CR-013: Hugging Face Inference API Provider Support

## Technical Analysis

The `base-generate` route is a well-structured, single-file Next.js API route with:
- Config loading via `loadFrontierConfig()` (env vars → typed `FrontierConfig`)
- A single request path that always sends OpenAI chat-completions format
- A generic `extractProviderOutput()` parser (handles OpenAI + Anthropic shapes)
- A complete fallback chain with typed reason codes and span attributes

Adding HF support requires three surgical changes to this file:
1. **Config layer**: read + validate a `FRONTIER_PROVIDER` env var
2. **Request layer**: branch request body construction by provider
3. **Response layer**: extend `extractProviderOutput` to recognize HF array format `[{ generated_text }]`

No new dependencies. No new files required for the implementation. Test changes are delegated alongside implementation.

---

## Discovery Findings

- `loadFrontierConfig()` already reads four env vars. Adding a fifth (`FRONTIER_PROVIDER`) follows the same pattern.
- `extractProviderOutput()` currently handles two shapes (OpenAI `choices[0].message.content` and Anthropic `content[].text`). HF's `[{ generated_text }]` is an array-at-root, not an object—this is a distinct shape that won't accidentally match existing paths.
- The existing test file has 3 tests covering: invalid prompt, missing config, and live OpenAI success. The new tests belong in the same file (same route, same mock scaffold).
- `.env.example` documents `FRONTIER_API_URL` with an OpenAI default comment. It needs a `FRONTIER_PROVIDER` entry added.
- No route/selector/accessibility contracts are affected. This is a pure backend change.
- No existing test asserts the request body format (only headers), so new HF tests will cover this gap.

---

## Configuration Specifications

### New env var: `FRONTIER_PROVIDER`
- Valid values: `openai` (default), `huggingface`
- If absent: behaves as `openai` (backward-compatible default)
- If set to an unrecognized value: resolves to `invalid_config` in `loadFrontierConfig()`, triggering fallback

### HF request parameters (Tech Lead-specified constants)
- `max_new_tokens`: **256** (explicit constant in route; balances response length against free-tier timeout)
- `temperature`: reuse existing `0.4` (same as current OpenAI path)

### HF URL pattern
- The user sets `FRONTIER_API_URL` to the full model URL: `https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B`
- Auth header: `Authorization: Bearer {FRONTIER_API_KEY}` (same pattern as current)

---

## Critical Assumptions

1. `FRONTIER_PROVIDER` absent → default to `openai` behavior. Existing deployments are unaffected.
2. HF Inference API always returns a JSON array `[{ generated_text: "..." }]` for success.
3. HF error responses use standard HTTP status codes (401, 429, 5xx) — handled by the existing `mapProviderFailure()` function unchanged.
4. `max_new_tokens: 256` is sufficient to produce a visible output within the 8s default timeout on the HF free tier.
5. No client-side (UI) changes are needed. `FrontierBaseChat.tsx` consumes the response envelope (`mode`, `output`, `metadata`, `reason`) which remains stable.

---

## Proposed Changes

### 1. `app/api/frontier/base-generate/route.ts` (DELEGATE → Backend Agent)

| Change | Detail |
|--------|--------|
| Add `HF_MAX_NEW_TOKENS = 256` constant | Top-level constant alongside existing ones |
| Extend `FrontierConfig` type | Add `provider: 'openai' \| 'huggingface'` field |
| Update `loadFrontierConfig()` | Read `FRONTIER_PROVIDER`, validate, default to `openai`; unknown value → `invalid_config` |
| Add `buildProviderRequestBody()` helper | Branches on `provider`: OpenAI format vs HF format |
| Update `fetch()` call | Replace inline `JSON.stringify({...})` with `buildProviderRequestBody()` call |
| Extend `extractProviderOutput()` | Add HF array-at-root check: `Array.isArray(payload) && payload[0]?.generated_text` |
| Add `frontier.provider` span attribute | Set alongside `frontier.model_id` (value: `'openai'` or `'huggingface'`) |

### 2. `__tests__/api/frontier-base-generate.test.ts` (DELEGATE → Backend Agent, explicitly delegated)

New test cases to add:
- HF live success: env `FRONTIER_PROVIDER=huggingface`, mock `[{ generated_text: "..." }]`, assert `mode: live`
- HF request format: verify `fetch` was called with `{ inputs: prompt, parameters: { max_new_tokens: 256, temperature: 0.4 } }` body
- HF fallback on 401: assert `upstream_auth` reason code
- HF fallback on 429: assert `quota_limited` reason code
- HF fallback on 5xx: assert `upstream_error` reason code
- HF empty/malformed response: `[{ generated_text: "" }]` → `empty_provider_output` fallback
- Unknown provider: `FRONTIER_PROVIDER=unknown` → `invalid_config` fallback (no fetch call)
- Regression: existing OpenAI live test remains valid (no change to that path)

### 3. `.env.example` (Tech Lead direct edit — permitted scope)

Add `FRONTIER_PROVIDER` entry with documentation.

---

## Contract Delta Assessment

- Route contracts changed? **No** (same path `/api/frontier/base-generate`, same response envelope shape)
- `data-testid` contracts changed? **No** (no UI changes)
- Accessibility/semantic contracts changed? **No**
- Testing handoff required per workflow matrix? **No** — this is a backend-only change with no route/selector/semantic contract change. Test work is explicitly delegated to the Backend Agent in the handoff.

---

## Architectural Invariants Check

- [x] **Observability Safety**: `frontier.provider` span attribute added; telemetry does not block/crash UI
- [x] **Security Boundaries**: `FRONTIER_API_KEY` remains server-side only; HF token uses same `Authorization: Bearer` pattern
- [x] **Fallback Preservation**: existing `mapProviderFailure()` handles HF HTTP errors; no new fallback code paths needed
- [x] **No New Dependencies**: HF Inference API is called via native `fetch` (same as current implementation)

---

## Delegation & Execution Order

| Step | Agent | Task Description |
|:-----|:------|:----------------|
| 1 | Tech Lead (direct) | Update `.env.example` with `FRONTIER_PROVIDER` |
| 2 | Backend Agent | Implement HF provider support in `route.ts` + update tests |
| 3 | Tech Lead | Adversarial diff review + run `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` |
| 4 | Tech Lead | Handoff to BA for acceptance |

---

## Delegation Graph

- **Execution Mode**: Sequential (Step 1 is Tech Lead direct; Step 2 is single Backend agent)
- **Dependency Map**:
  - Step 2 (Backend) does not depend on Step 1 output (`.env.example` is documentation, not runtime)
  - Step 3 (Tech Lead verification) depends on Step 2 completion
- **Parallel Groups**: N/A (single sub-agent)
- **Handoff Batch Plan**: Single handoff to Backend Agent
- **Final Verification Owner**: Tech Lead runs all quality gates (`pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`)

---

## Operational Checklist

- [x] **Environment**: No hardcoded values. `FRONTIER_PROVIDER` is env-driven with safe default.
- [x] **Observability**: `frontier.provider` span attribute added to existing trace.
- [x] **Artifacts**: No new tool-generated artifacts; `.gitignore` unchanged.
- [x] **Rollback**: Remove `FRONTIER_PROVIDER` from env and delete the ~30 lines of new code in `route.ts`. One-step revert.

---

## Definition of Done (Technical)

- [ ] `FRONTIER_PROVIDER=huggingface` sends `{ inputs, parameters }` body to configured URL
- [ ] `FRONTIER_PROVIDER=openai` (or absent) continues to send `{ model, messages, temperature }` — existing behavior unchanged
- [ ] `FRONTIER_PROVIDER=<unknown>` triggers `invalid_config` fallback without calling upstream
- [ ] HF `[{ generated_text }]` response correctly extracted as `mode: live` output
- [ ] `frontier.provider` span attribute present in all code paths (live and fallback)
- [ ] All new tests pass; existing tests unchanged and passing
- [ ] `pnpm test` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] `pnpm build` passes
