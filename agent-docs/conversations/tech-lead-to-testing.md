# Handoff: Tech Lead → Testing Agent

## Subject
`CR-015 - Adaptation Page: Update E2E Tests for AdaptationChat Selector Contracts`

## Status
`issued`

## Dependency Note
This handoff is issued after the Frontend Agent has completed and reported back. The confirmed `data-testid` contracts from the Frontend completion report are encoded in this handoff. Do NOT modify them.

---

## Objective

Update `__tests__/e2e/navigation.spec.ts` to reflect the removal of 6 old `AdaptationStrategySelector` data-testids and the introduction of 9 new `AdaptationChat` data-testids. Two tests require changes; one test must be rewritten.

---

## Rationale (Why)

CR-015 replaced `AdaptationStrategySelector` with `AdaptationChat`. Six data-testids that existing E2E tests assert are now absent from the DOM. The two affected tests will fail if run against the updated app. The Testing Handoff Trigger Matrix requires a Testing handoff when data-testids are removed and new selectors are introduced. E2E contract closure is mandatory before this CR can be closed.

---

## Constraints

### Testing Boundaries
- Allowed files: `__tests__/e2e/navigation.spec.ts` only.
- Do NOT modify any app source files (`app/`, `components/`, `lib/`).
- Do NOT modify any other test files.
- Do NOT add new test files (unless required for a `.debug.spec.ts` — must be deleted before reporting complete).

### Verification Boundaries
- E2E required: **YES** — data-testid contract changes trigger mandatory E2E per workflow matrix.
- Run quality gates in sequence: `pnpm test:e2e`, then classify results.
- Tech Lead has already verified `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` — all pass. You do not need to re-run these unless you introduce TypeScript/lint changes.
- Failure classification required: classify each E2E result as `CR-related`, `pre-existing`, or `environmental`.

---

## Stable Signals to Assert (Mandatory)

Use the E2E Selector Reliability Ladder. Prefer `data-testid` (level 1) for structural assertions, `getByRole` (level 2) for interactive controls.

### Preserved contracts (must remain asserted)
| `data-testid` | Assertion type |
|---|---|
| `adaptation-page` | `toBeVisible()` |
| `adaptation-hero` | `toBeVisible()` |
| `adaptation-strategy-comparison` | `toBeVisible()` |
| `adaptation-continuity-links` | `toBeVisible()` |
| `adaptation-link-transformers` | `toBeVisible()` + `toHaveAttribute('href', '/foundations/transformers')` |
| `adaptation-link-context` | `toBeVisible()` + `toHaveAttribute('href', '/context/engineering')` |

### New contracts to assert (from Frontend completion report — confirmed)
| `data-testid` | Element |
|---|---|
| `adaptation-chat` | Outermost section container |
| `adaptation-chat-tab-full-finetuning` | Full Fine-Tuning tab button |
| `adaptation-chat-tab-lora-peft` | LoRA / PEFT tab button |
| `adaptation-chat-tab-prompt-prefix` | Prompt / Prefix Tuning tab button |
| `adaptation-chat-form` | `<form>` element |
| `adaptation-chat-input` | `<textarea>` |
| `adaptation-chat-submit` | Submit button |
| `adaptation-chat-output` | Terminal output `<div>` |
| `adaptation-chat-status` | Status/mode indicator |

### Removed contracts (must NOT be asserted after this CR)
| `data-testid` | Reason |
|---|---|
| `adaptation-interaction` | Component deleted |
| `adaptation-strategy-selector` | Component deleted |
| `strategy-button-full-finetuning` | Component deleted |
| `strategy-button-lora-peft` | Component deleted |
| `strategy-button-prompt-prefix` | Component deleted |
| `adaptation-interaction-output` | Component deleted |

---

## Prohibited Brittle Assertions (Mandatory)

- **No assertions on transient loading copy** (e.g., "Querying adaptation endpoint...") — timing-dependent.
- **No assertions on terminal output text content from the API** — live API responses are non-deterministic and fallback text is only shown when unconfigured.
- **No layout-coupled CSS selectors** — only `data-testid`, `getByRole`, `href`, and stable `aria-*` attributes.
- **No timeout-only waits** — use `toBeVisible()` or state-based assertions with Playwright's built-in retrying.

---

## Known Environmental Caveats (Mandatory)

- System Node.js is v16.20.1 (below ≥20.x minimum). Use `nvm use 18` before running `pnpm test:e2e`.
- E2E requires the local dev server on port `3001`. The `pnpm test:e2e` script sets `E2E=true` and manages the server — use this script, not raw `playwright test`.
- If the dev server fails to bind (sandbox constraint), classify as **environmental** — not a product regression. Attempt local-equivalent execution per `agent-docs/testing-strategy.md`.
- Playwright expects the adaptation page at `/models/adaptation`. This route is unchanged.

---

## Assumptions To Validate (Mandatory)

