# Report: Backend -> Tech Lead

## Subject
`CR-019 - Generation Config Centralization: Backend Implementation`

## [Status]
`completed`

---

## [CR-018 Historical Note]
Prior CR-018 backend-to-tech-lead content replaced per Conversation File Freshness Rule.
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-018-plan.md` ✓
- Evidence 2 (prior CR closed): CR-018 status `Done` per `agent-docs/project-log.md` and prior report `[Status]=completed` ✓
- Result: replacement allowed.

## [Preflight: Assumptions]
1. `lib/config/generation.ts` exists and exports `FRONTIER_GENERATION_CONFIG`, `ADAPTATION_GENERATION_CONFIG`, and `FrontierProvider` — **confirmed**.
2. Removed generation env vars (`FRONTIER_API_URL`, `FRONTIER_MODEL_ID`, `FRONTIER_PROVIDER`, `FRONTIER_TIMEOUT_MS`, `ADAPTATION_API_URL`, `ADAPTATION_FULL_FINETUNE_MODEL_ID`, `ADAPTATION_LORA_MODEL_ID`, `ADAPTATION_PROMPT_PREFIX_MODEL_ID`, `ADAPTATION_OUTPUT_MAX_CHARS`) are consumed only in the two target route files (excluding `.env*`, `agent-docs/`, `__tests__/`) — **confirmed**.
3. `parseTimeout` is only imported by `app/api/frontier/base-generate/route.ts` and `app/api/adaptation/generate/route.ts` — **confirmed**.
4. Existing route logs/span attributes do not expose `FRONTIER_API_KEY`; key usage is limited to upstream `Authorization` header construction — **confirmed**.

## [Preflight: Adjacent Risks]
- Behavior shift risk: removing env-driven invalid-config pathways means `missing_config` becomes the only configuration fallback reason from route config loading.
- Regression risk: test fixtures currently rely on removed env vars and are expected to fail until Testing Agent updates those tests.

## [Preflight: Open Questions]
- none

## [Preflight Status]
`clear-to-implement`

## [Scope Check]
- Handoff source: `agent-docs/conversations/tech-lead-to-backend.md`
- Files modified:
  - `lib/server/generation/shared.ts`
  - `app/api/frontier/base-generate/route.ts`
  - `app/api/adaptation/generate/route.ts`
- Scope compliance:
  - [x] All modified files are in Backend ownership or explicitly delegated.
  - [x] No test files were created/modified.

## [Changes Made]
1. **Shared utility cleanup**: removed `parseTimeout` and timeout constants (`DEFAULT_TIMEOUT_MS`, `MIN_TIMEOUT_MS`, `MAX_TIMEOUT_MS`) from `lib/server/generation/shared.ts`; kept only `FallbackReasonCode`, `extractProviderErrorMessage`, and `mapProviderFailure` exports.
2. **Frontier route centralization** (`app/api/frontier/base-generate/route.ts`):
   - Added config import: `FRONTIER_GENERATION_CONFIG` + `FrontierProvider`.
   - Removed `parseTimeout` import and all env reads except `process.env.FRONTIER_API_KEY`.
   - Refactored `loadFrontierConfig()` to source `apiUrl/modelId/provider/timeoutMs` from config constants.
   - Removed provider-validation and URL-validation branches from config loading.
3. **Adaptation route centralization** (`app/api/adaptation/generate/route.ts`):
   - Added config import: `ADAPTATION_GENERATION_CONFIG`.
   - Removed `parseTimeout` import and `STRATEGY_MODEL_ENV` mapping.
   - Replaced env-based output cap with config value (`ADAPTATION_GENERATION_CONFIG.outputMaxChars`).
   - Refactored `loadAdaptationConfig()` to source `apiUrl/timeoutMs/models[strategy]` from config constants and read only `FRONTIER_API_KEY` from env.

## [Verification Results]
- **Command**: `node -v`
  - **Scope**: full suite preflight
  - **Execution Mode**: sandboxed
  - **Result**: `PASS (preflight executed)` with environmental mismatch: `v18.19.0` (< required `>=20.x`).
- **Command**: `nvm use 20 && node -v`
  - **Scope**: runtime recovery attempt
  - **Execution Mode**: sandboxed
  - **Result**: `FAIL` (`nvm: command not found`); classified under `environmental`.
- **Command**: `pnpm lint`
  - **Scope**: full suite
  - **Execution Mode**: sandboxed
  - **Result**: `PASS` (`No ESLint warnings or errors`). Non-blocking engine warning due Node `v18.19.0`.
- **Command**: `pnpm exec tsc --noEmit`
  - **Scope**: full suite
  - **Execution Mode**: sandboxed
  - **Result**: `PASS` (exit code 0).
- **Command**: `pnpm test`
  - **Scope**: full suite
  - **Execution Mode**: sandboxed
  - **Result**: `FAIL` — `17` suites total, `15` passed, `2` failed; `159` tests total, `155` passed, `4` failed.
  - **Failed files**:
    - `__tests__/api/adaptation-generate.test.ts`
    - `__tests__/api/frontier-base-generate.test.ts`
  - **Classification**: `expected — test setup uses removed env vars/config assumptions; awaiting Testing Agent updates for CR-019`.

## [AC-5 Security Confirmation]
- `FRONTIER_API_KEY` remains env-read only in route config loaders:
  - `app/api/frontier/base-generate/route.ts`
  - `app/api/adaptation/generate/route.ts`
- `FRONTIER_API_KEY` is used only in upstream auth header construction (`Authorization: Bearer ...`) and is not emitted in responses, logger fields, or span attributes.
- Reviewed span attributes/log fields in both routes (`http.*`, `frontier.*`, `adaptation.*`, `route`, `errorName`, `upstreamStatus`, `reasonCode`) and confirmed no key material exposure.

## [Out-of-Scope Requests Detected]
- none

## [Blockers]
- none

## [Failure Classification]
- `CR-related`: Expected unit-test drift in two API test files pending Testing Agent update (per handoff expectation).
- `pre-existing`: none.
- `environmental`: Node runtime is `v18.19.0` (< `>=20.x`) and `nvm` unavailable in this environment.
- `non-blocking warning`: `pnpm` engine warning and existing Jest open-handle note post-run.

## [Deviations]
- none

## [Meta Observations (CR-019)]
1. **Historical artifact vs procedure misalignment**
   - Observation: No ambiguity encountered; handoff explicitly included pre-replacement evidence for prior CR closure, which prevented uncertainty about replacing conversation artifacts.
   - Recommendation: Keep this explicit pre-replacement evidence block mandatory in every handoff template.
2. **Freshness-rule efficiency after CR closure**
   - Observation: Process was efficient once evidence was present, but creating a new in-progress report before implementation is manual and repetitive.
   - Recommendation: Add a minimal preflight-stub snippet to the backend template for faster, consistent kickoff.
3. **Long-term retention/deletion policy for old CR artifacts**
   - Observation: Artifact count is growing (`requirements/`, `plans/`, conversation history), and lookup still worked via IDs but scan cost is increasing.
   - Recommendation: Add a lightweight index/archival convention (e.g., quarterly archive index) while preserving immutable historical artifacts.
4. **Parallel CR execution across branches**
   - Observation: Single-file conversation artifacts (`tech-lead-to-backend.md`, `backend-to-tech-lead.md`) are merge-conflict prone if two CRs run in parallel branches.
   - Recommendation: Consider CR-scoped conversation filenames or branch-scoped working copies with an explicit consolidation step.
5. **Agent workload limits and load-management strategy**
   - Observation: Context load was manageable but dense due mandatory universal docs + long handoff + evidence logging requirements.
   - Recommendation: Add a short “execution checklist” section at top of handoffs summarizing assumptions, scope, and verification gates to reduce re-scanning overhead.

## [Ready for Next Agent]
`yes`

## [Follow-up Recommendations]
- Testing Agent should update the two failing API test files to align with config-centralized route behavior (no env-driven non-secret settings).
- Tech Lead/Testing should rerun quality gates under Node >=20.x local-equivalent environment to clear runtime-compliance warning.
