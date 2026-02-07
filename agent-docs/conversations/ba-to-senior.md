# BA → Senior Developer Handoff: CR-003

## Context
The project vision (`project-vision.md`) was finalized after the home page and transformers page were created. This CR aligns those pre-existing pages with the canonical 10-stage learning narrative.

## The Problem (What & Why)
The current home page communicates a generic "comprehensive exploration of LLMs" message, but the project's actual mission is specific: **teach architectural ideas, not APIs**. The stage order, route paths, and descriptions don't match the finalized roadmap.

**Why this matters:** First impressions set expectations. A misaligned home page suggests a different learning journey than what we deliver.

## The Requirement
Full details: [CR-003-home-page-alignment.md](/agent-docs/requirements/CR-003-home-page-alignment.md)

**Summary:**
1. Rewrite hero section with vision-aligned messaging
2. Align all 10 stages (titles, descriptions, routes) to `project-vision.md`
3. Add "From Tensors to Teams" mental model framing
4. Add "Learn with Tiny, Build with Large" reference
5. Move `app/transformer/` → `app/foundations/transformers/`

## Scope Boundaries
- **IN SCOPE:** Home page content, transformer route path
- **OUT OF SCOPE:** Transformer page *content* (that's next CR), redirects from old routes

## Key Constraints
- Clean break on old routes (no redirects)
- Page must remain static/SSG
- Existing tests (`__tests__/page.test.tsx`) will need updating

## Acceptance Criteria (Summary)
| ID | Criteria |
|----|----------|
| AC-1 | Hero section has vision-aligned text |
| AC-2 | 10 stages match `project-vision.md` exactly |
| AC-3 | Mental model table/summary visible |
| AC-4 | Dual engine strategy referenced |
| AC-5 | `/foundations/transformers` works |
| AC-6 | `/transformer` returns 404 |
| AC-7 | `pnpm build` passes |
| AC-8 | Tests pass (updated) |

## Questions for Technical Analysis
1. Should the mental model table be a separate component or inline in `page.tsx`?
2. Any concerns with the nested route structure (`/foundations/transformers`)?

---
**Requesting:** Technical complexity analysis and implementation plan.
