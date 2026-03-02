# Technical Plan - CR-001: Establish Standard Kit v1.0

## Technical Analysis
- **Current State**: Project uses basic Next.js setup with Tailwind CSS but lacks standard UI primitives, state management, and validation libraries.
- **Goal**: Standardize the toolset to prevent dependency bloat and ensure consistency.

## Critical Assumptions
- Next.js 15 is compatible with the requested library versions.
- `pnpm` is the package manager.
- Access to Internet for installation.

## Proposed Changes
### Dependencies
Install the following:
- `zod`, `zustand`
- `@radix-ui/react-slot`, `@radix-ui/react-dialog` (Starting primitives)
- `clsx`, `tailwind-merge`
- `framer-motion`
- `lucide-react`
- `react-markdown`, `remark-gfm`
- `shiki`

### Documentation (`agent-docs/technical-context.md`)
- Add "Standard Kit (Version 1.0)" section.
- Add Governance Warning.

### Code (`lib/utils.ts`)
- Implement `cn` utility using `clsx` and `tailwind-merge`.

## Architectural Invariants Check
- [x] **Constraint**: Sub-agents FORBIDDEN from installing packages -> Senior Dev will execute.
- [x] **Constraint**: Strict Versions -> Will use latest stable compatible with React 19/Next 15.

## Delegation & Execution Order
| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | Senior Developer | Install dependencies via `pnpm add` |
| 2 | Senior Developer | Update `technical-context.md` |
| 3 | Senior Developer | Create `lib/utils.ts` |
| 4 | Senior Developer | Verification (Build & Check) |

## Operational Checklist
- [x] **Environment**: No hardcoded values.
- [x] **Observability**: N/A for this change.
- [x] **Artifacts**: Check `.gitignore` (standard usually covers).
- [x] **Rollback**: `git revert` or manually remove packages.

## Definition of Done (Technical)
- [ ] Dependencies present in `package.json`.
- [ ] `technical-context.md` updated.
- [ ] `lib/utils.ts` created and valid.
- [ ] `pnpm build` passes.
