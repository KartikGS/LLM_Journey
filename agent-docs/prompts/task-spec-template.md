# Task Specification Template

## Metadata
- **Task ID**: <Unique identifier, e.g., TASK-001>
- **Owner**: <Agent role or human>
- **Status**: PLANNED | IN_PROGRESS | BLOCKED | REVIEW | DONE
- **Priority**: P0 (critical) | P1 (high) | P2 (medium) | P3 (low)
- **Estimated Effort**: S (< 2h) | M (2-8h) | L (> 8h)

## Goal
<One sentence objective - specific and measurable>

## Context
**Why this matters:**
<Connection to project vision>

**Related work:**
- PRs: <links>
- Issues: <links>
- Docs: <links>

**Files involved:**
- Read: <files that provide context>
- Modify: <files that will change>
- Create: <files that will be added>

## Prerequisites
**Must be done first:**
- [ ] <Dependency 1>
- [ ] <Dependency 2>

**Must be read first:**
- [ ] docs/AGENTS.md
- [ ] docs/roles/<relevant-role>.md
- [ ] <specific docs for this task>

## Implementation Steps
1. **<Step 1 name>**
   - Action: <what to do>
   - Verification: <how to verify it worked>

2. **<Step 2 name>**
   - Action: <what to do>
   - Verification: <how to verify it worked>

## Constraints
**Must do:**
- <Required action 1>
- <Required action 2>

**Must NOT do:**
- <Forbidden action 1>
- <Forbidden action 2>

**Ask if unclear:**
- <Ambiguous scenario 1>
- <Ambiguous scenario 2>

## Acceptance Criteria
- [ ] **Functional**: <Feature works as described>
- [ ] **Tests**: All tests pass (`pnpm test`)
- [ ] **Code Quality**: Follows docs/development/style-guide.md
- [ ] **Documentation**: Relevant docs updated
- [ ] **Responsive**: Works on mobile/tablet/desktop (if UI)
- [ ] **Observable**: OTEL traces present (if applicable)
- [ ] **Project Log**: docs/project-log.md updated with completion

## Verification Commands
```bash
# Run these before marking task complete
pnpm test                    # All tests pass
pnpm lint                    # No lint errors
pnpm typecheck              # No type errors
pnpm build                  # Builds successfully
```

## Rollback Plan
If this breaks production:
<Steps to revert or fix quickly>

## Example

See: docs/prompts/examples/add-dark-mode.md