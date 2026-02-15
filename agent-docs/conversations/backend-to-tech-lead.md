# Report: Backend -> Tech Lead

## Subject
`CR-012 - Frontier Base Inference API + Fallback Contract`

## [Preflight]
### Assumptions
- Route contract is `POST /api/frontier/base-generate` with JSON body `{ "prompt": string }`.
- Live provider call uses server-only env config: `FRONTIER_API_URL`, `FRONTIER_MODEL_ID`, `FRONTIER_API_KEY`.
- Provider call uses an OpenAI-compatible payload/response shape, while frontend contract remains provider-agnostic.
- Missing config/quota/timeout/upstream failures should return deterministic `mode: "fallback"` responses.

### Adjacent Risks
- Configured provider endpoint may not be OpenAI-compatible.
- Provider error payloads vary by vendor; fallback reason mapping depends on status/message heuristics.
- Upstream latency spikes can increase fallback frequency under timeout bounds.

### Open Questions
- None that materially changed API contract or scope.

## [Status]
- `completed`

## [Scope Check]
- Handoff source: `agent-docs/conversations/tech-lead-to-backend.md`
- Files modified:
  - `app/api/frontier/base-generate/route.ts`
  - `.env.example`
  - `agent-docs/conversations/backend-to-tech-lead.md`
- Scope compliance:
  - [x] All modified files are in Backend ownership or explicitly delegated.
  - [x] No test files were created/modified unless explicitly delegated.

## [Changes Made]
- Added `POST /api/frontier/base-generate` route with:
  - strict request validation for `prompt` (non-empty, max length),
  - bounded upstream timeout (`FRONTIER_TIMEOUT_MS` with clamped defaults),
  - server-side provider call using env-only credentials,
  - graceful deterministic fallback responses for missing/invalid config, timeout, quota/auth/upstream failures, invalid provider payload, and empty provider output,
  - explicit base-model metadata labeling (`assistantTuned: false`, `adaptation: "none"`, descriptive note),
  - route-level tracing/logging instrumentation without secret exposure.
- Updated `.env.example` with `FRONTIER_*` contract and usage notes:
  - `FRONTIER_API_URL`
  - `FRONTIER_MODEL_ID`
  - `FRONTIER_API_KEY`
  - `FRONTIER_TIMEOUT_MS`

## [Verification Results]
- `pnpm lint`: `pass`
  - Evidence: `✔ No ESLint warnings or errors`
- `pnpm exec tsc --noEmit`: `pass`
  - Evidence: exit code `0`
- Behavioral evidence mapped to handoff DoD:
  - Allowed-path evidence:
    - Live success (configured provider, mock upstream):
      - HTTP `200`
      - Response includes `mode: "live"`, non-empty `output`, and base-model metadata.
      - Sample output: `"Live mock frontier response for: Explain why scaling matters"`
  - Blocked/error-path evidence:
    - Simulated quota failure (mock upstream `429`):
      - HTTP `200`
      - Response includes `mode: "fallback"`, deterministic curated `output`, and `reason.code: "quota_limited"`.
    - Invalid prompt (`"   "`):
      - HTTP `400`
      - Response includes controlled validation error: `{"error":{"code":"invalid_prompt",...}}`.

## [Out-of-Scope Requests Detected]
- `none`

## [Blockers]
- `none`

## [Failure Classification]
- CR-related failures:
  - none
- Pre-existing failures:
  - none observed in required verification commands
- Environmental/non-blocking notes:
  - Local runtime verification required temporary unsandboxed port binding for mock provider + Next dev server.

## [Deviations]
- `none`

## [Ready for Next Agent]
- `yes`

## [Follow-up Recommendations]
- Frontend handoff should consume the route contract as:
  - success: `mode: "live"`
  - resilience: `mode: "fallback"` + `reason`
  - validation error: HTTP `400` with `error.code`
