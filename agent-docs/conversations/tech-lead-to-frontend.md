# Handoff: Tech Lead → Frontend Agent

## Subject: CR-005 - Visual Enhancement for Home Page & Navbar

## Objective
Apply premium visual design patterns to the Home Page and Navbar to match the design language established in `browser-support-fallback.tsx`. Create a "wow-factor" first impression with glassmorphism, gradient glows, and smooth animations.

## Rationale (Why)
The current Home Page and Navbar use basic styling that doesn't match the premium design language of other components. Users should feel impressed from the first page load. The reference component (`browser-support-fallback.tsx`) demonstrates the design system we want across the application.

---

## Constraints

### Technical
- **Use `framer-motion`** for all animations (already in Standard Kit)
- **Use `clsx`/`tailwind-merge`** for conditional class merging
- **Use `lucide-react`** for any icons
- **NO new dependencies** - Standard Kit only
- **GPU-accelerated animations only** - `transform`, `opacity` (no `width`, `height`, `margin`)

### Accessibility
- **MUST** respect `prefers-reduced-motion` using `framer-motion`'s `useReducedMotion()` hook
- Disable/reduce animations when user prefers reduced motion

### Theme Support
- **MUST** work in both Light AND Dark modes
- Use the existing patterns: `dark:` prefix, `/80` opacity variants

---

## Scope

### Files to Modify

#### 1. `app/page.tsx`
**Convert to Client Component** (add `'use client'`)

**Add Background Effects:**
```tsx
{/* Premium Background Glows */}
<div className="fixed inset-0 overflow-hidden pointer-events-none">
  <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
  <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
</div>
```

**Hero Section Enhancements:**
- Wrap in a glassmorphism container: `bg-white/80 dark:bg-[#111111]/80 backdrop-blur-2xl rounded-[2rem]`
- Add subtle gradient border glow on the container

**CTA Button:**
- Add gradient border effect: `bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600`
- Add hover glow effect
- Use `framer-motion` for subtle scale animation on hover

**Journey Cards:**
- Add gradient border glow on hover
- Enhanced shadow: `shadow-2xl` on hover
- Subtle scale animation with `framer-motion`

**Phase Table:**
- Glassmorphism background
- Subtle border highlight

#### 2. `app/ui/navbar.tsx`

**Enhanced Styling:**
- Match glassmorphism treatment: `bg-white/80 dark:bg-[#111111]/80 backdrop-blur-2xl`
- Add subtle gradient accent line at top or bottom

**Hover States:**
- Premium gradient glow on active items
- Smooth color transitions

**Mobile Menu Animation:**
- Replace CSS transition with `framer-motion` `AnimatePresence`
- Smooth slide-in/out with fade backdrop
- Hamburger button receives subtle glow

---

## Reference Patterns (from `browser-support-fallback.tsx`)

| Pattern | Code Example |
|---------|--------------|
| Multi-layer glow | `bg-blue-500/10 blur-[120px] animate-pulse` |
| Glassmorphism | `bg-white/80 dark:bg-[#111111]/80 backdrop-blur-2xl` |
| Gradient border | `bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-[2rem] blur opacity-20` |
| Premium shadow | `shadow-2xl` |
| Rounded corners | `rounded-[2rem]` or `rounded-2xl` |

---

## Definition of Done

- [ ] Home Page has multi-layered gradient glow backgrounds
- [ ] Home Page hero section has glassmorphism styling
- [ ] CTA button has dynamic gradient border/glow effect on hover
- [ ] Journey stage cards have premium hover states with shadow/glow
- [ ] Navbar has consistent glassmorphism styling
- [ ] Mobile menu has smooth `framer-motion` open/close animation
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Blue/purple gradient accents used consistently
- [ ] Both Light and Dark modes render correctly
- [ ] `pnpm dev` runs without errors
- [ ] `pnpm lint` passes without warnings

## Verification
After implementation:
1. Run `pnpm dev` and visually inspect at http://localhost:3001
2. Run `pnpm lint` - must pass
3. Test both Light and Dark mode (toggle in DevTools or system settings)
4. Test mobile viewport (use DevTools device emulation)
5. Test `prefers-reduced-motion` (DevTools > Rendering > Emulate CSS media feature)

## Report Back
Write completion report to `/agent-docs/conversations/frontend-to-tech-lead.md` including:
- Summary of changes
- Any deviations from plan
- Screenshots or recording (optional)
- Verification results

---

*Handoff created: 2026-02-09*
*Tech Lead Agent*
