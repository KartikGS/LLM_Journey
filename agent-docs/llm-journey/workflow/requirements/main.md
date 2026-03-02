# Requirements

## Directory Guide

`/agent-docs/llm-journey/workflow/requirements/` stores Change Requirement (CR) artifacts as the source of historical scope and acceptance intent.

### Naming
- Use `CR-XXX-<slug>.md` (zero-padded numeric ID), e.g. `CR-008-governance-update.md`.
- IDs are strictly increasing; never reuse an existing ID.

### Status Model
- `Draft`
- `Clarified`
- `In Progress`
- `Done`
- `Blocked`

### Legacy Status Mapping (Historical CRs)
Older CRs may use prior wording. Treat these as equivalent for interpretation and reporting:
- `Completed` -> `Done`
- `Implemented` -> `Done`
- `Done ✅` -> `Done`

Policy:
- Do not bulk-edit old closed CRs only to normalize wording.
- Use canonical status labels for all new CRs and new updates.

### Historical Integrity Rule
- Closed CRs (`Done`) are historical records and are immutable by default.
- Do not retrofit older CRs to match new template structure or formatting.
- Legacy structure differences across old CRs are expected and acceptable.

### Allowed Post-Closure Edits
- Typo or formatting corrections
- Broken internal/external link corrections
- Factual correction that does not alter historical intent

When applying any allowed post-closure edit, append an `Amendment Log` entry in the CR:
- Date
- Reason
- What was changed

### If You Discover Gaps in an Old CR
- Do not rewrite old ACs to "look modern."
- Create a follow-up artifact:
  - A new CR, or
  - An investigation report in `/agent-docs/llm-journey/workflow/reports/` referencing the original CR ID.
- Keep the original closed CR intact, except for amendment-noted corrections.

### Traceability
- Every CR referenced in `$LLM_JOURNEY_LOG` must exist as a file in this directory.
- BA handoffs and closure evidence should reference the CR ID explicitly.

---

## CR Template

```
# CR-XXX: [Title]

## Status
[Draft | Clarified | In Progress | Done | Done (user validation pending) | Blocked]

## Business Context
**User Need:**
**Expected Value:**
**Execution Mode:** [Standard | Fast | Heavy]

## Functional Requirements
1.
2.

## Non-Functional Requirements
- Performance:
- Security:
- Accessibility:

## System Constraints & Invariants
- **Constraint Mapping**: [List specific ADRs, technical-context, or tooling-standard rules that apply]
- **Design Intent**: [Is this change a core pivot or a standard feature extension? Why is it built this way?]

## Acceptance Criteria
- [ ]
- [ ]

## Verification Mapping
- **Development Proof**: [How should the developer prove the AC are met? e.g., 'Passes E2E test X', 'Manual verification of fallback UI']
- **AC Evidence Format (for closure)**:
  - Use one line per AC in this pattern:
  - `[x] <AC text> — Verified: <file-or-command>, <result>`
  - Example:
  - `[x] pnpm build passes — Verified: \`pnpm build\`, exit code 0`
- **User Validation**: [How will the human verify this? e.g., 'Navigation link takes me to /new-page']

## Baseline Failure Snapshot (Required for Regression/Incident CRs)
<!-- If the failure is an external service constraint (e.g., API tier limitation, provider quota) not reproducible by any local command, write: "N/A — external service failure; baseline not reproducible locally. See Notes." -->
- **Date**: [YYYY-MM-DD]
- **Command(s)**: [Exact command(s) used]
- **Execution Mode**: [sandboxed | local-equivalent/unsandboxed]
- **Observed Result**: [Failing specs/errors with concise facts]

## Post-Fix Validation Snapshot (Filled at Closure)
- **Date**: [YYYY-MM-DD]
- **Command(s)**: [Exact command(s) used]
- **Execution Mode**: [sandboxed | local-equivalent/unsandboxed]
- **Observed Result**: [Pass/fail summary, including browser matrix for E2E]

## Environment Variable Changes
<!-- Required only when this CR adds, removes, or redefines environment variables. Delete section if not applicable. -->
- `VAR_NAME` — add / remove / rename: [purpose and expected value or reference]

## Dependencies
- Blocks:
- Blocked by:

## Notes
[BA Agent notes, user clarifications, etc.]

## Technical Analysis (filled by Tech Lead — required for M/L/H complexity; optional for [S])
**Complexity:** [Low | Medium | High]
**Estimated Effort:** [S | M | L]
**Affected Systems:**
**Implementation Approach:**

## Deviations Accepted (filled at closure by BA)
[List deviations from the Tech Lead's completion report and whether they were accepted or escalated.]
- None / [Deviation description] — Accepted / Escalated
```
