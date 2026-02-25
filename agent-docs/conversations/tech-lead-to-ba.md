# Handoff: Tech Lead → BA Agent

## Subject
`CR-017 — Small Backlog Fixes and Runtime Alignment`

## Status
`verified`

---

## [CR-015 Historical Note]
Prior CR-015 Tech Lead → BA content replaced per Conversation File Freshness Rule.
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-015-plan.md` ✓
- Evidence 2 (prior CR closed): CR-015 status `verified` per prior `tech-lead-to-ba.md` ✓
- Result: replacement allowed.

---

## Technical Summary

CR-017 bundled five small backlog items into a single low-risk cleanup pass across backend, frontend, and tooling layers:

1. **Adaptation output cap** — `/api/adaptation/generate` now reads `ADAPTATION_OUTPUT_MAX_CHARS` from the environment (default 4000) and applies it via `.slice()` to live output, matching the existing `FRONTIER_OUTPUT_MAX_CHARS` safety pattern in `base-generate`.
2. **`toRecord()` shared utility** — Duplicated local `toRecord()` helper extracted to `lib/utils/record.ts`; both API routes now import from the shared location. Local definitions removed from both route files.
3. **Transformers heading rename** — `<h3>` heading on the Transformers page changed from the developer-facing `"Model Comparison Template"` to the learner-facing `"Tiny vs Frontier: By the Numbers"`. Copy-only change.
4. **Dead code removal** — The unreachable `Array.isArray(payload)` branch in `extractProviderOutput()` in `base-generate/route.ts` was removed after confirming no supported code path depends on it (provider returns OpenAI-compat objects; all HF tests mock `{ choices: [...] }` format, not legacy array format).
5. **Node.js runtime contract** — `package.json` now declares `"engines": { "node": ">=20.x" }`; `.nvmrc` created with value `20` to give developers an explicit activation path.

**Scope boundaries preserved:**
- API response schemas for `/api/adaptation/generate` and `/api/frontier/base-generate` unchanged.
- No visual redesign beyond the heading text change.
- No new npm dependencies introduced.
- Observability and fallback behaviors untouched.
- No route-path, `data-testid`, or accessibility semantic contracts changed.

**Execution delegation:**
- Backend tasks (AC-1, AC-2 partial, AC-3, AC-5, and AC-8 gate): delegated to Backend Agent.
- Frontend task (AC-4): delegated to Frontend Agent.
- Tech Lead direct: `lib/utils/record.ts` creation, `.env.example` update, `package.json` engines field, `.nvmrc` creation.

---

## Evidence of AC Fulfillment

- [x] **AC-1 (Adaptation output cap):** `ADAPTATION_OUTPUT_MAX_CHARS = Math.max(1, parseInt(process.env.ADAPTATION_OUTPUT_MAX_CHARS ?? '4000', 10) || 4000)` declared at `app/api/adaptation/generate/route.ts:14-15`; applied as `extractedOutput.slice(0, ADAPTATION_OUTPUT_MAX_CHARS)` at line 462. New test `'should cap live output at ADAPTATION_OUTPUT_MAX_CHARS characters'` verifies 10-char cap via `jest.isolateModules()` (see Deviations). `beforeEach` clears `process.env.ADAPTATION_OUTPUT_MAX_CHARS` to prevent test leakage.

- [x] **AC-2 (Config contract):** `.env.example` — `ADAPTATION_OUTPUT_MAX_CHARS='4000'` added under the adaptation section with inline comment: `# Optional: max characters returned in live adaptation output (default 4000, matches frontier cap)`.

- [x] **AC-3 (`toRecord` cleanup):** `lib/utils/record.ts` created with a single exported `toRecord(value: unknown): Record<string, unknown> | null` function. `app/api/adaptation/generate/route.ts:6` and `app/api/frontier/base-generate/route.ts:6` both now import from `@/lib/utils/record`. Local `toRecord()` definitions removed from both files (adaptation: was lines 185-187; base-generate: was lines 163-165). API behavior unchanged — confirmed by full test suite passing (134 tests, 0 regressions).

