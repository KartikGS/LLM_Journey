# Report: Backend → Tech Lead

## Subject
`CR-018 — Generation API Hardening Parity: Backend Implementation`

## [Status]
`completed`

---

## [CR-017 Historical Note]
Prior CR-017 backend-to-tech-lead content replaced per Conversation File Freshness Rule.
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-017-plan.md` ✓
- Evidence 2 (prior CR closed): CR-017 status `Done` per `agent-docs/project-log.md` ✓
- Result: replacement allowed.

---

## [Preflight: Assumptions]
1. `lib/server/generation/shared.ts` does NOT yet exist — **confirmed** (created).
2. `parseTimeout`, `extractProviderErrorMessage`, and `mapProviderFailure` are byte-for-byte identical in both routes — **confirmed** (extracted to shared utility).
3. `ADAPTATION_SYSTEM_PROMPT` never appears in response payload, log field, or span attribute — **confirmed**.
4. `FRONTIER_API_KEY` never appears in response payload, log field, or span attribute — **confirmed**.
5. `safeMetric` is exported from `@/lib/otel/metrics` — **confirmed**.
6. `validateContentLength` is already imported in `middleware.ts` — **confirmed**.

## [Preflight: Adjacent Risks]
- Metric high-cardinality: Avoided by using only fixed `reason_code` labels for fallback counters.
- Middleware brittleness: `maxBodySize` set to 8192 (4x peak expected); `contentLengthRequired: false` set to handle browser fetch inconsistency.

## [Preflight: Open Questions]
- none

## [Preflight Status]
`clear-to-implement`

## [Scope Check]
- Handoff source: `agent-docs/conversations/tech-lead-to-backend.md`
- Files modified:
  - `lib/server/generation/shared.ts` (new)
  - `app/api/frontier/base-generate/route.ts`
  - `app/api/adaptation/generate/route.ts`
  - `middleware.ts`
  - `lib/otel/metrics.ts`
  - `agent-docs/api/adaptation-generate.md` (new)
- Scope compliance:
  - [x] All modified files are in Backend ownership or explicitly delegated.
  - [x] No test files were created/modified.

## [Changes Made]
1. **Extracted Shared Utilities**: Created `lib/server/generation/shared.ts` containing the shared logic for timeouts, error extraction, and failure mapping.
2. **Hardened Middleware**: Added entries for both generation routes in `middleware.ts` ensuring rate limiting and body size enforcement.
3. **Instrumented Metrics**: 
   - Added 4 new metrics to `lib/otel/metrics.ts`: `frontier_generate.requests`, `frontier_generate.fallbacks`, `adaptation_generate.requests`, `adaptation_generate.fallbacks`.
   - Instrumented both routes with `safeMetric()` calls for request counts and fallback reason tracking.
4. **Cleaned Duplicate Logic**: Refactored both generation routes to use the shared module; removed redundant timeout constants and local helper functions.
5. **Contract Documentation**: Created `agent-docs/api/adaptation-generate.md` to document the Stage 2 API contract.

## [Verification Results]
- `node -v`: `v20.20.0` (PASS)
- `pnpm lint`: `PASS` (✔ No ESLint warnings or errors)
- `pnpm exec tsc --noEmit`: `PASS` (exit code 0)
- `pnpm test`: `PASS` (134 tests passed)
  - **Command**: `pnpm test`
  - **Result**: `17 suites passed, 134 tests passed`
  - **Baseline Check**: 134 tests (matches post-CR-017 total).

## [AC-5 Security Confirmation]
- **Verified Clean**: The following span attributes and log fields were audited in both `frontier/base-generate` and `adaptation/generate`. None contain `FRONTIER_API_KEY` or `ADAPTATION_SYSTEM_PROMPT`.
- **Span Attributes**: `frontier.configured`, `frontier.model_id`, `frontier.provider`, `adaptation.strategy`, `adaptation.configured`, `adaptation.model_id`, `adaptation.mode`, `adaptation.reason_code`.
- **Log Fields**: `route`, `errorName`, `upstreamStatus`, `reasonCode`.

## [Out-of-Scope Requests Detected]
- none

## [Blockers]
- none

## [Failure Classification]
- `CR-related`: none
- `pre-existing`: none
- `environmental`: none

## [Deviations]
- none

## [Ready for Next Agent]
`yes`

## [Follow-up Recommendations]
- Testing Agent in Step 2 should verify the new middleware enforcement (429 and 413 responses) via E2E or targeted integration tests.
