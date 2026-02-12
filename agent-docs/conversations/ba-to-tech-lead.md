# Tech Lead Prompt: Execute CR-006

**Context**: 
The Transformer Page is functionally correct but visually flat. We need to align it with the new premium design language established in CR-005.

**Goal**:
Implement the visual overhaul defined in `agent-docs/requirements/CR-006-transformer-page.md`.

**Key Directives**:
1.  **Read the CR**: Review `CR-006` for specific visual requirements (Glassmorphism, Gradients, Cards).
2.  **Reference CR-005**: Look at the logic in `app/page.tsx` and `browser-support-fallback.tsx` (or the previous plan `CR-005-plan.md`) for implementation patterns.
3.  **Client Component Strategy**: You authorize the conversion of this page to a Client Component to support `framer-motion`.
4.  **No Logic Changes**: Ensure the underlying `BaseLLMChat` functionality remains untouched and functional.
5.  **Plan First**: Create `plans/CR-006-plan.md` before coding.

**Hand-off**:
Please assume the role of **Tech Lead** and execute this plan.
