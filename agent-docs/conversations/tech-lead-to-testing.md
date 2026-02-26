# Handoff: Tech Lead → Testing Agent

## Subject
`CR-019 — Generation Config Centralization: Test Suite Alignment`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior content: `CR-018`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-018-plan.md` ✓
- Evidence 2 (prior CR closed): CR-018 status `Done` per `agent-docs/project-log.md` ✓
- Result: replacement allowed.

---

## Objective

Update the two failing API test files to align with the config-centralized route behavior introduced in CR-019. After your changes, `pnpm test` must pass with zero new failures. No production code changes are in scope.

---

## Rationale (Why)

Backend refactored both generation routes to source all non-secret settings from `lib/config/generation.ts` instead of environment variables. Only `FRONTIER_API_KEY` is now read from env. The existing tests were written against the old env-driven model and fail because:

1. `setConfigEnv` / `beforeEach` helpers still set/delete env vars that the routes no longer read.
2. The `invalid_config` test path (unknown `FRONTIER_PROVIDER` env value) no longer exists in the route.
3. The output-cap test used `process.env.ADAPTATION_OUTPUT_MAX_CHARS` + `jest.isolateModules` to force a non-default cap — this env var is now gone.

---

## Constraints

- **Allowed files:** `__tests__/api/frontier-base-generate.test.ts`, `__tests__/api/adaptation-generate.test.ts`
- **No app code changes** — do not modify any file outside `__tests__/`.
- **Verification:** `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit` (full `pnpm build` is Tech Lead scope; omit from your verification sequence).
- **E2E:** Not required — no route/selector/semantic contracts changed per AC-4.
- **Failure classification:** Node v18 / nvm mismatch is pre-existing environmental; classify and proceed per tooling-standard.md.

---

## Stable Signals to Assert (Mandatory)

- Route returns `mode: 'fallback'` with `reason.code: 'missing_config'` when `FRONTIER_API_KEY` is absent.
- Route returns `mode: 'live'` with `output` and correct `metadata.modelId` when `FRONTIER_API_KEY` is present and upstream succeeds.
- `FRONTIER_API_KEY` value does not appear in response body or span attributes on any path.

## Prohibited Brittle Assertions (Mandatory)

- Do not assert on any removed env var value (`FRONTIER_API_URL`, `FRONTIER_MODEL_ID`, `FRONTIER_PROVIDER`, `FRONTIER_TIMEOUT_MS`, `ADAPTATION_API_URL`, adaptation model ID env vars, `ADAPTATION_OUTPUT_MAX_CHARS`).
- Do not assert `reason.code: 'invalid_config'` — that fallback path is unreachable post-migration and will never be returned by the routes.

---

## Known Environmental Caveats (Mandatory)

- Node v18.19.0 (< required >=20.x), `nvm` unavailable. Pre-existing; classify as `environmental` if tests fail due to runtime. Does not block this CR.
- `pnpm` engine warning on every run — non-blocking, classify as `non-blocking warning`.
- Jest open-handle note post-run — pre-existing, non-blocking.

---

## Assumptions To Validate (Mandatory)

1. After `setConfigEnv` is simplified to set only `FRONTIER_API_KEY`, the routes resolve all other settings from `FRONTIER_GENERATION_CONFIG` / `ADAPTATION_GENERATION_CONFIG` — confirm by verifying live-path tests still pass with the correct config values.
2. The `jest.isolateModules` + `jest.mock('@/lib/config/generation', ...)` pattern produces an isolated module registry where the route sees the overridden `outputMaxChars: 10` — confirm the output-cap test produces a 10-char truncated result.
3. Module-level mocks for `@/lib/otel/tracing`, `@/lib/otel/metrics`, `@/lib/otel/logger` carry over into `jest.isolateModules` scope without re-declaration — confirm by checking that span/metric mocks work in the isolated test.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

- `invalid_config` dead code branch in `FallbackReasonCode` type and route handlers — flagged by Tech Lead; not a test concern but record if you observe it.
- Any new test failures in suites other than the two target files — flag immediately as a potential regression.

---

## Scope

### Files to Modify

- `__tests__/api/frontier-base-generate.test.ts`
- `__tests__/api/adaptation-generate.test.ts`

---

## Required Changes — `frontier-base-generate.test.ts`

### 1. `beforeEach` cleanup block
Remove deletes for removed env vars. Keep only `FRONTIER_API_KEY`:

```diff
- delete process.env.FRONTIER_API_URL;
- delete process.env.FRONTIER_MODEL_ID;
  delete process.env.FRONTIER_API_KEY;
