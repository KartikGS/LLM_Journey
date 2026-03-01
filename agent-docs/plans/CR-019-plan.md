# Technical Plan — CR-019: Generation Config Centralization with Parallel Meta Observations

## Technical Analysis

Both generation routes (`/api/frontier/base-generate` and `/api/adaptation/generate`) currently read non-secret runtime settings entirely from environment variables at request time (inside `loadFrontierConfig()` / `loadAdaptationConfig()`). This creates env-config sprawl and makes settings hard to reason about or version.

The CR centralizes these non-secret settings into a committed TypeScript config at `lib/config/generation.ts`. Only `FRONTIER_API_KEY` remains as a runtime env secret (required for auth; must never be committed). All other settings become static config constants.

Key technical challenge: the adaptation route reads `ADAPTATION_OUTPUT_MAX_CHARS` at **module load time** (top-level `const`), not inside a function. This affects how the Testing Agent mocks the cap in tests — see Testing handoff for the prescribed approach.

---

## Discovery Findings

### Env Var Inventory

| Env Var | Route(s) | Secret? | CR-019 Action |
| :--- | :--- | :--- | :--- |
| `FRONTIER_API_URL` | frontier | No | Move to config |
| `FRONTIER_MODEL_ID` | frontier | No | Move to config |
| `FRONTIER_PROVIDER` | frontier | No | Move to config |
| `FRONTIER_TIMEOUT_MS` | both | No | Move to config |
| `FRONTIER_API_KEY` | both | **Yes** | **Retain in env** |
| `ADAPTATION_API_URL` | adaptation | No | Move to config |
| `ADAPTATION_FULL_FINETUNE_MODEL_ID` | adaptation | No | Move to config |
| `ADAPTATION_LORA_MODEL_ID` | adaptation | No | Move to config |
| `ADAPTATION_PROMPT_PREFIX_MODEL_ID` | adaptation | No | Move to config |
| `ADAPTATION_OUTPUT_MAX_CHARS` | adaptation | No | Move to config |

### File Audit

- **`app/api/frontier/base-generate/route.ts`**: Config loaded inside `loadFrontierConfig()` (called per-request). Has `invalid_config` path for unknown provider or bad URL. `HF_MAX_NEW_TOKENS = 256` and `PROMPT_MAX_CHARS = 2000` are hardcoded constants (not env-driven) — out of scope.
- **`app/api/adaptation/generate/route.ts`**: Config loaded inside `loadAdaptationConfig()` (per-request). `ADAPTATION_OUTPUT_MAX_CHARS` is a **module-load-time constant** at line 22 (not inside a function). `PROMPT_MAX_CHARS = 2000` is hardcoded — out of scope.
- **`lib/server/generation/shared.ts`**: Exports `parseTimeout`, `extractProviderErrorMessage`, `mapProviderFailure`, and `FallbackReasonCode`. After migration, `parseTimeout` is no longer called by either route → can be removed.
- **`lib/config/`**: Does not yet exist. Tech Lead creates it.
- **`agent-docs/api/frontier-base-generate.md`**: Has "Environment Contract" section listing 4 env vars to be removed.
- **`agent-docs/api/adaptation-generate.md`**: Has "Environment Contract" section listing 7 env vars (6 to be removed; `FRONTIER_API_KEY` retained).
- **`__tests__/api/frontier-base-generate.test.ts`**: Sets env vars in `beforeEach`/test cases to configure the route. Includes `invalid_config` test for unknown `FRONTIER_PROVIDER` that becomes obsolete after migration. Uses `mockAdd` pattern per standard.
- **`__tests__/api/adaptation-generate.test.ts`**: `setConfigEnv()` helper sets 5 env vars for configured state. Output cap test uses `jest.isolateModules()` to reload route with a custom env var. Both must be updated for config-sourced values.

### Route Contract Stability Confirmed (AC-4 pre-check)

