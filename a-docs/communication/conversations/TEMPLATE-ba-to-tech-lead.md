# Template: BA -> Tech Lead Handoff

## Subject
`[CR-ID] - [Requirement Handoff Title]`

## Status
`issued`

## Objective
- [What outcome this CR must deliver for the Product End User.]

## Linked CR
- `a-docs/workflow/requirements/CR-XXX-<slug>.md`

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

## Documentation Impact (Preliminary)
<!--
BA assessment at requirement time. This is an early flag for the Tech Lead's binding documentation
decision in the plan. The TL plan's Documentation Impact section (canonical semantics source:
a-docs/workflow/plans/TEMPLATE.md) carries the binding decision; this field captures BA awareness at
requirement authoring time to avoid late discovery.
-->
- **Likely required?**: `yes` | `no` | `unknown`
- **If yes — known domains** (flag areas at requirement time; final file list is owned by the TL plan):
  - `README.md`: [what context would change]
  - `a-docs/**`: [what context would change]
  - `human-docs/**`: [what context would change]
- **If no or unknown — rationale**: [why this CR is unlikely to require documentation updates, or what information is missing to assess]

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
