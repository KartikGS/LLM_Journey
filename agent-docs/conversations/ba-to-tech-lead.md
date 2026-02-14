# Tech Lead Prompt: Plan and Execute CR-011

## Subject
CR-011 - Server-First Rendering Boundary for UI Pages

## Context
User requested rollback of broad page-level client rendering introduced for `framer-motion`.

Current signal:
- Route pages currently marked as client:
  - `app/page.tsx`
  - `app/foundations/transformers/page.tsx`
  - `app/models/adaptation/page.tsx`
- Shared UI components that currently force client rendering:
  - `app/ui/components/GlassCard.tsx`
  - `app/ui/components/JourneyStageHeader.tsx`
  - `app/ui/components/JourneyContinuityLinks.tsx`
- Interactive modules that should remain client-oriented by design:
  - `app/foundations/transformers/components/BaseLLMChat.tsx`
  - strategy selector behavior on adaptation page
  - mobile navbar open/close and active-state interaction in `app/ui/navbar.tsx`
- User decisions (2026-02-14):
  - Keep `app/ui/navbar.tsx` as a client component.
  - Preserve styling/visual quality; do not convert server-rendered sections to client solely for styling or decorative animation.

Artifact:
- Requirement: `agent-docs/requirements/CR-011-server-first-rendering-boundary.md`

## Goal
Execute CR-011 by shifting to server-first composition for content-heavy pages while preserving client interactivity strictly where user input/state is required.

## Scope Source of Truth
- `agent-docs/requirements/CR-011-server-first-rendering-boundary.md`

## Key Directives
1. Create `agent-docs/plans/CR-011-plan.md` before implementation/delegation.
2. Preserve architecture rendering invariant:
   - Prefer Server Components for SEO/content-heavy pages.
   - Keep Client Components only for interaction/state surfaces.
3. Treat this as a rendering-boundary refactor:
   - Do not expand into unrelated redesign.
   - Preserve existing visual system (glass/gradient/styling language) using server-compatible patterns where possible.
4. Validate with explicit command evidence:
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
5. If route structure or `data-testid` contracts are altered, include Testing handoff and same-CR E2E updates per workflow invariant.

## Hand-off
Please assume **Tech Lead** role and run the standard planning + delegation flow for CR-011.
