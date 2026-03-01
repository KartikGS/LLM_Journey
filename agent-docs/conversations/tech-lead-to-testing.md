# Handoff: Tech Lead → Testing Agent

## Subject
`CR-021 — Frontier and Adaptation Response Streaming: E2E Test Coverage`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior content: `CR-019` (`Generation Config Centralization: Test Suite Alignment`)
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-019-plan.md` ✓
- Evidence 2 (prior CR closed): `CR-019` status `Completed` per `agent-docs/project-log.md` ✓
- Result: replacement allowed.

---

## Execution Mode
`testing`

---

## Objective

Two tasks:

1. **Evaluate and update** `__tests__/e2e/transformer.spec.ts` for streaming timing impact — the frontier chat route now streams tokens progressively instead of returning a buffered JSON response.

2. **Add adaptation E2E coverage** — no adaptation E2E spec currently exists at `__tests__/e2e/`. Create `__tests__/e2e/adaptation.spec.ts` covering the adaptation chat submit cycle.

Then run the full E2E suite and report results.

---

## Known Environmental Caveats

- **Node.js runtime**: System runtime may be below `>=20.x`. Run `node -v` first. If below 20.x, activate via `nvm use 20`. If nvm unavailable, classify as `environmental` in your report.
- **pnpm**: Use `pnpm` exclusively.
- **E2E requires a running dev server**: Run `pnpm dev` (or confirm the `baseURL` in `playwright.config.ts`) before running `pnpm test:e2e`. If E2E cannot run due to environment constraints, classify as `environmental` and document what you verified.

---

## What Changed (Backend + Frontend — already reviewed by Tech Lead)

**Routes** (`app/api/frontier/base-generate/route.ts`, `app/api/adaptation/generate/route.ts`):
- Now return `Content-Type: text/event-stream` for successful live-path responses.
- Pre-stream fallback paths still return JSON.

**Components** (`FrontierBaseChat.tsx`, `AdaptationChat.tsx`):
- Replaced `await response.json()` with an SSE stream reader.
- New state: `isStreaming` + `hasFirstToken` (replacing `isLoading`).
- `frontier-submit` / `frontier-input` / `adaptation-chat-submit` / `adaptation-chat-input` stay `disabled` for the **entire streaming duration** (from submit click until `done`/`error` event).
- Output area shows loader until first token, then progressive output with cursor; cursor removed on stream end.
- All `data-testid` contracts preserved without change.

---

## Task 1: Evaluate `transformer.spec.ts` for Streaming Timing Impact

Read `__tests__/e2e/transformer.spec.ts` in full. Evaluate each assertion against the new streaming behavior:

### Assessment targets

**Test: "should complete frontier submit cycle and show output/status @critical" (lines 51–66)**

| Assertion | Concern | Decision needed |
|---|---|---|
| `frontierSubmit.toBeDisabled()` | Still correct — button disabled while `isStreaming` | No change expected |
| `frontierSubmit.toBeEnabled({ timeout: 15000 })` | **Key concern**: button re-enables only after full stream completes (`done`/`error` → `isStreaming = false`). If the LLM generates slowly, 15s may be insufficient. | Extend to `{ timeout: 30000 }` if 15s is insufficient; retain if adequate |
| `frontierStatus` contains `/Mode: (live\|fallback)/i` | Status set in `done` handler before `isStreaming = false`. Test waits for button to re-enable first, so status fires after stream is complete. No timing issue expected. | No change expected |
| `frontierOutput` contains `'$'` | `$` prefix renders once `hasFirstToken = true` (mid-stream). Present well before stream ends. No change expected. | No change expected |

**Tests: "should expose CR-012 narrative and frontier contracts" and "should keep tiny transformer interaction signal functional"**

Both tests are unaffected by streaming changes (static structure and a different component respectively). Confirm they still pass; no changes expected.

### Required outcome for Task 1

If `frontierSubmit.toBeEnabled({ timeout: 15000 })` times out in your E2E run, change it to `{ timeout: 30000 }`. If 15s is adequate, retain. Document your decision and the observed timing in your report.

---

## Task 2: Add Adaptation E2E Coverage

No adaptation E2E spec exists. **Create** `__tests__/e2e/adaptation.spec.ts`.

### Minimum required coverage

**Test 1: Static contracts @critical**
- Navigate to `/models/adaptation`
- Assert the following `data-testid` elements are visible:
  - `adaptation-chat`
  - `adaptation-chat-tab-full-finetuning`
  - `adaptation-chat-tab-lora-peft`
  - `adaptation-chat-tab-prompt-prefix`
  - `adaptation-chat-form`
  - `adaptation-chat-input`
  - `adaptation-chat-submit`
  - `adaptation-chat-output`
  - `adaptation-chat-status`

**Test 2: Submit cycle (full-finetuning strategy) @critical**
- Navigate to `/models/adaptation`
- Click `adaptation-chat-tab-full-finetuning`
- Fill `adaptation-chat-input` with a short prompt (e.g., `'Explain supervised learning in one sentence.'`)
- Click `adaptation-chat-submit`
- Assert `adaptation-chat-submit` becomes disabled
- Assert `adaptation-chat-submit` becomes re-enabled with `{ timeout: 30000 }`
- Assert `adaptation-chat-status` contains `/Mode: (live|fallback)/i`
- Assert `adaptation-chat-output` contains `'$'`

### Design constraints for Task 2

- Use `{ timeout: 30000 }` for all "becomes re-enabled" assertions — streaming duration may vary.
- Do NOT assert on specific LLM-generated output text content (non-deterministic).
- Do NOT add `data-testid` attributes to the component — only assert on existing contracts listed above.
- Do NOT use `page.waitForTimeout()` — use `toBeEnabled`/`toBeVisible` with explicit timeouts.

---

## Scope

### Files to create
- `__tests__/e2e/adaptation.spec.ts` (new)

### Files to modify
- `__tests__/e2e/transformer.spec.ts` (timeout adjustment only if needed — no structural changes)

### Files NOT in scope
- Any component, route, config, or non-test file

---

## Out-of-Scope But Must Be Flagged

- If any existing E2E test fails for a reason unrelated to streaming, flag and classify as `pre-existing`.
- If the adaptation page has an accessibility or structural regression visible during E2E, flag it.
- Do NOT make production code changes.

---

## Definition of Done

- [ ] `transformer.spec.ts` timeout evaluated; extended to 30s or confirmed adequate at 15s
- [ ] `adaptation.spec.ts` created: static contracts test + submit cycle test for `full-finetuning`
- [ ] All `data-testid` contracts verified visible on adaptation page
- [ ] `pnpm test:e2e` passes (all E2E tests, no new failures)
- [ ] `pnpm test` (unit + integration) still passes — confirm no regression
- [ ] `pnpm lint` passes
- [ ] `pnpm exec tsc --noEmit` passes

---

## Clarification Loop

Post preflight concerns to `agent-docs/conversations/testing-to-tech-lead.md`. Tech Lead responds in the same file.

---

## Verification

Use command evidence standard: Command, Scope, Execution Mode, Result.

Run in sequence:
```
node -v
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm test:e2e
```

---

## Scope Extension Control

If any feedback expands implementation beyond this handoff scope, mark it `scope extension requested` in your report. Wait for explicit `scope extension approved` before implementing expanded work.

---

## Report Back

Write completion report to `agent-docs/conversations/testing-to-tech-lead.md` using `agent-docs/conversations/TEMPLATE-testing-to-tech-lead.md`.

Status vocabulary: `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`
