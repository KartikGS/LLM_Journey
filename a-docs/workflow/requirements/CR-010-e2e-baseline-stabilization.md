# CR-010: E2E Baseline Stabilization

## Status
Done

## Business Context
**User Need:** Restore trustworthy E2E feedback so route-level regressions are detected reliably without false negatives from stale assertions or environment confusion.  
**Expected Value:** Faster debugging cycles, cleaner release confidence, and reduced wasted effort from non-actionable E2E failures.

## Clarified Requirement Summary
- Resolve current E2E failure cluster identified in local runtime execution.
- Align stale landing-page assertions/selectors with the current home-page contract and structure.
- Stabilize Transformer E2E expectation flow so UI-state checks match actual generation lifecycle and observability boundary behavior.
- Establish explicit verification evidence for full suite and targeted specs.

## Functional Requirements
1. E2E test assertions must match current canonical route contracts for Stage 1 navigation (`/foundations/transformers`).
2. Landing-page E2E selectors must target the current DOM structure for stage cards and CTA.
3. Transformer E2E must validate generation behavior without relying on brittle transient UI text assumptions.
4. Team must have one reproducible command path for full E2E and targeted landing/navigation/transformer checks.

## Non-Functional Requirements
- Performance:
  - No additional heavy setup steps that materially slow existing E2E startup beyond current baseline.
- Security:
  - No relaxation of security controls solely to force E2E pass; changes must preserve existing security boundaries.
- Accessibility:
  - Route assertion updates must not remove existing semantic-role based checks.

## System Constraints & Invariants
- **Constraint Mapping**:
  - `agent-docs/workflow.md` (E2E selector invariant + blocker reporting)
  - `agent-docs/tooling-standard.md` (E2E command canon)
  - `agent-docs/technical-context.md` (port `3001` and E2E notes)
- **Design Intent**: Stabilization and contract alignment, not feature expansion.

## Acceptance Criteria
- [x] Landing page E2E route assertion validates the current home CTA destination (`/foundations/transformers`). — Verified: `__tests__/e2e/landing-page.spec.ts:17`, `agent-docs/conversations/tech-lead-to-ba.md:24`, `agent-docs/conversations/tech-lead-to-ba.md:25`.
- [x] Landing page E2E stage-card assertion passes against current page structure (no stale `div.grid > a` dependency). — Verified: `__tests__/e2e/landing-page.spec.ts:19`, `__tests__/e2e/landing-page.spec.ts:20`, `agent-docs/conversations/tech-lead-to-ba.md:27`, `agent-docs/conversations/tech-lead-to-ba.md:28`.
- [x] Transformer E2E generation assertion is updated to a stable behavioral signal and passes across configured browsers. — Verified: `__tests__/e2e/transformer.spec.ts:33`, `__tests__/e2e/transformer.spec.ts:34`, `agent-docs/conversations/tech-lead-to-ba.md:30`, `agent-docs/conversations/tech-lead-to-ba.md:31`.
- [x] E2E validation evidence includes:
  - full suite command result,
  - targeted landing/navigation/transformer spec results. — Verified: `agent-docs/conversations/tech-lead-to-ba.md:34`, `agent-docs/conversations/tech-lead-to-ba.md:35`, `agent-docs/conversations/tech-lead-to-ba.md:36`, `agent-docs/conversations/tech-lead-to-ba.md:37`, `agent-docs/conversations/tech-lead-to-ba.md:38`, `agent-docs/conversations/tech-lead-to-ba.md:39`, `agent-docs/conversations/tech-lead-to-ba.md:40`, `agent-docs/conversations/tech-lead-to-ba.md:41`.

## Verification Mapping
- **Development Proof**:
  - Updated E2E assertion file(s) and command output evidence in Tech Lead completion report.
- **AC Evidence Format (for closure)**:
  - ``[x] <AC text> — Verified: <file-or-command>, <result>``
- **User Validation**:
  - Run `pnpm test:e2e` locally in a runtime that can bind port `3001`.
  - Confirm landing/navigation/transformer specs pass and no stale `/transformer` expectation remains.

## Dependencies
- Blocks: Reliable acceptance on future route/navigation CRs.
- Blocked by: Runtime constraints that prevent local server startup.

## Risks, Assumptions, Open Questions
- **Assumption**: Current intended Stage 1 route remains `/foundations/transformers`.
- **Assumption**: OTEL collector endpoint may be unavailable in local default setup; E2E should not fail solely due to upstream collector reachability.
- **Risk**: Additional hidden E2E drift may appear after landing and transformer assertions are corrected.
- **Open Question**: Should E2E route assertions be centralized in a shared constant to reduce future contract drift?

## Latest Validation Update (2026-02-14)
- Command run: `pnpm test:e2e` (local runtime execution).
- Result: `12 passed`, `6 failed`, `18 total`.
- Failing specs:
  - `__tests__/e2e/landing-page.spec.ts` (all browsers): `locator('div.grid > a')` count expected `10`, received `0`.
  - `__tests__/e2e/transformer.spec.ts` (all browsers): `getByText('Generating...')` not found.
- Additional signal:
  - OTEL proxy logs show upstream `ECONNREFUSED 127.0.0.1:4318` during E2E; this should be treated under observability failure-boundary expectations, not as a UI hard-fail trigger unless explicitly required by AC.

## Closure Validation Update (2026-02-14)
- Tech Lead verification report status: `verified` (`agent-docs/conversations/tech-lead-to-ba.md:6`).
- Local-equivalent command evidence after test updates:
  - `pnpm test:e2e -- __tests__/e2e/landing-page.spec.ts` -> PASS (`3 passed`) (`agent-docs/conversations/tech-lead-to-ba.md:34`, `agent-docs/conversations/tech-lead-to-ba.md:35`)
  - `pnpm test:e2e -- __tests__/e2e/navigation.spec.ts` -> PASS (`12 passed`) (`agent-docs/conversations/tech-lead-to-ba.md:36`, `agent-docs/conversations/tech-lead-to-ba.md:37`)
  - `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts` -> PASS (`3 passed`) (`agent-docs/conversations/tech-lead-to-ba.md:38`, `agent-docs/conversations/tech-lead-to-ba.md:39`)
  - `pnpm test:e2e` -> PASS (`18 passed`) (`agent-docs/conversations/tech-lead-to-ba.md:40`, `agent-docs/conversations/tech-lead-to-ba.md:41`)

## Rollback Plan
- Revert only E2E assertion updates and related test-doc updates from this CR.
- No runtime/data migration rollback required.

## BA Complexity Assessment
- **Business Complexity:** Small
- **Execution Mode (BA):** Fast
- **Why:** This is a targeted stabilization effort with clear route contract intent and limited blast radius.

## Technical Analysis (filled by Tech Lead)
**Complexity:** [Low | Medium | High]
**Estimated Effort:** [S | M | L]
**Affected Systems:**
**Implementation Approach:**

## Deviations Accepted (filled at closure by BA)
- None