- [x] **AC-4 (Heading rename):** `app/foundations/transformers/page.tsx:134` — `<h3>` text is `"Tiny vs Frontier: By the Numbers"`. No `data-testid`, role, or structural change. Parent `GlassCard` preserves `data-testid="transformers-comparison"`.

- [x] **AC-5 (Dead code removal):** `Array.isArray(payload)` branch removed from `extractProviderOutput()` in `app/api/frontier/base-generate/route.ts`. Function now begins directly with `const root = toRecord(payload);`. Dead-code validation: (1) featherless-ai router returns OpenAI-compat objects, not legacy HF arrays; (2) `buildProviderRequestBody` for `huggingface` uses OpenAI completions format; (3) no test in `__tests__/api/frontier-base-generate.test.ts` mocks an array payload — all HF tests use `{ choices: [{ text: '...' }] }`.

- [x] **AC-6 (Node runtime contract):** `package.json` — `"engines": { "node": ">=20.x" }` added after `"private": true`. `.nvmrc` created at project root with value `20`. Tech Lead verification run under Node v20.20.0 via `nvm use 20`. Backend sub-agent also confirmed v20.20.0 (`node -v` result in sub-agent report).

- [x] **AC-7 (Contract stability):** No route-path, `data-testid`, or accessibility semantic contracts changed. Confirmed: Backend adversarial diff review found no testid additions/removals; Frontend report confirms no testid or role changes at `page.tsx:134`; all 134 unit tests pass with no selector/contract regressions.

- [x] **AC-8 (Quality gates):** All four gates PASS under Node v20.20.0. See Verification Commands section below.

---

## Verification Commands

**Unit + Integration tests (Tech Lead run):**
- Command: `pnpm test`
- Scope: full suite (17 suites)
- Execution Mode: local-equivalent/unsandboxed (Node v20.20.0 via nvm)
- Result: **PASS** — 134 tests, 0 failures (baseline was 133; +1 new cap test)

**Lint (Tech Lead run):**
- Command: `pnpm lint`
- Scope: full project
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — ✔ No ESLint warnings or errors

**TypeScript (Tech Lead run):**
- Command: `pnpm exec tsc --noEmit`
- Scope: full project
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — exit 0, no output

**Build (Tech Lead run):**
- Command: `pnpm build`
- Scope: full Next.js production build
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — all routes compiled; no type errors; `lib/utils/record.ts` included in bundle

---

## Failure Classification Summary

- **CR-related**: none — all CR-017 scope items implemented and verified.
- **Pre-existing**: none detected in CR scope.
- **Environmental**: System Node.js v16.20.1 remains below documented minimum (≥20.x). Tech Lead verification ran under v20.20.0 via nvm. Frontend Agent used v18.19.0 (nvm v20 unavailable in that session). Pre-existing since CR-013; tracked in project-log Next Priorities. Node v20+ upgrade is the AC-6 partial mitigation (runtime contract is now machine-readable; host-level enforcement remains a future step).
- **Non-blocking warning**: `next lint` deprecation notice (pre-existing, unrelated to CR); OTel `require-in-the-middle` critical dependency warning in `pnpm build` output (pre-existing — `lib/otel/client.ts`, `lib/otel/server.ts`; tracked from prior CRs).

---

## Adversarial Diff Review

**`lib/utils/record.ts`**: Clean. Single exported function, no side effects. Type guard only — returns `Record<string, unknown> | null`. No logger calls, no span attributes. Correctly handles `null` (returns `null`, not `{}`).

