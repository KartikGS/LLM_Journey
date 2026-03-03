# Technical Plan - CR-012: Transformers Stage Narrative Upgrade (Tiny -> Frontier -> Adaptation Bridge)

## Technical Analysis
- Current state:
  - `app/foundations/transformers/page.tsx` has a hero, tiny ONNX interaction (`BaseLLMChat`), supporting cards, and continuity links, but not the required narrative sequence (`How -> Try -> Frontier -> Issues -> Next Stage`).
  - There is no provider-inference API route for Stage 1 frontier interaction (`app/api/` currently contains telemetry routes only).
  - Existing tests cover tiny chat behavior and basic transformers navigation, but not frontier fallback/live behavior and not the new narrative sections required by CR-012.
- Key technical challenges:
  - Introduce provider-backed frontier inference without exposing secrets client-side.
  - Preserve stability when provider configuration/quota is unavailable (fallback-first resilience).
  - Add narrative clarity and reusable stage structure while preserving existing route continuity and quality gates.
- Complexity: **Medium**
- Estimated effort: **M**

## Discovery Findings
- Probe results:
  - Transformers route contract is stable at `/foundations/transformers` (`app/foundations/transformers/page.tsx`).
  - Stage continuity target `/models/adaptation` already exists and is linked from transformers continuity UI.
  - Existing selectors/contracts in active use include:
    - `transformers-hero`
    - `transformers-continuity-links`
    - `transformers-link-home`
    - `transformers-link-adaptation`
    - tiny chat form controls (`textarea#chat`, sample buttons)
  - Current E2E transformer coverage (`__tests__/e2e/transformer.spec.ts`) validates tiny generation and telemetry signal only; no frontier contract assertions exist.
  - Playwright browser matrix target is confirmed as `chromium`, `firefox`, `webkit` (`playwright.config.ts`).
  - No current provider-inference implementation was found in `app/` or `lib/`.
- Resolved wildcards:
  - Frontier interaction implementation will use a **server-side proxy route** with environment-driven provider configuration (default behavior: live only when fully configured).
  - Provider settings are resolved as runtime-configured values (`endpoint`, `model`, `api key`) rather than hardcoded vendor credentials in source.
  - Reusable narrative structure will be represented in-page through explicit sectioned composition and stable section-level contracts.
- Validated assumptions:
  - Route URIs can remain unchanged (`/foundations/transformers`, `/models/adaptation`).
  - Existing continuity-link contracts can remain stable while adding new narrative/interaction sections.
  - CR requires new selector/semantic contracts, which triggers a Testing handoff in the same CR per workflow matrix.
- Route/selector/semantic contract inventory (pre-change):
  - Route contracts:
    - `/foundations/transformers`
    - `/models/adaptation`
    - `/` (previous-stage continuity link)
  - Selector/accessibility contracts:
    - `transformers-hero`
    - `transformers-continuity-links`
    - `transformers-link-home`
    - `transformers-link-adaptation`
    - `textarea#chat` + tiny-sample button labels
  - Critical interactive contracts:
    - Tiny ONNX generation remains functional and keyboard accessible.
    - Continuity links remain visible and navigable.
- Conversation freshness audit:
  - Existing handoff/report files are stale for prior CRs (`CR-010`, `CR-011`, health-check follow-up).
  - For CR-012, `agent-docs/conversations/tech-lead-to-backend.md`, `agent-docs/conversations/tech-lead-to-frontend.md`, `agent-docs/conversations/tech-lead-to-testing.md` will be replaced (not appended) when issued.

## Configuration Specifications
- No middleware/CSP/security-header policy changes are planned.
- New server runtime configuration contract (to be documented in `.env.example` and consumed server-side only):
  - `FRONTIER_API_URL` (provider endpoint URL)
  - `FRONTIER_MODEL_ID` (base-model identifier)
  - `FRONTIER_API_KEY` (secret; never exposed to client)
  - `FRONTIER_TIMEOUT_MS` (optional; bounded default if omitted)
- Proposed backend API contract:
  - `POST /api/frontier/base-generate`
  - Request: `{ prompt: string }` with server-side validation and input bounds.
  - Response:
    - `mode: "live"` with model-labeled output when provider call succeeds.
    - `mode: "fallback"` with explanatory reason and curated sample output when configuration/quota/runtime blocks live inference.
  - Failure behavior:
    - No uncaught exception path to UI.
    - User-facing fallback/error message is always returned for recoverable failures.

## Critical Assumptions
- A provider endpoint that supports server-side inference via API key is available when configured by environment.
- "Base model (not assistant fine-tuned)" labeling is explicit in UI copy regardless of provider/model choice.
- In default local/test environments, missing provider configuration is acceptable and must render deterministic fallback UX.
- Adding new section-level test contracts and frontier controls will require testing updates in the same CR.

## Proposed Changes
- Backend Agent:
  - Implement secure server route for frontier generation (`POST /api/frontier/base-generate`) with:
    - prompt validation,
    - bounded timeout,
    - provider call using server-only secret,
    - graceful fallback mapping for unconfigured/quota/timeout/upstream failures.
  - Add/adjust server-side config access for frontier provider variables.
  - Update environment template documentation for required frontier variables.
