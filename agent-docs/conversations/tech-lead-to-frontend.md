# Tech Lead → Frontend Agent: CR-004 Navbar Alignment

## Objective
Align the navbar with the project vision by:
1. Creating a shared journey stages module
2. Updating `page.tsx` to import from the shared module
3. Updating `navbar.tsx` with correct routes, names, and icons

## Rationale (Why)
The navbar currently uses old routes (`/transformer`, `/llm`) while the home page was updated in CR-003 to use vision-aligned routes (`/foundations/transformers`, `/models/adaptation`). This causes:
- 404 errors when clicking navbar links
- Terminology mismatch between navbar and content
- Future drift risk with duplicated data

## Constraints
- Use `lucide-react` icons only (Standard Kit)
- Routes must match `project-vision.md` exactly
- Shared module must be single source of truth

## Tasks

### Task 1: Create `lib/journey-stages.ts`

Create a new file with:

```typescript
import { LucideIcon, Cpu, SlidersHorizontal, FileText, Search, Wrench, Users, Plug, BarChart3, Shield, Rocket, Home } from 'lucide-react';

export interface JourneyStage {
  title: string;
  href: string;
  description: string;
  stage: number;
  icon: LucideIcon;
}

export const journeyStages: JourneyStage[] = [
  {
    title: "Transformers (Foundations)",
    href: "/foundations/transformers",
    description: "How do we turn math into language? Start with attention, embeddings, and the decoder-only architecture.",
    stage: 1,
    icon: Cpu,
  },
  {
    title: "Model Adaptation",
    href: "/models/adaptation",
    description: "How do we specialize a pre-trained model? Explore fine-tuning, LoRA, and training trade-offs.",
    stage: 2,
    icon: SlidersHorizontal,
  },
  {
    title: "Context Engineering",
    href: "/context/engineering",
    description: "How do we design effective inputs? Master prompting patterns, templates, and context windows.",
    stage: 3,
    icon: FileText,
  },
  {
    title: "RAG (Retrieval)",
    href: "/systems/rag",
    description: "How do we stop the model from forgetting or hallucinating? Ground responses with external knowledge.",
    stage: 4,
    icon: Search,
  },
  {
    title: "Agents & Tool Use",
    href: "/agents/basic",
    description: "How do we give the model hands? Enable autonomous action through tool calling and planning.",
    stage: 5,
    icon: Wrench,
  },
  {
    title: "Multi-Agent Systems",
    href: "/agents/multi",
    description: "How do we give the model partners? Coordinate multiple agents for complex workflows.",
    stage: 6,
    icon: Users,
  },
  {
    title: "MCP (Standardization)",
    href: "/protocols/mcp",
    description: "How do we standardize model interactions? Learn the Model Context Protocol for interoperability.",
    stage: 7,
    icon: Plug,
  },
  {
    title: "Eval & Observability",
    href: "/ops/observability",
    description: "How do we measure what matters? Build evaluation pipelines and trace model behavior.",
    stage: 8,
    icon: BarChart3,
  },
  {
    title: "Safety & Security",
    href: "/ops/safety",
    description: "How do we build guardrails? Implement safety boundaries and security constraints.",
    stage: 9,
    icon: Shield,
  },
  {
    title: "Deployment",
    href: "/ops/deployment",
    description: "How do we go to production? Deploy, scale, and operate LLM applications reliably.",
    stage: 10,
    icon: Rocket,
  },
];

// Home navigation item (separate from journey stages)
export const homeNavItem = {
  title: "Home",
  href: "/",
  icon: Home,
};
```

### Task 2: Update `app/page.tsx`

1. Import `journeyStages` from `@/lib/journey-stages`
2. Remove the local `journeyStages` array definition (lines 4-65)
3. Keep `mentalModelPhases` local (it's home-page specific)
4. Icon property is available but not needed in home page currently

### Task 3: Update `app/ui/navbar.tsx`

1. Import `journeyStages` and `homeNavItem` from `@/lib/journey-stages`
2. Remove the hardcoded `navItems` array (lines 7-19)
3. Update the nav item rendering to:
   - Show Home first (from `homeNavItem`)
   - Map over `journeyStages` for the 10 stages
   - Display each icon inline with the title
4. Example icon rendering:
   ```tsx
   <stage.icon className="w-4 h-4 inline-block mr-2" />
   ```

## Definition of Done
- [ ] `lib/journey-stages.ts` exists with correct data and types
- [ ] `page.tsx` imports from shared module, no duplicate data
- [ ] `navbar.tsx` renders all 10 stages with icons
- [ ] Navbar items match home page card titles exactly
- [ ] `pnpm build` passes
- [ ] Visual: Icons appear next to each nav item

## Report
After completion, write your work report in `/agent-docs/conversations/frontend-to-tech-lead.md`.
