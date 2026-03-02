# CR-019: Generation Config Centralization with Parallel Meta Observations

## Status
`Done`

## Business Value

Centralizing non-secret generation settings in a versioned config reduces environment sprawl, lowers setup errors, and makes behavior easier to reason about across dev/test/prod while preserving secret isolation for credentials.

Human User intent: keep only `FRONTIER_API_KEY` in env for generation, move other generation settings (for example `FRONTIER_API_URL`, `FRONTIER_MODEL_ID`) to config, and run simultaneous meta analysis during this CR.

Product End User audience: engineers learning from Stage 1 (`/foundations/transformers`) and Stage 2 (`/models/adaptation`) generation interactions.

Expected outcome for Product End User: no route or UX contract change; interactions remain stable while backend configuration becomes more predictable and maintainable.

## Scope

1. Move non-secret generation runtime settings from env-driven resolution to a versioned config source for generation APIs.
2. Keep `FRONTIER_API_KEY` as the only env-based generation secret.
3. Preserve existing generation route contracts and learner-facing behavior.
4. Update technical docs and env contract docs to reflect the new configuration model.
5. Capture parallel meta-analysis findings for the five user-specified pointers during normal CR execution.

## Acceptance Criteria

- [x] **AC-1 (Config centralization):** Generation routes resolve non-secret runtime settings from a versioned config source instead of env variables. — Verified: [generation.ts](/home/kartik/Metamorphosis/LLM_Journey/lib/config/generation.ts:14), [generation.ts](/home/kartik/Metamorphosis/LLM_Journey/lib/config/generation.ts:21), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/frontier/base-generate/route.ts:92), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:91).
- [x] **AC-2 (Secret isolation):** `FRONTIER_API_KEY` remains env-only for generation authentication and is not moved into committed config. — Verified: [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/frontier/base-generate/route.ts:88), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:86), `rg -n "process\\.env\\.FRONTIER_API_KEY" app lib --glob '!**/*.test.ts' --glob '!**/__tests__/**'` (only the two route matches).
- [x] **AC-3 (Hard-switch behavior):** Legacy env-variable fallback for moved non-secret generation settings is removed; behavior is determined by config + secret key only. — Verified: `sh -lc "rg -n 'process\\.env\\.(FRONTIER_API_URL|FRONTIER_MODEL_ID|FRONTIER_PROVIDER|FRONTIER_TIMEOUT_MS|ADAPTATION_API_URL|ADAPTATION_FULL_FINETUNE_MODEL_ID|ADAPTATION_LORA_MODEL_ID|ADAPTATION_PROMPT_PREFIX_MODEL_ID|ADAPTATION_OUTPUT_MAX_CHARS)' app lib --glob '!**/*.test.ts' --glob '!**/__tests__/**' | wc -l"` => `0`, [shared.ts](/home/kartik/Metamorphosis/LLM_Journey/lib/server/generation/shared.ts:6), [.env.example](/home/kartik/Metamorphosis/LLM_Journey/.env.example:13).
- [x] **AC-4 (Contract stability):** No route-path, request/response envelope, `data-testid`, or accessibility-semantic contract changes. — Verified: [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/frontier/base-generate/route.ts:19), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:18), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/frontier/base-generate/route.ts:44), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:51), [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:31).
- [x] **AC-5 (Docs parity):** API docs and env docs clearly reflect the new source of truth (config vs env), including migration notes for previously env-based generation settings. — Verified: [frontier-base-generate.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/api/frontier-base-generate.md:96), [frontier-base-generate.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/api/frontier-base-generate.md:115), [adaptation-generate.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/api/adaptation-generate.md:93), [adaptation-generate.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/api/adaptation-generate.md:111), [.env.example](/home/kartik/Metamorphosis/LLM_Journey/.env.example:17).
- [x] **AC-6 (Verification gates):** `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build` pass under compliant runtime (or are classified per runtime policy with explicit evidence). — Verified: `node -v` => `v18.19.0` (pre-existing mismatch already tracked in [project-log.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/project-log.md:52), proceed-and-classify exception applied per tooling standard), `pnpm test` => PASS (158/158), `pnpm lint` => PASS, `pnpm build` => PASS, `pnpm exec tsc --noEmit` => initial pre-build miss on `.next/types` then PASS after build rerun (exit 0).
- [x] **AC-7 (Parallel meta observations):** Tech Lead and each executing sub-agent report CR-scoped findings on all five user pointers with evidence and at least one actionable recommendation each. — Verified: [backend-to-tech-lead.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/backend-to-tech-lead.md:104), [testing-to-tech-lead.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/testing-to-tech-lead.md:75), [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:125).
- [x] **AC-8 (Meta synthesis):** Tech Lead handoff to BA includes a consolidated synthesis of pointer findings plus proposed follow-up items (immediate vs backlog vs policy-candidate). — Verified: [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:125), [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:187).

## Verification Mapping

