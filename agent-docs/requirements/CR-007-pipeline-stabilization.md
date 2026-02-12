# CR-007: Pipeline Stabilization for Test, Lint, and Build

## Status
Done

## Business Context
**User Need:** Restore engineering flow after the last CR by making the quality gate reliable again.  
**Expected Value:** Developers regain confidence in CI and can ship safely without spending cycles on unrelated breakages.

## Functional Requirements
1. Resolve current failing test suite(s) caused by stale module references introduced by prior route/file changes.
2. Resolve current production build blocker(s) caused by TypeScript incompatibilities.
3. Keep lint status green without relaxing lint/type standards.

## Non-Functional Requirements
- Performance: No measurable runtime regression introduced for navigation or core chat flows.
- Security: Preserve existing telemetry and security boundaries; do not weaken CSP/token controls.
- Accessibility: No degradation to existing navbar interaction accessibility semantics.

## System Constraints & Invariants
- **Constraint Mapping**:
  - `agent-docs/tooling-standard.md`: use `pnpm`; maintain ESLint + strict TypeScript.
  - `agent-docs/architecture.md`: preserve observability safety and security boundaries.
  - `agent-docs/workflow.md`: implementation must be executed via Tech Lead planning/delegation flow.
- **Design Intent**: This is stabilization/repair work to restore expected engineering baseline after CR drift, not a feature pivot.

## Acceptance Criteria
- [x] `pnpm test` passes in repository root with exit code `0`.  
  Verified: `agent-docs/conversations/tech-lead-to-ba.md` (AC-1 evidence, `14 passed, 14 total`; `91 passed, 91 total`).
- [x] `pnpm lint` passes in repository root with exit code `0`.  
  Verified: `agent-docs/conversations/tech-lead-to-ba.md` (AC-2 evidence, no ESLint warnings/errors).
- [x] `pnpm build` passes in repository root with exit code `0`.  
  Verified: `agent-docs/conversations/tech-lead-to-ba.md` (AC-3 evidence, production build completes).
- [x] No temporary compatibility shim is merged unless explicitly documented as an accepted deviation.  
  Verified: `agent-docs/conversations/tech-lead-to-ba.md` (AC-4 evidence, no shim added).

## Verification Mapping
- **Development Proof**:
  - Capture command outputs for:
    - `pnpm test`
    - `pnpm lint`
    - `pnpm build`
    - `pnpm exec tsc --noEmit`
  - Link changed files and rationale in completion report.
- **User Validation**:
  - User runs `pnpm test && pnpm lint && pnpm build` locally and sees all commands succeed.

## Dependencies
- Blocks: Any CR requiring a green CI baseline.
- Blocked by: None.

## Notes
- Discovery evidence is documented in:
  - `agent-docs/reports/INVESTIGATION-CR-007-pipeline-regression.md`
- Current known failures identified during BA discovery:
  - Stale import path in `__tests__/components/BaseLLMChat.test.tsx`
  - Framer Motion TS typing error in `app/ui/navbar.tsx`
- Open question to user: include OTel build warning cleanup now or track separately after green baseline.

## Technical Analysis (filled by Tech Lead)
**Complexity:** Medium  
**Estimated Effort:** S-M  
**Affected Systems:** Test suite module resolution, navbar animation typing, build/typecheck pipeline  
**Implementation Approach:** Targeted, reversible fixes only:
- Updated stale transformer import in `__tests__/components/BaseLLMChat.test.tsx`
- Applied strict-safe Framer Motion variant typing in `app/ui/navbar.tsx`
- Re-verified with `pnpm test`, `pnpm lint`, `pnpm build`, and `pnpm exec tsc --noEmit`

## Deviations Accepted (filled at closure by BA)
None.

## Closure Notes (BA)
- Tech Lead completion reviewed in `agent-docs/conversations/tech-lead-to-ba.md`.
- Additional verification requirement from BA handoff (`pnpm exec tsc --noEmit`) is marked PASS in handoff evidence.
- Non-blocking OTel webpack warning remains informational and is accepted as out-of-scope for CR-007 stabilization AC.
