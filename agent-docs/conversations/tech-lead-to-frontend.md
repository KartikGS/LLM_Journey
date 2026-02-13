# Handoff: Tech Lead -> Frontend Agent

## Subject: CR-007 - Navbar Framer Motion Type Stabilization

## Objective
Fix strict TypeScript typing failure in `app/ui/navbar.tsx` caused by Framer Motion variant transition type inference, while preserving current navbar behavior.

## Rationale (Why)
`pnpm build` and `pnpm exec tsc --noEmit` are blocked by `TS2322` in navbar motion variants. This is a targeted stabilization fix to restore pipeline health, not a UI redesign.

---

## Constraints

### Technical
- No dependency changes.
- No route changes.
- No behavior changes to navbar open/close flow.
- Preserve reduced-motion behavior.
- Keep strict TypeScript compatibility with existing standards.

### Accessibility
- Preserve current interaction/accessibility semantics (`aria-label`, keyboard/click behavior).

### Theme / Cross-Cutting
- Do not change visual styling intent for light/dark modes.

---

## Scope

### Files to Modify

#### `app/ui/navbar.tsx`
- Normalize/explicitly type motion variants so `transition.type` resolves to Framer Motion’s expected literal union.
- Keep animation semantics equivalent to current implementation.

---

## Definition of Done
- [ ] `app/ui/navbar.tsx` no longer triggers TypeScript Framer Motion variant error.
- [ ] Mobile menu animation behavior remains functionally unchanged.
- [ ] Reduced-motion branch remains intact and behaviorally correct.
- [ ] No new lint errors introduced.

## Verification
1. Implement the type/inference-safe variant definition in `app/ui/navbar.tsx`.
2. Run `pnpm exec tsc --noEmit`.
3. Run `pnpm lint`.
4. Provide short behavioral sanity note for navbar open/close + reduced motion.

## Report Back
Write execution report to `agent-docs/conversations/frontend-to-tech-lead.md` including:
- [Changes Made]
- [Verification Results]
- [Behavioral Sanity Check]
- [Deviations] (if any)

Reference plan: `agent-docs/plans/CR-007-plan.md`

---

*Handoff created: 2026-02-12*
*Tech Lead Agent*
