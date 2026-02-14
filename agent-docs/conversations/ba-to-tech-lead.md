# Tech Lead Prompt: Plan and Execute CR-009

## Context
User requested we start building the **Model Adaptation** page in the roadmap.  
BA created `agent-docs/requirements/CR-009-model-adaptation-page.md` as the scoped requirement artifact for Stage 2 (`/models/adaptation`).

## Goal
Execute CR-009 by delivering a complete, non-placeholder page for `/models/adaptation` with:
- roadmap-consistent educational narrative,
- premium visual consistency with existing pages,
- one lightweight interactive learning element,
- quality-gate and verification evidence.

## Scope Source of Truth
- Requirement: `agent-docs/requirements/CR-009-model-adaptation-page.md`
- Vision alignment: `agent-docs/project-vision.md` (Stage 2 definition)

## Key Directives
1. Read CR-009 and create `agent-docs/plans/CR-009-plan.md` before implementation.
2. Enforce route and selector integrity: if structure/test selectors change, include Testing Agent updates per workflow invariants.
3. Keep scope controlled: baseline educational + lightweight interaction only. User has explicitly confirmed this scope on 2026-02-14.
4. Preserve architecture/security invariants and avoid introducing external dependencies without explicit approval.
5. Provide verification evidence for:
   - route render behavior (`/models/adaptation`)
   - required UI sections and interaction behavior
   - `pnpm lint`, `pnpm test`, `pnpm build`

## Hand-off
Please assume the role of **Tech Lead** and run the standard planning + delegation workflow for CR-009.
