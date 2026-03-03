# CR-017: Small Backlog Fixes and Runtime Alignment

## Status
`Done`

## Business Value

This CR bundles five small backlog items into one low-risk cleanup pass so the project can reduce avoidable drift:
- learner-facing copy becomes clearer on the Transformers page,
- adaptation API behavior becomes consistent with existing frontier safeguards,
- known dead code and utility duplication are reduced,
- local runtime expectations become explicit and enforceable.

Human User intent: execute the five `[S]` Next Priorities listed in `project-log.md:48-52`.

Product End User audience: software engineers learning through the LLM Journey stages (especially Stage 1 and Stage 2 pages).

Expected outcome for Product End User: clearer instructional language and no regressions in existing learning flows.

## Scope

1. Add output length capping to `/api/adaptation/generate`, aligned with the existing frontier safety pattern.
2. Reduce duplicated server-side `toRecord()` utility usage in adaptation/frontier API routes.
3. Rename the Transformers comparison-card heading from developer-facing wording to learner-facing wording.
4. Remove unreachable `Array.isArray(payload)` path in `extractProviderOutput()` once validated as unused for supported provider contract.
5. Upgrade repository runtime contract to Node.js 20+ (tooling-standard alignment).

## Acceptance Criteria

- [x] **AC-1 (Adaptation output cap):** Live output returned by `/api/adaptation/generate` is bounded by a configurable cap and cannot exceed the configured maximum length. — Verified: [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:14), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:462), [adaptation-generate.test.ts](/home/kartik/Metamorphosis/LLM_Journey/__tests__/api/adaptation-generate.test.ts:222).
- [x] **AC-2 (Config contract):** The adaptation output cap is represented as an explicit environment contract and documented in `.env.example`. — Verified: [.env.example](/home/kartik/Metamorphosis/LLM_Journey/.env.example:40).
- [x] **AC-3 (`toRecord` cleanup):** Server-side duplication of `toRecord()` between adaptation/frontier API routes is reduced through a shared utility without changing API behavior. — Verified: [record.ts](/home/kartik/Metamorphosis/LLM_Journey/lib/utils/record.ts:8), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:6), [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/frontier/base-generate/route.ts:6), and `pnpm test` pass evidence in [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:69).
- [x] **AC-4 (Heading rename):** The `<h3>` heading currently shown as `"Model Comparison Template"` on the Transformers page is replaced with learner-facing copy. — Verified: [page.tsx](/home/kartik/Metamorphosis/LLM_Journey/app/foundations/transformers/page.tsx:134).
- [x] **AC-5 (Dead code removal):** Unreachable HF-array branch in `extractProviderOutput()` is removed after confirming no supported code path depends on it. — Verified: [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/frontier/base-generate/route.ts:206) now starts with object-path extraction (`const root = toRecord(payload);` at line 207); `rg -n "Array\\.isArray\\(payload\\)" app/api/frontier/base-generate/route.ts __tests__/api/frontier-base-generate.test.ts` returned no matches.
- [x] **AC-6 (Node runtime contract):** Project runtime expectation is machine-readable as Node.js `>=20.x`, and developer activation path is explicit. — Verified: [package.json](/home/kartik/Metamorphosis/LLM_Journey/package.json:5), [.nvmrc](/home/kartik/Metamorphosis/LLM_Journey/.nvmrc:1).
- [x] **AC-7 (Contract stability):** No route-path, `data-testid`, or accessibility semantic contracts are changed by this CR. — Verified: route constants unchanged in [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/adaptation/generate/route.ts:8) and [route.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/frontier/base-generate/route.ts:8); `data-testid="transformers-comparison"` preserved in [page.tsx](/home/kartik/Metamorphosis/LLM_Journey/app/foundations/transformers/page.tsx:128); Tech Lead contract audit in [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:57).
- [x] **AC-8 (Quality gates):** `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build` pass under compliant runtime. — Verified: [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:66), [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:72), [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:78), [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:84).

## Constraints

- Preserve API response schemas for:
  - `/api/adaptation/generate`
  - `/api/frontier/base-generate`
- No visual redesign beyond heading text replacement.
- Do not introduce new dependencies.
- Keep observability/fallback behavior intact (no telemetry-boundary regressions).

## Risks & Assumptions

| Item | Type | Notes |
|---|---|---|
| Runtime mismatch persists on host machine | Risk | Repo can enforce contract, but local machine version switching still requires environment setup. |
| Dead-code branch might still be used by undocumented provider mode | Risk | Must verify via provider contract + test coverage before deletion. |
| Utility extraction can over-expand scope | Scope | Keep cleanup limited to server-side helper reuse in touched API routes. |

## Execution Mode

`Standard` (`[M]`): multiple small artifacts across backend/frontend/tooling, but single-phase and low coupling.

## Verification Mapping

- AC-1/AC-2: route code evidence + env example evidence + unit assertions for capped output behavior.
- AC-3/AC-5: diff + unit tests confirming unchanged response behavior on supported payload shapes.
- AC-4: file-level copy evidence on Transformers page.
- AC-6: runtime contract artifacts + `node -v` proof under activated compliant runtime.
- AC-7: explicit contract-stability statement in Tech Lead handoff.
- AC-8: full command evidence in canonical sequence.

## Baseline Failure Snapshot (Runtime Mismatch)

- **Date**: 2026-02-25
- **Command(s)**: `node -v`
- **Execution Mode**: `sandboxed`
- **Observed Result**: `v18.19.0` (below documented minimum `>=20.x` in `agent-docs/tooling-standard.md`)

## Environment Variable Changes

- `ADAPTATION_OUTPUT_MAX_CHARS` — add: max response characters returned by `/api/adaptation/generate` live mode.

## Dependencies

- Blocks: none
- Blocked by: none

## Notes

- Testing handoff is not mandatory by default because no route/test-id/accessibility contract change is intended. If implementation changes any of those contracts, Testing handoff becomes mandatory per workflow matrix.
- Keep-in-mind review completed: active warning (`Diagnostic Fallback UIs`) is unrelated to this CR and remains open.

## Post-Fix Validation Snapshot

- **Date**: 2026-02-25
- **Command(s)**: `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`
- **Execution Mode**: `local-equivalent/unsandboxed`
- **Observed Result**: PASS (Tech Lead evidence: 134 tests, lint clean, typecheck exit 0, build success under Node v20.20.0).

## Deviations Accepted (filled at closure by BA)

- `Tech Lead Recommendation #1` (client-side `toRecord()` duplication) — Minor; no AC intent/contract change. Accepted as follow-up backlog item.
- `Tech Lead Recommendation #2` (host-level Node v20+ enforcement pending) — Minor environmental residual; CR AC-6 contract delivered (`engines` + `.nvmrc`). Accepted and retained in Next Priorities.
