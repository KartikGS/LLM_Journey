# CR-012: Transformers Stage Narrative Upgrade (Tiny -> Frontier -> Adaptation Bridge)

## Status
Done

## Business Context
**User Need:** The current Transformers page demonstrates a tiny local model but does not clearly show why scaling to internet-trained base models matters, or why adaptation/fine-tuning is the next logical stage.  
**Expected Value:** Make Stage 1 pedagogically complete by showing the progression from tiny mechanics to frontier capability limits, then explicitly handing off to Stage 2 (Model Adaptation) as the solution path.

## Clarified Requirement Summary
- Keep the tiny Transformer demo as the "mechanics sandbox" and clearly frame it as intentionally limited.
- Add a "Frontier" interaction block that uses provider inference for a base (non-instruction-finetuned) model.
- Expose the gap: base pretraining alone does not produce a reliable assistant.
- Bridge that gap directly to `/models/adaptation` so Stage 2 feels necessary, not optional.
- Define a reusable page pattern that can be reused in later stages.

## Product Shaping (BA Recommendation)
- Recommendation: Use a consistent stage pattern: `How -> Try (Optional) -> Frontier -> Issues -> Next Stage`.
- Challenge to potential over-scope: Do not host large model weights ourselves for this stage; prefer provider inference with quota-safe fallback behavior.
- Suggested enhancement: Include one side-by-side prompt comparison (Tiny vs Frontier Base) so users can see scale effects in concrete output, not abstract copy.

## Functional Requirements
1. The Transformers page at `/foundations/transformers` must be restructured around the following section flow:
   - `How` (how tiny model is trained; include Colab reference)
   - `Try (Optional)` (existing tiny model interaction can remain as-is)
   - `Frontier` (interactive provider-backed base model demo)
   - `Issues` (what base model still fails to solve)
   - `Next Stage` (explicit bridge to Model Adaptation)
2. The `How` section must explain that the tiny model is for learning internals, not production assistant quality, and include a working Colab link.
3. The `Frontier` section must allow user prompt submission to a base model trained on internet-scale text and clearly label it as "not fine-tuned for assistant behavior."
4. The `Frontier` section must support a graceful fallback when provider credentials/quota are unavailable (for example: disabled input + explanatory message + curated sample outputs).
5. The `Issues` section must list at least 3 concrete unresolved problems from base-model-only behavior (for example: instruction-following inconsistency, safety/tone drift, domain reliability gaps).
6. The stage bridge must explicitly state that adaptation/fine-tuning addresses these issues and link to `/models/adaptation`.
7. A reusable "Stage Narrative Template" must be represented in-page so the same structure can be applied to later journey pages with minimal content-only changes.

## Non-Functional Requirements
- Performance:
  - Frontier responses must show visible loading state within 200ms of submit.
  - Frontier request timeout/failure must return a user-visible error/fallback state without freezing the page.
- Security:
  - Provider credentials must never be exposed in client-side code.
  - Existing CSP, telemetry boundary, and middleware constraints must remain unchanged.
- Accessibility:
  - All interactive controls in Tiny and Frontier blocks must be keyboard accessible.
  - Error/loading/fallback states must be text-visible (not color-only signaling).

## System Constraints & Invariants
- **Constraint Mapping**:
  - `agent-docs/project-vision.md` (learn with tiny, build with large; stage continuity)
  - `agent-docs/architecture.md` (security and observability invariants, server/client boundaries)
  - `agent-docs/technical-context.md` (ONNX tiny runtime context, framework/environment assumptions)
  - `agent-docs/workflow.md` (route/test-id/a11y contract sync if changed)
- **Design Intent**: Narrative-completeness upgrade and learning-flow clarity improvement for Stage 1, plus a reusable structure template for upcoming stages.

