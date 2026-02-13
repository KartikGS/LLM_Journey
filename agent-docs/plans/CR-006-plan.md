# Technical Plan - CR-006: Transformer Page Visual Overhaul

## Technical Analysis
- **Current State**: `/foundations/transformers` uses basic HTML/Tailwind styling. Functional but visually flat.
- **Goal**: Apply "Premium Educational Platform" aesthetic (Glassmorphism, Glows, Animations) per CR-005 standards.
- **Constraint**: Must pass `transformer.spec.ts` (e2e) which relies on specific IDs and Roles.
- **Opportunity**: `app/page.tsx` has inline styles for glassmorphism. We will extract these into reusable Design System components.

## Proposed Changes

### 1. New Design System Components (`app/ui/components/`)
Create reusable components to enforce consistency between Home and Transformer pages.
#### [NEW] [GlassCard.tsx](file:///home/kartik/Metamorphosis/LLM-Journey/app/ui/components/GlassCard.tsx)
- Wrapper with `bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl`, border, and shadow.
- Supports `hover` prop for interactive cards (scale/glow).

#### [NEW] [GlowBackground.tsx](file:///home/kartik/Metamorphosis/LLM-Journey/app/ui/components/GlowBackground.tsx)
- The multi-layered blue/purple gradient blobs found in `app/page.tsx`.

#### [NEW] [GradientText.tsx](file:///home/kartik/Metamorphosis/LLM-Journey/app/ui/components/GradientText.tsx)
- Reusable `bg-gradient-to-r ... bg-clip-text text-transparent`.

### 2. Transformer Page Refactor (`app/foundations/transformers/page.tsx`)
#### [MODIFY] [page.tsx](file:///home/kartik/Metamorphosis/LLM-Journey/app/foundations/transformers/page.tsx)
- **Layout**: Switch to `flex-col` with `gap-8` -> `gap-16` for breathing room.
- **Hero**: Use `GradientText` for "Decoder-Only Transformer". Center aligned with hero glow.
- **Chat**: Wrap `BaseLLMChat` in a specialized "Console" variant of `GlassCard` (darker background in light mode to mimic terminal?).
- **Info Sections**:
    - **Model Overview**: Convert `<ul>` to a Flex/Grid of mini-cards (Data Grid).
    - **Self-Attention**: `GlassCard` with "How it works" diagram placeholder or styled text.
    - **Training**: `GlassCard`.
    - **Generation**: `GlassCard`.
- **Animations**: Implement `framer-motion` `staggerChildren` for global page load.

### 3. Chat Component (`app/foundations/transformers/components/BaseLLMChat.tsx`)
#### [MODIFY] [BaseLLMChat.tsx](file:///home/kartik/Metamorphosis/LLM-Journey/app/foundations/transformers/components/BaseLLMChat.tsx)
- **Visuals**: Update Button and Input styles to match "Premium" aesthetic (gradient borders, glass backgrounds).
- **Safety**: Ensure `id="chat"`, `type="submit"`, `aria-label`s remain unchanged for E2E tests.

## Verification Plan

### Automated Tests
- **Lint & Build**: `pnpm lint && pnpm build` to ensure no syntax/type errors.
- **E2E Regression**: Run `npx playwright test transformer.spec.ts` to ensure core functionality (generation, OTel) works.

### Manual Verification
1.  **Visual Check**:
    - [ ] Glow primitives render correctly.
    - [ ] Glassmorphism blur is visible (check over colorful backgrounds).
    - [ ] Gradients match Home Page.
2.  **Responsiveness**:
    - [ ] Mobile: Cards stack vertically.
    - [ ] Desktop: Grid layout.
3.  **Themes**:
    - [ ] Light Mode: Clean, readable, subtle shadows.
    - [ ] Dark Mode: "Cyberpunk" feel, glows prominent.
4.  **Reduced Motion**:
    - [ ] Toggle system pref -> Verify animations are instant/disabled.

## Delegation Strategy
1.  **Frontend Agent**:
    - Create `GlassCard`, `GlowBackground`, `GradientText`.
    - Refactor `app/foundations/transformers/page.tsx` and `BaseLLMChat.tsx`.
    - Verify visual regression manually.
2.  **Testing Agent**:
    - Run E2E tests to confirm no regression.