- AC-1 to AC-3: route/config-source evidence + targeted tests for config resolution and fallback behavior.
- AC-4: contract-stability evidence from route files and UI/test selector audit.
- AC-5: updated docs evidence (`agent-docs/api/*`, env documentation artifacts).
- AC-6: command outputs for quality gates and runtime preflight classification.
- AC-7 to AC-8: explicit "Meta Observations (CR-019)" sections in role handoffs/reports and consolidated TL synthesis in `tech-lead-to-ba.md`.

## Baseline Failure Snapshot (Required for Regression/Incident CRs)

- **Date**: `2026-02-25`
- **Command(s)**: `N/A`
- **Execution Mode**: `N/A`
- **Observed Result**: Enhancement/config-governance CR, not incident-driven.

## Post-Fix Validation Snapshot (Filled at Closure)

- **Date**: `2026-02-25`
- **Command(s)**: `node -v`; `pnpm test`; `pnpm lint`; `pnpm exec tsc --noEmit`; `pnpm build`; `pnpm exec tsc --noEmit` (post-build rerun)
- **Execution Mode**: `sandboxed`
- **Observed Result**: Runtime preflight reports `v18.19.0` (below `>=20.x`, pre-existing and tracked). `pnpm test` PASS (17 suites, 158 tests), `pnpm lint` PASS, `pnpm build` PASS with pre-existing OTel warning, initial `pnpm exec tsc --noEmit` failed before `.next/types` generation then passed after build rerun (exit 0).

## Environment Variable Changes

- `FRONTIER_API_KEY` — `retain`: required secret env variable for generation authentication.
- `FRONTIER_API_URL` — `remove from env contract`: move to versioned generation config.
- `FRONTIER_MODEL_ID` — `remove from env contract`: move to versioned generation config.
- `FRONTIER_PROVIDER` — `remove from env contract`: move to versioned generation config.
- `FRONTIER_TIMEOUT_MS` — `remove from env contract`: move to versioned generation config.
- `ADAPTATION_API_URL` — `remove from env contract`: move to versioned generation config.
- `ADAPTATION_FULL_FINETUNE_MODEL_ID` — `remove from env contract`: move to versioned generation config.
- `ADAPTATION_LORA_MODEL_ID` — `remove from env contract`: move to versioned generation config.
- `ADAPTATION_PROMPT_PREFIX_MODEL_ID` — `remove from env contract`: move to versioned generation config.
- `ADAPTATION_OUTPUT_MAX_CHARS` — `remove from env contract`: move to versioned generation config.

## Constraints

- Preserve route contracts and learner-facing behavior for `/api/frontier/base-generate` and `/api/adaptation/generate`.
- Preserve security containment invariants: no secret leakage in responses/logs/spans.
- Do not introduce new process policy automatically from this CR's meta findings; recommendations require Tech Lead verification or explicit Human User approval per workflow.
- No dependency installation unless explicitly approved via scope extension.
- If implementation reveals unavoidable contract changes, pause and escalate with a scope-extension decision.

## Risks & Assumptions

| Item | Type | Notes |
|---|---|---|
| Hard switch may break local setups relying on old env vars | Risk | Requires migration clarity and explicit docs |
| Config drift across environments | Risk | Needs clear source-of-truth ownership |
| Meta-analysis breadth may increase delivery overhead | Risk | Keep findings evidence-based and scoped to 5 pointers |
| User prefers no compatibility window unless stated | Assumption | This CR assumes hard-switch behavior |

## Execution Mode

`Standard` (`[M]`): backend/config + testing + docs + coordinated meta observation capture.

## Notes

- User-provided simultaneous meta-analysis pointers to be answered in CR execution:
  1. Confusion from historical-artifact vs procedure misalignment, and mitigation model.
  2. Freshness-rule efficiency opportunities for conversation files after CR closure.
  3. Long-term retention/deletion policy for old CR artifacts.
  4. Parallel CR execution across branches (including CR number collision and ideal git flow).
  5. Agent workload limits and load-management strategy.
- Keep-in-mind review completed during acceptance: active warning (`Diagnostic Fallback UIs`) is unrelated to CR-019 scope and remains open.

## Technical Analysis (filled by Tech Lead — required for M/L/H complexity; optional for [S])
**Complexity:** `Medium`
**Estimated Effort:** `M`
**Affected Systems:** `app/api/frontier/base-generate/route.ts`, `app/api/adaptation/generate/route.ts`, `lib/config/generation.ts`, `lib/server/generation/shared.ts`, API docs, `.env.example`, targeted API tests.
**Implementation Approach:** Introduce a versioned config source for all non-secret generation settings, retain env-only secret auth key, update route loaders to config-first resolution, align docs/tests, and capture CR-scoped meta observations in all role reports with Tech Lead synthesis.

## Deviations Accepted (filled at closure by BA)
- Minor — `invalid_config` remains in `FallbackReasonCode`/route fallback branches as unreachable dead code while docs removed that reason code; accepted because runtime contract behavior is unchanged and no AC intent/route/API/test-id/accessibility contract was altered. Follow-up recommended as housekeeping CR.
- Minor — TL recommendation to apply immediate process improvements (execution checklist, gap-items section, CR-scoped conversation naming, exact-path handoff section) is accepted as post-CR follow-up and tracked in `project-log.md` Next Priorities.
