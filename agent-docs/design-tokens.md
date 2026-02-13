# Design Tokens & Visual System

> [!IMPORTANT]
> This is the **single source of truth** for visual values. Do not invent ad-hoc colors, shadows, or animation timings.
> If a token doesn't exist for your use case, **add it here first**, then use it.

---

## Aesthetic North Star

> **"Wow yet Professional, subtle but not too subtle."**

**Reference calibration:** [Linear](https://linear.app), [Vercel](https://vercel.com), [Raycast](https://raycast.com).

These are developer tools that feel premium without being flashy. Key traits:
- **Restrained motion** — animations communicate state, never decorate
- **Depth through shadow and blur**, not through color overload
- **Consistent rhythm** — spacing, radius, and transitions feel predictable
- **Both themes feel intentional** — dark mode is NOT just "inverted light mode"

---

## Color Palette

### Surface Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `surface-base` | `bg-[#fafafa]` | `bg-[#0a0a0a]` | Page background |
| `surface-raised` | `bg-white/80` | `bg-[#111111]/80` | Cards, containers (with `backdrop-blur`) |
| `surface-overlay` | `bg-white/90` | `bg-[#111111]/90` | Modals, popovers, navbar |
| `surface-hover` | `bg-black/[0.03]` | `bg-white/[0.03]` | Hovered interactive elements |
| `surface-active` | `bg-black/[0.05]` | `bg-white/[0.06]` | Active/selected states |
| `surface-subtle` | `bg-black/[0.02]` | `bg-white/[0.02]` | Table headers, subdued sections |

### Border Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `border-default` | `border-black/[0.08]` | `border-white/[0.08]` | Standard dividers |
| `border-subtle` | `border-black/[0.05]` | `border-white/[0.05]` | Soft separation |
| `border-emphasis` | `border-black/[0.12]` | `border-white/[0.15]` | Hovered card borders |

### Text Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `text-primary` | `text-gray-900` | `text-white` | Headings, primary content |
| `text-secondary` | `text-gray-600` | `text-gray-400` | Body text, descriptions |
| `text-tertiary` | `text-gray-500` | `text-gray-500` | Captions, meta info |
| `text-muted` | `text-gray-400` | `text-gray-600` | Disabled, placeholder |

### Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| `accent-gradient` | `from-blue-600 via-indigo-500 to-purple-600` | Primary gradient (CTAs, active indicators) |
| `accent-blue` | `text-blue-600 dark:text-blue-400` | Active nav items, links |
| `glow-blue` | `bg-blue-500/10 dark:bg-blue-600/5` | Background glow layers |
| `glow-purple` | `bg-purple-500/10 dark:bg-purple-600/5` | Background glow layers |

> [!TIP]
> **Light mode glow opacity rule**: Keep glow opacity at `/10` max in light mode. Higher values cause visible blobs that look unintentional. Dark mode can go up to `/5`–`/10` since the dark surface absorbs more.

---

## Shadow Scale

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `shadow-sm` | `shadow-sm` | `shadow-none` | Subtle depth for small elements |
| `shadow-card` | `shadow-md shadow-black/5` | `shadow-none` | Default card shadow |
| `shadow-card-hover` | `shadow-lg shadow-black/8` | `shadow-lg shadow-black/20` | Hovered cards |
| `shadow-elevated` | `shadow-xl shadow-black/5` | `shadow-xl shadow-black/30` | Dropdowns, menus |
| `shadow-hero` | `shadow-2xl shadow-black/5` | `shadow-2xl shadow-black/40` | Hero containers, prominent elements |

> [!NOTE]
> In light mode, tint shadows with subtle color for warmth: `shadow-blue-500/5`. In dark mode, pure black shadows work because the surface absorbs them.

---

## Animation Tokens

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `duration-instant` | `100ms` | Active/press states |
| `duration-fast` | `150ms` | Hover color transitions, icon changes |
| `duration-normal` | `250ms` | Reveals, fade-ins, slide transitions |
| `duration-slow` | `400ms` | Page-level transitions, complex reveals |

### Spring Presets

| Token | Config | Usage |
|-------|--------|-------|
| `spring-snappy` | `{ type: 'spring', stiffness: 400, damping: 25 }` | Button taps, toggles, small interactions |
| `spring-smooth` | `{ type: 'spring', stiffness: 300, damping: 30 }` | Menu slides, nav transitions |
| `spring-gentle` | `{ type: 'spring', stiffness: 200, damping: 25 }` | Layout animations, `layoutId` transitions |

### Easing

| Token | CSS Value | Usage |
|-------|-----------|-------|
| `ease-out` | `ease-out` / `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `ease-in-out` | `ease-in-out` | Continuous transitions |

---

## Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `rounded-md` | Buttons, badges, small inputs |
| `radius-md` | `rounded-lg` | Nav items, list items |
| `radius-lg` | `rounded-xl` | Cards, containers |
| `radius-xl` | `rounded-2xl` | Hero sections, prominent containers |
| `radius-full` | `rounded-full` | Avatars, status dots |

---

## Glassmorphism Patterns

### Standard Glass Surface
```
bg-white/80 dark:bg-[#111111]/80 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.08]
```

### Gradient Border Glow (Use Sparingly)
```html
<!-- Outer wrapper with relative positioning -->
<div className="relative group">
  <!-- Glow layer — sits behind the content -->
  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300" />
  <!-- Content layer -->
  <div className="relative bg-white/80 dark:bg-[#111111]/80 backdrop-blur-2xl rounded-xl ...">
    ...
  </div>
</div>
```

> [!CAUTION]
> **Gradient border glow should appear on at most 1–2 elements per viewport.** If every card, button, and section glows, nothing stands out. Reserve it for the page's primary interactive element (e.g., CTA button).

---

## Background Glow Layers

For ambient page depth, use 1–2 fixed blurred circles:

```tsx
<div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
  <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] rounded-full" />
  <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/5 blur-[120px] rounded-full" />
</div>
```

> [!WARNING]
> Do **NOT** add `animate-pulse` to background glows. Static glows create depth. Pulsing glows create visual noise and distract from content.
