# CR-004: Navbar Vision Alignment

## Status
**Done** ✅ (BA Verified: 2026-02-08)

## Business Context
**User Need:** The navbar was not updated when CR-003 aligned the home page content with the project vision. Users clicking navbar links encounter 404 errors for most routes, and the terminology does not match the "From Tensors to Teams" narrative.

**Expected Value:**
- Eliminates broken navigation (404s) by aligning navbar routes with the vision-defined routes.
- Creates visual and conceptual consistency between navbar and main content.
- Reinforces the 10-stage learning journey structure throughout the application.

**Root Cause:** CR-003 updated `page.tsx` content but did not update `navbar.tsx`. This was likely an oversight since the navbar is in a separate component file.

## Functional Requirements

### FR-1: Align Navbar Items to Vision Roadmap
Update `navItems` array in `app/ui/navbar.tsx` to match `project-vision.md` roadmap:

| # | Current Name | Current Route | New Name | New Route |
|---|-------------|---------------|----------|-----------|
| 0 | Home | `/` | Home | `/` (unchanged) |
| 1 | Transformer | `/transformer` | Transformers (Foundations) | `/foundations/transformers` |
| 2 | LLM | `/llm` | Model Adaptation | `/models/adaptation` |
| 3 | Fine-tuning | `/fine-tuning` | Context Engineering | `/context/engineering` |
| 4 | Tools | `/tools` | RAG (Retrieval) | `/systems/rag` |
| 5 | RAG | `/rag` | Agents & Tool Use | `/agents/basic` |
| 6 | Agents | `/agents` | Multi-Agent Systems | `/agents/multi` |
| 7 | MCP | `/mcps` | MCP (Standardization) | `/protocols/mcp` |
| 8 | Deployment | `/deployment` | Eval & Observability | `/ops/observability` |
| 9 | Safety | `/safety` | Safety & Security | `/ops/safety` |
| 10 | Evaluation | `/evaluation` | Deployment | `/ops/deployment` |

### FR-2: Add Stage Icons/Logos to Each Navbar Item
Each stage in the navbar should have a distinctive icon/logo that visually represents the topic. This reinforces the learning journey and improves visual appeal.

> [!TIP]
> Use `lucide-react` icons as per the Standard Kit. Select icons that semantically represent each stage:
> - Transformers → Neural network / CPU / Layers
> - Model Adaptation → Settings / Sliders / Tune
> - Context Engineering → Text / Prompt / Edit
> - RAG → Search / Database / Book
> - Agents & Tool Use → Bot / Wrench / Hammer
> - Multi-Agent Systems → Users / Network / Share
> - MCP → Link / Plug / Standard
> - Eval & Observability → BarChart / Eye / Activity
> - Safety & Security → Shield / Lock / AlertTriangle
> - Deployment → Rocket / Cloud / Server

### FR-3: Refactor to Shared Stage Data (Mandatory)
Extract the `journeyStages` array from `page.tsx` into a shared module (e.g., `lib/journey-stages.ts`) that both `page.tsx` and `navbar.tsx` import. This prevents future drift between components.

## Non-Functional Requirements
- **Performance:** No regression. Navbar remains client-rendered with minimal JS.
- **Accessibility:** Maintain existing keyboard navigation and semantic structure.
- **Consistency:** Route names should match exactly between navbar and home page cards.

## System Constraints & Invariants
- **Constraint Mapping:**
  - `project-vision.md` is the source of truth for route URIs.
  - `page.tsx` already implements the correct stage data; navbar should mirror this.
- **Test Impact:** E2E tests in `__tests__/e2e/navigation.spec.ts` use OLD routes (`/transformer`, `/llm`) and will require updates.

## Acceptance Criteria
- [ ] **AC-1:** All 10 navbar items match titles and routes from `project-vision.md` roadmap.
- [ ] **AC-2:** Clicking each navbar item navigates to the correct route (no 404s for existing pages).
- [ ] **AC-3:** Navbar terminology matches home page stage cards exactly.
- [ ] **AC-4:** Each navbar item displays an appropriate icon/logo from `lucide-react`.
- [ ] **AC-5:** Stage data is defined in a shared module (`lib/journey-stages.ts` or similar).
- [ ] **AC-6:** Both `page.tsx` and `navbar.tsx` import from the shared module.
- [ ] **AC-7:** Build passes (`pnpm build`).
- [ ] **AC-8:** E2E tests pass or are updated to reflect new routes.
- [ ] **AC-9:** Unit tests pass (`pnpm test`).

## Verification Mapping
- **Development Proof:**
  - `pnpm build` succeeds.
  - `pnpm test` passes.
  - `pnpm exec playwright test __tests__/e2e/navigation.spec.ts` passes (after test updates).
- **User Validation:**
  - Visual inspection: Navbar items match the 10-stage roadmap.
  - Click `/foundations/transformers` in navbar → Page loads without 404.

## Dependencies
- **Blocks:** None
- **Blocked by:** None

## Notes
- The home page cards (`page.tsx`) already have the correct `journeyStages` array.
- **User Decision (2026-02-08):** Use logos/icons in sidebar instead of stage numbers.
- **User Decision (2026-02-08):** Shared stage data refactoring is mandatory (FR-3).

## Technical Analysis (filled by Tech Lead)
**Complexity:** Low
**Estimated Effort:** S
**Affected Systems:** Navbar (`app/ui/navbar.tsx`), Home page (`app/page.tsx`), E2E tests
**Implementation Approach:** Create shared module `lib/journey-stages.ts` with stage data and icons. Update both `page.tsx` and `navbar.tsx` to import from this shared module, eliminating duplication and preventing future drift.

**Plan:** See `/agent-docs/plans/CR-004-plan.md` for full execution plan.