- delete process.env.FRONTIER_TIMEOUT_MS;
- delete process.env.FRONTIER_PROVIDER;
```

### 2. `HF_ENV` constant (inside `HF Provider Path` describe)
Simplify to API key only:

```diff
  const HF_ENV = {
-     FRONTIER_API_URL: 'https://router.huggingface.co/featherless-ai/v1/completions',
-     FRONTIER_MODEL_ID: 'meta-llama/Meta-Llama-3-8B',
      FRONTIER_API_KEY: 'hf-secret-key',
-     FRONTIER_PROVIDER: 'huggingface',
  };
```

### 3. Remove the `invalid_config` test entirely
Delete the entire test block:

```
it('should return invalid_config fallback and not call fetch for unknown FRONTIER_PROVIDER', ...)
```

This code path was removed by Backend. The test is obsolete.

### 4. `should return live envelope when upstream provider succeeds` test
Replace env setup and update assertions:

```diff
- process.env.FRONTIER_API_URL = 'https://provider.example/v1/chat/completions';
- process.env.FRONTIER_MODEL_ID = 'frontier-base-live';
  process.env.FRONTIER_API_KEY = 'secret-key';
- process.env.FRONTIER_TIMEOUT_MS = '5000';
```

Update metadata assertion (modelId now comes from `FRONTIER_GENERATION_CONFIG.modelId`):
```diff
- modelId: 'frontier-base-live',
+ modelId: 'meta-llama/Meta-Llama-3-8B',
```

Update fetch URL assertion (URL now comes from `FRONTIER_GENERATION_CONFIG.apiUrl`):
```diff
  expect(global.fetch).toHaveBeenCalledWith(
-     'https://provider.example/v1/chat/completions',
+     'https://router.huggingface.co/featherless-ai/v1/completions',
      expect.objectContaining({ ... })
  );
```

### 5. `Metrics and Security` `HF_ENV` constant
Same simplification as item 2 — only `FRONTIER_API_KEY: 'sk-secret-frontier-key'`.

---

## Required Changes — `adaptation-generate.test.ts`

### 1. `beforeEach` cleanup block
Remove deletes for all non-secret vars. Keep only `FRONTIER_API_KEY`:

```diff
  delete process.env.FRONTIER_API_KEY;
- delete process.env.ADAPTATION_API_URL;
- delete process.env.ADAPTATION_FULL_FINETUNE_MODEL_ID;
- delete process.env.ADAPTATION_LORA_MODEL_ID;
- delete process.env.ADAPTATION_PROMPT_PREFIX_MODEL_ID;
- delete process.env.FRONTIER_TIMEOUT_MS;
- delete process.env.ADAPTATION_OUTPUT_MAX_CHARS;
```

### 2. `setConfigEnv` helper
Only `FRONTIER_API_KEY` determines configured state:

```diff
  function setConfigEnv(strategy: 'full-finetuning' | 'lora-peft' | 'prompt-prefix') {
-     process.env.ADAPTATION_API_URL = ADAPTATION_API_URL;
      process.env.FRONTIER_API_KEY = FRONTIER_API_KEY;
-     process.env.ADAPTATION_FULL_FINETUNE_MODEL_ID = MODEL_IDS['full-finetuning'];
-     process.env.ADAPTATION_LORA_MODEL_ID = MODEL_IDS['lora-peft'];
-     process.env.ADAPTATION_PROMPT_PREFIX_MODEL_ID = MODEL_IDS['prompt-prefix'];
      void strategy;
  }
