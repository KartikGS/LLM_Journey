# Handoff: Tech Lead → Frontend Agent

## Subject: CR-006 - Transformer Page Visual Overhaul

## Objective
Enhance the visual presentation of the Transformer Page (`/foundations/transformers`) to match the "Premium Educational Platform" standard established in CR-005.

## Rationale (Why)
The current page is functionally correct but visually flat ("Basic HTML"). To increase learner engagement and authority, we need to upgrade the aesthetics to use glassmorphism, dynamic glows, and smooth animations, creating a "wow" factor that invites exploration.

---

## Constraints

### Technical
- **Framework**: Use `framer-motion` for animations.
- **Styling**: `tailwind-merge` and `clsx` for dynamic classes.
- **Consistency**: Re-use (and finalize) the patterns from `app/page.tsx` by extracting them into components.

### Accessibility
- **Reduced Motion**: All large animations (fade/slide) must respect `prefers-reduced-motion`.
- **Contrast**: Ensure text is readable on top of glass/blur backgrounds in both Light/Dark modes.

### Theme / Cross-Cutting
- **Dual Theme**: Must look premium in both Light (clean, airy) and Dark (cyberpunk, distinct glows).

---

## Design Intent

**Target Aesthetic:** "Future-Tech Dashboard". Think of a high-end data visualization tool or a sci-fi interface. It should feel deep (multi-layered backgrounds) and responsive.

**Animation Guidance:**
- **Page Load**: Staggered fade-up for sections.
- **Interactions**: Subtle scale/glow intensity increase on card hover.
- **Avoid**: Excessive motion that distracts from reading.

**What NOT to do:**
- Do not change the *content text* (educational explanations).
- Do not break existing `id="chat"` or `role="button"` which are used by E2E tests.

---

## Scope

### Files to Modify

#### `app/ui/components/GlassCard.tsx` (NEW)
- Create a reusable wrapper with `backdrop-blur-xl`, border, shadow, and optional hover effects.
- Extract styling logic from `app/page.tsx`'s cards.

#### `app/ui/components/GlowBackground.tsx` (NEW)
- Extract the fixed background blobs from `app/page.tsx`.

#### `app/ui/components/GradientText.tsx` (NEW)
- Extract the gradient text utility.

#### `app/foundations/transformers/page.tsx`
- Refactor layout to use `flex-col gap-16`.
- Replace `<ul>` lists with a Grid of `GlassCard`s.
- Apply `framer-motion` variants for entrance.

#### `app/foundations/transformers/components/BaseLLMChat.tsx`
- Update the textarea and button styles to use glassmorphism/gradients.
- Ensure it looks like a "console" or "terminal" embedded in glass.

---

## Definition of Done
- [ ] `GlassCard`, `GlowBackground`, `GradientText` components created in `app/ui/components/`
- [ ] Transformer page uses these components
- [ ] Page background features multi-layered gradient glows
- [ ] "Model Overview" specs displayed as a visual grid
- [ ] E2E tests (`pnpm playwright test transformer.spec.ts`) PASS
- [ ] `pnpm lint` pass
- [ ] Light and Dark modes both legible

## Verification
1.  Run `pnpm dev` and visit `/foundations/transformers`.
2.  Check Light/Dark mode visually.
3.  Check responsiveness (Mobile vs Desktop).
4.  Run `pnpm lint`.
5.  Run `pnpm playwright test transformer.spec.ts`.

## Report Back
Write completion report to `/agent-docs/conversations/frontend-to-tech-lead.md`.

*Handoff created: 2026-02-11*
*Tech Lead Agent*
