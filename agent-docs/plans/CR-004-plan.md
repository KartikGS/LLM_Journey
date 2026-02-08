# Technical Plan - CR-004: Navbar Vision Alignment

## Technical Analysis
- **Current State:** `navbar.tsx` uses old routes (`/transformer`, `/llm`, etc.) while `page.tsx` has already been updated with correct vision-aligned routes (`/foundations/transformers`, `/models/adaptation`, etc.)
- **Root Cause:** CR-003 updated home page content but missed the navbar component
- **Key Challenge:** Prevent future drift between navbar and home page by extracting shared stage data

## Discovery Findings
- **`navbar.tsx` (L7-19):** Contains hardcoded `navItems` array with 11 items (Home + 10 old routes)
- **`page.tsx` (L4-65):** Contains `journeyStages` array with correct 10-stage data
- **`navigation.spec.ts`:** Uses old routes (`/transformer`, `/llm`) - will fail after changes
- **`lib/` directory:** Has `config.ts` and `utils.ts` - good location for shared module
- **Icons:** `lucide-react` is in Standard Kit per `technical-context.md`

## Configuration Specifications
- **Shared Module Location:** `lib/journey-stages.ts`
- **Data Structure:**
  ```typescript
  interface JourneyStage {
    title: string;
    href: string;
    description: string;
    stage: number;
    icon: LucideIcon;
  }
  ```
- **Icon Mapping (per FR-2):**
  | Stage | Icon |
  |-------|------|
  | Transformers | `Cpu` |
  | Model Adaptation | `SlidersHorizontal` |
  | Context Engineering | `FileText` |
  | RAG | `Search` |
  | Agents & Tool Use | `Wrench` |
  | Multi-Agent Systems | `Users` |
  | MCP | `Plug` |
  | Eval & Observability | `BarChart3` |
  | Safety & Security | `Shield` |
  | Deployment | `Rocket` |

## Critical Assumptions
- `lucide-react` is already installed (verified in Standard Kit)
- Routes in `project-vision.md` are the source of truth
- Pages at new routes may not exist yet (404s expected but links should be correct)

## Proposed Changes

### 1. [NEW] `lib/journey-stages.ts`
- Create shared module with `journeyStages` array
- Include icon property for each stage
- Export type definitions

### 2. [MODIFY] `app/page.tsx`
- Import `journeyStages` from shared module
- Remove local `journeyStages` definition
- Keep `mentalModelPhases` local (home-page specific)

### 3. [MODIFY] `app/ui/navbar.tsx`
- Import `journeyStages` from shared module
- Replace hardcoded `navItems` with mapped data from shared module
- Add icon rendering for each nav item
- Keep "Home" item separate (not part of journey stages)

### 4. [MODIFY] `__tests__/e2e/navigation.spec.ts`
- Update route expectations to new paths
- `/transformer` → `/foundations/transformers`
- `/llm` → `/models/adaptation`

## Architectural Invariants Check
- [x] **No new dependencies** - Uses existing `lucide-react` from Standard Kit
- [x] **No drift risk** - Shared module ensures single source of truth
- [x] **Accessibility maintained** - Icons are decorative, text labels preserved

## Delegation & Execution Order
| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | **Frontend** | Create `lib/journey-stages.ts` with stage data, types, and icon imports |
| 2 | **Frontend** | Update `app/page.tsx` to import from shared module |
| 3 | **Frontend** | Update `app/ui/navbar.tsx` with shared data and icons |
| 4 | **Testing** | Update E2E navigation tests for new routes |

> [!NOTE]
> All changes are feature code. Per Tech Lead protocol, direct implementation is prohibited.

## Operational Checklist
- [x] **Environment**: No hardcoded values, paths from vision doc
- [x] **Observability**: N/A for this change
- [x] **Artifacts**: No new tool artifacts to gitignore
- [x] **Rollback**: Delete `lib/journey-stages.ts`, revert changes to 3 files

## Definition of Done (Technical)
- [ ] `lib/journey-stages.ts` exists with correct stage data and icons
- [ ] `page.tsx` imports from shared module (no local duplication)
- [ ] `navbar.tsx` displays 10 stages with correct routes and icons
- [ ] E2E tests reference new routes
- [ ] `pnpm build` passes
- [ ] `pnpm test` passes
- [ ] Visual verification: Navbar matches home page cards
