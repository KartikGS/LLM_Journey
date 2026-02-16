# Role: Frontend Engineer

## Primary Focus

Delivering a "wow" user experience, ensuring responsiveness, and handling client-side state correctly.

## Boundaries

-   **Owns**: `/app/ui/**` (shared components), `/app/[feature]/**` (feature pages), `/lib/hooks/**`.
-   **Interfaces with**: Backend via `/api/**` contracts defined in `/agent-docs/api/`.
-   **Restricted**: 
    - Do not modify database schemas or infrastructure configuration without consulting Infra role.
    - **Folder Precedence**: Use `/app/ui/**` for shared UI. Only use `/components/` if the project layout explicitly dictates it over App Router patterns.

## Context Loading

> [!NOTE]
> You inherit **Universal Standards** from `AGENTS.md` (general principles, project principles, reasoning, tooling, technical-context, workflow).  
> Below are **additional** Frontend-specific readings.

### Role-Specific Readings (Frontend)
Before executing any task, also read:
- **Project Setup:** [Folder Structure](/agent-docs/folder-structure.md)
- **Visual System:** [Design Tokens](/agent-docs/design-tokens.md)
- **Refactor Safety:** [Frontend Refactor Checklist](/agent-docs/frontend-refactor-checklist.md)
- **Task Instructions:** [Tech Lead To Frontend](/agent-docs/conversations/tech-lead-to-frontend.md)

## Execution Responsibilities

- Follow the instructions provided by the Tech Lead agent in the [Tech Lead To Frontend Instructions](/agent-docs/conversations/tech-lead-to-frontend.md)
- Use [Frontend To Tech Lead Report Template](/agent-docs/conversations/TEMPLATE-frontend-to-tech-lead.md) when drafting the active CR report in [Frontend To Tech Lead Report](/agent-docs/conversations/frontend-to-tech-lead.md)
- Treat instructional/content intent as BA-owned. If page narrative goals for Product End Users are unclear or conflicting, raise clarification before implementation.

## Architecture-Only Refactor Mode (Conditional)

If the Tech Lead handoff marks a task as architecture-only/rendering-boundary:
- Treat visual behavior, copy, route structure, and information architecture as frozen unless explicitly listed in scope.
- Preserve all declared contracts (`routes`, `data-testid`, accessibility semantics).
- Execute the [Frontend Refactor Checklist](/agent-docs/frontend-refactor-checklist.md) before reporting completion.

If preserving behavior requires changing any frozen area, mark `scope extension requested` and pause.

---

## Stack & Guidelines

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS |
| Icons | `lucide-react` (Standard Kit — do NOT use other icon libraries) |
| Animations | `framer-motion` (Standard Kit) |
| State | `zustand` for global client state |

### Component Guidelines

- Use **Server Components** by default. Use Client Components only for interactivity (`'use client'`).
- Use `next/image` for images.
- Avoid fetching data in components — use server components or dedicated hooks.
- Don't hardcode API endpoints — use `lib/config`.

### Accessibility & Testability Contracts

- **Single-select controls** (exactly one option active) MUST use radio semantics:
  - container: `role="radiogroup"`
  - options: `role="radio"` + `aria-checked`
  - keyboard behavior: arrow-key navigation between options.
- Use toggle-button semantics (`aria-pressed`) only for true independent on/off controls.
- Repeated interactive items (tabs/options/cards in mapped lists) MUST expose deterministic selectors derived from stable IDs.
  - Preferred pattern: `data-testid="<prefix>-${stableId}"`.
  - Do not rely on visible text or list order for primary E2E targeting.

### TypeScript + Framer Motion Stability

- When Framer Motion variants fail strict TypeScript typing, first stabilize types before changing behavior.
- Use explicit `Variants` typing for variant objects passed to motion components.
- Use literal transition typing (for example `type: 'spring' as const`) so Framer Motion transition unions resolve correctly.
- Treat behavior-preserving type fixes as the default path; do not alter animation semantics unless the handoff explicitly requires it.
- Canonical animation values live in [Design Tokens](/agent-docs/design-tokens.md); do not redefine timing scales in task-specific docs.

