# Technical Plan - CR-011: Server-First Rendering Boundary for UI Pages

## Technical Analysis
- Current state uses page-level `'use client'` on:
  - `app/page.tsx`
  - `app/foundations/transformers/page.tsx`
  - `app/models/adaptation/page.tsx`
- Shared presentational components also force client boundaries:
  - `app/ui/components/GlassCard.tsx`
  - `app/ui/components/JourneyStageHeader.tsx`
  - `app/ui/components/JourneyContinuityLinks.tsx`
- Key challenge is preserving existing visuals and interaction behavior while moving static/presentational composition back to Server Components.
- Complexity: **Medium**
- Estimated effort: **M**

## Discovery Findings
- Rendering probes confirmed all three target pages and three shared UI components currently include `'use client'`.
- Interactive-only surfaces identified and intentionally retained as client:
  - `app/foundations/transformers/components/BaseLLMChat.tsx`
  - adaptation strategy selector behavior in `app/models/adaptation/page.tsx` (to be extracted into a client island)
  - `app/ui/navbar.tsx` (user-confirmed to remain client)
- E2E contract probes confirmed active selectors/routes currently used by suite:
  - `/foundations/transformers`, `/models/adaptation`
  - `data-testid="adaptation-page"`
  - `data-testid="adaptation-strategy-selector"`
  - continuity link href assertions between adaptation and transformers routes
- Resolved wildcards:
  - No new libraries required; use existing stack (`Next.js 15 App Router`, `framer-motion`, Tailwind, existing UI components).
- Validated assumptions:
  - Route URIs remain unchanged.
  - Existing test-id/href contracts can be preserved during refactor.

## Configuration Specifications
- No root/project configuration changes are planned in this CR.
- No CSP/middleware/telemetry/security configuration changes are planned.

## Critical Assumptions
- Home, Transformers, and Adaptation pages can render as Server Components with isolated client islands for interactive sections only.
- Styling quality is preserved via server-compatible class styling and selective client wrappers, not page-level client conversion.
- `app/ui/navbar.tsx` remains client-rendered by explicit user decision (2026-02-14).
- Existing route/test-id contracts remain stable; if any contract delta emerges, Testing handoff is mandatory before CR closure.

## Proposed Changes
- Frontend agent refactor scope:
  - Convert `app/page.tsx` to server-first composition (remove page-level `'use client'`).
  - Convert `app/foundations/transformers/page.tsx` to server-first composition while preserving `BaseLLMChat` as client module.
  - Convert `app/models/adaptation/page.tsx` to server-first composition by extracting strategy selector/stateful interaction into a dedicated client island component.
  - Refactor presentational components to stop forcing client boundaries:
    - `app/ui/components/GlassCard.tsx`
    - `app/ui/components/JourneyStageHeader.tsx`
    - `app/ui/components/JourneyContinuityLinks.tsx`
  - Preserve existing route flow, educational content, continuity links, and visual hierarchy.
- Testing impact:
  - No planned route/test-id contract change.
  - If any selector/contract changes become necessary during implementation, add same-CR Testing handoff and matching E2E updates.

## Architectural Invariants Check
- [x] **Component Rendering Strategy**: SEO/content-heavy pages use Server Components; client rendering limited to interactive/stateful surfaces.
- [x] **Observability Safety**: No changes to telemetry boundaries or failure behavior.
- [x] **Security Boundaries**: No CSP/token/middleware behavior changes.
- [x] **E2E Selector Invariant**: Existing route and selector contracts preserved unless explicitly updated with paired tests.

## Delegation & Execution Order
| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | Frontend | Implement server-first boundary refactor across target pages and shared presentational components while preserving UX contracts. |
| 2 | Tech Lead | Perform adversarial diff review and run verification gates: `pnpm lint`, `pnpm test`, `pnpm build`. |
| 3 | Tech Lead | If contracts changed, issue Testing handoff for same-CR E2E updates before closure. |

## Delegation Graph (MANDATORY)
- **Execution Mode**: Sequential
- **Dependency Map**:
  - Step 2 depends on Step 1 output: **yes**
  - Required evidence: frontend completion report + modified-file diff consistency against CR-011 AC.
  - Step 3 depends on detected contract delta from Step 1/2: **conditional yes**
- **Parallel Groups**:
  - None (work is dependency-driven).
- **Handoff Batch Plan**:
  - Sequential first handoff: `agent-docs/conversations/tech-lead-to-frontend.md`
  - Conditional follow-up handoff (only on contract delta): `agent-docs/conversations/tech-lead-to-testing.md`
- **Final Verification Owner**:
  - Tech Lead (integration review + required quality gates)

## Operational Checklist
- [x] **Environment**: No hardcoded environment changes introduced.
- [x] **Observability**: Existing boundaries untouched.
- [ ] **Artifacts**: `.gitignore` updates not expected; verify no new generated artifacts are tracked.
- [x] **Rollback**: Revert CR-011 rendering-boundary commits to restore prior page-level client directives.

## Definition of Done (Technical)
- [ ] `app/page.tsx` is server-first (no page-level `'use client'`) with behavior/visual parity.
- [ ] `app/foundations/transformers/page.tsx` is server-first; chat interaction remains functional via client island.
- [ ] `app/models/adaptation/page.tsx` is server-first; strategy selector interaction remains functional via client island.
- [ ] Shared presentational components no longer force client rendering unless directly handling user input/state.
- [ ] `pnpm lint` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` passes.
- [ ] If route/selector/test-id contracts changed, same-CR E2E updates are completed and evidenced.