**`app/api/adaptation/generate/route.ts`**: Clean. `ADAPTATION_OUTPUT_MAX_CHARS` is module-level (parsed once at load time — consistent with `FRONTIER_OUTPUT_MAX_CHARS` pattern). `parseInt` with `|| 4000` fallback guards against `NaN`. `Math.max(1, ...)` ensures cap is never ≤ 0. Slice applied only to live output, not fallback text. No debug artifacts. Telemetry boundary untouched — no span attributes added or removed for the cap feature.

**`app/api/frontier/base-generate/route.ts`**: Clean. Dead code branch removal leaves `extractProviderOutput()` leaner and starting directly with `const root = toRecord(payload);`. Remaining logic (OpenAI choices path, Anthropic-like content path) is identical to pre-CR behavior for supported payload shapes. No behavior change for configured routes.

**`__tests__/api/adaptation-generate.test.ts`**: Clean. Cap test assertion is exact: `expect(body.output).toBe('This respo')` and `expect(body.output.length).toBe(10)`. `beforeEach` cleanup for `ADAPTATION_OUTPUT_MAX_CHARS` prevents leakage. `jest.isolateModules()` pattern is the correct approach for module-level constants (see Deviations).

**`app/foundations/transformers/page.tsx`**: Clean. Only line 134 changed. `data-testid="transformers-comparison"` on parent `GlassCard` preserved. No structural, accessibility, or navigation contract changes. Heading is purely presentational copy.

**No residual risks identified.**

---

## Technical Retrospective

**Trade-offs accepted:**
- `ADAPTATION_OUTPUT_MAX_CHARS` is a module-level constant for consistency with `FRONTIER_OUTPUT_MAX_CHARS`. This means changing the env var requires a process restart — acceptable given the config-at-startup pattern already used across the project.
- `jest.isolateModules()` for the cap test is slightly more complex than a direct `POST` call, but it is the only correct approach for module-level constants. The pattern is well-understood and the test accurately validates the feature.

**Out-of-scope items deferred (per CR constraints):**
- Client-side `toRecord()` definitions remain in `FrontierBaseChat.tsx` and `AdaptationChat.tsx`. These are client-side components; the CR explicitly scoped cleanup to server-side API routes only. If a third component needs the helper, extraction to a shared client utility is warranted (see Recommendations).

---

## Tech Lead Recommendations

1. **Client-side `toRecord()` duplication** — `FrontierBaseChat.tsx` and `AdaptationChat.tsx` each have local `toRecord()` definitions that are functionally identical to `lib/utils/record.ts`. The CR constrained cleanup to server-side routes. Recommend: add to project-log Next Priorities for a future lib-cleanup CR if a third client component needs the helper. No immediate urgency.

2. **Host-level Node.js v20+ enforcement** — AC-6 formalizes the runtime contract in `package.json` and `.nvmrc`, but the host machine still runs v16.20.1. Verification continues to depend on `nvm use 20`. Recommend: retain in project-log Next Priorities. No new action required at this CR boundary.

---

## Deployment Notes

**New optional env var** (`ADAPTATION_OUTPUT_MAX_CHARS`):
- Default behavior if absent: cap of 4000 characters (matching frontier cap).
- To override: add `ADAPTATION_OUTPUT_MAX_CHARS='<integer>'` to `.env.local`.
- No `.env.local` changes required for existing deployments — default is safe.

**No other deployment impact:**
- No new npm packages.
- No new API routes or route renames.
- No CSP or middleware changes.
- No infrastructure changes.
- `lib/utils/record.ts` is a shared server-side utility with no runtime dependencies.

---

## Link to Updated Docs

- Plan: `agent-docs/plans/CR-017-plan.md`
- CR: `agent-docs/requirements/CR-017-small-backlog-fixes-and-runtime-alignment.md`
- Backend handoff: `agent-docs/conversations/tech-lead-to-backend.md`
- Frontend handoff: `agent-docs/conversations/tech-lead-to-frontend.md`
- Sub-agent reports: `backend-to-tech-lead.md`, `frontend-to-tech-lead.md`

---
*Report created: 2026-02-25*
*Tech Lead Agent*
