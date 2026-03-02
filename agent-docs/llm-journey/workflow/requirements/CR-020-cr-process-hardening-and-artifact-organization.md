# CR-020: CR Process Hardening and Artifact Organization

## Status
`Done`

## Business Value

This CR reduces coordination overhead and merge friction by standardizing handoff structure and conversation-file organization while preserving historical traceability.

Human User intent: proceed with the accepted meta-analysis outcomes from CR-019 (items 1, 2, 3, 5), evaluate CR-artifact foldering for item 4, and explicitly defer branch-strategy policy decisions for now.

Product End User audience: engineers learning through all LLM Journey stages (indirectly impacted through faster, safer delivery cycles and clearer verification flow).
Developer-contributor audience: engineers actively building and maintaining the application (directly impacted via lower coordination overhead, clearer handoffs, and reduced context-switch cost).

Expected outcome for Product End User: fewer coordination-induced regressions and more reliable feature delivery cadence, without changing learner-facing routes or page behavior.
Expected outcome for developer contributors: faster CR execution, cleaner ownership boundaries, and lower merge/review friction across concurrent work.

## Scope

1. Apply agreed immediate process hardening from CR-019:
   - execution-checklist section in handoff templates,
   - gap-items/known-risks section in TL session-state template,
   - exact-path references in handoffs,
   - CR-scoped naming for ephemeral conversation files.
2. Preserve freshness checks and improve efficiency with prefilled preflight/freshness stubs where useful.
3. Define retention posture explicitly: historical CR artifacts are retained (archive/index approach allowed; deletion not allowed by this CR).
4. Evaluate CR-artifact foldering feasibility with a recommendation artifact that compares options and compatibility impact.
5. Keep branch strategy policy decision deferred in this CR (document deferment; no policy change).

## Acceptance Criteria

- [x] **AC-1 (Execution checklist standard):** Backend/Testing/Tech Lead handoff templates include a concise execution-checklist section. — Verified: [TEMPLATE-tech-lead-to-backend.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/TEMPLATE-tech-lead-to-backend.md:58), [TEMPLATE-tech-lead-to-testing.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/TEMPLATE-tech-lead-to-testing.md:78), [TL-session-state.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/coordination/TL-session-state.md:35).
- [x] **AC-2 (Gap-items standard):** TL session-state template includes an explicit `gap items / known risks` section used for adversarial review focus. — Verified: [TL-session-state.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/coordination/TL-session-state.md:65).
- [x] **AC-3 (Exact-path standard):** Handoff templates require exact-path references to active CR artifacts (minimum: requirement, plan, and latest relevant report/conversation artifact). — Verified: [TEMPLATE-tech-lead-to-backend.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/TEMPLATE-tech-lead-to-backend.md:9), [TEMPLATE-tech-lead-to-testing.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/TEMPLATE-tech-lead-to-testing.md:9), [TEMPLATE-tech-lead-to-frontend.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/TEMPLATE-tech-lead-to-frontend.md:9), [TEMPLATE-tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/TEMPLATE-tech-lead-to-ba.md:9), [TL-session-state.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/coordination/TL-session-state.md:16).
- [x] **AC-4 (CR-scoped conversation naming):** Workflow/conversation-template guidance documents CR-scoped naming for ephemeral coordination files and preserves freshness-rule behavior. — Verified: [workflow.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/workflow.md:70), [workflow.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/workflow.md:74).
- [x] **AC-5 (Freshness efficiency):** Prefilled freshness/preflight stub guidance is present without weakening the mandatory freshness gate. — Verified: [workflow.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/workflow.md:77), [workflow.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/workflow.md:86), [TL-session-state.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/coordination/TL-session-state.md:26).
- [x] **AC-6 (Retention policy alignment):** Documentation explicitly states closed CR artifacts are retained (with archive/index strategy if needed), not deleted. — Verified: [workflow.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/workflow.md:247).
- [x] **AC-7 (Foldering feasibility output):** A documented feasibility analysis exists for CR-artifact foldering, including at least two options, migration/compatibility impact, and recommendation. — Verified: [CR-020-foldering-feasibility.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/plans/CR-020-foldering-feasibility.md:32), [CR-020-foldering-feasibility.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/plans/CR-020-foldering-feasibility.md:59), [CR-020-foldering-feasibility.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/plans/CR-020-foldering-feasibility.md:95), [CR-020-foldering-feasibility.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/plans/CR-020-foldering-feasibility.md:127), [CR-020-foldering-feasibility.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/plans/CR-020-foldering-feasibility.md:158).
- [x] **AC-8 (Git strategy deferment):** One-branch-per-CR policy decision remains deferred and is explicitly recorded as a pending Human User decision. — Verified: [workflow.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/workflow.md:127), [project-log.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/project-log.md:52).
- [x] **AC-9 (Verification gates for touched docs/process artifacts):** Required verification commands for this CR’s touched artifacts are executed and reported per role policy. — Verified: [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:120), [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:125), [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:130), [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:135), [tech-lead-to-ba.md](/home/kartik/Metamorphosis/LLM_Journey/agent-docs/conversations/tech-lead-to-ba.md:140).

