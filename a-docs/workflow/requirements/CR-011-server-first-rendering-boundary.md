# CR-011: Server-First Rendering Boundary for UI Pages

## Status
Done

## Business Context
**User Need:** Reduce unnecessary client-side rendering caused by broad `framer-motion` usage so pages remain mostly server-rendered, while preserving interactivity where users provide input.  
**Expected Value:** Better architectural alignment with Next.js App Router best practices, improved initial rendering posture for content-heavy pages, and reduced client-side complexity without removing critical interactive learning features.

## Clarified Requirement Summary
- Rebalance rendering strategy from "page-level client components" to "server page shell + targeted client islands."
- Keep client-only rendering for components that require user input/stateful interaction.
- Remove client-only dependency from purely presentational components where interaction is not required.
- Preserve current user-facing learning flow and navigation behavior.

## Product Shaping (BA Recommendation)
- Recommendation: Treat this as a rendering-boundary refactor, not a visual redesign.
- Challenge to prior decision: Global adoption of client pages for animation value creates ongoing maintenance and performance trade-offs that now outweigh benefit on static content blocks.
- Proposed direction: Keep animation/styling quality while moving non-input content to server-rendered components; use CSS or server-compatible techniques for presentational effects and reserve client rendering for user-input surfaces (chat input, strategy selector, mobile menu controls).

## Functional Requirements
1. Home, Transformers, and Model Adaptation route pages must be refactored to server-first composition where possible.
2. User-input-driven interactive modules (for example: chat input/generation controls, strategy selector, mobile nav toggle) must remain client components.
3. Purely presentational shared UI components must no longer force client rendering of parent pages.
4. Existing route structure, educational content, and continuity navigation behavior must remain unchanged.
5. Existing styling quality (glassmorphism/gradients/visual hierarchy) must be preserved; styling must not be removed solely to achieve server rendering.

## Non-Functional Requirements
- Performance:
  - Reduce unnecessary client component surface area by removing page-level `'use client'` where interaction is not required.
  - Maintain equivalent or better perceived responsiveness for interactive elements after client-island extraction.
- Security:
  - No changes to CSP, telemetry proxy, or middleware security behavior.
  - Preserve observability failure-boundary invariant (telemetry failures never block UI).
- Accessibility:
  - Keyboard behavior of interactive controls must remain functional after component boundary changes.
  - Respect existing reduced-motion behavior where retained animations remain.

## System Constraints & Invariants
- **Constraint Mapping**:
  - `agent-docs/architecture.md` (Component Rendering Strategy: SEO-critical pages should remain Server Components; client components where interactivity is primary)
  - `agent-docs/workflow.md` (E2E selector invariant when structure/contracts change)
  - `agent-docs/tooling-standard.md` (Next.js 15 App Router + standard quality gates)
  - `agent-docs/project-vision.md` (must preserve educational continuity across stages)
- **Design Intent**: Architectural correction and scope tightening, not feature expansion.

## Acceptance Criteria
- [x] `app/page.tsx` no longer requires page-level `'use client'` and is composed as server-first with client islands only where required. — Verified: `app/page.tsx:1`, `app/page.tsx:30`.
- [x] `app/foundations/transformers/page.tsx` no longer requires page-level `'use client'`; interactive chat experience remains functional. — Verified: `app/foundations/transformers/page.tsx:1`, `app/foundations/transformers/page.tsx:20`.
- [x] `app/models/adaptation/page.tsx` no longer requires page-level `'use client'`; strategy selector interaction remains functional. — Verified: `app/models/adaptation/page.tsx:1`, `app/models/adaptation/page.tsx:41`, `app/models/adaptation/components/AdaptationStrategySelector.tsx:1`.
- [x] Shared presentational components used by these pages (for example `GlassCard`, stage headers, continuity links) are refactored so they do not force client rendering unless they directly handle user input/state. — Verified: `app/ui/components/GlassCard.tsx:1`, `app/ui/components/JourneyStageHeader.tsx:1`, `app/ui/components/JourneyContinuityLinks.tsx:1`.
- [x] Core quality checks pass after refactor: `pnpm lint`, `pnpm test`, `pnpm build`. — Verified: `agent-docs/conversations/tech-lead-to-ba.md:33`, `agent-docs/conversations/tech-lead-to-ba.md:35`, `agent-docs/conversations/tech-lead-to-ba.md:37`, `agent-docs/conversations/tech-lead-to-ba.md:39`, `agent-docs/conversations/tech-lead-to-ba.md:45`, `agent-docs/conversations/tech-lead-to-ba.md:47`.
- [x] If page structure or `data-testid` contracts change, matching E2E updates are included in this same CR. — Verified: `app/models/adaptation/page.tsx:12`, `app/models/adaptation/page.tsx:24`, `app/models/adaptation/components/AdaptationStrategySelector.tsx:44`, `app/ui/components/JourneyContinuityLinks.tsx:22`, `agent-docs/conversations/tech-lead-to-ba.md:30`.

## Verification Mapping
- **Development Proof**:
  - File-level evidence showing removal of unnecessary `'use client'` directives and introduction of isolated client components.
  - Command evidence for `pnpm lint`, `pnpm test`, `pnpm build`.
  - E2E command evidence only if selectors/routes/contracts were altered.
- **AC Evidence Format (for closure)**:
  - ``[x] <AC text> — Verified: <file-or-command>, <result>``
- **User Validation**:
  - Navigate to `/`, `/foundations/transformers`, `/models/adaptation`.
  - Confirm interactive controls still work (chat input, adaptation selector, mobile nav behavior).
  - Confirm no user-visible regressions in continuity links and primary learning content.

## Dependencies
- Blocks: Future performance/SEO-sensitive page work that assumes server-first baseline.
- Blocked by: None.

## Risks, Assumptions, Open Questions
- **Assumption**: Mobile navbar interaction remains intentionally client-rendered.
- **Risk**: Refactor may inadvertently alter animation behavior on non-interactive cards if component contracts are not split cleanly.
- **User Decision (2026-02-14)**: Keep `app/ui/navbar.tsx` as a client component due to interaction density.
- **User Decision (2026-02-14)**: Preserve styling and visual quality; do not force client rendering solely for styling/animation. Prefer server-compatible styling/animation methods for non-input UI.

## Rollback Plan
- Revert rendering-boundary refactor commits for affected pages/components.
- Restore prior client component directives if regression is found.
- No data migration or infra rollback required.

## BA Complexity Assessment
- **Business Complexity:** Medium
- **Execution Mode (BA):** Standard
- **Why:** Cross-route UI architecture correction with moderate regression risk and test contract sensitivity.

## Notes
- This CR intentionally avoids introducing new visual requirements.
- Scope is limited to rendering-boundary correction and preservation of current user-facing behavior.
- Closure validated from Tech Lead verification handoff on `2026-02-14`.

## Technical Analysis (filled by Tech Lead)
**Complexity:** [Low | Medium | High]  
**Estimated Effort:** [S | M | L]  
**Affected Systems:**  
**Implementation Approach:**  

## Deviations Accepted (filled at closure by BA)
- Decorative framer-motion entrance effects were removed from server-rendered page shells while preserving styling via CSS transitions — Accepted (`agent-docs/conversations/tech-lead-to-ba.md:64`).
