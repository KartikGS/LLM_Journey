# Handoff: Testing Agent -> Tech Lead

## Subject
`CR-012 - Transformers Narrative + Frontier Contract Test Sync`

## Preflight

### Assumptions I'm making
- New section and interaction contracts are intentionally anchored with `data-testid` values listed in the CR-012 testing handoff.
- `POST /api/frontier/base-generate` is the single backend contract for frontier interaction, with `mode: "live"` and `mode: "fallback"` success envelopes plus `400` validation errors.
- Existing tiny transformer interaction remains available and should continue to pass prior behavior checks.

### Risks not covered by current scope
- Sandboxed Playwright execution may still fail during `webServer` startup before browser tests run.
- The CR acceptance requirement for a same-prompt Tiny vs Frontier comparison artifact may be unmet after frontend refinement; this may force CR-related blocker classification even if automated tests otherwise pass.

### Questions for Tech Lead
- None.

## Preflight Status
- `clear-to-implement`

---

## CR-012 Testing Report

### [Status]
- `blocked`

### [Changes Made]
- Updated `__tests__/components/BaseLLMChat.test.tsx`:
  - Aligned tiny chat heading assertion with renamed UI framing (`Tiny Transformer Playground`).
- Added `__tests__/components/FrontierBaseChat.test.tsx`:
  - Added stable contract assertions for:
    - `frontier-form`
    - `frontier-input`
    - `frontier-submit`
    - `frontier-status`
    - `frontier-output`
  - Added behavior tests for:
    - `mode: "live"` response handling
    - `mode: "fallback"` response handling
    - backend validation error payload rendering
    - client-side empty prompt validation path
- Added `__tests__/api/frontier-base-generate.test.ts`:
  - Added route-level tests for:
    - invalid prompt -> HTTP `400` + controlled `invalid_prompt` payload
    - missing config -> HTTP `200` + `mode: "fallback"` envelope
    - configured upstream success -> HTTP `200` + `mode: "live"` envelope
- Updated `__tests__/e2e/transformer.spec.ts`:
  - Added CR-012 section/contract assertions for:
    - `transformers-how`
    - `transformers-try`
    - `transformers-frontier`
    - `transformers-issues`
    - `transformers-next-stage`
    - `transformers-comparison`
    - frontier interaction contracts
    - continuity contract to `/models/adaptation`
  - Added tiny interaction continuity verification.
  - Added explicit acceptance probe for same-prompt Tiny vs Frontier comparison artifact.

### [Verification Results]
- Command: `pnpm test`
  - Scope: full Jest suite
  - Execution Mode: `sandboxed`
  - Result: `PASS` (`16` suites, `104` tests)
- Command: `pnpm lint`
  - Scope: full lint suite
  - Execution Mode: `sandboxed`
  - Result: `PASS` (no ESLint errors; Next.js deprecation warning for `next lint`)
- Command: `pnpm exec tsc --noEmit`
  - Scope: full TypeScript check
  - Execution Mode: `sandboxed`
  - Result: `PASS`
- Command: `pnpm build`
  - Scope: production build
  - Execution Mode: `sandboxed`
  - Result: `PASS` (non-blocking OpenTelemetry bundling warnings)

#### Reproduction Matrix
| command | mode | browsers | result | classification note |
|---|---|---|---|---|
| `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts` | sandboxed | N/A (startup failure) | FAIL (`Process from config.webServer exited early`) | environmental (constrained startup) |
| `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts` | local-equivalent/unsandboxed | chromium, firefox, webkit | FAIL (`3 failed`, `6 passed`) | CR-related blocker: missing same-prompt comparison artifact |
| `pnpm test:e2e` | sandboxed | N/A (startup failure) | FAIL (`Process from config.webServer exited early`) | environmental (constrained startup) |
| `pnpm test:e2e` | local-equivalent/unsandboxed | chromium, firefox, webkit | FAIL (`3 failed`, `21 passed`) | CR-related blocker reproduced in full suite |

### [Dependency Consumption]
- No package/dependency changes.

### [Failure Classification]
- `CR-related`:
  - Same-prompt Tiny vs Frontier comparison artifact probe failed in all browsers.
  - Evidence:
    - `__tests__/e2e/transformer.spec.ts` assertion at line `28`.
    - Browser artifact logs:
      - `test-results/transformer-Transformer-Pa-7eaeb-frontier-contracts-critical-chromium/error-context.md`
      - `test-results/transformer-Transformer-Pa-7eaeb-frontier-contracts-critical-firefox/error-context.md`
      - `test-results/transformer-Transformer-Pa-7eaeb-frontier-contracts-critical-webkit/error-context.md`
- `environmental`:
  - Sandboxed Playwright startup failed before browser execution (`config.webServer exited early`), reproduced on both targeted and full E2E commands.
- `non-blocking warning`:
  - OTEL upstream refusal logs (`ECONNREFUSED 127.0.0.1:4318`) during E2E runs; user flows continued.
  - OpenTelemetry bundling warnings during `pnpm build`.
  - Next.js lint deprecation warning during `pnpm lint`.

### [BLOCKER / FEEDBACK]
- Decision needed: CR-012 acceptance requires a visible same-prompt Tiny vs Frontier comparison artifact, but current UI provides a generic comparison template instead.
- Impact:
  - E2E acceptance probe fails deterministically across chromium/firefox/webkit.
  - CR cannot be closed as complete under current acceptance contract.

### [Ready for Next Agent]
- `no` (awaiting Tech Lead direction on CR acceptance mismatch).

### [New Artifacts]
- Added:
  - `__tests__/api/frontier-base-generate.test.ts`
  - `__tests__/components/FrontierBaseChat.test.tsx`
- Updated:
  - `__tests__/components/BaseLLMChat.test.tsx`
  - `__tests__/e2e/transformer.spec.ts`
- Playwright failure artifacts:
  - `test-results/transformer-Transformer-Pa-7eaeb-frontier-contracts-critical-chromium/`
  - `test-results/transformer-Transformer-Pa-7eaeb-frontier-contracts-critical-firefox/`
  - `test-results/transformer-Transformer-Pa-7eaeb-frontier-contracts-critical-webkit/`

### [Follow-up Recommendations]
- Align frontend output with CR-012 same-prompt comparison requirement, then rerun:
  - `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts`
  - `pnpm test:e2e`

---

## CR-012 Follow-up Update (User-Directed Scope Change)

### [Status]
- `updated`

### [Change Applied]
- Removed same-prompt comparison artifact assertion from:
  - `__tests__/e2e/transformer.spec.ts`
- Reason:
  - User confirmed the frontend section was intentionally removed and requested matching test removal.

### [Verification Results]
- Command: `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts`
  - Scope: transformer spec only
  - Execution Mode: `sandboxed`
  - Browser Scope: N/A (startup failure)
  - Result: `FAIL` (`Process from config.webServer exited early`) -> environmental
- Command: `pnpm test:e2e -- __tests__/e2e/transformer.spec.ts`
  - Scope: transformer spec only
  - Execution Mode: `local-equivalent/unsandboxed`
  - Browser Scope: `chromium`, `firefox`, `webkit`
  - Result: `PASS` (`9 passed`)

### [Failure Classification Update]
- Prior CR-related blocker is cleared.
- Remaining targeted-run failure in sandbox mode is environmental startup only.

### [Ready for Next Agent]
- `yes`
