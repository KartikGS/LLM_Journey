# Handoff: Tech Lead → BA Agent

## Subject
`CR-015 — Adaptation Page: Strategy-Linked Chat Interface`

## Status
`verified`

---

## Technical Summary

CR-015 replaced the passive `AdaptationStrategySelector` (radio buttons + detail card) on the Model Adaptation page with a live, strategy-linked chat interface (`AdaptationChat`). Three tabs — Full Fine-Tuning, LoRA/PEFT, Prompt/Prefix Tuning — each connect to a real model on the featherless-ai router via a new `/api/adaptation/generate` endpoint. The static comparison grid was enriched with `bestFor` and `caution` fields that were already in `strategy-data.ts` but not displayed.

**Scope boundaries preserved:**
- Adaptation page route (`/models/adaptation`) unchanged.
- Server Component structure of `page.tsx` unchanged — `AdaptationChat` is the new client island.
- Stable testids (`adaptation-page`, `adaptation-hero`, `adaptation-strategy-comparison`, `adaptation-continuity-links`, continuity link hrefs) all preserved.
- `app/api/frontier/base-generate/route.ts` frozen — no changes to the existing frontier endpoint.
- No new npm packages introduced.

---

## Evidence of AC Fulfillment

- [x] **AC-1**: Comparison grid cards display `bestFor` and `caution` — `app/models/adaptation/page.tsx:35-36` (two new `<li>` entries per card rendering `strategy.bestFor` / `strategy.caution`).
- [x] **AC-2**: `AdaptationStrategySelector` removed. `adaptation-interaction` section and all child testids absent from DOM — `AdaptationStrategySelector.tsx` deleted; `page.tsx` import and render removed; confirmed absent in E2E (12/12 pass with no assertion on old testids).
- [x] **AC-3**: `AdaptationChat` renders with 3-tab selector; tab switching updates model info + chat interface without page reload — `AdaptationChat.tsx:239-265` (tablist + tab buttons); `handleTabChange` is synchronous client state; confirmed via `@critical` E2E tab-switch test (12/12 pass).
- [x] **AC-4**: Each tab's model info card shows model ID, origin/team, adaptation method, purpose — `AdaptationChat.tsx:26-73` (`TAB_CONFIGS` array; all four fields rendered for `activeConfig` in lines 277-307).
- [x] **AC-5 (Full Fine-Tuning)**: Calls adaptation API with `strategy: 'full-finetuning'`; English example prompts — `AdaptationChat.tsx:147-151` (fetch call with `strategy: activeTab`); `TAB_CONFIGS[0].examplePrompts` (English, lines 35-40).
- [x] **AC-6 (LoRA/PEFT)**: Calls API with `strategy: 'lora-peft'`; Italian example prompts; Italian-first callout — `TAB_CONFIGS[1].examplePrompts` (Italian, lines 51-55); `callout` field rendered as amber alert box at `AdaptationChat.tsx:311-316`.
- [x] **AC-7 (Prompt/Prefix)**: Calls API with `strategy: 'prompt-prefix'`; system prompt applied server-side, not in UI; info card explains technique — server-side injection at `route.ts:144-148` (`buildMessages()` adds system role only for `prompt-prefix`); `ADAPTATION_SYSTEM_PROMPT` constant only used in request body, absent from all response fields/logs/spans (audited); `TAB_CONFIGS[2].adaptation` explains the technique (`AdaptationChat.tsx:64`).
- [x] **AC-8**: All 3 strategies return strategy-specific deterministic fallback text when unconfigured — `route.ts:20-27` (`FALLBACK_TEXT` record with exact strategy-specific strings); verified by 6 unit tests (3 missing_config + 3 exact fallback text assertions). Fallback texts are thematically specific per strategy.
- [x] **AC-9**: Adaptation API routes to correct model per strategy; system prompt prepended for `prompt-prefix` — `route.ts:100-138` (`loadAdaptationConfig` reads strategy-specific env var); `route.ts:140-152` (`buildMessages` prepends system message for `prompt-prefix` only); verified by 3 model routing unit tests + 1 system prompt injection test.
- [x] **AC-10**: All quality gates pass — `pnpm test`: 133 passed (22 new tests); `pnpm lint`: ✔ no errors; `pnpm exec tsc --noEmit`: exit 0; `pnpm build`: succeeded. Run by Tech Lead under Node v18.19.0 (nvm).
- [x] **AC-11**: Light/dark themes correct — all Tailwind classes in `AdaptationChat.tsx` use `dark:` variants; no hardcoded colors; confirmed via source audit (adversarial diff review).
- [x] **AC-12**: E2E tests updated — `navigation.spec.ts` Test 1 updated (6 new assertions, 3 removed); Test 2 rewritten with `@critical` tag preserved; `pnpm test:e2e -- __tests__/e2e/navigation.spec.ts` passes (12/12, chromium/firefox/webkit).

---

## Verification Commands

**Unit + Integration tests (Tech Lead run):**
- Command: `pnpm test`
- Scope: full suite (17 test suites)
- Execution Mode: local-equivalent/unsandboxed (Node v18.19.0 via nvm)
- Result: **PASS** — 133 tests, 0 failures

**Lint (Tech Lead run):**
- Command: `pnpm lint`
- Scope: full project
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — ✔ No ESLint warnings or errors

**TypeScript (Tech Lead run):**
- Command: `pnpm exec tsc --noEmit`
- Scope: full project
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — exit 0, no output

**Build (Tech Lead run):**
- Command: `pnpm build`
- Scope: full Next.js production build
- Execution Mode: local-equivalent/unsandboxed
- Result: **PASS** — `/api/adaptation/generate` in build output; `/models/adaptation` built; no type errors