- Route paths: `/api/frontier/base-generate`, `/api/adaptation/generate` — **unchanged**.
- Request/response envelopes: unchanged.
- `data-testid` attributes: N/A (backend-only).
- Accessibility semantics: N/A (backend-only).

### Baseline Test Count

159 tests passing (from project log CR-018 completion).

---

## Configuration Specifications

### `lib/config/generation.ts` — Canonical Config (Tech Lead creates directly)

```typescript
/**
 * Versioned generation configuration.
 *
 * Non-secret runtime settings for frontier and adaptation generation routes.
 * FRONTIER_API_KEY is intentionally absent — it must remain as an environment secret.
 *
 * Source of truth: this file. Do not read these values from environment variables
 * in generation routes. See agent-docs/api/ for the env contract.
 */

export type FrontierProvider = 'openai' | 'huggingface';

export const FRONTIER_GENERATION_CONFIG = {
    provider: 'huggingface' as FrontierProvider,
    apiUrl: 'https://router.huggingface.co/featherless-ai/v1/completions',
    modelId: 'meta-llama/Meta-Llama-3-8B',
    timeoutMs: 8000,
} as const;

export const ADAPTATION_GENERATION_CONFIG = {
    apiUrl: 'https://router.huggingface.co/featherless-ai/v1/chat/completions',
    timeoutMs: 8000,
    outputMaxChars: 4000,
    models: {
        'full-finetuning': 'meta-llama/Meta-Llama-3-8B-Instruct',
        'lora-peft': 'swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA',
        'prompt-prefix': 'meta-llama/Meta-Llama-3-8B',
    },
} as const;
```

**Notes:**
- `FrontierProvider` type moves from the frontier route file to this config file. Backend Agent imports it from here.
- Config values match the current featherless-ai production setup (established in CR-014). `FRONTIER_TIMEOUT_MS` default of 8000ms (from `shared.ts` `DEFAULT_TIMEOUT_MS`) is preserved.
- `ADAPTATION_OUTPUT_MAX_CHARS` cap value of 4000 matches current env/route default.

---

## Implementation Decisions (Tech Lead Owned)

1. **`invalid_config` path removal**: After migration, `loadFrontierConfig()` no longer does URL validation or provider-string validation (both come from committed config constants, not user-supplied env vars). The `invalid_config` fallback code is therefore no longer reachable in either route. Backend Agent must remove the URL validation block and the provider-string validation block from both `loadFrontierConfig()` and `loadAdaptationConfig()`. The `invalid_config` value is retained in the `FallbackReasonCode` union type (for forward compatibility) but will not be producible after this CR.

2. **`parseTimeout` removal**: Both routes currently call `parseTimeout(process.env.FRONTIER_TIMEOUT_MS)`. After migration, `timeoutMs` is a plain integer constant from config — no parsing needed. `parseTimeout` and its supporting constants (`DEFAULT_TIMEOUT_MS`, `MIN_TIMEOUT_MS`, `MAX_TIMEOUT_MS`) become dead code in `shared.ts` and must be removed by the Backend Agent. No existing tests import `shared.ts` directly, so no test impact from removing this function.

3. **`configured` logic simplification**: After migration, both `loadFrontierConfig()` and `loadAdaptationConfig()` have exactly one env var to check: `FRONTIER_API_KEY`. The `configured` field becomes `apiKey.length > 0`. URL and model ID are always available from config, so `missing_config` means only "API key absent."

4. **`FrontierProvider` type import**: The frontier route currently defines `FrontierProvider` inline in the `FrontierConfig` type. After migration, import it from `@/lib/config/generation`.

5. **`ADAPTATION_OUTPUT_MAX_CHARS` module-load-time pattern**: The current top-level const with env parsing is replaced by a config import. Since config is a static module import, it is still effectively "module-load-time" — no behavior change for the route. The existing `jest.isolateModules()` cap test must be rewritten by the Testing Agent to mock the config module (see Testing handoff).

6. **API docs update classification**: Removing non-secret vars from "Environment Contract" in API docs and the `invalid_config` code from "Fallback Reason Codes" is a **minor documentation accuracy update**, not a contract change. No consumer behavior is affected. Tech Lead handles this directly.

