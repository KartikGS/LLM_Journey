# Tech Lead → Testing Agent: CR-004 Navigation Tests Update

## Objective
Update E2E navigation tests to use the new vision-aligned routes.

## Rationale (Why)
CR-004 changes navbar routes from old paths to new paths. The existing E2E tests in `navigation.spec.ts` reference old routes:
- `/transformer` → Now `/foundations/transformers`
- `/llm` → Now `/models/adaptation`

Without this update, E2E tests will fail.

## Constraints
- Maintain `@smoke` tags on tests
- Do NOT add new tests (out of scope for CR-004)
- Route changes per `project-vision.md`:
  | Old Route | New Route |
  |-----------|-----------|
  | `/transformer` | `/foundations/transformers` |
  | `/llm` | `/models/adaptation` |

## Task

### Update `__tests__/e2e/navigation.spec.ts`

1. **Test 1:** "should navigate from Home to Transformer"
   - Change URL expectation: `/transformer` → `/foundations/transformers`
   - The "Start Your Journey →" link already points to correct route (updated in page.tsx)
   - Update the page content expectation if needed (the page may not exist yet - adjust test accordingly)

2. **Test 2:** "should navigate from Transformer to LLM"
   - Change `page.goto('/transformer')` → `page.goto('/foundations/transformers')`
   - Change URL expectation: `/llm` → `/models/adaptation`
   - Remove or update the "Explore LLM →" link check (original link may not exist)

> [!WARNING]
> The actual pages at `/foundations/transformers` and `/models/adaptation` may not exist yet (will 404). The tests should verify navigation occurs, but may need adjustment if page content doesn't exist.

## Definition of Done
- [ ] E2E tests reference new routes
- [ ] `pnpm exec playwright test __tests__/e2e/navigation.spec.ts` passes (or clearly shows expected 404 behavior)
- [ ] No regressions in other E2E tests

## Dependency
Wait for Frontend Agent to complete their tasks first, as `page.tsx` updates will affect the "Start Your Journey" link behavior.

## Report
After completion, write your work report in `/agent-docs/conversations/testing-to-tech-lead.md`.
