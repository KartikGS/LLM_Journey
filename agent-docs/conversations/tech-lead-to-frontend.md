# Handoff: Tech Lead → Frontend Agent

## Subject
`CR-014 - Comparison Table Concretization: Fill Meta-Llama-3-8B values, remove developer subtitle`

## Status
`issued`

## Execution Mode (Mandatory)
`feature-ui`

---

## Objective

Update the comparison table on the Transformers page (`app/foundations/transformers/page.tsx`) with concrete `meta-llama/Meta-Llama-3-8B` values and remove the developer-facing subtitle. No structural, route, or selector contract changes.

---

## Rationale (Why)

The comparison table currently shows `TBD` placeholders and an internal developer instruction ("Use this template when you lock concrete model choices.") that is visible to learners. This is the core educational comparison artifact of Stage 1 — learners are meant to anchor the Tiny vs Frontier comparison on concrete facts (model size, context window, tokenization). Without real values, the comparison is abstract and the educational moment is lost.

---

## Constraints

**UI/UX:**
- Do not change `data-testid="transformers-comparison"` or any other `data-testid` on the page.
- Do not change row labels or table structure — only the Scaled Base Model column header and the three cell values in that column.
- No visual redesign. The table renders as-is; only text content changes.
- No new components, no layout changes, no animation changes.

**Ownership:**
- Only `app/foundations/transformers/page.tsx` is in scope.
- Do not modify any other file.
- No package installation.
- No test file changes (no route/testid/accessibility contract changes — existing tests unaffected).

---

## Contracts Inventory (Mandatory)

- Route contracts: `/foundations/transformers` — **unchanged**
- Selector/accessibility contracts — **all unchanged**:
  - `transformers-comparison` (the table wrapper) — do not touch
  - All other existing `data-testid` attributes on the page — do not touch
- No new selector contracts being added
- No continuity/navigation contracts change

---

## Design Intent (Mandatory for UI)

- Target aesthetic: existing table styling unchanged — this is a text content update only.
- Animation budget: none — no new animations.
- Explicit anti-patterns:
  - Do not rewrite table structure, row labels, or styling classes.
  - Do not add new table rows or columns.
  - Do not change the Tiny Transformer column content.

---

## Assumptions To Validate (Mandatory)

1. The subtitle `"Use this template when you lock concrete model choices."` at `page.tsx:135` is a standalone `<p>` element and can be removed without affecting surrounding layout.
2. The three `TBD` cells and the `Scaled Base Model` column header are standalone text nodes replaceable without structural changes.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

1. If removing the subtitle paragraph creates a layout regression (e.g., unexpected spacing collapse), flag it rather than adding compensating markup without Tech Lead approval.
2. Any other `TBD` content elsewhere on the page is out of scope — do not change it.

---

## Scope

### Files to Modify

**`app/foundations/transformers/page.tsx`** — four targeted text changes:

| Location | Current | Required |
|---|---|---|
| `page.tsx:135` — subtitle `<p>` | `Use this template when you lock concrete model choices.` | *(remove the entire `<p>` element)* |
| `page.tsx:145` — column header `<th>` | `Scaled Base Model` | `Meta-Llama-3-8B` |
| `page.tsx:152` — tokenization `<td>` | `TBD (depends on selected model)` | `BPE (byte-pair encoding), 128K vocabulary` |
| `page.tsx:157` — context window `<td>` | `TBD` | `8,192 tokens` |
| `page.tsx:162` — model size `<td>` | `TBD` | `8B parameters` |

Line numbers are provided as navigation hints from last read. Confirm the actual content matches before editing.

---

## Definition of Done

- [ ] Column header reads `Meta-Llama-3-8B` (not `Scaled Base Model`)
- [ ] Tokenization cell reads `BPE (byte-pair encoding), 128K vocabulary`
- [ ] Context window cell reads `8,192 tokens`
- [ ] Model size cell reads `8B parameters`
- [ ] Subtitle `"Use this template when you lock concrete model choices."` is absent
- [ ] `data-testid="transformers-comparison"` is unchanged
- [ ] No other selectors, row labels, or table structure changed
- [ ] `pnpm lint` passes
- [ ] `pnpm exec tsc --noEmit` passes

---

## Clarification Loop (Mandatory)

Before implementation, post preflight note to `agent-docs/conversations/frontend-to-tech-lead.md`:
- Confirm the subtitle element and TBD cells match expected content at stated line numbers.
- Any open question that could affect scope.

If any open question changes contracts or scope — pause and wait for Tech Lead response.

---

## Verification

Run and report:
1. `pnpm lint` — must pass clean
2. `pnpm exec tsc --noEmit` — must pass clean

Manual check to report:
- Comparison table renders with `Meta-Llama-3-8B` header and concrete values visible on `/foundations/transformers`
- Developer subtitle is absent
- `data-testid="transformers-comparison"` present and unchanged

---

## Scope Extension Control (Mandatory)

If implementation reveals any adjacent change is needed beyond the four text edits above, mark it `scope extension requested` and pause. Do not implement expanded work without explicit Tech Lead approval.

---

## Report Back

Write completion report to `agent-docs/conversations/frontend-to-tech-lead.md`.
Use template: `agent-docs/conversations/TEMPLATE-frontend-to-tech-lead.md`

---

## Reference Files

- Plan: `agent-docs/plans/CR-014-plan.md`
- CR: `agent-docs/requirements/CR-014-hf-router-migration-and-comparison-table.md`
- Transformers page: `app/foundations/transformers/page.tsx`

---
*Handoff created: 2026-02-20*
*Tech Lead Agent*
