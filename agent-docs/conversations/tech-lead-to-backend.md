# Handoff: Tech Lead → Backend Agent

## Subject
`CR-022 — Adaptation Page Upgrade and Cleanup: Dead-Code Cleanup`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing Backend handoff context: `CR-021`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-021-plan.md` ✓
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-021-frontier-response-streaming.md` status `Done` per `agent-docs/project-log.md` ✓
- Result: replacement allowed for new CR context.

---

## Exact Artifact Paths (Mandatory)
- Requirement: `agent-docs/requirements/CR-022-adaptation-page-upgrade-and-cleanup.md`
- Plan: `agent-docs/plans/CR-022-plan.md`
- Upstream report (if sequential): N/A — this is a parallel step.
- Report back to: `agent-docs/conversations/backend-to-tech-lead.md`

---

## Objective

Remove two confirmed dead-code items from the generation layer:
1. The unreachable `invalid_config` branch and its associated type members from both generation routes and the shared type utility.
2. The unused `ADAPTATION_API_URL` constant from the adaptation API test file.

These are pure housekeeping changes — no behavioral changes to any API contract, no observable output change to callers.

## Rationale (Why)

The `invalid_config` branch was never reachable: `loadAdaptationConfig()` and `loadFrontierConfig()` only ever set `issueCode: 'missing_config'` when unconfigured. The branch was kept as forward-compatible scaffolding but no feature has ever used it. Removing it reduces false complexity for future maintainers and eliminates TypeScript type noise in the `FallbackReasonCode` union.

`ADAPTATION_API_URL` was a leftover constant from an earlier test design that no longer uses it — `setConfigEnv()` sets only `FRONTIER_API_KEY`. The linter emits a `no-unused-vars` or equivalent warning for it.

---

## Known Environmental Caveats

- **Node.js runtime**: System runtime may be below `>=20.x`. Run `node -v` first. If below 20.x, activate via `nvm use 20`. If nvm unavailable, classify as `environmental` in your report.
- **pnpm**: Use `pnpm` exclusively. Never `npm` or `yarn`.
- **Live-path availability**: `no` — API key is not required for this task. All changes are to dead-code paths and test constants. No live provider calls are exercised.

---

## Constraints

### Technical Constraints
- **No behavioral changes**: The removal of `invalid_config` must not alter the behavior of any path that is actually reached. The `!config.configured` block in both routes must still correctly return a `missing_config` fallback — only the dead `issueCode === 'invalid_config'` conditional is removed.
- **No API contract changes**: No route response shapes change. The `FallbackReasonCode` union change is an internal type only; no API doc update is required.
- **TypeScript strict mode**: All type changes must satisfy `tsc --noEmit`. Verify the narrowed type is sufficient.
- **No new packages**.

### Ownership Constraints
- **Files in scope** (explicit delegation):
  - `lib/server/generation/shared.ts`
  - `app/api/adaptation/generate/route.ts`
  - `app/api/frontier/base-generate/route.ts`
  - `__tests__/api/adaptation-generate.test.ts`
- **API route unit tests** (`__tests__/api/`) are explicitly delegated to Backend for this CR (consistent with CR-021 delegation model — Backend owns the test files for the routes it maintains).
- **Do NOT modify**: Any frontend component, `page.tsx`, any other test file, any config file, or `testing-contract-registry.md`.

---

## Assumptions To Validate (Mandatory)

- **Live-path availability**: `no` — API key not required.
- Assumption 1: `invalid_config` is not referenced anywhere else in the codebase. Run `grep -rn "invalid_config" app/ lib/ __tests__/` before starting. Expected: only in the 4 locations identified below (shared.ts type union + 2 routes + nowhere in test files except if any test specifically exercises this code path — which would be dead).
- Assumption 2: `ADAPTATION_API_URL` is declared exactly once at line 109 of `__tests__/api/adaptation-generate.test.ts` and is not referenced anywhere else in the file. Verify by reading the full file before editing.
- Assumption 3: After removing `'invalid_config'` from `FallbackReasonCode`, no other file references `FallbackReasonCode` with the assumption that `'invalid_config'` is a valid value. Run `grep -rn "FallbackReasonCode"` to verify all usages.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

