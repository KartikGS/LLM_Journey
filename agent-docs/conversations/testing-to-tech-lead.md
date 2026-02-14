# Handoff: Testing Agent -> Tech Lead

## Subject
`CR-010 - E2E Baseline Stabilization (Landing + Transformer Contract Alignment)`

## Preflight

### Assumptions I'm making
- Home CTA contract is `Start Your Journey →` linking to `/foundations/transformers`.
- Landing page can be validated via stable role/href contracts without depending on `div.grid > a`.
- Transformer generation completion should be validated by durable post-submit behavior, not transient loading text visibility.

### Risks not covered by current scope
- Constrained/sandboxed execution can fail before Playwright webServer startup.
- OTEL upstream at `127.0.0.1:4318` may refuse connection; this is non-blocking if user-visible flow remains intact.

### Questions for Tech Lead
- None.

---

## CR-010 - E2E Baseline Stabilization Report

### [Status]
- Completed

### [Changes Made]
- Updated `__tests__/e2e/landing-page.spec.ts`:
  - Replaced stale CTA destination assertion from `/transformer` to `/foundations/transformers`.
  - Removed brittle structural selector dependency (`div.grid > a`).
  - Added stable href-contract assertions for journey links (`/models/adaptation`, `/context/engineering`, `/ops/deployment`).
- Updated `__tests__/e2e/transformer.spec.ts`:
  - Removed brittle transient `Generating...` visibility dependency.
  - Added durable generation assertions: submit button disabled->enabled cycle and response container visibility/text after generation.
  - Preserved OTEL request emission verification.
- `__tests__/e2e/navigation.spec.ts`:
  - No file change required.
  - Verified as targeted regression check.

### [Verification Results]

#### Reproduction Matrix
| Command | Mode | Browsers | Result | Classification |
|---|---|---|---|---|
| `pnpm test:e2e -- __tests__/e2e/landing-page.spec.ts` | sandboxed | N/A (webServer startup) | FAIL (`Process from config.webServer exited early`) | environmental (constrained execution) |
| `pnpm test:e2e -- __tests__/e2e/navigation.spec.ts` | sandboxed | N/A (webServer startup) | FAIL (`Process from config.webServer exited early`) | environmental (constrained execution) |
| `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts` | sandboxed | N/A (webServer startup) | FAIL (`Process from config.webServer exited early`) | environmental (constrained execution) |
| `pnpm test:e2e` | sandboxed | N/A (webServer startup) | FAIL (`Process from config.webServer exited early`) | environmental (constrained execution) |
| `pnpm test:e2e -- __tests__/e2e/landing-page.spec.ts` | local-equivalent/unsandboxed | chromium, firefox, webkit | PASS (`3 passed`) | CR-related assertions validated |
| `pnpm test:e2e -- __tests__/e2e/navigation.spec.ts` | local-equivalent/unsandboxed | chromium, firefox, webkit | PASS (`12 passed`) | regression check passed |
| `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts` | local-equivalent/unsandboxed | chromium, firefox, webkit | PASS (`3 passed`) | durable transformer assertions validated |
| `pnpm test:e2e` | local-equivalent/unsandboxed | chromium, firefox, webkit | PASS (`18 passed`) | suite baseline stable |

### [Dependency Consumption]
- No dependency or runtime config changes.

### [Failure Classification]
- CR-related:
  - Fixed landing CTA route assertion drift.
  - Fixed landing selector strategy drift (removed structural dependency).
  - Fixed transformer generation assertion drift (removed transient text dependence).
- Environmental:
  - Sandboxed runs consistently failed before test execution (`config.webServer exited early`).
- Non-blocking warning:
  - OTEL upstream refusal (`ECONNREFUSED 127.0.0.1:4318`) observed in unsandboxed runs; expected under observability failure-boundary and did not affect user-visible flow/test pass.

### [Ready for Next Agent]
- Yes.

### [New Artifacts]
- Updated test files:
  - `__tests__/e2e/landing-page.spec.ts`
  - `__tests__/e2e/transformer.spec.ts`
- Playwright artifacts from intermediate failed attempts exist under `test-results/navigation-*` and `test-results/landing-page-*`.

### [Follow-up Recommendations]
- Keep CR verification evidence sourced from local-equivalent/unsandboxed E2E runs in this environment until sandbox webServer startup behavior is resolved.