7. **`invalid_config` removal from API docs Fallback Reason Codes**: Since neither route will produce `invalid_config` after migration, remove it from both API contract docs. This does not affect the response type enum in code (kept for forward compat), only the doc listing.

---

## Critical Assumptions

- `FRONTIER_API_KEY` value in `.env.local` (gitignored) is the only active runtime dependency for live generation to work. This CR does not change how it's read or validated.
- No other file currently reads `FRONTIER_API_URL`, `FRONTIER_MODEL_ID`, etc. from env. Verify with grep before Backend proceeds.
- `lib/config/` directory does not exist yet (confirmed by discovery).
- The featherless-ai router URLs used in `.env.example` match the production setup established in CR-014.
- No E2E tests assert on config-driven route behavior (confirmed: existing E2E covers page-level navigation and generation interaction, not route internals).

---

## Proposed Changes

### Tech Lead Direct Changes (this session, before Backend handoff)

| File | Change |
| :--- | :--- |
| `lib/config/generation.ts` | **Create**: versioned generation config (content above) |
| `.env.example` | Remove 9 non-secret generation env vars; add config reference comment |
| `agent-docs/api/frontier-base-generate.md` | Update Environment Contract; remove `invalid_config` from Fallback Reason Codes; add Change Log entry |
| `agent-docs/api/adaptation-generate.md` | Update Environment Contract; remove `invalid_config` from Fallback Reason Codes; add Change Log entry |

### Backend Agent Changes (Step 1)

| File | Change |
| :--- | :--- |
| `app/api/frontier/base-generate/route.ts` | Import `FRONTIER_GENERATION_CONFIG` + `FrontierProvider` from config; refactor `loadFrontierConfig()` to use config values; remove URL validation and provider-string validation; remove local `FrontierProvider` type |
| `app/api/adaptation/generate/route.ts` | Import `ADAPTATION_GENERATION_CONFIG` from config; refactor `loadAdaptationConfig()` to use config values; replace module-load-time env-cap constant with config import |
| `lib/server/generation/shared.ts` | Remove `parseTimeout`, `DEFAULT_TIMEOUT_MS`, `MIN_TIMEOUT_MS`, `MAX_TIMEOUT_MS` |

### Testing Agent Changes (Step 2, after Backend)

| File | Change |
| :--- | :--- |
| `__tests__/api/frontier-base-generate.test.ts` | Update `beforeEach` (remove now-irrelevant env deletes); remove `invalid_config` / unknown-provider test; update any test that set `FRONTIER_API_URL`/`FRONTIER_MODEL_ID`/`FRONTIER_PROVIDER`/`FRONTIER_TIMEOUT_MS` env vars to configure the route (now config-sourced); add config mock for tests needing non-default config values |
| `__tests__/api/adaptation-generate.test.ts` | Simplify `setConfigEnv()` to set only `FRONTIER_API_KEY`; update `beforeEach` to only clear `FRONTIER_API_KEY`; rewrite output-cap test to mock `lib/config/generation` instead of using env-based `isolateModules` approach |

---

## Contract Delta Assessment

No route-path, request/response envelope, `data-testid`, or accessibility/semantic contract changes.

**Testing handoff required?** Per workflow matrix: "UI structure/class refactor with unchanged route/selector/semantics → Conditional." This is backend config refactor. No contract changes. However, test files require significant updates (method of asserting `configured` state changes from env vars to config mocking). Testing Agent is required for test ownership, not contract sync.

---

## Architectural Invariants Check

- [x] **Observability Safety**: Tracing, metrics, and logging patterns unchanged. Config read does not affect observability boundary.
- [x] **Security Boundaries**: `FRONTIER_API_KEY` remains env-only secret. Config file contains zero secrets. Committed config is intentionally public non-sensitive data.
- [x] **Telemetry failure boundary**: No change — `safeMetric()` wrappers remain.
- [x] **Component Rendering Strategy**: No frontend changes. Backend-only scope.

