# Technical Plan - CR-003: Home Page Vision Alignment

## Technical Analysis
- **Current State**: Home page (`app/page.tsx`) has a 10-stage `journeyStages` array with titles, routes, and descriptions that predate the finalized project vision.
- **Gap**: Stages don't match `project-vision.md` roadmap (different titles, routes, descriptions).
- **Structural Change**: Transformer route at `/transformer` needs to move to `/foundations/transformers`.

### Key Technical Challenges
1. Updating `journeyStages` array to match vision exactly.
2. Moving folder `app/transformer/` → `app/foundations/transformers/`.
3. Adding new content (Mental Model table, Dual Engine reference).
4. Updating tests to reflect new route.

---

## Discovery Findings

### Current Home Page Structure (`app/page.tsx`)
- **Hero Section** (lines 70-78): Generic tagline needs replacement.
- **Main CTA** (lines 81-91): Links to `/transformer` → needs update to `/foundations/transformers`.
- **Journey Stages** (lines 4-65): 10-stage array with wrong titles/routes.
- **Stage Grid** (lines 105-123): Renders the array.

### Current Folder Structure
```
app/
├── page.tsx           # Home page (needs content update)
├── transformer/       # Needs to move to foundations/transformers/
│   ├── components/
│   └── page.tsx
└── ...
```

### Existing Tests (`__tests__/page.test.tsx`)
- Checks for `h1` with "LLM Journey"
- Checks "Start Your Journey" link has `href="/transformer"` → needs update to `/foundations/transformers`

---

## Configuration Specifications
N/A - This CR involves content and structural changes only, no config modifications.

---

## Critical Assumptions
1. Next.js App Router supports nested route folders (`app/foundations/transformers/`).
2. Moving folder is sufficient for route change - no additional routing config needed.
3. No redirects from old routes (confirmed in CR scope).
4. Page remains static/SSG (no dynamic data fetching added).

---

## Proposed Changes

### Component 1: Home Page Content (`app/page.tsx`)

#### FR-1: Update Hero Section
- Replace generic tagline with vision-aligned messaging.
- Include reference to "mechanics, trade-offs, and failure modes" and/or core quote.

#### FR-2: Align journeyStages Array
Update to match `project-vision.md`:

| # | New Title | New Route | Description Focus |
|---|-----------|-----------|-------------------|
| 1 | Transformers (Foundations) | `/foundations/transformers` | Math → Language |
| 2 | Model Adaptation | `/models/adaptation` | Pre-trained → Specialized |
| 3 | Context Engineering | `/context/engineering` | Input design |
| 4 | RAG (Retrieval) | `/systems/rag` | Memory/grounding |
| 5 | Agents & Tool Use | `/agents/basic` | Hands for the model |
| 6 | Multi-Agent Systems | `/agents/multi` | Partners for the model |
| 7 | MCP (Standardization) | `/protocols/mcp` | Protocol standards |
| 8 | Eval & Observability | `/ops/observability` | Measurement |
| 9 | Safety & Security | `/ops/safety` | Guardrails |
| 10 | Deployment | `/ops/deployment` | Production readiness |

#### FR-3: Mental Model Section
Add "From Tensors to Teams" paradigm table inline (single-use, no component extraction needed).

#### FR-4: Dual Engine Reference
Add "Learn with Tiny, Build with Large" callout to hero section or dedicated element.

#### FR-5: Update Main CTA
Change link from `/transformer` → `/foundations/transformers`.

---

### Component 2: Route Restructure

#### Move Transformer Folder
```
app/transformer/ → app/foundations/transformers/
```
- Create `app/foundations/` directory.
- Move entire `transformer/` folder as `transformers/`.
- No content changes to the moved page (out of scope per CR).

---

### Component 3: Test Updates (`__tests__/page.test.tsx`)

Update test expectation:
```diff
- expect(link).toHaveAttribute('href', '/transformer')
+ expect(link).toHaveAttribute('href', '/foundations/transformers')
```

Optionally add tests for new content visibility (Mental Model table, vision messaging).

---

## Architectural Invariants Check
- [x] **Observability Safety**: N/A - No telemetry changes.
- [x] **Security Boundaries**: N/A - Static content only.
- [x] **SSG Requirement**: No dynamic data fetching added.

---

## Delegation & Execution Order

| Step | Agent | Task Description |
|:-----|:------|:-----------------|
| 1 | **Frontend** | Move `app/transformer/` → `app/foundations/transformers/` |
| 2 | **Frontend** | Update `app/page.tsx` with vision-aligned content (hero, stages, mental model, dual engine) |
| 3 | **Testing** | Update `__tests__/page.test.tsx` with new route expectation |

**Rationale for order**: File structure first, then content, then tests. This ensures tests verify the final state.

---

## Operational Checklist
- [x] **Environment**: No hardcoded values introduced.
- [x] **Observability**: N/A for this CR.
- [x] **Artifacts**: No new tool-generated artifacts.
- [x] **Rollback**: Revert the 3 file changes + restore moved folder.

---

## Verification Plan

### Automated Tests
1. **Unit Tests**: `pnpm test`
   - Verifies updated `__tests__/page.test.tsx` passes.
   
2. **Build Validation**: `pnpm build`
   - Verifies no build errors with new route structure.

### Manual Verification
1. Run `pnpm dev` (already running on port 3001).
2. Navigate to `http://localhost:3001/` - verify:
   - Hero section has vision-aligned messaging.
   - "Start Your Journey" button is visible.
   - 10 stages with correct titles are displayed.
   - Mental model table is visible.
   - "Learn with Tiny, Build with Large" reference is visible.
3. Click "Start Your Journey" → should navigate to `/foundations/transformers`.
4. Navigate to `http://localhost:3001/foundations/transformers` → should load transformer page.
5. Navigate to `http://localhost:3001/transformer` → should return 404.

---

## Definition of Done (Technical)
- [ ] Hero section contains vision-aligned text (AC-1)
- [ ] All 10 stages match `project-vision.md` (AC-2)
- [ ] Mental model table visible (AC-3)
- [ ] Dual engine strategy referenced (AC-4)
- [ ] `/foundations/transformers` works (AC-5)
- [ ] `/transformer` returns 404 (AC-6)
- [ ] `pnpm build` passes (AC-7)
- [ ] Tests pass (AC-8)

---

## Answers to BA Questions

### Q1: Mental model table - separate component or inline?
**Decision**: Inline in `page.tsx`.  
**Rationale**: Single-use element, simple structure. Component extraction would add unnecessary abstraction without reuse benefit. If mental model appears on multiple pages in future, we can extract then.

### Q2: Concerns with nested route structure (`/foundations/transformers`)?
**Decision**: No concerns.  
**Rationale**: Next.js App Router natively supports nested folder structures. The path `app/foundations/transformers/page.tsx` automatically maps to `/foundations/transformers`. No additional routing configuration required.