```

### 3. `Metrics and Security` `VALID_ENV` constant
Simplify to API key only:

```diff
  const VALID_ENV = {
-     ADAPTATION_API_URL: 'https://router.huggingface.co/v1/chat/completions',
      FRONTIER_API_KEY: 'sk-secret-key',
-     ADAPTATION_FULL_FINETUNE_MODEL_ID: 'model-ff',
-     ADAPTATION_LORA_MODEL_ID: 'model-lora',
-     ADAPTATION_PROMPT_PREFIX_MODEL_ID: 'model-pp',
  };
```

### 4. Output-cap test — replace env-var pattern with config mock

Remove `process.env.ADAPTATION_OUTPUT_MAX_CHARS = '10'`. Replace the `jest.isolateModules` body to mock `@/lib/config/generation` with `outputMaxChars: 10`:

```typescript
it('should cap live output at ADAPTATION_OUTPUT_MAX_CHARS characters', async () => {
    setConfigEnv('full-finetuning');
    mockLiveResponse('This response is longer than ten characters');

    let isolatedPOST: typeof POST;
    jest.isolateModules(() => {
        jest.mock('@/lib/config/generation', () => ({
            ADAPTATION_GENERATION_CONFIG: {
                apiUrl: 'https://router.huggingface.co/featherless-ai/v1/chat/completions',
                timeoutMs: 8000,
                outputMaxChars: 10,
                models: {
                    'full-finetuning': 'meta-llama/Meta-Llama-3-8B-Instruct',
                    'lora-peft': 'swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA',
                    'prompt-prefix': 'meta-llama/Meta-Llama-3-8B',
                },
            },
        }));
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        isolatedPOST = require('@/app/api/adaptation/generate/route').POST;
    });

    const req = createRequest({ prompt: 'Test cap.', strategy: 'full-finetuning' });
    const res = await isolatedPOST!(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.mode).toBe('live');
    expect(body.output).toBe('This respo');
    expect(body.output.length).toBe(10);
});
```

---

## Verification Depth

`boundary-focused`

Required boundary classes:
- **Config-only configured state:** routes enter live path with only `FRONTIER_API_KEY` set (no URL/model env vars).
- **Config-only unconfigured state:** routes enter fallback with `missing_config` when `FRONTIER_API_KEY` absent (no other env vars needed).
- **Output cap:** live output truncated to `outputMaxChars` from config, not env.
- **Removed path:** `invalid_config` is never returned.

---

## Definition of Done

- [ ] `invalid_config` test removed from `frontier-base-generate.test.ts`
- [ ] All `setHfEnv` / `setConfigEnv` / `beforeEach` helpers reference only `FRONTIER_API_KEY`
- [ ] `Metrics and Security` `HF_ENV` and `VALID_ENV` constants simplified to API key only
- [ ] Output-cap test uses config mock pattern, not env var
- [ ] Live-path URL and modelId assertions updated to config values
- [ ] `pnpm test`: all suites pass (0 failures)
- [ ] `pnpm lint`: passes (no new ESLint errors)
- [ ] `pnpm exec tsc --noEmit`: passes (exit code 0)

---

## Clarification Loop (Mandatory)

- Testing posts preflight concerns/questions in `agent-docs/conversations/testing-to-tech-lead.md`.
- Tech Lead responds in the same file.
- Repeat until concerns are resolved or status becomes `blocked`.

---

## Verification

Use command evidence standard: Command, Scope, Execution Mode, Result.

## Report Back

Write completion report to `agent-docs/conversations/testing-to-tech-lead.md`.

Status vocabulary: `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`