---

## Delegation & Execution Order

| Step | Owner | Task Description |
| :--- | :--- | :--- |
| 0 (direct) | Tech Lead | Create `lib/config/generation.ts`; update `.env.example`; update API docs |
| 1 | Backend Agent | Refactor routes to use config; clean up `shared.ts` |
| 2 | Testing Agent | Update test files for config-driven routes; run full verification gates |

---

## Delegation Graph

- **Execution Mode**: **Sequential** (Backend → Testing)
- **Dependency Map**:
  - Testing (Step 2) depends on Backend (Step 1): tests import from route files; test setup (env var management, mocking strategy) changes based on what Backend builds; Testing Agent must read Backend's report and modified files before updating tests.
- **First Handoff**: `tech-lead-to-backend.md` (issued after Tech Lead direct changes are done)
- **Second Handoff**: `tech-lead-to-testing.md` (issued after Backend report reviewed + adversarial diff completed)
- **Two-Session Model**: Applies (Backend + Testing sub-agents). Session A covers through Backend handoff + Wait State. Session B covers adversarial review of Backend work + Testing handoff + final verification + BA handoff.
- **Final Verification Owner**: Testing Agent runs `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` in sequence and reports full results.

---

## Meta Observations (CR-019) — Tech Lead Planning-Phase Notes

> Required per AC-7/AC-8. Each pointer: observed pain, evidence, mitigation, follow-up type.

**Pointer 1 — Confusion from historical-artifact vs procedure misalignment:**
- **Pain**: Agents reading closed CRs may adopt outdated patterns or interpret old decisions as current policy.
- **Evidence**: The CR Immutability Rule in `workflow.md` and `AGENTS.md` constraint ("Treat closed CRs as historical artifacts — immutable by default") address this, but the mitigation relies on agent discipline. Discovery for this CR showed that the `ba-to-tech-lead.md` conversation file correctly included a Pre-Replacement Check and cited the prior CR — the mechanism works when followed.
- **Mitigation**: Add an explicit agent-facing note in `AGENTS.md` or `workflow.md` directing agents to check `project-log.md` (Recent Focus) before reading any requirement artifact — this establishes "start from the log, not the archive." The current two-layer read structure (Layer 1 standards + Layer 2 role) doesn't surface this pattern explicitly.
- **Follow-up type**: `policy-candidate` — low urgency; the current system works when protocol is followed.

**Pointer 2 — Freshness-rule efficiency for conversation files after CR closure:**
- **Pain**: The Conversation File Freshness Rule requires agents to verify prior CR closure before replacing conversation files. This adds a read step at the start of every CR. For fast-moving sequential CRs, this step is mostly mechanical.
- **Evidence**: The `ba-to-tech-lead.md` Pre-Replacement Check took one verification step but produced no new information for this CR (prior CR was clearly done). The protocol adds ~1 tool call per handoff per CR.
- **Mitigation**: Consider a lightweight "CR closure stamp" pattern — when the BA updates `project-log.md` at CR closure, it also updates a single-line `agent-docs/coordination/last-closed-cr.md` with the CR ID and closure date. Pre-replacement checks can read this one file instead of re-reading the prior conversation file + plan artifact.
- **Follow-up type**: `backlog` — moderate value, requires a small doc change and adoption across all handoff files.

**Pointer 3 — Long-term retention/deletion policy for old CR artifacts:**
- **Pain**: `agent-docs/requirements/` and `agent-docs/plans/` accumulate CR files across the project lifecycle. Currently no policy governs archiving or pruning.
- **Evidence**: 19 CRs to date. Files are small (typically <10KB each). At current pace (~1-2 CRs/week), the directory will have 100+ files within a year. No discoverability issue now but may become one.
- **Mitigation**: Extend the `project-log.md` Archive pattern to the file system — create `agent-docs/requirements/archive/` and `agent-docs/plans/archive/` directories. Move CRs older than the 4 most recent (the visible window in project-log.md) to archive. This matches the log's rolling visibility model and prevents directory clutter without destroying history.
- **Follow-up type**: `backlog` — low urgency until >50 files.

