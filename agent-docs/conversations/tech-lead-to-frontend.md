# Handoff: Tech Lead → Frontend Agent

## Subject
`CR-017 — Small Backlog Fixes: Transformers Heading Copy Rename`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior content: `CR-015` (`Adaptation Page: New AdaptationChat Component + Grid Enrichment`)
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-015-plan.md` ✓
- Evidence 2 (prior CR closed): `CR-015` status `Done` per `agent-docs/project-log.md` ✓
- Result: replacement allowed.

---

## Execution Mode
`feature-ui`

---

## Objective

Rename the `<h3>` heading on the Transformers page from the developer-facing placeholder `"Model Comparison Template"` to the learner-facing copy `"Tiny vs Frontier: By the Numbers"`.

This is a **copy-only change**. No structural, layout, styling, testid, route, or accessibility changes are permitted or required.

---

## Rationale (Why)

The `<h3>` currently reads `"Model Comparison Template"` — developer-facing language that was never replaced after the comparison card section was built. On a page visited by learners, this breaks the educational tone. The rename makes the heading meaningful and self-explanatory for the product end user without any UI rework.

---

## Known Environmental Caveats

- **Node.js runtime**: System runtime may be below `>=20.x` (documented minimum). Run `node -v` first. If below 20.x, activate via `nvm use 20`. If nvm is unavailable, classify as `environmental` in your report.
- **pnpm**: Use `pnpm` exclusively.

---

## Constraints

- **Copy-only**: Change only the string content of the `<h3>`. Do not change className, wrapping elements, surrounding structure, or any other content on the page.
- **No testid changes**: This `<h3>` has no `data-testid`. Do not add one.
- **No accessibility changes**: The `<h3>` semantic role is unchanged.
- **No visual redesign**: Light/dark mode classes, animations, and layout are frozen.
- **No other copy changes in scope**: Only this one `<h3>` is in scope for this CR.

---

## Contracts Inventory (Mandatory)

All existing contracts on the Transformers page must remain unchanged:

| Contract | Value | Status |
|:---|:---|:---|
| Route | `/foundations/transformers` | stable |
| All existing `data-testid` values | (unchanged) | stable |
| All `href` continuity links | (unchanged) | stable |

The `<h3>` heading has **no testid** — no selector contract to update.

---

## Assumptions To Validate (Mandatory)

1. `app/foundations/transformers/page.tsx` line 134 currently reads `<h3 ...>Model Comparison Template</h3>`. Confirm before editing.
2. The heading is static JSX content (not dynamically generated from data). Confirm — if dynamic, stop and flag before making changes.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

- If you notice any other developer-facing copy on the page while reading the file, **flag it in your report** as a future recommendation. Do not change it — this CR is scoped to the single `<h3>` only.
- If the heading has any surrounding structure that makes a copy-only change non-trivial (e.g., it is conditionally rendered or receives i18n treatment), **stop and flag it** before making changes.

---

## Scope

### Files to Modify
- `app/foundations/transformers/page.tsx`:
  - Line ~134: change `Model Comparison Template` → `Tiny vs Frontier: By the Numbers`
  - No other changes.

---

## Design Intent

- **Target aesthetic**: Unchanged. The copy replacement affects only the text content of the heading.
- **Animation budget**: None — no animation changes.
- **Anti-patterns**:
  - Do NOT add a `data-testid` to this `<h3>`.
  - Do NOT change any styling, className, or structure.
  - Do NOT touch any other line in the file unless the rename itself requires it.

---

## Definition of Done

- [ ] `<h3>` at `app/foundations/transformers/page.tsx` reads `"Tiny vs Frontier: By the Numbers"` (AC-4)
- [ ] No `data-testid`, route, `role`, or `aria-*` contracts changed (AC-7)
- [ ] No other file modified
- [ ] `pnpm lint` passes (AC-8)
- [ ] `pnpm exec tsc --noEmit` passes (AC-8)

---

## Clarification Loop (Mandatory)

- Post preflight concerns to `agent-docs/conversations/frontend-to-tech-lead.md`.
- Tech Lead responds in the same file.
- For a copy-only change of this scope, no blocking questions are anticipated — but follow the protocol if anything unexpected is found.

---

## Verification

Run in sequence:
```
node -v
pnpm lint
pnpm exec tsc --noEmit
```

Cite the exact file line in your report confirming the heading now reads `"Tiny vs Frontier: By the Numbers"`.

---

## Scope Extension Control (Mandatory)

If any feedback expands implementation beyond this handoff scope, mark it `scope extension requested` in your report. Wait for explicit `scope extension approved` from Tech Lead before implementing expanded work.

---

## Report Back

Write completion report to `agent-docs/conversations/frontend-to-tech-lead.md` using `agent-docs/conversations/TEMPLATE-frontend-to-tech-lead.md`.

Status vocabulary: `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`