## Verification Mapping

- AC-1 to AC-5: template/workflow/session-state file evidence with line references.
- AC-6: policy language evidence in workflow/project-log/related process docs.
- AC-7: feasibility artifact presence and completeness (options + impact + recommendation).
- AC-8: explicit deferred-decision evidence in current process log/artifact.
- AC-9: verification command evidence in `tech-lead-to-ba.md`.

## Baseline Failure Snapshot (Required for Regression/Incident CRs)

- **Date**: `2026-02-25`
- **Command(s)**: `N/A`
- **Execution Mode**: `N/A`
- **Observed Result**: Process-improvement CR; not incident-driven.

## Post-Fix Validation Snapshot (Filled at Closure)

- **Date**: `2026-02-26`
- **Command(s)**: `pnpm test`; `pnpm lint`; `pnpm exec tsc --noEmit`; `pnpm build`
- **Execution Mode**: `local-equivalent/unsandboxed`
- **Observed Result**: All gates passed under Node `v20.20.0`; pre-existing OTel build warning only.

## Constraints

- Do not delete historical CR artifacts as part of this CR.
- Do not introduce one-branch-per-CR as policy in this CR; keep explicitly deferred.
- Preserve role boundaries and freshness-rule invariants.
- Preserve traceability invariant across `requirements/`, `plans/`, `conversations/`, and `project-log`.
- If a proposed foldering model breaks current canonical-path assumptions, document and defer rather than forcing migration in this CR.

## Risks & Assumptions

| Item | Type | Notes |
|---|---|---|
| Over-broad process edits can create policy drift | Risk | Keep scope limited to accepted items + feasibility analysis |
| CR-scoped naming may require transition guidance for active files | Risk | Must include compatibility notes |
| Foldering proposal could conflict with existing tool/path expectations | Risk | Feasibility output must include migration impact |
| User wants git strategy deferred | Assumption | No branch-policy change is part of CR-020 |

## Execution Mode

`Standard` (`[M][DOC]`): multi-artifact process-doc and template alignment with one feasibility analysis output.

## Notes

- User decisions applied from CR-019 meta synthesis:
  1. Agree
  2. Agree
  3. Agree
  4. Investigate CR-artifact foldering; wait on git strategy decision
  5. Agree
- Human User explicitly deferred final foldering option decision during closure; feasibility output retained for later decision.
- Keep-in-mind review completed during acceptance; active warning (`Diagnostic Fallback UIs`) is unrelated to CR-020 scope and remains open.

## Technical Analysis (filled by Tech Lead — required for M/L/H complexity; optional for [S])
**Complexity:** `Medium`
**Estimated Effort:** `M`
**Affected Systems:** `agent-docs/workflow.md`, `agent-docs/coordination/TL-session-state.md`, `agent-docs/conversations/TEMPLATE-tech-lead-to-backend.md`, `agent-docs/conversations/TEMPLATE-tech-lead-to-testing.md`, `agent-docs/conversations/TEMPLATE-tech-lead-to-frontend.md`, `agent-docs/conversations/TEMPLATE-tech-lead-to-ba.md`, `agent-docs/plans/CR-020-foldering-feasibility.md`.
**Implementation Approach:** Additive process-doc and template hardening aligned to approved CR-019 meta outcomes; produce a non-invasive foldering feasibility study and keep branch strategy as an explicit deferred policy decision.

## Deviations Accepted (filled at closure by BA)
- None — no implementation deviations against CR-020 acceptance intent.
- Tech Lead recommendations reviewed: Option D index-file follow-up and optional frontend-checklist parity are accepted as backlog candidates and tracked in `project-log.md` Next Priorities.
