# Handoff: Tech Lead -> Frontend Agent

## Subject
`CR-011 - Server-First Rendering Boundary Refactor for UI Pages`

## Status
`issued`

## Objective
Refactor rendering boundaries so `/`, `/foundations/transformers`, and `/models/adaptation` are server-first page compositions, while preserving all required interactive behavior through targeted client islands only.

## Rationale (Why)
CR-011 corrects architectural drift from broad page-level client rendering. The project invariant requires content-heavy pages to remain Server Components, with Client Components reserved for user-input/stateful interaction surfaces. This reduces unnecessary client surface area without changing learning flow or visual quality.

## Constraints
- UI/UX constraints:
  - Preserve current visual quality (glassmorphism, gradients, hierarchy, spacing).
  - No redesign or content rewrite; this is a rendering-boundary refactor only.
  - Preserve current responsive behavior across mobile and desktop.
- Semantic/testability constraints:
  - Preserve existing route contracts: `/`, `/foundations/transformers`, `/models/adaptation`.
  - Preserve existing `data-testid` contracts already used by tests (including adaptation selectors and continuity links).
  - Keep continuity link href contracts unchanged.
- Ownership constraints:
  - Frontend-owned files in `app/` and UI components are in scope.
  - Do not modify tests in this handoff unless Tech Lead explicitly issues a Testing handoff.
  - No package installation.

## Design Intent (Mandatory for UI)
- Target aesthetic:
  - Keep existing premium look and feel unchanged to users.
- Animation budget:
  - Keep meaningful interaction animation where state/input exists.
  - For non-interactive presentational blocks, use server-compatible styling patterns and avoid forcing page-level client rendering.
- Explicit anti-patterns:
  - Do not keep `'use client'` at page level solely for decorative animation.
  - Do not convert non-interactive presentational components to client without direct state/input need.

## Assumptions To Validate (Mandatory)
- `BaseLLMChat` remains a client component and can be embedded in a server-rendered transformers page.
- Adaptation strategy selector behavior can be isolated into a client island while parent page remains server-rendered.
- `app/ui/navbar.tsx` remains client-rendered by user decision (2026-02-14).
- Shared presentational components can be refactored to avoid forcing client boundaries.

## Out-of-Scope But Must Be Flagged (Mandatory)
- Any route rename or navigation information architecture change.
- New feature additions beyond rendering-boundary extraction.
- Security/telemetry/middleware behavior changes.

## Scope
### Files to Modify
- `app/page.tsx`: Remove page-level `'use client'`; keep server-first composition.
- `app/foundations/transformers/page.tsx`: Remove page-level `'use client'`; preserve chat interactivity via client module usage.
- `app/models/adaptation/page.tsx`: Remove page-level `'use client'`; extract stateful selector/interaction into client island component(s).
- `app/ui/components/GlassCard.tsx`: Refactor so presentational usage does not force client rendering.
- `app/ui/components/JourneyStageHeader.tsx`: Refactor to server-compatible presentational component.
- `app/ui/components/JourneyContinuityLinks.tsx`: Refactor to server-compatible presentational component while preserving link contracts.
- `app/models/adaptation/components/*` (new files allowed): Client island extraction for strategy selector/interactive region, if needed.

## Definition of Done
- [ ] `app/page.tsx` no longer has page-level `'use client'`.
- [ ] `app/foundations/transformers/page.tsx` no longer has page-level `'use client'`.
- [ ] `app/models/adaptation/page.tsx` no longer has page-level `'use client'`.
- [ ] Interactive behavior remains functional for:
  - chat input/generation controls (transformers),
  - adaptation strategy selector interaction,
  - mobile nav behavior (unchanged via existing navbar client component).
- [ ] Shared presentational components no longer force client rendering unless directly handling input/state.
- [ ] Existing route and selector contracts remain stable; if changed, mark `scope extension requested`.
- [ ] `pnpm exec tsc --noEmit` passes.
- [ ] `pnpm lint` passes.

## Clarification Loop (Mandatory)
- Post preflight assumptions/risks/questions in `agent-docs/conversations/frontend-to-tech-lead.md` before implementation.
- Wait for Tech Lead response if any open question materially affects implementation validity.

## Verification
- Execute and report:
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
- Manual contract checks (and report evidence lines):
  - `/`, `/foundations/transformers`, `/models/adaptation` render correctly.
  - adaptation selector still updates displayed strategy output.
  - continuity links preserve expected href relationships.
  - no user-visible styling regressions in light/dark mode.

## Scope Extension Control (Mandatory)
- If implementation requires changing route structure, test-id names, or continuity link contracts, mark `scope extension requested` and pause for explicit approval.

## Report Back
Write completion report to `agent-docs/conversations/frontend-to-tech-lead.md` with:
- status (`complete` or `blocked`)
- changes made (file list)
- verification results
- failure classification for any issue (`CR-related`, `pre-existing`, `environmental`, `non-blocking warning`)
- readiness for next agent.
