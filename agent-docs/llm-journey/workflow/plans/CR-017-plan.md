# Technical Plan — CR-017: Small Backlog Fixes and Runtime Alignment

## Technical Analysis

Five isolated maintenance tasks bundled into one pass. No shared state, no cross-task coupling. The scope covers two API routes, one UI heading, one dead code branch, and runtime contract artifacts. No new dependencies required.

The key technical concern is AC-5 (dead code removal): must confirm the `Array.isArray(payload)` branch in `extractProviderOutput()` is truly unreachable given the current featherless-ai router contract before deleting it.

---

## Discovery Findings

**AC-1/AC-2 (Adaptation output cap)**
- `app/api/adaptation/generate/route.ts:459` — `extractedOutput` returned directly with no cap.
- `app/api/frontier/base-generate/route.ts:9` — uses `FRONTIER_OUTPUT_MAX_CHARS = 4000` (hardcoded constant), applied at line 511: `extractedOutput.slice(0, FRONTIER_OUTPUT_MAX_CHARS)`.
- `.env.example` has no `ADAPTATION_OUTPUT_MAX_CHARS` entry. Needs to be added.

**AC-3 (toRecord cleanup)**
- `toRecord()` defined locally in:
  - `app/api/frontier/base-generate/route.ts:163` (server-side)
  - `app/api/adaptation/generate/route.ts:185` (server-side)
  - `app/foundations/transformers/components/FrontierBaseChat.tsx:20` (client-side — out of scope)
  - `app/models/adaptation/components/AdaptationChat.tsx:75` (client-side — out of scope)
- CR-017 BA scope: server-side API routes only. Client components are out of scope.
- `lib/utils/` directory exists (`lib/utils/parseHeaderString.ts`). A new `lib/utils/record.ts` fits the established pattern.

**AC-4 (Heading rename)**
- `app/foundations/transformers/page.tsx:134`: `<h3>` currently reads `"Model Comparison Template"`.
- Suggested replacement (per project-log note): `"Tiny vs Frontier: By the Numbers"`.
- No `data-testid` on this `<h3>`. Copy-only change — no contract delta.

**AC-5 (Dead code removal)**
- `extractProviderOutput()` in `app/api/frontier/base-generate/route.ts:211-218`:
  ```
  // HF: [{ generated_text: "..." }]
  if (Array.isArray(payload) && payload.length > 0) { ... }
  ```
- After CR-014 migration: `FRONTIER_PROVIDER=huggingface` now uses featherless-ai OpenAI-completions format. Response is `{ choices: [{ text: "..." }] }`, never an array.
- `buildProviderRequestBody` for HF sends `{ model, prompt, max_tokens, temperature }` — OpenAI completions format. Featherless-ai returns `choices[].text`, not legacy `[{ generated_text: "" }]`.
- Existing HF tests in `__tests__/api/frontier-base-generate.test.ts` mock responses as `{ choices: [{ text: '...' }] }` — they do NOT exercise the `Array.isArray` branch. Branch removal will not break existing tests.
- **Conclusion**: Branch is unreachable. Safe to remove.

**AC-6 (Node runtime contract)**
- `package.json` has no `engines` field currently.
- No `.nvmrc` or `.node-version` file in repo root.
- System runtime (from CR-017 baseline): `v18.19.0` — below documented minimum `>=20.x`.

---

## Configuration Specifications

### ADAPTATION_OUTPUT_MAX_CHARS env var
- **Type**: positive integer
- **Default**: 4000 (matches `FRONTIER_OUTPUT_MAX_CHARS`)
- **Parsing**: `Math.max(1, parseInt(process.env.ADAPTATION_OUTPUT_MAX_CHARS ?? '4000', 10) || 4000)`
- **Application**: `extractedOutput.slice(0, adaptationOutputMaxChars)` before returning `LiveModeResponse`
- **Scope**: Live path only. Fallback text is hardcoded and not subject to this cap.

### Node runtime contract
- `package.json` `engines` field: `{ "node": ">=20.x" }`
- `.nvmrc`: single line `20` (LTS major version, lets nvm resolve latest `20.x`)

### toRecord shared utility
- **Path**: `lib/utils/record.ts`
- **Export**: named export `toRecord`
- **Signature**: `export function toRecord(value: unknown): Record<string, unknown> | null`
- **Body**: unchanged from existing inline implementations
- Routes import with: `import { toRecord } from '@/lib/utils/record';`

### Heading rename
- **From**: `"Model Comparison Template"`
- **To**: `"Tiny vs Frontier: By the Numbers"`
- **Location**: `app/foundations/transformers/page.tsx:134`

---

## Implementation Decisions

