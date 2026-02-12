# Handoff: Tech Lead -> Testing Agent

## Subject: CR-007 - Pipeline Stabilization (Test Import + Full Verification)

## Objective
Stabilize the test/build pipeline portion owned by Testing by fixing stale test module pathing and producing verification evidence for CR-007 quality gates.

## Rationale (Why)
CR-007 is a baseline restoration CR. Current pipeline is blocked by deterministic regressions; we need minimal, reversible repair that restores trust in `test/lint/build` without relaxing standards.

---

## Constraints

### Technical
- Use `pnpm` only.
- Do not weaken lint/type/test thresholds.
- No compatibility shim unless explicitly escalated as a deviation.
- Keep test intent unchanged; this is path stabilization, not behavior redesign.

### Scope Guardrails
- This handoff is limited to testing-owned files and verification commands.
- If you find feature-code changes required, stop and report back.

---

## Scope

### Files to Modify

#### `__tests__/components/BaseLLMChat.test.tsx`
- Update stale import from old transformer path to canonical path under `app/foundations/transformers`.
- Do not change assertion semantics unless required by canonical path migration evidence.

---

## Definition of Done
- [ ] Stale import in `__tests__/components/BaseLLMChat.test.tsx` is corrected to canonical module path.
- [ ] `pnpm test` passes (exit code `0`).
- [ ] `pnpm lint` passes (exit code `0`).
- [ ] `pnpm exec tsc --noEmit` passes (exit code `0`).
- [ ] `pnpm build` passes (exit code `0`).
- [ ] Any remaining failure is explicitly classified as CR-related vs pre-existing.

## Verification
1. Apply the import path fix.
2. Run `pnpm test`.
3. Run `pnpm lint`.
4. Run `pnpm exec tsc --noEmit`.
5. Run `pnpm build`.
6. Capture concise evidence for each command (pass/fail + relevant error lines if fail).

## Report Back
Write execution report to `agent-docs/conversations/testing-to-tech-lead.md` including:
- [Changes Made]
- [Verification Results]
- [Failure Classification]
- [Deviations] (if any)

Reference plan: `agent-docs/plans/CR-007-plan.md`

---

*Handoff created: 2026-02-12*
*Tech Lead Agent*
