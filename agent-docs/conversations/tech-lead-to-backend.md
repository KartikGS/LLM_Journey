# Handoff: Tech Lead -> Backend Agent

## Subject
`CR-012 - Frontier Base Inference API + Fallback Contract`

## Status
`issued`

## Objective
Implement a secure server endpoint for Stage 1 frontier interaction that returns live base-model output when provider config is available, and deterministic fallback output when it is not.

## Contract Delta
- New route contract:
  - `POST /api/frontier/base-generate`
- New response-state contract for frontend consumer:
  - Live mode: `mode: "live"` with generated output and explicit base-model labeling metadata.
  - Fallback mode: `mode: "fallback"` with explanation + curated output for unavailable config/quota/timeout/upstream failures.
- No changes to existing telemetry routes or existing page routes.

## Rationale (Why)
CR-012 requires the Transformers stage to bridge from tiny local mechanics to frontier-scale behavior. That requires a backend failure boundary for provider calls so secrets stay server-side and the user experience remains stable under missing config or quota pressure.

## Constraints
- Technical constraints:
  - Use `pnpm` only.
  - No dependency installation.
  - Keep provider credentials server-side only (never in client bundle or response payload).
  - Validate request payload (`prompt`) and reject invalid input with controlled response.
  - Use bounded timeout behavior for upstream provider requests.
  - Use graceful fallback mode for recoverable provider/config failures.
- Security/architecture constraints:
  - Do not modify CSP/middleware/security-header behavior.
  - Do not alter telemetry proxy/token routes.
  - Do not log secrets.
- Ownership constraints:
  - Backend-owned code only in this handoff.
  - Do not modify UI/page code.
  - Do not create/modify tests in this handoff (Testing Agent owns test work unless separately delegated).

## Assumptions To Validate (Mandatory)
- Provider endpoint can be called from server via API key and JSON payload.
- Fallback response can be deterministic without external network dependency.
- Response contract can be kept provider-agnostic for frontend reuse.

## Out-of-Scope But Must Be Flagged (Mandatory)
- Any UI redesign or narrative-copy rewrite in `app/foundations/transformers/page.tsx`.
- Any request to install provider SDK packages.
- Any route rename or changes to existing continuity-link contracts.

## Scope
### Files to Modify
- `app/api/frontier/base-generate/route.ts`
  - Implement endpoint, request validation, provider call, timeout handling, fallback handling, and stable response shape.
- `.env.example`
  - Add `FRONTIER_*` configuration keys with concise usage notes.
- Optional backend utility/config file(s) as needed for clean parsing:
  - `lib/config.ts` and/or backend utility module under `lib/` for env/timeouts/response mapping.

## Definition of Done
- [ ] `POST /api/frontier/base-generate` exists with typed, validated request handling.
- [ ] Valid prompt + configured provider success path returns `mode: "live"` and non-empty output.
- [ ] Missing config/quota/timeout/upstream failure paths return `mode: "fallback"` with explanatory reason and safe output.
- [ ] Base-model (non-adapted/non-assistant) label metadata is included in response contract for frontend display.
- [ ] Secrets are not returned to client and not logged.
- [ ] `.env.example` documents required `FRONTIER_*` variables.
- [ ] `pnpm lint` passes.
- [ ] `pnpm exec tsc --noEmit` passes.

## Clarification Loop (Mandatory)
- Before implementation, post preflight assumptions/risks/questions in `agent-docs/conversations/backend-to-tech-lead.md`.
- If open questions can alter API contract or scope validity, pause and wait for Tech Lead response.

## Verification
1. Implement backend route and env contract updates.
2. Run `pnpm lint`.
3. Run `pnpm exec tsc --noEmit`.
4. Provide behavioral evidence for:
   - Live success path (when config is present),
   - Fallback path (when config missing or provider failure simulated),
   - Invalid prompt path (input validation).

## Reference Files
- `agent-docs/requirements/CR-012-transformers-tiny-to-frontier-bridge.md`
- `agent-docs/plans/CR-012-plan.md`
- `app/foundations/transformers/page.tsx`
- `agent-docs/architecture.md`
- `agent-docs/technical-context.md`

## Report Back
Write completion report to `agent-docs/conversations/backend-to-tech-lead.md` using:
- `agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md`

Include:
- status (`complete` or `blocked`)
- scope compliance
- changed files
- verification command results
- failure classification (`CR-related`, `pre-existing`, `environmental`, `non-blocking warning`)
- readiness for next agent

*Handoff created: 2026-02-15*
*Tech Lead Agent*
