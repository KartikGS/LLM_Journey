# Technical Plan — CR-022: Adaptation Page Upgrade and Cleanup

## Technical Analysis

CR-022 bundles four independent workstreams:
1. **Narrative content addition** (Server Component additions to `page.tsx`) — pure markup, no state.
2. **UX hardening** (disable tabs during streaming in `AdaptationChat.tsx`) — client state guard already exists (`isStreaming`), only missing from tab buttons.
3. **AI disclaimer** (static text in `AdaptationChat.tsx`) — rendered always visible.
4. **Dead-code removal** (two routes + one type union + one test constant) — confirmed unreachable paths.

No new packages required. No architectural pivot. No route changes.

---

## Discovery Findings

### `invalid_config` Reachability Audit

**Confirmed unreachable in both routes:**

- `app/api/adaptation/generate/route.ts`: `loadAdaptationConfig()` returns `issueCode: 'missing_config'` when `!apiKey`, and omits `issueCode` entirely when configured. **No code path sets `issueCode: 'invalid_config'`.**
  - Line 75: Type definition `issueCode?: 'missing_config' | 'invalid_config'` → safe to narrow to `'missing_config'` only, or remove `issueCode` from type entirely (since it's only ever `'missing_config'`).
  - Lines 197-201: `if (issueCode === 'invalid_config')` branch is dead code → remove.
- `app/api/frontier/base-generate/route.ts`: Identical pattern. `loadFrontierConfig()` only ever sets `issueCode: 'missing_config'`. Lines 67 and 209 have the same dead-code structure.
- `lib/server/generation/shared.ts` line 8: `'invalid_config'` in `FallbackReasonCode` union — no production code path emits this value anymore → remove.

**Safe removal scope:** All three files. No behavioral change to any caller.

### `ADAPTATION_API_URL` in Test File

- `__tests__/api/adaptation-generate.test.ts` line 109: `const ADAPTATION_API_URL = 'https://router.huggingface.co/featherless-ai/v1/chat/completions'` declared inside the `describe` block.
- `setConfigEnv()` sets only `FRONTIER_API_KEY` — never references `ADAPTATION_API_URL`.
- No other usage of `ADAPTATION_API_URL` in the file confirmed.
- **Confirmed unused** → remove the constant declaration.

### AdaptationChat Tab State

- `AdaptationChat.tsx` already tracks `isStreaming` state.
- Example prompts already use `disabled={isStreaming}` (line 423).
- Tab buttons (lines 340-357) currently have **no `disabled` attribute** → this is the gap.
- Adding `disabled={isStreaming}` to tab buttons closes AC-4 and AC-5.

### Narrative Sections — Page Structure

- `page.tsx` is a Server Component (no `'use client'` directive).
- Structure: `GlowBackground` → `JourneyStageHeader` → strategy comparison section → `<AdaptationChat />` → `<JourneyContinuityLinks />`.
- "Why We Adapt LLMs" inserts before the strategy comparison section.
- "Limitations & What's Next" inserts between `<AdaptationChat />` and `<JourneyContinuityLinks />`.
- Both new sections are static content only — Server Components confirmed. No ADR needed.

### Existing Component UI Components Available

- `GlassCard` — available, used for strategy cards, appropriate for narrative sections.
- `GlowBackground`, `JourneyStageHeader` — existing layout primitives.
- Glassmorphism aesthetic matches: `GlassCard` with appropriate padding, semantic headings, and list items.

### Route/Selector/Semantic Contract Inventory

- Route: `/models/adaptation` — unchanged.
- Existing preserved testids: `adaptation-page`, `adaptation-hero`, `adaptation-strategy-comparison`, `adaptation-chat`, `adaptation-chat-tab-*`, `adaptation-chat-form`, `adaptation-chat-input`, `adaptation-chat-submit`, `adaptation-chat-output`, `adaptation-chat-status`.
- **New testids added**: `adaptation-why-adapt` (new section), `adaptation-limitations` (new section).
- Tab buttons gain `disabled` attribute during streaming → accessibility contract change.

### E2E Existing Coverage

- `__tests__/e2e/adaptation.spec.ts` exists (created in CR-021) covering static contracts and submit cycle.
- The two new sections (`adaptation-why-adapt`, `adaptation-limitations`) need assertions added to the static contracts test.

### Contract Registry Status (Pre-existing discrepancy noted)

- `testing-contract-registry.md` lists: `adaptation-interaction`, `adaptation-strategy-selector`, `adaptation-interaction-output` — these do **not** match current testids in the component (`adaptation-chat`, `adaptation-chat-tab-*`, etc.).
- This is a **pre-existing discrepancy** predating CR-022. Testing Agent must reconcile (update registry to match actual testids from the component) and add the two new CR-022 additions.

---

## Configuration Specifications

No new config values, constants, or schema changes. All values are inline to the components.

**AI disclaimer text (verbatim, per CR-022 AC-6):**
> "AI can make mistakes, check important info."

---

## Implementation Decisions (Tech Lead Owned)

### Decision 1: Narrative sections rendering boundary
- **Decision**: Server Components (pure markup, no client state or interactivity needed).
- **Options considered**: (a) Server Components — no `'use client'` needed, most efficient; (b) Client Components — would be unnecessary, adding JS bundle weight.
- **Chosen**: Server Components. The narrative sections contain only headings, paragraphs, lists, and a link. `page.tsx` is already a Server Component. New sections are added directly in `page.tsx` or as co-located server-only component files.
- **Rationale**: Satisfies `architecture.md` Component Rendering Strategy — static narrative content requires no client state.

### Decision 2: Tab disabled mechanism
- **Decision**: Native `disabled` HTML attribute on `<button>` elements.
- **Options considered**: (a) Native `disabled` — correct accessibility semantics (focus prevented, `aria-disabled` automatically set by browser); (b) `aria-disabled` only — requires additional keyboard-focus guard; (c) CSS pointer-events only — not accessible.
- **Chosen**: Option (a). CR NFR explicitly states: "use `disabled` attribute or `aria-disabled` with keyboard-focus prevention." Native `disabled` is the simpler correct solution.
- **Rationale**: Satisfies AC-4, AC-5, and NFR accessibility requirement in one attribute.

### Decision 3: AI disclaimer placement
- **Decision**: Render the AI disclaimer as a small text block immediately **below the input form** and **above the terminal output `div`** within the right panel of `AdaptationChat`.
- **Options considered**: (a) Below input form — always visible regardless of output state; (b) Below terminal output — may be below the fold; (c) Inside output terminal — disrupts monospace aesthetic.
- **Chosen**: Option (a) — below the form `<div>`, before the terminal output `div`. Delegates exact implementation to Frontend Agent with the constraint: must be visible in both light/dark mode and must not be inside the terminal output area.
- **Rationale**: Maximally visible position; consistent with how disclaimers appear in similar chat UIs.

### Decision 4: `invalid_config` removal scope in `AdaptationConfig` and `FrontierConfig` types
- **Decision**: Remove `'invalid_config'` from the `issueCode` optional field type in both `AdaptationConfig` and `FrontierConfig` local types. The field itself can remain if it aids future extensibility, but only with `'missing_config'` in its type union.
- **Alternative considered**: Remove the `issueCode` field entirely since it's always `'missing_config'`.
- **Chosen**: Remove only `'invalid_config'` from the union (keep `issueCode?: 'missing_config'`). Less disruptive, TypeScript will still correctly narrow it.
- **Rationale**: Minimizes diff surface while eliminating the dead type member.

---

## Critical Assumptions

- `AdaptationChat.tsx` `isStreaming` state is `true` for the entire duration from form submit to `done`/`error` SSE event (confirmed by reading `onSubmit` — `setIsStreaming(true)` at line 210, `setIsStreaming(false)` in `finally` block at line 326).
- `lib/server/generation/shared.ts` `FallbackReasonCode` is the only definition of this type; no external package redefines it.
- `ADAPTATION_API_URL` constant in `adaptation-generate.test.ts` is not referenced anywhere else in that file beyond line 109.
- No component tests for `AdaptationChat` exist currently (confirmed — no `__tests__/components/` files in glob output).

---

## Proposed Changes

### Frontend Agent Scope

**`app/models/adaptation/page.tsx`**
- Add `<section data-testid="adaptation-why-adapt">` before the `adaptation-strategy-comparison` section. Content: "Why We Adapt LLMs" with 4 bullet points (instruction-following, domain expertise, knowledge cutoff, output format control). GlassCard wrapper with consistent glassmorphism styling.
- Add `<section data-testid="adaptation-limitations">` between `<AdaptationChat />` and `<JourneyContinuityLinks />`. Content: "Limitations & What's Next" covering trade-offs for all three strategies + bridging callout with navigable `<a>` or `<Link>` to `/context/engineering`.

**`app/models/adaptation/components/AdaptationChat.tsx`**
- Tab buttons (lines 337-357): Add `disabled={isStreaming}` attribute.
- Add `cursor-not-allowed opacity-50` (or equivalent disabled style) to tab buttons when `isStreaming`.
- Add AI disclaimer text immediately below the `<form>` element and above the terminal output `div` (inside the right panel `div.w-full.lg:w-1/2.flex.flex-col.gap-4`).

### Backend Agent Scope

**`lib/server/generation/shared.ts`**
- Remove `'invalid_config'` from `FallbackReasonCode` type union (line 8).

**`app/api/adaptation/generate/route.ts`**
- Remove `'invalid_config'` from `AdaptationConfig.issueCode` type (line 75).
- Remove the `issueCode === 'invalid_config'` branch in the `!config.configured` block (lines 197-201). Replace the conditional with the `'missing_config'` message directly (since that is the only possible value).

**`app/api/frontier/base-generate/route.ts`**
- Same changes: remove `'invalid_config'` from `FrontierConfig.issueCode` type (line 67), remove the dead `issueCode === 'invalid_config'` branch (line 209).

**`__tests__/api/adaptation-generate.test.ts`**
- Remove `const ADAPTATION_API_URL = ...` declaration (line 109).

### Testing Agent Scope (sequential, after Frontend + Backend complete)

**`__tests__/components/AdaptationChat.test.tsx`** (new file)
- Unit tests for tab locking behavior: render `AdaptationChat`, mock streaming state, verify tab buttons are disabled during streaming and re-enabled after.
- Must use React Testing Library.

**`__tests__/e2e/adaptation.spec.ts`** (update)
- Add assertions for `adaptation-why-adapt` and `adaptation-limitations` to the existing `@critical` static contracts test.

**`agent-docs/testing-contract-registry.md`** (update — Tech Lead permitted, done in TL Session B)
- Reconcile pre-existing discrepancy: replace `adaptation-interaction`, `adaptation-strategy-selector`, `adaptation-interaction-output` with actual current testids.
- Add `adaptation-why-adapt` and `adaptation-limitations` to Adaptation Stage Contracts.

---

## Contract Delta Assessment

- **Route contracts changed?** No — `/models/adaptation` is unchanged.
- **`data-testid` contracts changed?** Yes — 2 additions: `adaptation-why-adapt`, `adaptation-limitations`. No removals or renames.
- **Accessibility/semantic contracts changed?** Yes — tab buttons gain `disabled` attribute during streaming (keyboard behavior change).
- **Testing handoff required per workflow matrix?** YES — `data-testid` additions + accessibility contract change both trigger Testing handoff.

---

## Architectural Invariants Check

- [x] **Observability Safety** — no changes to OTel paths; narrative sections are static.
- [x] **Security Boundaries** — no new inputs, no API changes.
- [x] **Component Rendering Strategy** — new narrative sections correctly stay Server Components.
- [x] **Contract Preservation** — all existing `data-testid` contracts preserved per AC-9.

---

## Delegation & Execution Order

| Step | Agent | Task Description | Mode |
| :--- | :--- | :--- | :--- |
| 1a | Frontend | Narrative sections in `page.tsx` + tab locking + AI disclaimer in `AdaptationChat.tsx` | Parallel |
| 1b | Backend | Dead-code removal in routes, `shared.ts`, and test file | Parallel |
| 2 | Testing | Component tests for tab locking + E2E spec update + full quality gates | Sequential |

## Delegation Graph

- **Execution Mode**: Parallel (Step 1a + 1b) → Sequential (Step 2)
- **Dependency Map**:
  - Step 2 (Testing) depends on Step 1a output: Testing Agent needs to know what `data-testid` values Frontend used for the new sections and what the tab disabled implementation looks like for accurate component testing.
  - Step 2 (Testing) depends on Step 1b output: Backend changes affect `pnpm test` pass/fail.
- **Parallel Groups**:
  - Group 1: Step 1a (Frontend) + Step 1b (Backend) — independent file sets, no shared dependencies.
- **Handoff Batch Plan**:
  - Parallel batch: Issue both `tech-lead-to-frontend.md` and `tech-lead-to-backend.md` in the same TL Session A turn.
  - Sequential follow-up: After both CR Coordinator reviews complete, issue `tech-lead-to-testing.md`.
- **Final Verification Owner**: Testing Agent runs full suite (`pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm test:e2e`).

## Operational Checklist

- [x] **Environment**: No hardcoded values introduced. Disclaimer text is inline string.
- [x] **Observability**: No tracing/metrics changes.
- [x] **Artifacts**: No new files requiring `.gitignore`.
- [x] **Rollback**: Revert Frontend and Backend commits. No config or infra changes.

## Definition of Done (Technical)

- [ ] AC-1: "Why We Adapt LLMs" section (`data-testid="adaptation-why-adapt"`) visible before strategy cards, covering all 4 points.
- [ ] AC-2: "Limitations & What's Next" section (`data-testid="adaptation-limitations"`) visible after `AdaptationChat`, before nav footer, covering all 3 strategy trade-offs.
- [ ] AC-3: Limitations section contains navigable `<Link>` or `<a>` to `/context/engineering`.
- [ ] AC-4: Strategy tab buttons `disabled={isStreaming}` — non-interactive during streaming.
- [ ] AC-5: Tab click mid-stream does not change `activeTab` state or restart generation.
- [ ] AC-6: AI disclaimer "AI can make mistakes, check important info." visible in `AdaptationChat` in both themes.
- [ ] AC-7: No `invalid_config` branch or type member in generation code; `pnpm exec tsc --noEmit` passes.
- [ ] AC-8: No `ADAPTATION_API_URL` constant in adaptation test files; `pnpm lint` passes.
- [ ] AC-9: All existing `data-testid` contracts preserved (no renames, no removals).
- [ ] AC-10: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` all pass.
- [ ] E2E: `pnpm test:e2e` passes including the two new section assertions.