- If `grep` reveals `invalid_config` is referenced in any file outside the four scoped files above, **STOP** and report before proceeding. Do not expand scope without explicit Tech Lead approval.
- If any existing test currently asserts `reason.code === 'invalid_config'`, that would be a pre-existing test that covers an unreachable path. Flag it as a pre-existing quality concern (Tech Lead Recommendation class per the deviation rubric) — do not silently delete the test assertion without documenting it.
- Do NOT touch the `invalid_config` handling in `AdaptationChat.tsx` (client-side) — the client only reads error codes from HTTP error responses (`invalid_json`, `invalid_prompt`, `invalid_strategy`). The `invalid_config` being removed is server-side only.

---

## Scope

### Changes — `lib/server/generation/shared.ts`

**Current (line 6–14):**
```ts
export type FallbackReasonCode =
    | 'missing_config'
    | 'invalid_config'
    | 'quota_limited'
    | 'timeout'
    | 'upstream_auth'
    | 'upstream_error'
    | 'invalid_provider_response'
    | 'empty_provider_output';
```

**After removal:**
```ts
export type FallbackReasonCode =
    | 'missing_config'
    | 'quota_limited'
    | 'timeout'
    | 'upstream_auth'
    | 'upstream_error'
    | 'invalid_provider_response'
    | 'empty_provider_output';
```

Remove the `| 'invalid_config'` line only.

### Changes — `app/api/adaptation/generate/route.ts`

**1. Narrow the `AdaptationConfig.issueCode` type (line 75):**

Current:
```ts
issueCode?: 'missing_config' | 'invalid_config';
```
After:
```ts
issueCode?: 'missing_config';
```

**2. Remove the dead `invalid_config` branch (lines ~196–206 in the `!config.configured` block):**

Current logic:
```ts
if (!config.configured) {
    const issueCode = config.issueCode ?? 'missing_config';
    const issueMessage =
        issueCode === 'invalid_config'
            ? 'Adaptation provider configuration is invalid. Showing deterministic fallback output.'
            : 'Adaptation provider is not configured. Showing deterministic fallback output.';
    // ...
}
```

After removal (replace the conditional with the `'missing_config'` message directly):
```ts
if (!config.configured) {
    const issueCode = config.issueCode ?? 'missing_config';
    const issueMessage = 'Adaptation provider is not configured. Showing deterministic fallback output.';
    // ...
}
```

