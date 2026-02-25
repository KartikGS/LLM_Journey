# Handoff: Tech Lead → Backend Agent

## Subject
`CR-017 — Small Backlog Fixes: Route Cleanup (Output Cap + toRecord + Dead Code)`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior content: `CR-015` (`Adaptation Page: New /api/adaptation/generate Endpoint`)
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-015-plan.md` ✓
- Evidence 2 (prior CR closed): `CR-015` status `Done` per `agent-docs/project-log.md` ✓
- Result: replacement allowed.

---

## Objective

Three focused backend changes:
1. Add a configurable output-length cap to `/api/adaptation/generate` live responses (AC-1/AC-2).
2. Migrate both API routes to import `toRecord()` from the new shared utility `lib/utils/record.ts`, removing the two inline local definitions (AC-3).
3. Remove the unreachable `Array.isArray(payload)` branch from `extractProviderOutput()` in `base-generate/route.ts` (AC-5).

---

## Rationale (Why)

- **Output cap (AC-1)**: The adaptation route has no output length ceiling. The frontier route already caps at 4000 chars via `FRONTIER_OUTPUT_MAX_CHARS`. Without a matching cap, an upstream model could return very long responses and degrade learner UX. Consistency with the existing safety pattern is the goal.
- **toRecord extraction (AC-3)**: The same 3-line utility is defined locally in two server-side routes. Extracting to `lib/utils/record.ts` (already created by Tech Lead) removes duplication without changing any behavior. If a third route needs it, the shared utility is already in place.
- **Dead code removal (AC-5)**: The `Array.isArray(payload)` branch in `extractProviderOutput()` handled a legacy HF inference API format (`[{ generated_text: "" }]`). After the CR-014 featherless-ai migration, the HF provider now uses OpenAI-compatible completions format (`choices[].text`). The array branch is unreachable by any supported provider path and no existing test exercises it. Removing it reduces confusion for future maintainers.

---

## Known Environmental Caveats

- **Node.js runtime**: System runtime may be below `>=20.x` (documented minimum). Run `node -v` first. If below 20.x, activate via `nvm use 20`. If nvm is unavailable, classify as `environmental` in your report — do not skip verification.
- **pnpm**: Use `pnpm` exclusively. Never `npm` or `yarn`.
- **Port**: Dev server is on `3001` if needed. Not required for unit test verification.

---

## Assumptions To Validate (Mandatory)

1. `lib/utils/record.ts` exists and exports `toRecord` — **already created by Tech Lead**. Verify the file is present before modifying routes.
2. The `Array.isArray(payload)` branch in `extractProviderOutput()` is not exercised by any test in `__tests__/api/frontier-base-generate.test.ts`. Confirm by inspecting the test file — no mock should return an array payload.
3. `process.env.ADAPTATION_OUTPUT_MAX_CHARS` is not yet read anywhere in `adaptation/generate/route.ts`. Confirm before adding.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

- Do NOT modify client-side components (`FrontierBaseChat.tsx`, `AdaptationChat.tsx`) — they also have local `toRecord()` definitions but are out of scope for this CR.
- Do NOT modify `__tests__/api/frontier-base-generate.test.ts` for any purpose other than confirming tests still pass after dead code removal.
- Do NOT modify `.env.example` — already updated by Tech Lead.
- If you discover the `Array.isArray` branch IS exercised by any existing test, **stop and flag it** before removing. Do not delete tested code without Tech Lead approval.

---

## Scope

### Files to Modify
- `app/api/adaptation/generate/route.ts`:
  - Remove local `toRecord()` definition (line 185-187)
  - Add import: `import { toRecord } from '@/lib/utils/record';` at top with other imports
  - Add `ADAPTATION_OUTPUT_MAX_CHARS` env read (see spec below)
  - Apply output cap to live response (see spec below)

- `app/api/frontier/base-generate/route.ts`:
  - Remove local `toRecord()` definition (line 163-165)
  - Add import: `import { toRecord } from '@/lib/utils/record';` at top with other imports
  - Remove `Array.isArray(payload)` branch from `extractProviderOutput()` (lines 211-218)

- `__tests__/api/adaptation-generate.test.ts`:
  - Add one new test: verify live output is capped when provider returns content longer than `ADAPTATION_OUTPUT_MAX_CHARS`

---

## Implementation Specification (Tech Lead Owned — Use Exactly)

### 1. ADAPTATION_OUTPUT_MAX_CHARS — module-level constant

Add near the top of `adaptation/generate/route.ts`, after the existing constants (`PROMPT_MAX_CHARS`, `DEFAULT_TIMEOUT_MS`, etc.):

```ts
const ADAPTATION_OUTPUT_MAX_CHARS =
    Math.max(1, parseInt(process.env.ADAPTATION_OUTPUT_MAX_CHARS ?? '4000', 10) || 4000);
