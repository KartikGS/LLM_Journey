# Technical Plan - CR-005: Visual Enhancement for Home Page & Navbar

## Technical Analysis
- **Current State**: Home Page and Navbar use basic Tailwind styling without premium visual effects
- **Reference Component**: `browser-support-fallback.tsx` establishes a high-fidelity design pattern with:
  - Multi-layered gradient glows (`blur-[120px]`)
  - Glassmorphism (`bg-white/80 dark:bg-[#111111]/80 backdrop-blur-2xl`)
  - Dynamic gradient borders
  - Subtle animations
- **Key Challenge**: Converting server components to client components for animation support without breaking existing functionality

## Discovery Findings
- **Existing Tests**: 
  - `landing-page.spec.ts`: Tests h1 visibility, 10 journey cards, CTA link
  - `navigation.spec.ts`: Tests navigation flow
- **Standard Kit Verified**: `framer-motion`, `clsx`, `tailwind-merge`, `lucide-react` available
- **File Classification**:
  - `app/page.tsx` → **Feature code** → Must delegate to Frontend Agent
  - `app/ui/navbar.tsx` → **Feature code** → Must delegate to Frontend Agent

## Critical Assumptions
1. Converting `app/page.tsx` from server to client component won't impact SSR/SEO
2. `framer-motion` animations work correctly with `prefers-reduced-motion` media query
3. Existing E2E selectors (h1, grid links) remain stable after visual changes

## Proposed Changes

### Home Page (`app/page.tsx`)
1. **Convert to Client Component** - Add `'use client'` directive for `framer-motion`
2. **Background Effects** - Add multi-layered gradient glows matching reference
3. **Hero Section** - Add glassmorphism card with backdrop blur
4. **CTA Button** - Add gradient border effect on hover
5. **Journey Cards** - Add premium hover states with glow/shadow effects
6. **Phase Table** - Subtle glassmorphism treatment

### Navbar (`app/ui/navbar.tsx`)
1. **Enhanced Styling** - Match glassmorphism treatment from reference
2. **Hover States** - Premium gradient glow on active/hover items
3. **Mobile Menu Animation** - Replace CSS transition with `framer-motion` AnimatePresence
4. **Hamburger Button** - Subtle glow effect

### Accessibility
- All animations wrapped in `prefers-reduced-motion` check
- Use `framer-motion`'s `useReducedMotion()` hook to conditionally disable animations

## Architectural Invariants Check
- [x] **Observability Safety**: Visual changes only, no telemetry impact
- [x] **Security Boundaries**: No new external inputs or API changes
- [x] **Dual Theme**: Both light and dark mode support required (per constraints)

## Delegation & Execution Order

| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | **Frontend** | Enhance `app/page.tsx` with glassmorphism, gradient glows, and `framer-motion` animations |
| 2 | **Frontend** | Enhance `app/ui/navbar.tsx` with matching visual treatment and animated mobile menu |
| 3 | **Testing** | Update E2E tests if selectors changed; add visual smoke test for reduced-motion |

> [!NOTE]
> Testing strategy: **Implementation-First**. Visual changes are subjective; BA + User will validate visually. Testing Agent only updates selectors if needed.

## Operational Checklist
- [x] **Environment**: No new env variables
- [x] **Observability**: No changes to tracing/logging
- [x] **Artifacts**: No new artifacts requiring `.gitignore`
- [x] **Rollback**: Revert the 2 file changes (`page.tsx`, `navbar.tsx`)

## Definition of Done (Technical)
- [ ] Home Page has multi-layered gradient glow backgrounds
- [ ] Home Page hero has glassmorphism styling
- [ ] CTA button has gradient border/glow on hover
- [ ] Journey cards have premium hover states
- [ ] Navbar has matching glassmorphism styling
- [ ] Mobile menu has `framer-motion` animation
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Blue/purple gradient accents used consistently
- [ ] Light AND Dark modes render correctly
- [ ] `pnpm dev` runs without errors
- [ ] `pnpm lint` passes
- [ ] Existing E2E tests pass (`pnpm test:e2e`)

## Risks & Notes
1. **Server to Client Component**: Home page becomes a client component. This is acceptable for an educational platform where SEO on the home page is minimal.
2. **Animation Performance**: All animations use GPU-accelerated properties (`transform`, `opacity`) per NFR.

---
*Plan created: 2026-02-09*
*Tech Lead Agent*
