# Template: BA -> Tech Lead Handoff

## Subject
`[CR-ID] - [Requirement Handoff Title]`

## Status
`issued`

## Objective
- [What outcome this CR must deliver for the Product End User.]

## Linked CR
- `agent-docs/requirements/CR-XXX-<slug>.md`

## Clarified Requirement Summary
- [Scope summary in 3-6 bullets.]

## Acceptance Criteria Mapping
- [ ] AC-1: [text]
- [ ] AC-2: [text]

## Verification Mapping
- [How each AC should be proven: file-level evidence, command evidence, user validation path.]

## Constraints
- [Architecture/security/process constraints that must be preserved.]

## Open Decisions (if any)
- [Decision needed + options + owner (`Human User` or `Tech Lead`).]
- `none` if resolved.

## Risk Analysis
- [Key delivery risks, assumption risks, and scope risks.]

## Reversal Risk
<!--
AC-level pre-implementation checks. Use when an AC contains an assumption the BA has not fully verified.
Format: "Reversal Risk — AC-X: Before implementing, run [exact command]. If [condition], stop and contact BA before proceeding."
Example: "Reversal Risk — AC-4: Before removing, run `grep -rn 'getFunctionName' .`. If any call site is found, stop and contact BA — the function may be live."
-->
- `none`

## Rationale (Why)
- [Business/learning reason this CR exists now.]

## Evidence Expectations for Tech Lead Handoff
- [Expected command evidence and artifact evidence to be returned in `tech-lead-to-ba.md`.]