## Acceptance Criteria
- [x] Transformers page renders a clear 5-part flow: `How`, `Try`, `Frontier`, `Issues`, `Next Stage`. — Verified: `app/foundations/transformers/page.tsx:20`, `app/foundations/transformers/page.tsx:85`, `app/foundations/transformers/page.tsx:89`, `app/foundations/transformers/page.tsx:175`, `app/foundations/transformers/page.tsx:196`.
- [x] `How` section includes an explicit tiny-model purpose statement and a working Colab link. — Verified: `app/foundations/transformers/page.tsx:43`, `app/foundations/transformers/page.tsx:58`.
- [x] Frontier interaction exists and is labeled as base model usage without assistant fine-tuning. — Verified: `app/foundations/transformers/components/FrontierBaseChat.tsx:232`, `app/foundations/transformers/components/FrontierBaseChat.tsx:260`, `app/api/frontier/base-generate/route.ts:39`.
- [x] Missing-key/quota-unavailable path is handled gracefully with explanatory fallback UI. — Verified: `app/api/frontier/base-generate/route.ts:327`, `app/api/frontier/base-generate/route.ts:390`, `app/foundations/transformers/components/FrontierBaseChat.tsx:139`, `app/foundations/transformers/components/FrontierBaseChat.tsx:151`.
- [x] `Issues` section presents at least 3 concrete limitations tied to base-model-only behavior. — Verified: `app/foundations/transformers/page.tsx:186`, `app/foundations/transformers/page.tsx:189`, `app/foundations/transformers/page.tsx:192`.
- [x] `Next Stage` bridge explicitly links unresolved issues to adaptation/fine-tuning and links to `/models/adaptation`. — Verified: `app/foundations/transformers/page.tsx:196`, `app/foundations/transformers/page.tsx:214`.
- [x] At least one prompt comparison artifact (Tiny vs Frontier Base) is visible on-page for the same prompt. — Verified: `app/foundations/transformers/page.tsx:123` (fulfilled via user-approved generalized comparison template artifact).
- [x] Quality checks pass: `pnpm lint`, `pnpm test`, `pnpm build`; and E2E updates are included in same CR if contracts/selectors/routes change. — Verified: `agent-docs/conversations/tech-lead-to-ba.md:36`, `agent-docs/conversations/tech-lead-to-ba.md:41`, `agent-docs/conversations/tech-lead-to-ba.md:51`, `agent-docs/conversations/tech-lead-to-ba.md:62`, `agent-docs/conversations/tech-lead-to-ba.md:74`, `__tests__/api/frontier-base-generate.test.ts:58`, `__tests__/components/FrontierBaseChat.test.tsx:16`, `__tests__/e2e/transformer.spec.ts:4`.

## Verification Mapping
- **Development Proof**:
  - Route-level UI evidence for all five sections and continuity links.
  - Interaction evidence for Frontier success and fallback states.
  - Command evidence for quality gates.
  - E2E selector/contract evidence if impacted.
- **AC Evidence Format (for closure)**:
  - ``[x] <AC text> — Verified: <file-or-command>, <result>``
- **User Validation**:
  - Open `/foundations/transformers`.
  - Verify each section in order and confirm Frontier block behavior in both configured and non-configured modes.
  - Confirm handoff clarity to `/models/adaptation`.

## Dependencies
- Blocks: Higher-quality narrative continuity between Stage 1 and Stage 2.
- Blocked by: Provider/API feasibility decisions (model/provider choice and quota policy) from Tech Lead execution planning.

## Risks, Assumptions, Open Questions
- **Assumption**: A low-cost provider path exists for base-model inference, or fallback simulation can be used when free-tier limits are reached.
- **Risk**: Users may interpret frontier output as assistant-grade unless labeling is explicit and persistent.
- **Risk**: Provider outages/quotas could make live demo brittle without robust fallback UX.
- **User Decision (2026-02-15)**: Frontier interaction defaults to live provider inference when provider configuration is available; fallback mode is shown when configuration/quota is unavailable.

## Rollback Plan
- Revert Stage 1 page/content updates and any new Frontier integration layer.
- Keep existing tiny ONNX experience and continuity links intact as baseline.
- No data migration or infrastructure rollback required.

## BA Complexity Assessment
- **Business Complexity:** Medium
- **Execution Mode (BA):** Standard
- **Why:** Single-stage enhancement with cross-stage narrative impact, provider dependency trade-offs, and moderate interaction/test contract risk.

## Notes
- This CR intentionally keeps "large model self-hosting" out of scope for cost and operations reasons.
- Adaptation page redesign is not required in this CR; only Stage 1 bridge clarity is required.
- This CR is designed as a reusable template precedent for later pages.

## Technical Analysis (filled by Tech Lead)
**Complexity:** Medium  
**Estimated Effort:** M  
**Affected Systems:** Stage 1 transformers UI route, frontier inference API route, API/component/E2E test contracts, env template.  
**Implementation Approach:** Server-side frontier route with validated live/fallback envelope, frontend narrative restructuring into five sections, and in-CR test synchronization for new contracts.

## Deviations Accepted (filled at closure by BA)
- AC-7 semantics changed from a strict same-prompt Tiny-vs-Frontier comparison to a generalized comparison template, based on user direction on 2026-02-15; associated E2E assertion was updated in the same CR. — Accepted (`agent-docs/conversations/tech-lead-to-ba.md:32`, `agent-docs/conversations/tech-lead-to-ba.md:103`).
