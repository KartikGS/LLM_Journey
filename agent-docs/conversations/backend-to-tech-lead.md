# Report: Backend → Tech Lead

## Subject
`CR-017 — Small Backlog Fixes: Route Cleanup (Output Cap + toRecord + Dead Code)`

## Status
`completed`

---

## [CR-015 Historical Note]
Prior CR-015 backend-to-tech-lead content replaced per Conversation File Freshness Rule.
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-015-plan.md` ✓
- Evidence 2 (prior CR closed): CR-015 status `completed` per prior `backend-to-tech-lead.md` and `project-log.md` ✓
- Result: replacement allowed.

---

## Preflight: Assumptions

1. `lib/utils/record.ts` exists and exports `toRecord` — **confirmed** (file present with correct signature).
2. The `Array.isArray(payload)` branch in `extractProviderOutput()` is not exercised by any test in `__tests__/api/frontier-base-generate.test.ts` — **confirmed**. All HF tests mock `{ choices: [{ text: 'HF output text' }] }` (OpenAI-compatible completions format), not the legacy `[{ generated_text: "" }]` array format.
3. `process.env.ADAPTATION_OUTPUT_MAX_CHARS` is not yet read anywhere in `adaptation/generate/route.ts` — **confirmed**. No prior reference exists.

## Preflight: Adjacent Risks

1. **Module-level constant testability**: `ADAPTATION_OUTPUT_MAX_CHARS` is parsed once at module load time (matching `FRONTIER_OUTPUT_MAX_CHARS` pattern in `base-generate`). Tests that set the env var *after* module import won't see the new value. The new cap test uses `jest.isolateModules()` to re-import the route with the env var already set — this is a minor deviation from the handoff test spec (see Deviations section).
2. **Client-side `toRecord()` duplication**: `AdaptationChat.tsx` and `FrontierBaseChat.tsx` still have local `toRecord()` definitions. These are client-side and explicitly out-of-scope per the handoff.

## Preflight: Open Questions
- none

## Preflight Status
`clear-to-implement`

---

## Scope Check

- Handoff source: `agent-docs/conversations/tech-lead-to-backend.md`
- Files modified:
  - `app/api/adaptation/generate/route.ts`
  - `app/api/frontier/base-generate/route.ts`
  - `__tests__/api/adaptation-generate.test.ts`
- Scope compliance:
  - [x] All modified files are in Backend ownership or explicitly delegated.
  - [x] Test file modified under explicit Tech Lead delegation (handoff: test scope delegated to Backend for output cap test).

## Changes Made

### `app/api/adaptation/generate/route.ts`
- Added import: `import { toRecord } from '@/lib/utils/record';`
- Added module-level constant: `const ADAPTATION_OUTPUT_MAX_CHARS = Math.max(1, parseInt(process.env.ADAPTATION_OUTPUT_MAX_CHARS ?? '4000', 10) || 4000);`
- Removed local `toRecord()` definition (was lines 185-187).
- Applied `.slice(0, ADAPTATION_OUTPUT_MAX_CHARS)` to `extractedOutput` in the `LiveModeResponse` return.

### `app/api/frontier/base-generate/route.ts`
- Added import: `import { toRecord } from '@/lib/utils/record';`
- Removed local `toRecord()` definition (was lines 163-165).
- Removed the `Array.isArray(payload)` dead code branch from `extractProviderOutput()` (was lines 210-218). Function body now starts directly with `const root = toRecord(payload);`.

### `__tests__/api/adaptation-generate.test.ts`
- Added `delete process.env.ADAPTATION_OUTPUT_MAX_CHARS;` to `beforeEach` cleanup.
- Added new test: `'should cap live output at ADAPTATION_OUTPUT_MAX_CHARS characters'` — uses `jest.isolateModules()` to re-import the route with `ADAPTATION_OUTPUT_MAX_CHARS=10`, verifying output is capped to 10 chars.

---

## Verification Results

### Runtime Preflight
- Command: `node -v`
- Result: `v20.20.0` ✓ (≥ 20.x satisfied)

### 1. `pnpm test`
- Command: `pnpm test`
- Scope: full suite
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — 17 suites, **134 tests passed**, 0 failed, 0 snapshots
- Total test count: **134** (was 133 baseline; +1 new cap test)

### 2. `pnpm lint`
- Command: `pnpm lint`
- Scope: full project
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — `✔ No ESLint warnings or errors`
- Note: pre-existing `next lint` deprecation notice (unrelated to CR)

### 3. `pnpm exec tsc --noEmit`
- Command: `pnpm exec tsc --noEmit`
- Scope: full project
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — exit code 0, no output

### DoD Checklist
- [x] `adaptation/generate/route.ts` imports `toRecord` from `@/lib/utils/record`; no local `toRecord` definition remains (AC-3)
- [x] `base-generate/route.ts` imports `toRecord` from `@/lib/utils/record`; no local `toRecord` definition remains (AC-3)
- [x] `Array.isArray(payload)` branch removed from `extractProviderOutput()` in `base-generate/route.ts` (AC-5)
- [x] `ADAPTATION_OUTPUT_MAX_CHARS` constant parsed from env in `adaptation/generate/route.ts`; applied via `.slice(0, ADAPTATION_OUTPUT_MAX_CHARS)` to live output (AC-1)
- [x] New cap test added and passing; `ADAPTATION_OUTPUT_MAX_CHARS` cleared in `beforeEach` (AC-1 test coverage)
- [x] `pnpm test` passes — 134 total, no regression vs. 133 baseline (AC-8)
- [x] `pnpm lint` passes (AC-8)
- [x] `pnpm exec tsc --noEmit` passes (AC-8)
- [x] No route/testid/accessibility contract changes (AC-7)

---

## Out-of-Scope Requests Detected
none

## Blockers
none

## Failure Classification
- `CR-related`: none
- `pre-existing`: none
- `environmental`: none (Node v20.20.0 used via nvm — satisfies documented minimum)
- `non-blocking warning`: `next lint` deprecation notice — pre-existing, unrelated to this CR.

## Deviations

1. **Cap test uses `jest.isolateModules()` instead of direct `POST` call** (Minor).
   - *Rationale*: `ADAPTATION_OUTPUT_MAX_CHARS` is parsed at module load time (top-level `const`). Setting `process.env.ADAPTATION_OUTPUT_MAX_CHARS` after the module is already imported has no effect. The handoff spec's test code calls the already-imported `POST`, which would always use the default `4000` cap. Using `jest.isolateModules()` forces a fresh module load with the env var already set, making the test actually verify the cap behavior. This matches the existing pattern where `FRONTIER_OUTPUT_MAX_CHARS` in `base-generate` is also module-level.
   - *Impact*: None on production behavior. Test correctly validates the feature. No contract change.

## Ready for Next Agent
yes

## Follow-up Recommendations
- The client-side `toRecord()` in `FrontierBaseChat.tsx` and `AdaptationChat.tsx` remains duplicated (out-of-scope per handoff). Consider extracting to a shared client-side utility if a third component needs it.

---
*Report created: 2026-02-25*
*Backend Agent*
