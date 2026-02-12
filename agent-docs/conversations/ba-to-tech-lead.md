# Tech Lead Prompt: Execute CR-007

## Context
The repository is currently unstable after the latest CR: quality gates are broken (`test` and `build`), while `lint` is green. This blocks safe iteration and release confidence.

## Goal
Execute `agent-docs/requirements/CR-007-pipeline-stabilization.md` and restore a fully green local pipeline:
- `pnpm test`
- `pnpm lint`
- `pnpm build`

## Discovery Evidence (BA)
- Investigation report: `agent-docs/reports/INVESTIGATION-CR-007-pipeline-regression.md`
- Current hard failures:
  - stale import in `__tests__/components/BaseLLMChat.test.tsx`
  - TypeScript/framer-motion variant typing failure in `app/ui/navbar.tsx`

## Key Directives
1. Read CR-007 and produce `agent-docs/plans/CR-007-plan.md` before implementation.
2. Prioritize minimal, reversible fixes that restore baseline stability.
3. Preserve architecture/security invariants; do not weaken TypeScript or lint settings.
4. If temporary workaround is required, report as deviation with rollback path.
5. Include verification evidence for all four checks:
   - `pnpm test`
   - `pnpm lint`
   - `pnpm build`
   - `pnpm exec tsc --noEmit`

## Hand-off
Please assume the role of **Tech Lead** and execute this CR via the standard planning and delegation workflow.