**Pointer 4 — Parallel CR execution across branches:**
- **Pain**: All CRs currently execute on a single feature branch (`feat/CR-XXX-slug`). Running multiple CRs simultaneously would risk CR number collision (two BAs assigning the same next number) and merge conflicts on shared docs (`project-log.md`, `ba-to-tech-lead.md`).
- **Evidence**: Project log shows strictly sequential CR delivery. No multi-branch experiment has been run. The current conversation file model (single file per role pair, replaced per CR) would break if two CRs used the same file simultaneously.
- **Mitigation**: Parallel CR execution requires: (a) a CR number reservation step before BA starts (claim the ID in `project-log.md` as "in-progress"); (b) CR-scoped conversation file naming (`ba-to-tech-lead-CR-019.md`) instead of the current single-file model; (c) a merge-safe `project-log.md` format (e.g., CR entries as separate small files rather than a single log). This is a significant workflow change.
- **Follow-up type**: `policy-candidate` — only invest if parallel delivery becomes a concrete need.

**Pointer 5 — Agent workload limits and load-management strategy:**
- **Pain**: The two-session model (tech-lead.md) was introduced after CR-018 demonstrated context saturation with Backend+Testing. Context pressure is not yet formally tracked per role or CR size.
- **Evidence**: CR-018 explicitly triggered the two-session model addition. This CR (CR-019) is `[M]` scope — Backend+Testing again — and will apply two-session. The "Workflow Health Signal" section in the meta pass is the current mechanism for surfacing saturation signals.
- **Mitigation**: The existing two-session model is the right tool. The gap is early warning: agents don't know when they're approaching saturation until they're in it. Consider adding a "context budget" check at the start of each TL session: if >3 sub-agent reports are expected in a single session, automatically require session split. Currently the trigger is "Backend + Testing" which is a good proxy but not the only case (e.g., a large `[L]` CR with 4 sub-agents would also saturate).
- **Follow-up type**: `policy-candidate` — the two-session model handles the known case; extend the trigger rule when a 3+ sub-agent CR materializes.

---

## Operational Checklist

- [x] **Environment**: Config values are hardcoded TypeScript constants — no env vars added.
- [x] **Observability**: No change to metrics/tracing/logging boundaries.
- [x] **Artifacts**: No new gitignore entries needed. `lib/config/generation.ts` is committed source.
- [x] **Rollback**: Delete `lib/config/generation.ts`, restore 9 env vars to `.env.example`, revert route files and `shared.ts`. Single-step revert.

---

## Definition of Done (Technical)

- [ ] `lib/config/generation.ts` exists with `FRONTIER_GENERATION_CONFIG` and `ADAPTATION_GENERATION_CONFIG` (AC-1).
- [ ] Neither frontier nor adaptation route reads `FRONTIER_API_URL`, `FRONTIER_MODEL_ID`, `FRONTIER_PROVIDER`, `FRONTIER_TIMEOUT_MS`, `ADAPTATION_API_URL`, `ADAPTATION_*_MODEL_ID`, or `ADAPTATION_OUTPUT_MAX_CHARS` from `process.env` (AC-1, AC-3).
- [ ] Both routes still read `process.env.FRONTIER_API_KEY` as the only env var (AC-2).
- [ ] `parseTimeout` is removed from `lib/server/generation/shared.ts` (AC-3).
- [ ] Route paths, request/response envelopes, and all external contracts are identical to pre-CR state (AC-4).
- [ ] API docs updated with config source; `.env.example` reflects new env contract (AC-5).
- [ ] `pnpm test` (≥159 tests passing), `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` all pass (AC-6).
- [ ] Backend and Testing reports include meta observations on all 5 pointers (AC-7).
- [ ] `tech-lead-to-ba.md` includes consolidated meta synthesis with follow-up classification (AC-8).
