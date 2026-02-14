# Requirements Directory Guide

## Purpose
`/agent-docs/requirements/` stores Change Requirement (CR) artifacts as the source of historical scope and acceptance intent.

## Naming
- Use `CR-XXX-<slug>.md` (zero-padded numeric ID), e.g. `CR-008-governance-update.md`.
- IDs are strictly increasing; never reuse an existing ID.

## Status Model
- `Draft`
- `Clarified`
- `In Progress`
- `Done`
- `Blocked`

## Legacy Status Mapping (Historical CRs)
Older CRs may use prior wording. Treat these as equivalent for interpretation and reporting:
- `Completed` -> `Done`
- `Implemented` -> `Done`
- `Done ✅` -> `Done`

Policy:
- Do not bulk-edit old closed CRs only to normalize wording.
- Use canonical status labels for all new CRs and new updates.

## Historical Integrity Rule
- Closed CRs (`Done`) are historical records and are immutable by default.
- Do not retrofit older CRs to match new template structure or formatting.
- Legacy structure differences across old CRs are expected and acceptable.

## Allowed Post-Closure Edits
- Typo or formatting corrections
- Broken internal/external link corrections
- Factual correction that does not alter historical intent

When applying any allowed post-closure edit, append an `Amendment Log` entry in the CR:
- Date
- Reason
- What was changed

## If You Discover Gaps in an Old CR
- Do not rewrite old ACs to "look modern."
- Create a follow-up artifact:
  - A new CR, or
  - An investigation report in `/agent-docs/reports/` referencing the original CR ID.
- Keep the original closed CR intact, except for amendment-noted corrections.

## Traceability
- Every CR referenced in `project-log.md` must exist as a file in this directory.
- BA handoffs and closure evidence should reference the CR ID explicitly.
