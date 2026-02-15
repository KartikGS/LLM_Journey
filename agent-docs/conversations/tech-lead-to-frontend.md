# Handoff: Tech Lead -> Frontend Agent

## Subject
`CR-012 - Transformers Narrative Restructure + Frontier UI Integration`

## Status
`issued`

## Execution Mode (Mandatory)
`feature-ui`

## Objective
Restructure the Stage 1 Transformers page into the required educational sequence:
`How -> Try (Optional) -> Frontier -> Issues -> Next Stage`,
while preserving tiny ONNX interaction and integrating the new backend frontier contract with resilient UI behavior.

## Rationale (Why)
CR-012 is a narrative-completeness change for Stage 1. Learners must see:
1) what tiny models teach,
2) what frontier base models add,
3) what still fails without adaptation,
4) why Stage 2 (`/models/adaptation`) is the next step.

The backend route now exists to support live-when-configured frontier interaction with deterministic fallback when unavailable.

## Constraints
- UI/UX constraints:
  - Keep current visual language consistent with existing journey pages.
  - Preserve mobile and desktop usability.
  - Keep dual-theme readability (light/dark).
  - Loading, fallback, and error states must be text-visible (not color-only).
- Performance/interaction constraints:
  - Frontier submit must show visible loading state immediately on action.
  - Frontier failure must resolve into user-visible non-blocking fallback state.
- Semantic/testability constraints:
  - Preserve existing transformers continuity contracts:
    - `transformers-hero`
    - `transformers-continuity-links`
    - `transformers-link-home`
    - `transformers-link-adaptation`
  - Add deterministic selectors for new narrative and frontier surfaces (listed below).
  - Keep all interactive controls keyboard accessible.
- Ownership constraints:
  - Frontend-owned files only.
  - Do not modify backend route contract.
  - Do not modify tests in this handoff (Testing Agent owns test updates).
  - No package installation.

## Contracts Inventory (Mandatory)
- Route contracts:
  - `/foundations/transformers`
  - `/models/adaptation` (continuity target)
  - `/` (previous-stage continuity target)
- Existing selector/accessibility contracts to preserve:
  - `transformers-hero`
  - `transformers-continuity-links`
  - `transformers-link-home`
  - `transformers-link-adaptation`
  - Tiny chat input remains label-associated and keyboard usable.
- New selector contracts to add (required):
  - `transformers-how`
  - `transformers-try`
  - `transformers-frontier`
  - `transformers-issues`
  - `transformers-next-stage`
  - `transformers-comparison`
  - `frontier-form`
  - `frontier-input`
  - `frontier-submit`
  - `frontier-status`
  - `frontier-output`
- Critical interactive contracts:
  - Frontier request uses `POST /api/frontier/base-generate` with `{ prompt }`.
  - Live response: `mode: "live"` + output.
  - Fallback response: `mode: "fallback"` + reason + output.
  - Validation error: HTTP `400` with `error.code`.

## Design Intent (Mandatory for UI)
- Target aesthetic:
  - Keep the existing premium educational look and hierarchy; no redesign detour.
  - Emphasize stage progression clarity over decorative complexity.
- Animation budget:
  - Keep meaningful motion only where it supports interaction/state clarity.
  - Avoid introducing animation that obscures fallback/error readability.
- Explicit anti-patterns:
  - Do not present frontier output as assistant-grade behavior.
  - Do not hide fallback mode behind subtle color-only indicators.
  - Do not remove continuity links or rewrite route flow.

## Assumptions To Validate (Mandatory)
- Existing `BaseLLMChat` can remain as the Try (Optional) block with minimal adaptation.
- Backend response contract from `app/api/frontier/base-generate/route.ts` is consumable as-is.
- New section-level selector additions will not conflict with current test-id namespace.

## Out-of-Scope But Must Be Flagged (Mandatory)
- Any change to backend API route contract.
- Any changes to adaptation page layout/content beyond continuity wording strictly needed for linkage (default: no adaptation page edits).
- Any route renames or nav-IA changes.

## Scope
### Files to Modify
- `app/foundations/transformers/page.tsx`
  - Implement five-part narrative flow and keep continuity links.
  - Add explicit bridge rationale to `/models/adaptation`.
- `app/foundations/transformers/components/BaseLLMChat.tsx` (optional)
  - Only if needed to align tiny block framing with "Try (Optional)" purpose.
- `app/foundations/transformers/components/*` (new file(s) expected)
  - Add a dedicated frontier interaction component.
  - Add reusable narrative section/template component(s) if helpful.

## Backend Contract Reference (for integration)
- Endpoint: `POST /api/frontier/base-generate`
- Request:
  - `{ "prompt": string }`
- Response modes:
  - Live:
    - `{ mode: "live", output: string, metadata: { assistantTuned: false, adaptation: "none", ... } }`
  - Fallback:
    - `{ mode: "fallback", output: string, reason: { code, message }, metadata: { ... } }`
- Validation error:
  - HTTP `400` with `{ error: { code: "invalid_json" | "invalid_prompt", message } }`

## Definition of Done
- [ ] Transformers page renders required 5-part flow in order:
  - `How`, `Try (Optional)`, `Frontier`, `Issues`, `Next Stage`
- [ ] `How` section explicitly states tiny model is for mechanics and includes Colab link.
- [ ] `Try (Optional)` keeps tiny ONNX interaction available.
- [ ] Frontier section:
  - submits prompt to backend contract,
  - shows immediate loading state on submit,
  - renders live/fallback outcomes with explicit mode messaging,
  - labels model behavior as base-model, not assistant fine-tuned.
- [ ] Issues section shows at least 3 concrete unresolved base-model limitations.
- [ ] Next Stage section explicitly links limitations to adaptation and links to `/models/adaptation`.
- [ ] Same-prompt comparison artifact (Tiny vs Frontier Base) is visible on-page.
- [ ] Required new selectors are present and stable.
- [ ] `pnpm exec tsc --noEmit` passes.
- [ ] `pnpm lint` passes.

## Clarification Loop (Mandatory)
- Before implementation, post preflight assumptions/risks/questions to `agent-docs/conversations/frontend-to-tech-lead.md`.
- If any open question can change contracts/scope, pause and wait for Tech Lead response.

## Verification
- Run and report:
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
- Manual checks to report with concise evidence:
  - five-section order present on `/foundations/transformers`
  - frontier live/fallback status rendering behavior
  - comparison artifact visibility
  - continuity link to `/models/adaptation`
  - keyboard accessibility of frontier form controls

## Scope Extension Control (Mandatory)
- If implementation requires route changes, selector renames, or adaptation-page redesign, mark `scope extension requested` and pause.

## Report Back
Write completion report to `agent-docs/conversations/frontend-to-tech-lead.md` including:
- status (`complete` or `blocked`)
- file list and scope compliance
- verification command evidence
- failure classification (`CR-related`, `pre-existing`, `environmental`, `non-blocking warning`)
- readiness for Testing handoff

*Handoff created: 2026-02-15*
*Tech Lead Agent*
