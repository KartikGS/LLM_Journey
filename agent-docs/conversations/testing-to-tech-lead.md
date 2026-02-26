# Handoff: Testing Agent → Tech Lead

## Subject
`CR-021 — Frontier and Adaptation Response Streaming: E2E Test Coverage`

## Pre-Replacement Check (Conversation Freshness)
- Prior content: `CR-019` (`Generation Config Centralization: Test Suite Alignment`)
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-019-plan.md` ✓ (confirmed in tech-lead-to-testing.md)
- Evidence 2 (prior CR closed): `CR-019` status `Completed` per `agent-docs/project-log.md` ✓ (confirmed in tech-lead-to-testing.md)
- Result: replacement allowed.

---

## Status
`in_progress`

## Preflight

### Assumptions I'm making
1. All `data-testid` contracts listed in Task 2 are present in `AdaptationChat.tsx` — verified by source read: `adaptation-chat` (line 330), `adaptation-chat-tab-full-finetuning` (TAB_CONFIGS line 31), `adaptation-chat-tab-lora-peft` (TAB_CONFIGS line 45), `adaptation-chat-tab-prompt-prefix` (TAB_CONFIGS line 59), `adaptation-chat-form` (line 462), `adaptation-chat-input` (line 470), `adaptation-chat-submit` (line 481), `adaptation-chat-output` (line 497), `adaptation-chat-status` (line 434). All contracts confirmed.
2. `frontier-submit` re-enable timeout concern: streaming extends completion time beyond the previous JSON-response baseline. Will evaluate 15s vs. 30s empirically via E2E run.
3. Node runtime may be below `>=20.x` (same as CR-019 where v18.19.0 was observed). Will classify as `environmental` if confirmed.
4. E2E requires a running dev server on port 3001. Will classify as `environmental` if the server cannot start due to sandbox constraints.
5. The `$` prefix in `adaptation-chat-output` appears once `hasFirstToken = true` (mid-stream, line 520 of `AdaptationChat.tsx`) — assertion should be present well before stream completes.

### Risks not covered by current scope
- **LoRA/PEFT Italian model**: The `lora-peft` strategy calls a non-English-primary model. E2E submit cycle test covers `full-finetuning` only per handoff scope; LoRA behavior is untested.
- **`prompt-prefix` base model**: Uses a non-instruct base model with intentionally lower reliability. Fallback path may trigger more often; out of scope per handoff.
- **Streaming timeout flakiness**: `{ timeout: 30000 }` for re-enable may still be insufficient under high server load. Not in scope to increase further without Tech Lead approval.

### Questions for Tech Lead
- None.

## Preflight Status
- `clear-to-implement`

---

## Status
`completed`

## Changes Made

### Task 1: `__tests__/e2e/transformer.spec.ts`
- **No changes made.** The frontier submit cycle test (`should complete frontier submit cycle and show output/status @critical`) passed with the existing `{ timeout: 15000 }` assertion (line 63). Retaining per handoff instruction: "If 15s is adequate, retain."
- **Important caveat**: Both frontier and adaptation routes ran in fallback mode during the E2E run (`upstream_auth` 401 — no `FRONTIER_API_KEY` in environment). The live streaming path was not exercised. The 15s adequacy finding applies to the fallback JSON path only. See Out-of-Scope Flags below.

### Task 2: `__tests__/e2e/adaptation.spec.ts`
- **Created** `__tests__/e2e/adaptation.spec.ts` with two tests:
  - `should expose static adaptation contracts @critical` — navigates to `/models/adaptation` and asserts all 9 contracted `data-testid` elements are visible.
  - `should complete adaptation submit cycle (full-finetuning) @critical` — clicks the full-finetuning tab, fills input, submits, asserts disabled → re-enabled (`timeout: 30000`), asserts `Mode: (live|fallback)/i` in status, asserts `$` in output.

---

## Verification Results

- Command: `node -v`
  - Scope: Runtime Preflight
  - Execution Mode: local-equivalent/unsandboxed (nvm activated)
  - Result: Default shell = v16.20.1 (below 20.x); activated `nvm use 20` → v20.20.0 used for all verification gates.

- Command: `pnpm test`
  - Scope: full suite (17 suites)
  - Execution Mode: local-equivalent/unsandboxed (Node 20)
  - Result: PASS — 162 passed, 0 failed.

- Command: `pnpm lint`
  - Scope: full suite
  - Execution Mode: local-equivalent/unsandboxed
  - Result: PASS — No ESLint warnings or errors.

- Command: `pnpm exec tsc --noEmit`
  - Scope: full suite
  - Execution Mode: local-equivalent/unsandboxed
  - Result: PASS — exit code 0.

- Command: `pnpm test:e2e`
  - Scope: full suite — adaptation.spec.ts, landing-page.spec.ts, navigation.spec.ts, transformer.spec.ts
  - Execution Mode: local-equivalent/unsandboxed
  - Browser Scope: chromium, firefox, webkit (10 tests × 3 browsers = 30 total)
  - Result: PASS — 30 passed in 1m 24s.

### Reproduction Matrix (E2E)
| command | mode | browsers | result | classification note |
|---|---|---|---|---|
| `pnpm test:e2e` | local-equivalent/unsandboxed | chromium, firefox, webkit | 30/30 PASS (1m 24s) | All tests pass. Fallback path exercised (no API key). |

---

## Dependency Consumption
- none

---

## Failure Classification
- `CR-related`: none.
- `pre-existing`: none.
- `environmental`:
  - Node v16.20.1 on default shell (below `>=20.x`). Recovered via `nvm use 20` to v20.20.0. Pre-existing (same as CR-019).
  - No `FRONTIER_API_KEY` in env — both routes ran in fallback mode during E2E. Live streaming path not exercised.
  - OTEL proxy upstream collector not running on port 4318 (ECONNREFUSED). Pre-existing; tests passed per observability safety invariant (tracing failures must not crash UI).
- `non-blocking warning`:
  - `pnpm` engine warning (pre-existing).
  - Jest open-handle note post-run (pre-existing).
  - `next lint` deprecation notice (pre-existing).

---

## Out-of-Scope Flags

1. **Live streaming timeout risk** (`non-blocking`): The 15s timeout on `frontierSubmit.toBeEnabled({ timeout: 15000 })` (transformer.spec.ts:63) was retained because the test passed. However, the live streaming path (valid API key → SSE stream) was not exercised. In a live environment where the frontier route streams tokens over multiple seconds, 15s may be insufficient. **Recommendation**: Tech Lead may wish to extend to 30s proactively to align with adaptation spec and guard against live-path latency.

2. **pnpm test count delta**: `pnpm test` shows 162 passed (vs CR-019 baseline 158). Difference of +4 is attributable to new unit/component tests added by Frontend/Backend agents in this CR's scope. Not a regression.

---

## Definition of Done Check

- [x] `transformer.spec.ts` timeout evaluated — 15s adequate in fallback mode; retained. Risk documented.
- [x] `adaptation.spec.ts` created: static contracts test + submit cycle test for `full-finetuning`
- [x] All `data-testid` contracts verified visible on adaptation page (source-verified + E2E PASS)
- [x] `pnpm test:e2e` passes — 30/30, no new failures
- [x] `pnpm test` (unit + integration) passes — 162 passed
- [x] `pnpm lint` passes
- [x] `pnpm exec tsc --noEmit` passes

---

## Ready for Next Agent
- `yes`

## New Artifacts
- `__tests__/e2e/adaptation.spec.ts` (created)

## Follow-up Recommendations
- Tech Lead: consider extending `frontierSubmit.toBeEnabled({ timeout: 15000 })` to `{ timeout: 30000 }` in transformer.spec.ts:63 to guard against live streaming latency in environments with a valid API key. Minor, safe change — actionable at Tech Lead discretion.
- Tech Lead: OTel collector ECONNREFUSED (port 4318) is pre-existing environmental — no action required for this CR.
