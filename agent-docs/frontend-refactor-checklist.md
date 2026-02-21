# Frontend Refactor Checklist

Use this checklist for rendering-boundary refactors, server/client extraction, and shared UI component updates.

## 1. Intent Lock
- [ ] Confirm task mode: `architecture-only` or `feature-ui`.
- [ ] If `architecture-only`, freeze visual behavior, copy, route structure, and information architecture.
- [ ] Record allowed scope and explicit out-of-scope items from handoff.

## 2. Contract Inventory (Before Edits)
- [ ] Route contracts listed (`/path` values that must remain unchanged).
- [ ] Selector contracts listed (`data-testid`, role/aria semantics).
- [ ] Continuity/navigation href contracts listed (if present).
- [ ] Critical interaction contracts listed (chat input, selector behavior, menu behavior, etc.).

## 3. Boundary Refactor Safety
- [ ] For each page, identify why `'use client'` exists (state/input vs decorative motion).
- [ ] Move state/input logic into client islands only.
- [ ] Keep non-interactive presentational composition server-first.
- [ ] Verify parent layout/container overflow behavior after extraction (no clipping/truncation regressions).

## 4. Shared Component Blast-Radius Check (When `app/ui/**` Changes)
- [ ] List impacted routes in preflight.
- [ ] Sanity-check each impacted route for:
  - render integrity (no clipping/overlap/collapse),
  - primary interactive surface visibility,
  - no selector/semantic contract regressions.

## 5. Verification Commands (Mandatory Order)
Run in the order specified in `frontend.md` Verification & Reporting Protocol (canonical source for frontend command sequence):
1. `pnpm lint`
2. `pnpm exec tsc --noEmit`

## 6. Report Evidence Format
For each DoD/contract item, include:
- contract name,
- status (`preserved` / `changed`),
- evidence reference (`path:line`),
- note (`none` if unchanged; otherwise reason + approval reference).

## 7. Pause Triggers
Pause and ask Tech Lead when any of these occur:
- Route/API/test-id/aria contract change appears necessary.
- More than one plausible behavior interpretation exists.
- Required file ownership crosses role boundaries.
- Refactor causes user-visible regression outside delegated scope.
