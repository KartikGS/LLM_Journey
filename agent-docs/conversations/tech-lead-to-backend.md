# Handoff: Tech Lead → Backend Agent

## Subject
`CR-019 — Generation Config Centralization: Backend Implementation`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior content: `CR-018`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-018-plan.md` ✓
- Evidence 2 (prior CR closed): CR-018 status `Done` per `agent-docs/project-log.md` ✓
- Result: replacement allowed.

---

## Objective

Refactor both generation route handlers and the shared generation utility to source all non-secret runtime settings from `lib/config/generation.ts` instead of environment variables. After this change, `process.env.FRONTIER_API_KEY` is the **only** env read in any generation route.

---

## Rationale (Why)

Nine non-secret generation settings (`FRONTIER_API_URL`, `FRONTIER_MODEL_ID`, `FRONTIER_PROVIDER`, `FRONTIER_TIMEOUT_MS`, `ADAPTATION_API_URL`, all three adaptation model IDs, `ADAPTATION_OUTPUT_MAX_CHARS`) were resolved at runtime from env vars. This creates:
- Configuration sprawl across env files with no single versioned source.
- Risk of environment-specific behavioral drift.
- Unnecessary coupling between deployment env and non-sensitive settings.

This CR establishes `lib/config/generation.ts` as the single source of truth for non-secret generation settings. The config file has already been created by the Tech Lead (see Scope below). Your task is to update the route handlers and shared utility to use it.

---

## Known Environmental Caveats (Mandatory)

- **Node.js runtime**: System may be below `>=20.x` documented minimum. Run `node -v` first. If below v20, activate via `nvm use 20`. If nvm is unavailable, classify as `environmental` and document — do not skip verification.
- **pnpm**: Use `pnpm` exclusively. Never `npm` or `yarn`.
- **Port**: Dev server runs on port `3001`. Not required for lint/type verification.
- **E2E**: Not in scope for this handoff. Testing Agent handles test file updates and full quality gates.

---

## Constraints

### Technical Constraints
- `process.env.FRONTIER_API_KEY` is the **only** env read that must remain in both route handlers. No other `process.env.*` reads may remain in either generation route.
- No new package dependencies.
- Preserve all existing route response envelopes exactly. No route-path, `data-testid`, or accessibility contract changes (AC-4).
- Do not add error handling for config-sourced values — they are trusted TypeScript constants, not user input.

### Ownership Constraints
- Files in scope: `app/api/frontier/base-generate/route.ts`, `app/api/adaptation/generate/route.ts`, `lib/server/generation/shared.ts`.
- Do **not** modify `__tests__/` files — the Testing Agent updates all test files in Step 2.
- Do **not** modify `lib/config/generation.ts` — it is Tech Lead-owned and already final.

---

## Assumptions To Validate (Mandatory — Before Starting)

1. **Config file exists**: `lib/config/generation.ts` was created by Tech Lead. Read it before starting. Confirm it exports `FRONTIER_GENERATION_CONFIG`, `ADAPTATION_GENERATION_CONFIG`, and `FrontierProvider`.
2. **No other consumers of removed env vars**: Grep for `FRONTIER_API_URL`, `FRONTIER_MODEL_ID`, `FRONTIER_PROVIDER`, `FRONTIER_TIMEOUT_MS`, `ADAPTATION_API_URL`, `ADAPTATION_FULL_FINETUNE_MODEL_ID`, `ADAPTATION_LORA_MODEL_ID`, `ADAPTATION_PROMPT_PREFIX_MODEL_ID`, `ADAPTATION_OUTPUT_MAX_CHARS` in source files (excluding `.env*`, `agent-docs/`, and `__tests__/`). If any consumer outside the two route files reads these vars, **stop and flag** before proceeding.
3. **`parseTimeout` has no external callers**: Confirm `parseTimeout` is only imported by the two route files. If any other file imports it, **stop and flag**.
4. **`FRONTIER_API_KEY` security**: Confirm the existing span attributes and log fields in both routes do not expose `FRONTIER_API_KEY`. (This was verified in CR-018 — re-confirm after your changes.)

---

## Out-of-Scope But Must Be Flagged (Mandatory)

- If any file outside the two route handlers reads a generation env var that this CR removes — **stop and flag**. Do not silently migrate an unexpected consumer.
- If during implementation you discover that `ADAPTATION_OUTPUT_MAX_CHARS` is read in any component or client file — **stop and flag** (this would be an architecture violation).
- Do not add streaming support, response-envelope changes, or new HTTP status codes.

---

## Scope

### Config File (already created — read-only for Backend)
- `lib/config/generation.ts`: already exists. Read it. Do not modify.

### Files to Modify

**`lib/server/generation/shared.ts`**
- Remove `parseTimeout` function and its supporting constants: `DEFAULT_TIMEOUT_MS`, `MIN_TIMEOUT_MS`, `MAX_TIMEOUT_MS`.
- Keep: `FallbackReasonCode` type, `extractProviderErrorMessage`, `mapProviderFailure`.
- After removal, the file should contain only the three exports above.

**`app/api/frontier/base-generate/route.ts`**
- Add import: `import { FRONTIER_GENERATION_CONFIG, type FrontierProvider } from '@/lib/config/generation';`
- Remove: local `FrontierProvider` type definition (currently embedded in the `FrontierConfig` type block). Import it from config instead.
- Remove: `parseTimeout` import from `@/lib/server/generation/shared`.
- Refactor `loadFrontierConfig()` — replace all env reads with config values. Required behavior:
  - Read `FRONTIER_API_KEY` from `process.env.FRONTIER_API_KEY?.trim() ?? ''`.
  - Use `FRONTIER_GENERATION_CONFIG.apiUrl`, `.modelId`, `.provider`, `.timeoutMs` for all other fields.
  - Remove the URL validation block (no longer needed — URL is a trusted config constant).
  - Remove the `rawProvider` validation block (no longer needed — provider is a trusted config constant).
  - `configured` is `true` if and only if `apiKey` is non-empty; `false` otherwise with `issueCode: 'missing_config'`.
  - The `invalid_config` branch is intentionally removed — it was only reachable via bad env input.

  Target shape of `loadFrontierConfig()` after migration:
  ```typescript
  function loadFrontierConfig(): FrontierConfig {
      const apiKey = process.env.FRONTIER_API_KEY?.trim() ?? '';

      if (!apiKey) {
          return {
              apiUrl: FRONTIER_GENERATION_CONFIG.apiUrl,
              modelId: FRONTIER_GENERATION_CONFIG.modelId,
              apiKey,
              timeoutMs: FRONTIER_GENERATION_CONFIG.timeoutMs,
              configured: false,
              issueCode: 'missing_config',
              provider: FRONTIER_GENERATION_CONFIG.provider,
          };
      }

      return {
          apiUrl: FRONTIER_GENERATION_CONFIG.apiUrl,
          modelId: FRONTIER_GENERATION_CONFIG.modelId,
          apiKey,
          timeoutMs: FRONTIER_GENERATION_CONFIG.timeoutMs,
          configured: true,
          provider: FRONTIER_GENERATION_CONFIG.provider,
      };
  }
  ```

**`app/api/adaptation/generate/route.ts`**
- Add import: `import { ADAPTATION_GENERATION_CONFIG } from '@/lib/config/generation';`
- Remove: `parseTimeout` import from `@/lib/server/generation/shared`.
- Remove: the `STRATEGY_MODEL_ENV` constant (it mapped strategy names to env var name strings — no longer needed).
- Replace the module-load-time env-based constant:
  ```typescript
  // OLD (remove this):
  const ADAPTATION_OUTPUT_MAX_CHARS =
      Math.max(1, parseInt(process.env.ADAPTATION_OUTPUT_MAX_CHARS ?? '4000', 10) || 4000);
  ```
  Replace with a direct config import reference. You may define a local alias:
  ```typescript
  const ADAPTATION_OUTPUT_MAX_CHARS = ADAPTATION_GENERATION_CONFIG.outputMaxChars;
  ```
  Or reference `ADAPTATION_GENERATION_CONFIG.outputMaxChars` directly at the usage site. Either is acceptable.
- Refactor `loadAdaptationConfig()` — replace all env reads with config values. Required behavior:
  - Read `FRONTIER_API_KEY` from `process.env.FRONTIER_API_KEY?.trim() ?? ''`.
  - Use `ADAPTATION_GENERATION_CONFIG.apiUrl` and `.timeoutMs` for those fields.
  - Use `ADAPTATION_GENERATION_CONFIG.models[strategy]` for the model ID (replaces `process.env[STRATEGY_MODEL_ENV[strategy]]`).
  - Remove the URL validation block.
  - `configured` is `true` if and only if `apiKey` is non-empty; `false` otherwise with `issueCode: 'missing_config'`.

  Target shape of `loadAdaptationConfig()` after migration:
  ```typescript
  function loadAdaptationConfig(strategy: StrategyId): AdaptationConfig {
      const apiKey = process.env.FRONTIER_API_KEY?.trim() ?? '';
      const modelId = ADAPTATION_GENERATION_CONFIG.models[strategy];

      if (!apiKey) {
          return {
              apiUrl: ADAPTATION_GENERATION_CONFIG.apiUrl,
              modelId,
              apiKey,
              timeoutMs: ADAPTATION_GENERATION_CONFIG.timeoutMs,
              configured: false,
              issueCode: 'missing_config',
          };
      }

      return {
          apiUrl: ADAPTATION_GENERATION_CONFIG.apiUrl,
          modelId,
          apiKey,
          timeoutMs: ADAPTATION_GENERATION_CONFIG.timeoutMs,
          configured: true,
      };
  }
  ```

---

## Important: Expected Test Failures (Do Not Modify Tests)

After your route changes, `pnpm test` **will report failures** in `__tests__/api/frontier-base-generate.test.ts` and `__tests__/api/adaptation-generate.test.ts`. This is **expected and acceptable**. The existing tests set env vars like `FRONTIER_API_URL`, `FRONTIER_MODEL_ID`, etc. to configure the route; those env reads no longer exist in the routes after migration. The Testing Agent will update all test files in Step 2.

**Do NOT modify test files.** Run `pnpm test` and report:
- How many tests fail, and which files.
- Classify as: `expected — test setup uses removed env vars; awaiting Testing Agent`.
- Confirm `pnpm lint` and `pnpm exec tsc --noEmit` pass cleanly.

---

## Meta Observations (CR-019) — Required in Your Report

Your `backend-to-tech-lead.md` report must include a **`Meta Observations (CR-019)`** section covering all five pointers with evidence from this CR's execution and at least one actionable recommendation per pointer:

1. Confusion from historical-artifact vs procedure misalignment — did you encounter any during this handoff? What helped or hurt?
2. Freshness-rule efficiency for conversation files after CR closure — any friction in the current pre-replacement check protocol?
3. Long-term retention/deletion policy for old CR artifacts — any concern with growing file count in `requirements/` or `plans/`?
4. Parallel CR execution across branches — any process or file-ownership issues you foresee?
5. Agent workload limits and load-management strategy — any context pressure signals during this execution?

Keep each response evidence-based and scoped to what you directly observed.

---

## Definition of Done

- [ ] `lib/config/generation.ts` imported in both route files; no modification to config file.
- [ ] `app/api/frontier/base-generate/route.ts`: `loadFrontierConfig()` reads only `process.env.FRONTIER_API_KEY`; all other values from config; URL and provider validation blocks removed; `FrontierProvider` type imported from config.
- [ ] `app/api/adaptation/generate/route.ts`: `loadAdaptationConfig()` reads only `process.env.FRONTIER_API_KEY`; all other values from config; `STRATEGY_MODEL_ENV` constant removed; module-load-time env cap replaced with config reference.
- [ ] `lib/server/generation/shared.ts`: `parseTimeout`, `DEFAULT_TIMEOUT_MS`, `MIN_TIMEOUT_MS`, `MAX_TIMEOUT_MS` removed; three exports remain (`FallbackReasonCode`, `extractProviderErrorMessage`, `mapProviderFailure`).
- [ ] `pnpm lint` passes with zero errors.
- [ ] `pnpm exec tsc --noEmit` passes with zero errors.
- [ ] `pnpm test` run and results reported; test failures classified as expected (removed env var setup) or unexpected (flag immediately).
- [ ] `FRONTIER_API_KEY` confirmed absent from all response payloads, log fields, and span attributes in both routes.
- [ ] Meta Observations section included in report.

---

## Clarification Loop (Mandatory)

Before implementation, post a preflight note to `agent-docs/conversations/backend-to-tech-lead.md` covering:
- Assumptions confirmed (or invalidated).
- Any adjacent risks not in current scope.
- Open questions (if any).

If any open question changes route contracts or scope, pause and wait for Tech Lead clarification before proceeding.

---

## Verification

Run in sequence. Report each using the Command Evidence Standard format.

```
node -v
pnpm lint
pnpm exec tsc --noEmit
pnpm test
```

For each command:
- **Command**: `[exact command]`
- **Scope**: `[full suite | targeted]`
- **Execution Mode**: `[sandboxed | local-equivalent/unsandboxed]`
- **Result**: `[PASS/FAIL + key counts or error summary]`

For `pnpm test`: report total test count, pass count, fail count. Classify failures.

---

## Report Back

Write completion report to `agent-docs/conversations/backend-to-tech-lead.md` using `agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md`.

Status vocabulary: `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`

Include in report:
- Preflight note (assumptions confirmed/invalidated).
- Summary of each file changed.
- Verification evidence in Command Evidence Standard format.
- Test failure classification (expected vs unexpected).
- Security confirmation (`FRONTIER_API_KEY` absent from responses/logs/spans).
- Deviations from this spec (if any), classified per the Deviation Protocol.
- **Meta Observations (CR-019)** section (all 5 pointers).