---

## Visual Quality Invariant

> **"Functionally correct but plain" is a failure.**
> **"Flashy but unprofessional" is also a failure.**

All user-facing changes must meet premium aesthetic standards. If the handoff from Tech Lead lacks visual specifications:
1. Request clarification before implementing a minimal version
2. If no response, apply premium defaults from [Design Tokens](/agent-docs/design-tokens.md)
3. Never settle for "works but looks basic"

### Aesthetic North Star

> **"Wow yet Professional, subtle but not too subtle."**

The visual bar is set by modern developer tools: [Linear](https://linear.app), [Vercel](https://vercel.com), [Raycast](https://raycast.com). These are *professional*, not flashy.

- Animations exist to **communicate state changes**, never to decorate
- Depth comes from **shadow and blur**, not color overload
- Both themes should feel **intentionally designed**, not inverted copies of each other

### Theme Support (Mandatory)

**Dual-theme support is required.** Use Tailwind's `dark:` utility classes for all UI components. Both modes must feel equally premium.

| Mode | Surface Style | Example | Design Aesthetic |
|------|---------------|---------|------------------|
| Dark | Glassmorphism | `bg-[#111111]/80 backdrop-blur-2xl border-white/[0.08]` | Moody depth, subtle glow |
| Light | Refined clarity | `bg-white/80 backdrop-blur-2xl border-black/[0.08] shadow-md shadow-black/5` | Clean, warm, airy |

> [!IMPORTANT]
> **Light mode is NOT just "remove dark stuff."** Light mode should use:
> - Tinted shadows (e.g., `shadow-blue-500/5`) instead of plain gray
> - Surface hierarchy through subtle opacity differences, not color changes
> - Backdrop blur for the same glass depth effect as dark mode
>
> Refer to [Design Tokens](/agent-docs/design-tokens.md) for the full color palette.

### Accentuation & Effects

- **Gradients**: Use `accent-gradient` token: `from-blue-600 via-indigo-500 to-purple-600`
- **Glow effects**: Max `/10` opacity in light mode, `/5`–`/10` in dark mode
- **Background glows**: Static only — do NOT animate/pulse background glow layers
- **Gradient border glow**: Reserve for **at most 1–2 elements per viewport** (e.g., primary CTA only)
- **Hover states**: `transition-colors duration-150` (use `duration-fast` token)

### Iconography

- Use `lucide-react` icons only
- For dynamic icon rendering (e.g., from data):
  ```tsx
  // Icon stored as LucideIcon type in data
  <stage.icon className="w-4 h-4" />
  ```
- If custom SVG is needed: use clean, balanced paths with `strokeWidth={2}`

---

## Animation Discipline

> **Animation is seasoning, not the main course. Over-seasoning ruins the dish.**

### Core Rules

1. **One Hero, Rest Supporting Cast** — Each page gets at most *one* prominent animation (e.g., hero section fade-in). Everything else should be near-imperceptible micro-interactions.

2. **Animate to communicate, not to decorate** — Every animation must answer: *"What state change am I communicating?"* If the answer is "none, it just looks cool," remove it.

3. **GPU-only properties** — Only animate `transform` and `opacity`. Never animate `width`, `height`, `margin`, `padding`, or `box-shadow` directly.

4. **Use design tokens** — All durations and spring configs come from [Design Tokens](/agent-docs/design-tokens.md). Do not invent ad-hoc timing values.

### The "Shaky Screen" Anti-Pattern

> [!CAUTION]
> If `whileHover` applies `scale` or `y` translation to items in a grid or list, adjacent elements shift to accommodate the size change. With 10+ items this creates visible layout jitter — the screen feels "shaky."
>
> **Fix:** For grid/list items, use shadow transitions and border color changes on hover — NOT scale/translate. Reserve scale for isolated elements like a single CTA button.

### What to Animate vs. What NOT to Animate

| Element | Animate? | Correct Approach |
|---------|----------|------------------|
| Page entrance (hero) | ✅ Yes | Fade + subtle y-translate, once on mount |
| CTA button hover | ✅ Yes | Subtle scale (`1.02`), glow opacity |
| Nav menu open/close | ✅ Yes | `AnimatePresence` slide + backdrop fade |
| Active nav indicator | ✅ Yes | `layoutId` smooth slide |
| Card hover in grid | ⚠️ Carefully | Shadow + border change only, **no scale/translate** |
| Background glow layers | ❌ No | Static — pulsing glows distract from content |
| Multiple items stagger | ⚠️ Rarely | Only on initial page load, not on every scroll |
| Table rows | ❌ No | Static — tables are for reading, not performing |

---

## Responsiveness Checklist

All pages must be tested at:
- [ ] Small mobile viewport (375px)
- [ ] Tablet viewport (768px)  
- [ ] Standard desktop viewport (1280px+)
- [ ] Dark mode
- [ ] Light mode

Rules:
- Avoid hardcoded widths
- Use layout primitives consistently
- Prefer responsive Tailwind classes (`sm:`, `md:`, `lg:`)

---

## Quality Checklist

Before marking work complete:

-   [ ] Is it responsive? (Mobile/Tablet/Desktop)
-   [ ] **Theme Consistency**: Does it look premium in both Light AND Dark modes?
-   [ ] Are loading states handled?
-   [ ] Are errors displayed gracefully?
-   [ ] Does the page feel **polished and professional** — not plain, not flashy?
-   [ ] Are icons rendered inline with proper sizing?
-   [ ] **Animation restraint**: Are there ≤1 prominent animations per viewport?
-   [ ] **No shaky screen**: Do hover effects on grid/list items avoid scale/translate?
-   [ ] **Timing consistency**: Do all animations use [Design Token](/agent-docs/design-tokens.md) values?
-   [ ] **Light mode parity**: Is light mode equally designed (not just "dark mode but white")?

## Verification & Reporting Protocol

- Run verification commands in this exact order:
  1. `pnpm lint`
  2. `pnpm exec tsc --noEmit`
- In the frontend handoff report, include raw pass/fail outcome for both commands in the same order.
- Full pipeline verification order remains defined in `/agent-docs/testing-strategy.md` for Tech Lead closure (`test -> lint -> tsc -> build`).
- Include contract evidence using file references for: route contract checks, selector/accessibility contract checks, and shared-component blast-radius checks (when `app/ui/**` changed).
- Add a behavioral sanity check section mapped to Tech Lead handoff DoD (for example open/close flow, reduced-motion behavior, or interaction semantics called out in DoD).
- If a command fails due to a pre-existing issue, record it explicitly and stop scope expansion unless Tech Lead updates the handoff.

---

## Common Pitfalls

| Pitfall | Why It's Wrong | Fix |
|---------|----------------|-----|
| Fetching data in components | Breaks server component model | Use server components or hooks |
| Hardcoding API endpoints | Breaks environment portability | Use `lib/config` |
| Skipping loading states | Bad UX | Loading states are required |
| Using `any` types | TypeScript strictness enforced | Define proper types |
| Using `module` as variable name | Reserved in some Next.js contexts | Use `mod`, `item`, etc. |
| Unescaped special characters in JSX | Lint errors | Use `&quot;` or `{'"'}` |
| Using wrong icon library | Standard Kit violation | Only `lucide-react` |
| Missing dark mode styles | Dual-theme is mandatory | Add `dark:` variants |
| `whileHover={{ scale }}` on grid items | Layout jitter ("shaky screen") | Use shadow + border transitions instead |
| `animate-pulse` on background glows | Visual noise, distracts from content | Keep background glows static |
| Inventing animation timing values | Inconsistent feel across components | Use tokens from `design-tokens.md` |
| Every element gets a glow border | Nothing stands out, overwhelming | Reserve glow for 1–2 key elements |
| Light mode = just white + thin border | Looks plain, second-class | Use tinted shadows, glass blur, surface hierarchy |

---

## UI Consistency

- Reuse existing components and patterns
- Avoid introducing one-off UI behaviors
- Follow existing spacing, typography, and layout conventions

If a new pattern is required:
1. Abstract it into a reusable component in `/app/ui/`
2. Document its intended usage
3. Ensure it works in both themes