1. The terminal filename label inside `adaptation-chat-output` is a stable client-side assertion (driven by `TAB_CONFIGS[strategy].terminalLabel` — not an API response). Values: `full_finetuning_output.txt`, `lora_peft_output.txt`, `prompt_prefix_output.txt`. Confirmed from `AdaptationChat.tsx`.
2. Tab switching in `AdaptationChat` is synchronous client-side state — no network request required to see the UI update.
3. The `adaptation-chat-status` element uses `role="status"` and `aria-live="polite"` — accessible and Playwright-queryable.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

- If you find any other E2E spec file referencing removed adaptation testids, flag it in your report — do not fix silently.
- The `@critical` tag on the rewritten test must be preserved. If you believe the new test cannot be marked `@critical`, flag it in the report.
- Do NOT add E2E assertions that depend on live API responses from `/api/adaptation/generate` — the endpoint may be unconfigured in E2E environments.

---

## Scope

### Files to Modify
- `__tests__/e2e/navigation.spec.ts`: Update 2 tests as specified below. Leave Test 3 untouched.

---

## Test-by-Test Instructions

### Test 1: "should navigate to Models/Adaptation" (`@smoke`)

**Remove these three assertions** (currently lines 24–26):
```ts
await expect(page.getByTestId('adaptation-interaction')).toBeVisible();
await expect(page.getByTestId('adaptation-strategy-selector')).toBeVisible();
await expect(page.getByTestId('adaptation-interaction-output')).toBeVisible();
```

**Replace with** (new `AdaptationChat` structural assertions):
```ts
await expect(page.getByTestId('adaptation-chat')).toBeVisible();
await expect(page.getByTestId('adaptation-chat-tab-full-finetuning')).toBeVisible();
await expect(page.getByTestId('adaptation-chat-tab-lora-peft')).toBeVisible();
await expect(page.getByTestId('adaptation-chat-tab-prompt-prefix')).toBeVisible();
await expect(page.getByTestId('adaptation-chat-input')).toBeVisible();
await expect(page.getByTestId('adaptation-chat-output')).toBeVisible();
```

### Test 2: "should update adaptation output when strategy changes" (`@critical`)

This test is fully obsolete — it asserts `adaptation-interaction-output` and `strategy-button-full-finetuning`, both deleted. **Rewrite it entirely.**

**New test name**: `'should update adaptation interface when strategy tab changes @critical'`

**New test intent**: Verify tab switching updates visible client-side content (terminal label), without requiring a live API call.

**Implementation**:
```ts
test('should update adaptation interface when strategy tab changes @critical', async ({ page }) => {
  await page.goto('/models/adaptation');

  const loraPeftTab = page.getByTestId('adaptation-chat-tab-lora-peft');
  const promptPrefixTab = page.getByTestId('adaptation-chat-tab-prompt-prefix');
  const output = page.getByTestId('adaptation-chat-output');

  await expect(loraPeftTab).toBeVisible();
  await expect(promptPrefixTab).toBeVisible();

  // Click LoRA / PEFT tab — terminal label must update to lora_peft_output.txt
  await loraPeftTab.click();
  await expect(output).toBeVisible();
  await expect(output).toContainText('lora_peft_output.txt');

  // Click Prompt / Prefix tab — terminal label must update to prompt_prefix_output.txt
  await promptPrefixTab.click();
  await expect(output).toContainText('prompt_prefix_output.txt');
});
```

The terminal label (`lora_peft_output.txt`, `prompt_prefix_output.txt`) is rendered from `activeConfig.terminalLabel` — a client-side constant, not an API response. It is visible in the `adaptation-chat-output` div header bar immediately on tab switch.

### Test 3: "should expose continuity links for previous and next stages" (`@smoke`)
**No changes.** Leave untouched.

---

## Verification Depth
`baseline` — structural presence and client-side tab-switch behavior. No boundary-focused API coverage needed.

---

## Definition of Done

- [ ] Test 1 updated: old 3 assertions removed; 6 new `AdaptationChat` assertions present.
- [ ] Test 2 rewritten: asserts tab switch via terminal label; `@critical` tag preserved.
- [ ] Test 3 unchanged.
- [ ] No other E2E spec files modified (or flagged if discovered).
- [ ] `pnpm test:e2e -- __tests__/e2e/navigation.spec.ts` passes under local-equivalent execution.
- [ ] All failures classified as `CR-related`, `pre-existing`, or `environmental`.

---

## Clarification Loop (Mandatory)

- Post preflight concerns/questions to `agent-docs/conversations/testing-to-tech-lead.md`.
- Tech Lead responds in the same file.
- If you cannot confirm the terminal label assertion at runtime, flag it as `needs_environment_verification` and provide the reproduction command.

---

## Verification

Use the command evidence standard in your report:
- Command: `pnpm test:e2e -- __tests__/e2e/navigation.spec.ts`
- Scope: navigation spec (adaptation tests specifically)
- Execution Mode: local-equivalent/unsandboxed
- Browser Scope: chromium minimum; report any firefox/webkit divergence
- Result: PASS/FAIL + test count

---

## Report Back

Write completion report to `agent-docs/conversations/testing-to-tech-lead.md`.
