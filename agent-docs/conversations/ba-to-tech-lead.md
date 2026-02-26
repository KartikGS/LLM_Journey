# BA to Tech Lead Handoff

## Subject
`CR-020 — CR Process Hardening and Artifact Organization`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing BA handoff context: `CR-019`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-019-plan.md`
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-019-generation-config-centralization-with-meta-observations.md` status is `Done`
- Result: replacement allowed for new CR context.

## Objective
Implement the accepted CR-019 meta outcomes for process hardening (items 1,2,3,5), evaluate CR-artifact foldering feasibility for item 4, and keep branch-strategy policy explicitly deferred.

## Linked Artifacts
- CR: `agent-docs/requirements/CR-020-cr-process-hardening-and-artifact-organization.md`

## Audience & Outcome Check
- Human User intent: execute agreed process updates now, explore CR-artifact foldering, and defer git strategy decision.
- Product End User audience: all website learners (indirect impact via better delivery reliability and lower coordination overhead).
- Developer-contributor audience: engineers building and maintaining the application (direct impact via lower coordination overhead and reduced context-switch cost).
- Expected outcome: faster and safer CR execution with clearer handoffs, lower artifact-discovery cost, and measurably smoother contributor workflow.

## Clarified Requirement Summary
- Standardize handoff templates with execution checklists and exact-path sections.
- Add/standardize `gap items / known risks` in TL session-state workflow artifacts.
- Enforce CR-scoped naming guidance for ephemeral conversation files while preserving freshness checks.
- Preserve historical artifact retention posture (archive/index allowed, deletion out of scope).
- Produce a feasibility artifact for CR-artifact foldering options and migration impact.
- Keep one-branch-per-CR policy decision deferred and explicitly recorded.

## Acceptance Criteria Mapping
- [ ] AC-1: Execution-checklist section exists in Backend/Testing/Tech Lead handoff templates.
- [ ] AC-2: TL session-state template includes `gap items / known risks`.
- [ ] AC-3: Handoff templates require exact-path references to active CR artifacts.
- [ ] AC-4: CR-scoped naming guidance exists for ephemeral conversation files, with freshness-rule compatibility.
- [ ] AC-5: Freshness efficiency improved via prefilled stub guidance without weakening the gate.
- [ ] AC-6: Historical CR artifact retention stance is explicit (`retain/archive`, not delete).
- [ ] AC-7: CR-artifact foldering feasibility artifact produced (options + impact + recommendation).
- [ ] AC-8: Git strategy decision remains explicitly deferred as user-owned policy decision.
- [ ] AC-9: Verification evidence recorded for touched docs/process artifacts.

## Verification Mapping
- Template/workflow evidence for AC-1 to AC-5.
- Policy-language evidence for AC-6 and AC-8.
- Feasibility artifact evidence for AC-7.
- Verification command evidence for AC-9 in `tech-lead-to-ba.md`.

## Constraints
- Do not delete historical CR artifacts in this CR.
- Do not standardize branch strategy in this CR; keep it deferred.
- Preserve freshness-rule and traceability invariants.
- No dependency installation unless scope extension is explicitly approved.
- If foldering options conflict with canonical-path assumptions, document and defer instead of forcing migration.

## Open Decisions
- CR-artifact foldering decision details (owner: Tech Lead proposes options; Human User confirms direction).
- One-branch-per-CR strategy remains deferred (owner: Human User).

## Risk Analysis
- Process-doc edits can cause policy drift if scope expands beyond accepted items.
- CR-scoped naming transition can create short-term confusion without explicit migration notes.
- Foldering proposal can conflict with current path assumptions if not analyzed before action.

## Rationale (Why)
This CR operationalizes the decisions you already approved, so process improvements move from recommendation to enforceable workflow artifacts, while still separating deferred policy questions from immediate execution standards.

## Evidence Expectations for Tech Lead Handoff
- One-line evidence per AC with file/line references.
- Explicit note that branch strategy remained deferred per user decision.
- Feasibility artifact link for CR-artifact foldering with options and recommendation.
- Clear classification of any immediate follow-up vs deferred/policy-candidate items.