**E2E (Testing Agent run):**
- Command: `pnpm test:e2e -- __tests__/e2e/navigation.spec.ts`
- Scope: navigation spec (4 tests × 3 browsers)
- Execution Mode: local-equivalent/unsandboxed (Node v18.19.0 via nvm)
- Browser Scope: chromium, firefox, webkit
- Result: **PASS** — 12/12 passed

---

## Failure Classification Summary

- **CR-related**: none — all CR-015 scope items implemented and verified.
- **Pre-existing**: none detected in CR scope.
- **Environmental**: System Node.js v16.20.1 is below documented minimum (≥20.x). All verification run under Node v18.19.0 via nvm. Pre-existing since CR-013; tracked in project-log Next Priorities. Node v20+ upgrade recommended.
- **Non-blocking warning**: `next lint` deprecation notice (pre-existing); Jest worker exit warning (pre-existing); OTel `require-in-the-middle` critical dependency warning in build (pre-existing — `lib/otel/client.ts`, `lib/otel/server.ts`).

---

## Adversarial Diff Review

**`page.tsx`**: Clean. `AdaptationStrategySelector` import and render removed. `AdaptationChat` import and render added. `bestFor`/`caution` fields rendered correctly via new `<li>` entries. All stable testids and continuity links preserved. No debug artifacts.

**`AdaptationChat.tsx`**: Clean. All 9 mandatory `data-testid` contracts present and match plan spec exactly. Split-panel `GlassCard` matches `FrontierBaseChat` pattern. Status state machine (`idle|live|fallback|error`) correctly implemented. Tab switch resets prompt/output/status state. Italian callout renders conditionally for LoRA tab only. No system prompt visible anywhere in UI. No debug artifacts. All colors use dual-theme Tailwind classes.

**`route.ts` (adaptation/generate)**: Clean. `ADAPTATION_SYSTEM_PROMPT` constant used only in `buildMessages()` — absent from all response fields, logger calls, and span attributes (audited line by line). Strategy-specific fallback texts match plan spec exactly. Config loading validates URL eagerly. Error mapping (429/401/403/5xx/timeout) mirrors `base-generate` pattern faithfully.

**`adaptation-generate.test.ts`**: Clean. 22 tests. All test names accurately describe behavior. System prompt injection verified by inspecting the outgoing fetch request body. Exact fallback text asserted with `toBe()`. Test isolation via `beforeEach` env cleanup confirmed correct (config loaded at request time, not module load time).

**`navigation.spec.ts`**: Clean. Test 1 updated exactly as specified. Test 2 fully rewritten — no live API dependency, asserts terminal label change (client-side constant, not API response). `@critical` tag preserved. Test 3 untouched. No brittle assertions.

**Residual risk noted**: The adaptation route has no output length cap (unlike `base-generate`'s `FRONTIER_OUTPUT_MAX_CHARS = 4000`). Chat completions from instruct models can be verbose. Minor safety concern — see Tech Lead Recommendations.

---

## Tech Lead Recommendations

1. **Adaptation endpoint output length cap** — `app/api/adaptation/generate/route.ts` returns `extractedOutput` without slicing. `base-generate` caps at 4000 chars (`FRONTIER_OUTPUT_MAX_CHARS`). Recommend adding a cap in a follow-up CR. Low priority (instruct models are generally more concise, fallback kicks in on empty output). Suggest: add to project-log Next Priorities.

2. **`toRecord()` utility duplication** — Backend Agent noted `toRecord()` is now locally duplicated in `base-generate/route.ts`, `adaptation/generate/route.ts`, and `AdaptationChat.tsx` (client-side). If a fourth route is added, extraction to `lib/server/` would be warranted. Out of scope for this CR. Suggest: defer to a future lib cleanup CR.

3. **Node.js v20+ upgrade** — System Node v16.20.1 remains below documented minimum (≥20.x). Pre-existing since CR-013. Should be a Next Priority to remove the nvm dependency from the verification workflow. Already in project-log Next Priorities.

---

## Deployment Notes

**New env vars required** (`.env.local` must be updated before the adaptation chat will show live responses):
```
ADAPTATION_API_URL='https://router.huggingface.co/featherless-ai/v1/chat/completions'
ADAPTATION_FULL_FINETUNE_MODEL_ID='meta-llama/Meta-Llama-3-8B-Instruct'
ADAPTATION_LORA_MODEL_ID='swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA'
ADAPTATION_PROMPT_PREFIX_MODEL_ID='meta-llama/Meta-Llama-3-8B'
```
API key: shared with existing `FRONTIER_API_KEY`. No new key required.

**Fallback behavior**: If env vars are absent or invalid, all three strategy tabs return strategy-specific deterministic fallback text. The page renders correctly in both configured and unconfigured environments.

**No infrastructure changes**: No new dependencies, no CSP changes, no middleware changes, no new routes in the navigation config.

---

## Link to Updated Docs

- Plan: `agent-docs/plans/CR-015-plan.md`
- CR: `agent-docs/requirements/CR-015-adaptation-strategy-chat-interface.md`
- Frontend handoff: `agent-docs/conversations/tech-lead-to-frontend.md`
- Backend handoff: `agent-docs/conversations/tech-lead-to-backend.md`
- Testing handoff: `agent-docs/conversations/tech-lead-to-testing.md`
- Sub-agent reports: `frontend-to-tech-lead.md`, `backend-to-tech-lead.md`, `testing-to-tech-lead.md`
