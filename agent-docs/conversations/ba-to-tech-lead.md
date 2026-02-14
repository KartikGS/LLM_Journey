# Tech Lead Prompt: Plan and Execute CR-010

## Subject
CR-010 - E2E Baseline Stabilization (startup blocker classification + route assertion alignment)

## Context
User reported failing E2E tests. BA investigation confirms:
- Local full-suite run executes and currently fails at `6/18`:
  - Landing page spec fails across browsers on stale selector contract (`div.grid > a` count).
  - Transformer spec fails across browsers on brittle `"Generating..."` visibility expectation.
- OTEL proxy shows upstream `ECONNREFUSED 127.0.0.1:4318` during run; treat this under failure-boundary expectations unless CR explicitly requires collector availability.

Artifacts:
- Requirement: `agent-docs/requirements/CR-010-e2e-baseline-stabilization.md`
- Investigation: `agent-docs/reports/INVESTIGATION-CR-010-e2e-failures.md`

## Goal
Execute CR-010 to restore reliable E2E baseline by:
1. Aligning stale landing-page route/selector assertions with canonical app contract.
2. Stabilizing transformer E2E assertions to use reliable behavioral checks.
3. Running full + targeted E2E verification with explicit pass/fail evidence.

## Scope Source of Truth
- `agent-docs/requirements/CR-010-e2e-baseline-stabilization.md`

## Key Directives
1. Create `agent-docs/plans/CR-010-plan.md` before implementation/delegation.
2. Treat this as a testing-contract stabilization task (no unrelated feature expansion).
3. Ensure workflow invariant compliance for selector/route updates.
4. Include explicit command evidence for:
   - `pnpm test:e2e`
   - `pnpm test:e2e -- __tests__/e2e/landing-page.spec.ts`
   - `pnpm test:e2e -- __tests__/e2e/navigation.spec.ts`
   - `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts`
5. Document handling rationale for OTEL upstream refusal in E2E context, aligned with architecture failure-boundary intent.

## Hand-off
Please assume **Tech Lead** role and run the standard planning + delegation flow for CR-010.
