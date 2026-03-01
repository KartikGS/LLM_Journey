# BA to Tech Lead Handoff

## Subject
`CR-024 — Generation Route Body Size Enforcement`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing BA handoff context: `CR-023`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-023-plan.md` ✓
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-023-purpose-driven-observability-refinement.md` status is `Done` ✓
- Result: replacement allowed for new CR context.

## Objective

CR-024 closes a body size enforcement gap on the two generation routes. The middleware is configured with `contentLengthRequired: false` for these routes, meaning requests without a `Content-Length` header bypass the 8192-byte size check entirely. `req.json()` then reads the full body into memory with no byte cap — Zod validation runs after parse, not before allocation.

This is a backend-only correctness fix. No API contracts, response shapes, UI, or route paths change.

## Linked Artifacts
- CR: `agent-docs/requirements/CR-024-generation-route-body-size-enforcement.md`

## Audience & Outcome Check
- **Human User intent:** Enforce the documented `maxBodySize: 8192` policy for generation routes robustly — regardless of header presence.
- **Developer-user impact:** The codebase correctly models the security posture it documents. The middleware config and actual enforcement are consistent.
- **Learner-user impact:** None — purely backend.

## The Core Decision You Must Make First

Two valid implementation approaches exist. You must choose one and document it in the plan:

**Option A — Require Content-Length in middleware:**
Set `contentLengthRequired: true` for both generation routes in `middleware.ts`. Requests without the header return `411`. Simple, one-line change in middleware config.

- Pro: Enforced before the route handler runs. Zero route-level changes.
- Con: Changes existing behavior for any client that omits `Content-Length` (rare for browser `fetch` with JSON body, but possible).
- **Test impact:** The existing test at `__tests__/middleware.test.ts:246` (`'passes when content-length header is absent for /api/frontier/base-generate'`) asserts the old behavior — it must be updated to assert `411` under Option A.

**Option B — Stream-level enforcement before `req.json()`:**
Add byte-limit enforcement in the route handlers (or a shared utility) before calling `req.json()`. Returns `413` only when the body actually exceeds the limit.

- Pro: Preserves behavior for no-body + no-header requests. More targeted.
- Con: Requires reading the stream before `req.json()`. Confirm Next.js App Router allows this without consuming the stream twice (likely requires reading to a buffer first, then parsing from that buffer — or `req.text()` + `JSON.parse()` pattern).
- **Test impact:** Existing test at `__tests__/middleware.test.ts:246` remains valid (it sends no body, so no size concern).

Before choosing, verify:
```
grep -rn "contentLengthRequired" middleware.ts
```
And confirm the stream-read approach is viable in Next.js App Router if you lean Option B.

## Reversal Risk

> **Reversal Risk — AC-1 & AC-3:** Before implementing, confirm whether the test at `__tests__/middleware.test.ts:246` needs to change under your chosen approach. Under Option A it MUST change (old assertion becomes wrong). Under Option B it MAY remain. Do not close the CR with a test asserting behavior the implementation no longer exhibits.

## Suggested Execution Mode

Single Backend sub-agent, single session. Both routes are affected identically. If Option A, this may be a middleware-only change with a test update. If Option B, route-level changes are needed for both routes.

## Acceptance Criteria Summary (full detail in CR-024)

- **AC-1:** POST to either generation route with body > 8192 bytes returns `4xx` regardless of `Content-Length` header state.
- **AC-2:** Rejection occurs without forwarding to upstream AI provider (no external call for rejected bodies).
- **AC-3:** New test: no `Content-Length` + body > 8192 → `4xx`, for both routes.
- **AC-4:** Existing valid-request and oversized-with-correct-header tests still pass.
- **AC-5:** `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` pass.
- **AC-6:** No route path, response contract, `data-testid`, or accessibility changes.

## Constraints

- No new npm packages.
- `maxBodySize` threshold stays at 8192 — enforce the existing policy, do not redefine it.
- TypeScript strict mode must remain satisfied.
- If Option A is chosen: update the middleware test at line 246 in the same CR.
