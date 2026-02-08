# BA → Tech Lead: CR-004 Navbar Alignment

## Reading Confirmation
I have read: `AGENTS.md`, `roles/ba.md`, `project-vision.md`, `reasoning-principles.md`, `technical-context.md`.

## Summary
The navbar was not updated during CR-003. The home page content now aligns with the 10-stage "From Tensors to Teams" roadmap, but the navbar still uses the old terminology and routes.

### Problem
- **Navbar routes are broken**: `/transformer` → 404 (page is at `/foundations/transformers`)
- **Terminology mismatch**: Navbar says "LLM", home page says "Model Adaptation"
- **E2E tests affected**: `navigation.spec.ts` uses old routes

### User Decisions (2026-02-08)
1. **Icons, not numbers**: Add `lucide-react` icons to each navbar item (see FR-2 for suggestions)
2. **Shared data is mandatory**: Extract `journeyStages` to a shared module (FR-3)

### Scope
This is a **[S]** (Small) change:
- Create shared module for stage data (`lib/journey-stages.ts`)
- Update `page.tsx` to import from shared module
- Update `navbar.tsx` with new routes, names, and icons
- Update E2E tests to use new routes

## Requirement Document
See: `/agent-docs/requirements/CR-004-navbar-alignment.md`

## Visual Evidence
![Navbar misalignment](file:///home/kartik/.gemini/antigravity/brain/46744d3c-4ca4-45bb-862d-ba73a5653c17/home_page_navbar_alignment_1770556291245.png)

## Request
Please review CR-004 and create an implementation plan. The requirements are now finalized with user decisions.

