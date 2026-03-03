# BA to Tech Lead Handoff

## Subject
`CR-025 — README Refresh and Documentation Governance in CR Flow`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing BA handoff context: `CR-024`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-024-plan.md` ✓
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-024-generation-route-body-size-enforcement.md` status is `Done` ✓
- Result: replacement allowed for new CR context.

## Objective

Deliver a documentation hardening CR with two linked outcomes:

1. **Modernize root `README.md`** so it accurately serves both project audiences (learner-user and developer-user), reflects current architecture and roadmap, and gives deterministic onboarding/contribution instructions.
2. **Operationalize docs freshness** by adding a mandatory documentation-impact decision to CR planning/execution/acceptance artifacts so doc updates are explicitly owned in every CR.

This is not a product behavior change. It is documentation + workflow quality hardening.

## Linked Artifacts
- CR: `agent-docs/requirements/CR-025-readme-refresh-and-documentation-governance.md`

## Audience & Outcome Check
- **Human User intent:** README should stop drifting and CR flow should systematically keep docs current.
- **Developer-user impact:** Faster, correct project onboarding and accurate contribution model for agentic development.
- **Learner-user impact:** Indirect quality benefit only; no immediate UI/runtime changes.

## Scope Clarification

### In scope
- Root README rewrite/refresh to reflect current project reality.
- Doc/process artifact updates that make documentation-impact review mandatory during CR execution and BA closure.
- Applying the documentation-impact rule across `README.md`, `agent-docs/**`, and `human-docs/**` when impacted by a CR.

### Out of scope
- Feature implementation, route/API behavior changes, or UI redesign.
- Re-architecting role ownership model.

## Technical Sanity Notes

Current README has known drift and contradictions versus canonical docs, including:
- package manager ambiguity (`pnpm` policy vs README mentioning npm/yarn/bun),
- stale structure/module references,
- missing explicit explanation of the current BA -> Tech Lead -> sub-agent CR flow.

Use canonical truth sources while rewriting:
- `agent-docs/tooling-standard.md`
- `agent-docs/technical-context.md`
- `agent-docs/project-vision.md`
- `$LLM_JOURNEY_ARCHITECTURE`
- `agent-docs/workflow.md`
- `agent-docs/decisions/ADR-0001-telemetry-proxy.md`

## Reversal Risk

- **Reversal Risk — AC-2:** Before finalizing README runtime/tooling statements, verify every command/policy line against canonical docs (`tooling-standard.md`, `technical-context.md`, `workflow.md`). If any contradiction appears, stop and align wording before merge.
- **Reversal Risk — AC-4/AC-5:** Before adding new documentation-impact language to workflow/templates, check for existing equivalent gates to avoid duplicative or conflicting policy text. If conflict is found, stop and request BA clarification on consolidation approach.

## Suggested Execution Mode

`Sequential` recommended.

Reason:
1. First complete README refresh (content truth alignment).
2. Then apply workflow/template/checklist guardrail updates informed by final wording and avoid policy duplication.

## Acceptance Criteria Summary (full detail in CR-025)

- **AC-1:** README reorganized with audience-aware structure and required sections.
- **AC-2:** README setup/policy lines match canonical docs, with no contradictions.
- **AC-3:** Stale README references removed/corrected.
- **AC-4:** Planning/execution artifacts include mandatory "Documentation Impact" field.
- **AC-5:** BA closure guidance includes explicit doc-impact verification before `Done`.
- **AC-6:** No app/runtime contract changes.

## Constraints

- No implementation code changes required for this CR.
- Preserve role ownership boundaries.
- Keep policy additions audit-friendly (field/checklist based, not broad prose).
- Do not create conflicting process authorities across docs.