1. **ADAPTATION_OUTPUT_MAX_CHARS parsed at module level** — consistent with how `parseTimeout` is implemented. Avoids repeated env reads per request.
2. **toRecord in `lib/utils/record.ts` (not `lib/utils.ts`)** — `lib/utils.ts` is a flat file; subdirectory pattern is already established by `lib/utils/parseHeaderString.ts`. Keeping utilities in separate files avoids barrel import complexity.
3. **`.nvmrc` uses major version `20`** — lets nvm resolve the latest `20.x` LTS release. Sufficient for machine-readable enforcement. `.node-version` not added (`.nvmrc` is the standard tool; avoid redundancy).
4. **Frontend heading copy** — `"Tiny vs Frontier: By the Numbers"` is the recommended copy from the project-log retrospective note. Tech Lead adopts it as-specified. No BA clarification needed (it's a developer-flagged item with explicit suggestion).

---

## Critical Assumptions

1. Featherless-ai router always returns OpenAI-compatible object format — never legacy HF array `[{ generated_text }]`. This was confirmed by CR-014 migration scope and is validated by existing test mocks.
2. The `toRecord()` function body is identical across all four current usages — one canonical implementation is safe.
3. No existing test directly tests the `Array.isArray(payload)` branch in `extractProviderOutput`. Confirmed by reading the test file.
4. Heading rename `<h3>` has no `data-testid` or E2E assertion — copy change only, no test contract impact.

---

## Proposed Changes

| File | Owner | Change |
|:---|:---|:---|
| `.env.example` | **Tech Lead (direct)** | Add `ADAPTATION_OUTPUT_MAX_CHARS='4000'` entry |
| `package.json` | **Tech Lead (direct)** | Add `"engines": { "node": ">=20.x" }` |
| `.nvmrc` | **Tech Lead (direct)** | Create: single line `20` |
| `lib/utils/record.ts` | **Tech Lead (direct)** | Create: exported `toRecord()` utility |
| `app/api/adaptation/generate/route.ts` | **Backend Agent** | (1) Import `toRecord` from `lib/utils/record`; (2) Remove local `toRecord` definition; (3) Add `ADAPTATION_OUTPUT_MAX_CHARS` env read; (4) Apply cap to live output |
| `app/api/frontier/base-generate/route.ts` | **Backend Agent** | (1) Import `toRecord` from `lib/utils/record`; (2) Remove local `toRecord` definition; (3) Remove `Array.isArray(payload)` branch from `extractProviderOutput()` |
| `__tests__/api/adaptation-generate.test.ts` | **Backend Agent** | Add test for capped output behavior |
| `app/foundations/transformers/page.tsx` | **Frontend Agent** | Rename heading text at line 134 |

---

## Contract Delta Assessment

- Route contracts changed? **No**
- `data-testid` contracts changed? **No**
- Accessibility/semantic contracts changed? **No**
- Testing handoff required per workflow matrix? **No** — copy-only change (AC-4) with stable selectors; backend changes are internal/additive with no route/contract change. AC-7 explicitly asserts contract stability.

---

## Architectural Invariants Check

- [x] **Observability Safety**: Output cap applied after extraction, before response. Telemetry attributes unchanged. Fallback boundary intact.
- [x] **Security Boundaries**: No new external inputs introduced. `ADAPTATION_OUTPUT_MAX_CHARS` is server-side env only.
- [x] **Dead code removal validated** before deletion (not speculative).

---

## Delegation & Execution Order

| Step | Agent | Task Description |
|:---|:---|:---|
| 0 | **Tech Lead (direct)** | Update `.env.example`, `package.json`, create `.nvmrc`, create `lib/utils/record.ts` |
| 1a | **Backend Agent** | Route updates: import shared `toRecord`, add output cap to adaptation route, remove dead code from base-generate route, add cap test |
| 1b | **Frontend Agent** | Heading rename in `app/foundations/transformers/page.tsx` |
| 2 | **Tech Lead** | Adversarial diff review + full quality gate sequence (`pnpm test` → `pnpm lint` → `pnpm exec tsc --noEmit` → `pnpm build`) |
| 3 | **Tech Lead** | BA handoff |

---

## Delegation Graph

- **Execution Mode**: **Parallel** (Steps 1a and 1b are independent — Backend and Frontend touch non-overlapping files)
- **Dependency Map**:
  - Step 1a depends on Step 0 (lib/utils/record.ts must exist before Backend imports from it)
  - Step 1b is independent of Step 0 and Step 1a
  - Step 2 depends on both 1a and 1b completing
- **Parallel Groups**:
  - Group 1: Step 1a (Backend) + Step 1b (Frontend) — issued simultaneously
- **Handoff Batch Plan**:
  - Both `tech-lead-to-backend.md` and `tech-lead-to-frontend.md` issued in the same turn after Tech Lead direct changes
- **Final Verification Owner**: Tech Lead runs full quality gates after both sub-agents report back

---

## Operational Checklist

- [x] **Environment**: `ADAPTATION_OUTPUT_MAX_CHARS` is env-driven with safe default. No hardcoded values exposed.
- [x] **Observability**: No telemetry boundary changes. No new span attributes required.
- [x] **Artifacts**: No new tool-generated artifacts; `.gitignore` unchanged.
- [x] **Rollback**: Revert is `git revert` on any commit. No DB migrations, no destructive state changes.

---

## Definition of Done (Technical)

- [ ] `ADAPTATION_OUTPUT_MAX_CHARS` present in `.env.example` (AC-2)
- [ ] `package.json` `engines` field set to `>=20.x` (AC-6)
- [ ] `.nvmrc` file exists with value `20` (AC-6)
- [ ] `lib/utils/record.ts` exports `toRecord()` (AC-3 foundation)
- [ ] Both API routes import `toRecord` from shared utility; local definitions removed (AC-3)
- [ ] `adaptation/generate` live output is capped by `ADAPTATION_OUTPUT_MAX_CHARS` (AC-1)
- [ ] `extractProviderOutput()` `Array.isArray` branch removed from `base-generate/route.ts` (AC-5)
- [ ] Heading at `transformers/page.tsx:134` reads `"Tiny vs Frontier: By the Numbers"` (AC-4)
- [ ] `pnpm test` passes (AC-8) — no regression vs. 133 baseline
- [ ] `pnpm lint` passes (AC-8)
- [ ] `pnpm exec tsc --noEmit` passes (AC-8)
- [ ] `pnpm build` passes (AC-8)
- [ ] No route/testid/accessibility contract changes (AC-7)
