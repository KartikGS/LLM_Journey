# CR-008: Health Check Hardening (Rate Limiting + Middleware Test Coverage)

## Status
Done (BA Verified: 2026-02-13)

## Business Context
**User Need:** Before major CRs, harden core reliability/security behavior discovered during health check and keep governance traceability consistent.  
**Expected Value:** Protected API routes enforce intended rate limits, regression risk is reduced through deterministic tests, and CR status interpretation is consistent without rewriting historical artifacts.

## Functional Requirements
1. Fix middleware rate-limit state mutation so in-window requests accumulate correctly.
2. Add middleware tests covering allow/block/bypass paths plus window-expiration boundary behavior.
3. Preserve existing bypass behavior for localhost and `E2E=true`.
4. Document legacy CR status mapping in requirements governance docs (forward-only standardization).

## Non-Functional Requirements
- Security: Do not weaken CSP/HSTS or telemetry boundaries while fixing rate limiting.
- Quality Gates: `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build` must pass.
- Reversibility: Changes remain localized and easy to roll back.

## System Constraints & Invariants
- `agent-docs/architecture.md`: preserve security and observability boundaries.
- `agent-docs/tooling-standard.md`: use `pnpm`, strict TypeScript, ESLint.
- `agent-docs/workflow.md`: preserve CR historical integrity (no retroactive normalization of closed artifacts).

## Acceptance Criteria
- [x] **AC-1:** Rate limits are enforced for protected middleware routes.  
  Verified: `middleware.ts:96` appends current timestamp into limiter state; block behavior asserted in `__tests__/middleware.test.ts:103`.
- [x] **AC-2:** Negative-space behavior is preserved (under-threshold requests and bypass paths remain allowed).  
  Verified: under-threshold assertions in `__tests__/middleware.test.ts:94`; localhost bypass at `__tests__/middleware.test.ts:134`; E2E bypass at `__tests__/middleware.test.ts:143`.
- [x] **AC-3:** Window-boundary expiration/reset behavior is covered by tests.  
  Verified: boundary test in `__tests__/middleware.test.ts:116` with post-window allow check at `__tests__/middleware.test.ts:130`.
- [x] **AC-4:** Full quality gates pass (`test`, `lint`, `tsc --noEmit`, `build`).  
  Verified: `agent-docs/conversations/tech-lead-to-ba.md:31` to `agent-docs/conversations/tech-lead-to-ba.md:45`.
- [x] **AC-5:** Legacy CR status interpretation is standardized without rewriting closed artifacts.  
  Verified: `agent-docs/requirements/README.md:17` defines `Completed/Implemented/Done ✅ -> Done` mapping and forward-only policy.

## Verification Mapping
- Tech Lead handoff evidence: `agent-docs/conversations/tech-lead-to-ba.md`
- Backend execution report: `agent-docs/conversations/backend-to-tech-lead.md`
- Testing execution report: `agent-docs/conversations/testing-to-tech-lead.md`
- Plan artifact: `agent-docs/plans/CR-008-plan.md`

## Dependencies
- Blocks: follow-on major CRs relying on middleware security confidence.
- Blocked by: none.

## Technical Analysis (filled by Tech Lead)
**Complexity:** Medium  
**Estimated Effort:** S-M  
**Affected Systems:** `middleware.ts`, middleware test coverage, requirements governance docs  
**Implementation Approach:** targeted middleware fix + deterministic test hardening + governance clarification without retroactive CR rewrites.

## Deviations Accepted (filled at closure by BA)
None.

## Closure Notes (BA)
- Tech Lead completion report reviewed: `agent-docs/conversations/tech-lead-to-ba.md`.
- All ACs validated with file/command evidence.
- Non-blocking residual warnings (OTel webpack warning, Jest open-handles warning) accepted as out-of-scope for CR-008 closure.
