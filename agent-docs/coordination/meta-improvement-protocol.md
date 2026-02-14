# Meta Improvement Protocol

## Purpose
Standardize how agents capture and execute documentation/process improvement feedback (retro/meta-analysis sessions).

## When To Use
Use this protocol when the user asks for:
- feedback on agent docs,
- instruction-conflict audits,
- process clarity or governance improvements,
- template/role-doc consistency cleanup.

## Required Output
Create a report in `agent-docs/reports/`:
- File pattern: `META-YYYYMMDD-<slug>.md`
- Minimum sections:
  - `Observed Issues`
  - `Conflict/Redundancy Analysis`
  - `Proposed Changes`
  - `Decision Needed` (if any)
  - `Approved Actions`

## Decision Ownership
- BA may identify/process-shape issues and propose updates.
- Tech Lead verifies feasibility, consistency, and final policy wording before adoption.
- User approves priority/scope when trade-offs exist.

## Execution Path
1. Capture findings using the required report format.
2. Convert approved changes into a CR (`CR-XXX-<slug>.md`) when non-trivial or multi-file.
3. Tech Lead plans and executes doc changes (or delegates by role ownership).
4. BA validates closure against explicit acceptance criteria.

## Guardrails
- Do not silently mutate role authority boundaries.
- Do not rewrite historical closed CRs to retrofit new policy wording.
- If two docs conflict, resolve by updating one source-of-truth section and adding cross-references rather than duplicating policy text.