The `issueCode` variable can be retained (it's still used for `span.setAttribute` and the metrics counter). Only the `issueMessage` ternary is removed.

### Changes — `app/api/frontier/base-generate/route.ts`

**1. Narrow the `FrontierConfig.issueCode` type (line 67):**

Current:
```ts
issueCode?: 'missing_config' | 'invalid_config';
```
After:
```ts
issueCode?: 'missing_config';
```

**2. Remove the dead `invalid_config` branch (lines ~207–211 in the `!frontierConfig.configured` block):**

Current logic:
```ts
if (!frontierConfig.configured) {
    const issueCode = frontierConfig.issueCode ?? 'missing_config';
    const issueMessage = issueCode === 'invalid_config'
        ? 'Frontier provider configuration is invalid. Showing deterministic fallback output.'
        : 'Frontier provider is not configured. Showing deterministic fallback output.';
    // ...
}
```

After removal:
```ts
if (!frontierConfig.configured) {
    const issueCode = frontierConfig.issueCode ?? 'missing_config';
    const issueMessage = 'Frontier provider is not configured. Showing deterministic fallback output.';
    // ...
}
```

### Changes — `__tests__/api/adaptation-generate.test.ts`

**Remove the unused constant declaration (line 109):**

Current (inside the `describe` block):
```ts
const ADAPTATION_API_URL = 'https://router.huggingface.co/featherless-ai/v1/chat/completions';
```

Delete this line entirely. Do NOT replace it with anything. Verify no other line in the file references `ADAPTATION_API_URL` before deleting.

---

## Definition of Done

- [ ] AC-7: No `invalid_config` branch or `'invalid_config'` type member remains in `shared.ts`, `adaptation/generate/route.ts`, or `frontier/base-generate/route.ts`. `pnpm exec tsc --noEmit` passes.
- [ ] AC-8: No `ADAPTATION_API_URL` constant in `__tests__/api/adaptation-generate.test.ts`. `pnpm lint` passes.
- [ ] AC-9: No `data-testid` renames or removals introduced (Backend does not touch frontend files).
- [ ] Existing `missing_config` fallback behavior is unchanged — the `issueCode` variable is still emitted to span attributes and metrics counter.
- [ ] `pnpm lint` passes with zero errors.
- [ ] `pnpm exec tsc --noEmit` passes with zero errors.
- [ ] No debug artifacts (`console.log`, commented-out blocks, TODO markers) in any modified file.

---

## Negative Space Rule (AC-7 Verification)

The Definition of Done for AC-7 must verify BOTH directions:
- [ ] **Positive**: `grep -n "invalid_config" lib/server/generation/shared.ts app/api/adaptation/generate/route.ts app/api/frontier/base-generate/route.ts` returns zero matches.
- [ ] **Negative**: `missing_config` fallback path still works — the `!config.configured` block still returns a fallback response with `reason.code: 'missing_config'`. Existing unit tests cover this (all three `missing_config` test cases in `adaptation-generate.test.ts` must still pass).

---

## Execution Checklist (Mandatory)

Before starting:
- [ ] Read this handoff completely.
- [ ] Read the plan at `agent-docs/plans/CR-022-plan.md`.
- [ ] Run `grep -rn "invalid_config" app/ lib/ __tests__/` to confirm scope matches the 3 scoped source files (not test references — verify).
- [ ] Read `__tests__/api/adaptation-generate.test.ts` fully before editing it.
- [ ] Write preflight note to `backend-to-tech-lead.md` (assumptions confirmed + any open questions).

Before reporting:
- [ ] All Definition of Done items checked.
- [ ] `pnpm lint` passes.
- [ ] `pnpm exec tsc --noEmit` passes.
- [ ] Completion report written to `backend-to-tech-lead.md` using the template.

---

## Clarification Loop (Mandatory)

Before implementation, Backend posts preflight concerns/questions in `agent-docs/conversations/backend-to-tech-lead.md`. Tech Lead responds in the same file. Repeat until concerns are resolved or status becomes `blocked`.

---

## Verification

Run in sequence. Report each using the Command Evidence Standard:

```
node -v
pnpm lint
pnpm exec tsc --noEmit
pnpm test -- --testPathPattern="adaptation-generate|frontier-base-generate|generation/shared"
```

Format:
- **Command**: `[exact command]`
- **Scope**: `[full suite | targeted spec]`
- **Execution Mode**: `[sandboxed | local-equivalent/unsandboxed]`
- **Result**: `[PASS/FAIL + key counts or failure summary]`

**Note**: Running only targeted tests is sufficient for this step. The Testing Agent runs the full `pnpm test` suite in the subsequent step.

---

## Scope Extension Control

If any feedback expands implementation beyond this handoff scope, mark it `scope extension requested` in your report. Wait for explicit `scope extension approved` from Tech Lead (or User override) before implementing expanded work.

---

## Report Back

Write completion report to `agent-docs/conversations/backend-to-tech-lead.md` using `agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md`.

Status vocabulary: `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`

Report must include:
- Preflight note (grep results confirming scope, `ADAPTATION_API_URL` usage confirmed absent).
- Summary of each file changed with key line numbers.
- Verification evidence (Command Evidence Standard format).
- Deviations from this spec (if any), classified per the Deviation Protocol.