- Frontend Agent:
  - Refactor `app/foundations/transformers/page.tsx` into explicit reusable narrative flow:
    - `How`
    - `Try (Optional)` (existing tiny ONNX interaction retained)
    - `Frontier`
    - `Issues`
    - `Next Stage`
  - Add/compose frontier interaction UI that:
    - submits prompt to `/api/frontier/base-generate`,
    - shows visible loading state immediately on submit,
    - clearly labels output as base-model (non-adapted/non-assistant-grade) behavior,
    - supports fallback UX when live mode is unavailable.
  - Add at least one visible same-prompt comparison artifact (Tiny vs Frontier Base) on page.
  - Preserve continuity link to `/models/adaptation` and make adaptation rationale explicit in section copy.
  - Keep existing transformers continuity contracts stable while adding deterministic selectors for new sections/controls.
- Testing Agent:
  - Add/update tests for new CR-012 contracts:
    - backend route behavior (live success and fallback/error paths),
    - frontend rendering and interaction contracts for narrative sections and frontier states,
    - E2E coverage updates for transformers page contract changes (route stable; selector/semantic contracts expanded).
  - Run and report quality gates with command evidence.

## Contract Delta Assessment (Mandatory)
- Route contracts changed? **No**
  - `/foundations/transformers` and `/models/adaptation` remain unchanged.
- `data-testid` contracts changed? **Yes**
  - New narrative and frontier interaction sections require additional deterministic selectors.
  - Existing continuity selectors must remain stable.
- Accessibility/semantic contracts changed? **Yes**
  - New frontier interaction controls and status messaging introduce new interaction semantics.
- Testing handoff required per workflow matrix? **Yes**
  - Triggered by selector and accessibility contract changes.
  - Same-CR testing updates are required.

## Architecture-Only Freeze Checklist (Conditional)
- Not applicable.
- CR-012 is a behavior/content/narrative enhancement (not architecture-only refactor).

## Architectural Invariants Check
- [x] **Observability Safety**: Frontier failure paths must not crash or block user-facing flow.
- [x] **Security Boundaries**: Provider credentials remain server-side only; no client secret exposure.
- [x] **Threat/Safety Intent**: Input validation and bounded execution for provider proxy route.
- [x] **Rendering Strategy**: Keep page composition consistent with server-first architecture while using client islands for interaction.
- [x] **E2E Selector Invariant**: Contract changes are paired with Testing handoff in same CR.

## Delegation & Execution Order
| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | Backend | Implement secure frontier provider proxy route + fallback behavior + env contract updates. |
| 2 | Frontend | Restructure transformers page narrative, preserve tiny demo, integrate frontier UI + comparison artifact + adaptation bridge copy. |
| 3 | Testing | Update/add backend/frontend/E2E tests for new contracts and run required verification commands. |
| 4 | Tech Lead | Adversarial diff review + integration verification + BA handoff artifact. |

## Delegation Graph (MANDATORY)
- **Execution Mode**: Sequential
- **Dependency Map**:
  - Step 2 depends on Step 1 output: **yes**
    - Required artifact: finalized frontier API request/response/fallback contract.
  - Step 3 depends on Step 2 output: **yes**
    - Required artifact: finalized selectors/semantics and integrated UI behaviors.
  - Step 4 depends on Step 3 output: **yes**
    - Required artifact: testing report with command evidence and failure classification.
- **Parallel Groups**:
  - None (output dependencies are strict).
- **Handoff Batch Plan**:
  - First handoff only: `agent-docs/conversations/tech-lead-to-backend.md`
  - Follow-up handoff: `agent-docs/conversations/tech-lead-to-frontend.md`
  - Final execution handoff: `agent-docs/conversations/tech-lead-to-testing.md`
- **Final Verification Owner**:
  - Tech Lead (must run/confirm required quality gates before BA verification handoff).

## Operational Checklist
- [x] **Environment**: No hardcoded secrets; provider behavior controlled by server env configuration.
- [x] **Observability**: Error/fallback states are user-visible and non-fatal.
- [ ] **Artifacts**: Verify no unintended generated artifacts are introduced (`test-results/`, build artifacts stay untracked as expected).
- [x] **Rollback**: Revert CR-012 transformer page, frontier API, and test changes to restore tiny-only Stage 1 baseline.

## Definition of Done (Technical)
- [ ] Transformers page presents required five-part flow: `How`, `Try (Optional)`, `Frontier`, `Issues`, `Next Stage`.
- [ ] `How` clearly frames tiny model purpose and includes working Colab reference.
- [ ] Tiny ONNX interaction remains functional and keyboard accessible.
- [ ] Frontier interaction is provider-backed in live mode when configured, with explicit non-assistant base-model labeling.
- [ ] Frontier fallback mode is graceful and user-visible for missing config/quota/runtime failure cases.
- [ ] Issues section lists at least three concrete base-model-only limitations.
- [ ] Next-stage bridge explicitly connects limitations to adaptation and links to `/models/adaptation`.
- [ ] At least one visible same-prompt Tiny vs Frontier comparison artifact is present.
- [ ] `pnpm lint` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` passes.
- [ ] Testing handoff updates are completed in same CR for selector/semantic contract changes.