```

This is parsed once at module load. The `|| 4000` fallback handles `NaN` from a non-numeric env value. `Math.max(1, ...)` prevents a zero or negative cap.

### 2. Apply cap to live output

In `adaptation/generate/route.ts`, locate the `LiveModeResponse` return (currently around line 459):

```ts
// CURRENT — no cap:
return NextResponse.json<LiveModeResponse>(
    {
        mode: 'live',
        output: extractedOutput,
        metadata: { strategy, modelId: config.modelId },
    },
    { status: 200 }
);

// CHANGE TO:
return NextResponse.json<LiveModeResponse>(
    {
        mode: 'live',
        output: extractedOutput.slice(0, ADAPTATION_OUTPUT_MAX_CHARS),
        metadata: { strategy, modelId: config.modelId },
    },
    { status: 200 }
);
```

### 3. Remove dead code from extractProviderOutput()

In `base-generate/route.ts`, remove the `Array.isArray` block (currently lines 211-218):

```ts
// DELETE THIS ENTIRE BLOCK:
// HF: [{ generated_text: "..." }]
if (Array.isArray(payload) && payload.length > 0) {
    const first = toRecord(payload[0]);
    const text = first?.generated_text;
    if (typeof text === 'string' && text.trim().length > 0) {
        return text.trim();
    }
    return null; // HF array found but no usable text → empty_provider_output fallback
}
```

After removal, `extractProviderOutput()` body should start directly with `const root = toRecord(payload);`.

### 4. New test for output cap

Add to `__tests__/api/adaptation-generate.test.ts`, in the Live Response section:

```ts
it('should cap live output at ADAPTATION_OUTPUT_MAX_CHARS characters', async () => {
    process.env.ADAPTATION_OUTPUT_MAX_CHARS = '10';
    setConfigEnv('full-finetuning');
    mockLiveResponse('This response is longer than ten characters');

    const req = createRequest({ prompt: 'Test cap.', strategy: 'full-finetuning' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.mode).toBe('live');
    expect(body.output).toBe('This respo');
    expect(body.output.length).toBe(10);
});
```

**Important**: Add `delete process.env.ADAPTATION_OUTPUT_MAX_CHARS;` to the `beforeEach` cleanup block alongside the other `delete process.env.*` lines.

---

## Definition of Done

- [ ] `adaptation/generate/route.ts` imports `toRecord` from `@/lib/utils/record`; no local `toRecord` definition remains (AC-3)
- [ ] `base-generate/route.ts` imports `toRecord` from `@/lib/utils/record`; no local `toRecord` definition remains (AC-3)
- [ ] `Array.isArray(payload)` branch removed from `extractProviderOutput()` in `base-generate/route.ts` (AC-5)
- [ ] `ADAPTATION_OUTPUT_MAX_CHARS` constant parsed from env in `adaptation/generate/route.ts`; applied via `.slice(0, ADAPTATION_OUTPUT_MAX_CHARS)` to live output (AC-1)
- [ ] New cap test added and passing; `ADAPTATION_OUTPUT_MAX_CHARS` cleared in `beforeEach` (AC-1 test coverage)
- [ ] `pnpm test` passes — no regression vs. 133 baseline (AC-8); report total test count
- [ ] `pnpm lint` passes (AC-8)
- [ ] `pnpm exec tsc --noEmit` passes (AC-8)
- [ ] No route/testid/accessibility contract changes (AC-7)

---

## Clarification Loop (Mandatory)

- Post preflight concerns/questions to `agent-docs/conversations/backend-to-tech-lead.md`.
- Tech Lead responds in the same file.
- If any open question reveals the dead code is not actually dead, or changes the API contract: **pause and wait** for Tech Lead response before implementing.

---

## Verification

Run in sequence (not parallel):
```
node -v
pnpm test
pnpm lint
pnpm exec tsc --noEmit
```

Report using canonical Command Evidence Standard format:
- Command: `[exact command]`
- Scope: `[full suite | impacted files]`
- Execution Mode: `[sandboxed | local-equivalent/unsandboxed]`
- Result: `[PASS/FAIL + key counts]`

Include total test count from `pnpm test` output.

---

## Report Back

Write completion report to `agent-docs/conversations/backend-to-tech-lead.md` using `agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md`.

Status vocabulary: `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`
