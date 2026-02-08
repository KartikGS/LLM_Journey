# CR-003: Home Page Vision Alignment

## Status
Done ✅ (BA Verified: 2026-02-07)

## Business Context
**User Need:** The home page and transformers route were created before the project vision was finalized. They need to be aligned with the canonical 10-stage learning narrative defined in `project-vision.md`.

**Expected Value:** 
- Establishes visual and conceptual consistency with the "From Tensors to Teams" mental model.
- Communicates the project's unique value proposition ("architectural ideas, not APIs").
- Sets correct expectations for the learning journey's structure and progression.

## Functional Requirements

### FR-1: Update Hero Section
1. Replace generic tagline with vision-aligned messaging that emphasizes "mechanics, trade-offs, and failure modes."
2. Include or reference the core quote: "Instead of teaching APIs, LLM Journey teaches the architectural ideas that led from transformers to agents."

### FR-2: Align 10-Stage Journey to Vision Roadmap
Update `journeyStages` array to match `project-vision.md` exactly:

| # | Current Title | New Title | New Route |
|---|--------------|-----------|-----------|
| 1 | Transformer | Transformers (Foundations) | `/foundations/transformers` |
| 2 | LLM | Model Adaptation | `/models/adaptation` |
| 3 | Fine-tuning | Context Engineering | `/context/engineering` |
| 4 | Tools | RAG (Retrieval) | `/systems/rag` |
| 5 | RAG | Agents & Tool Use | `/agents/basic` |
| 6 | Agents | Multi-Agent Systems | `/agents/multi` |
| 7 | MCP | MCP (Standardization) | `/protocols/mcp` |
| 8 | Deployment | Eval & Observability | `/ops/observability` |
| 9 | Safety | Safety & Security | `/ops/safety` |
| 10 | Evaluation | Deployment | `/ops/deployment` |

### FR-3: Add "Mental Model" Framing
Add a section that presents the "From Tensors to Teams" paradigm table from `project-vision.md`:
- Phase 1-3: The Model (How do we turn math into language?)
- Phase 4: Context (How do we stop the model from forgetting or hallucinating?)
- Phase 5-7: The System (How do we give the model hands and partners?)
- Phase 8-10: Production (How do we make it safe, fast, and measurable?)

### FR-4: Add "Dual Engine" Strategy
Reference the "Learn with Tiny, Build with Large" approach somewhere on the page (hero subtitle or dedicated callout).

### FR-5: Restructure Transformers Route
Move existing `/transformer` page to `/foundations/transformers`:
- Move `app/transformer/` folder to `app/foundations/transformers/`
- No content changes required in this CR

## Non-Functional Requirements
- **Performance:** No regression. Page must remain static/SSG.
- **Security:** N/A (static content only).
- **Accessibility:** Maintain existing semantic HTML structure (headings, links).

## System Constraints & Invariants
- **Constraint Mapping:**
  - `project-vision.md` is the source of truth for narrative and route URIs.
  - `tooling-standard.md`: Next.js 15 App Router conventions.
  - Existing home page tests in `__tests__/page.test.tsx` will need updating.
- **Design Intent:** Standard feature extension. This aligns pre-vision pages with the now-finalized project direction.

## Acceptance Criteria
- [ ] **AC-1:** Hero section contains vision-aligned messaging (no generic "comprehensive exploration" text).
- [ ] **AC-2:** All 10 stages match the titles, descriptions, and routes from `project-vision.md` roadmap.
- [ ] **AC-3:** "From Tensors to Teams" mental model table or summary is visible on the page.
- [ ] **AC-4:** "Learn with Tiny, Build with Large" is referenced on the page.
- [ ] **AC-5:** Navigating to `/foundations/transformers` loads the transformer page.
- [ ] **AC-6:** Old route `/transformer` returns 404 (clean break, no redirect).
- [ ] **AC-7:** Build passes (`pnpm build`).
- [ ] **AC-8:** Existing tests pass or are updated to reflect new content.

## Verification Mapping
- **Development Proof:**
  - `pnpm build` succeeds without errors.
  - `pnpm test` passes (with updated `__tests__/page.test.tsx`).
  - Visual verification that `/foundations/transformers` renders correctly.
- **User Validation:**
  - Human reviews home page and confirms alignment with `project-vision.md`.
  - Human clicks "Start Your Journey" and lands on `/foundations/transformers`.

## Dependencies
- **Blocks:** None
- **Blocked by:** None (vision is finalized)

## Notes
- User confirmed clean break is acceptable (no redirects from old routes).
- Transformer page *content* changes are out of scope; will be addressed in a subsequent CR.
- This CR addresses the first priority item in `project-log.md`: "Audit existing/needed pages against the 10-point Learning Narrative."

## Technical Analysis (filled by Tech Lead)
**Complexity:** [Low | Medium | High]
**Estimated Effort:** [S | M | L]
**Affected Systems:**
**Implementation Approach:**
