# Tech Lead Prompt: Plan and Execute CR-012

## Subject
CR-012 - Transformers Stage Narrative Upgrade (Tiny -> Frontier -> Adaptation Bridge)

## Context
User requested that the Transformers page show the scaling journey clearly:
- Tiny model = mechanics/training demo (with Colab reference).
- Optional local "Try" remains for tiny model.
- Add a Frontier section where users can interact with a larger base model via provider inference.
- Make it explicit that base model behavior is still not assistant-grade.
- Add Issues -> Adaptation bridge so Stage 2 rationale is obvious.
- Keep costs practical; free-tier and fallback-friendly behavior is acceptable.

Current code signal:
- Stage 1 currently has tiny ONNX chat in `app/foundations/transformers/components/BaseLLMChat.tsx`.
- Stage 1 page content exists but does not yet implement a formal Tiny -> Frontier -> Issues -> Adaptation narrative sequence.
- Stage 2 (`/models/adaptation`) already exists and should be used as the explicit "next fix" destination.

Artifact:
- Requirement: `agent-docs/requirements/CR-012-transformers-tiny-to-frontier-bridge.md`

## Goal
Execute CR-012 by restructuring Stage 1 into a reusable narrative pattern:
`How -> Try (Optional) -> Frontier -> Issues -> Next Stage`,
while preserving architecture/security/testing invariants and keeping provider usage cost-aware.

## Scope Source of Truth
- `agent-docs/requirements/CR-012-transformers-tiny-to-frontier-bridge.md`

## Key Directives
1. Create `agent-docs/plans/CR-012-plan.md` before implementation/delegation.
2. Preserve existing tiny ONNX demo and frame it as mechanics-oriented.
3. Add frontier interaction in a way that:
   - clearly labels base-model behavior as non-finetuned,
   - supports graceful fallback when key/quota is unavailable,
   - avoids exposing provider secrets client-side.
4. Add explicit "Issues" framing tied to adaptation outcomes and continuity to `/models/adaptation`.
5. Keep this CR focused:
   - no large-model self-hosting,
   - no adaptation page redesign unless required for continuity wording.
6. Validate with explicit command evidence:
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
7. If route/selector/semantic contracts change, include Testing handoff and same-CR E2E updates per workflow matrix.

## Clarification Needed from User (if unresolved during planning)
- Resolved (User Decision, 2026-02-15): Use `live when configured` as the default for Frontier interaction.

## Hand-off
Please assume **Tech Lead** role and run the standard planning + delegation flow for CR-012.
