# LLM Journey — Conversations

This folder contains the live inter-agent handoff and report files for the current CR, plus the permanent templates that govern their format.

---

## What Lives Here

### Active Handoff / Report Files

These are single-CR working artifacts. Each file holds the current live handoff or report for that role pair. When a new CR begins, the file is replaced (after confirming the prior CR is closed — see `$LLM_JOURNEY_COMMUNICATION_COORDINATION` for the handoff protocol and its pre-replacement check rule).

| File | Direction | Trigger |
|---|---|---|
| `ba-to-tech-lead.md` | BA → Tech Lead | CR clarified and approved by user |
| `tech-lead-to-ba.md` | Tech Lead → BA | CR verification complete |
| `tech-lead-to-backend.md` | Tech Lead → Backend | Planning gate passed, user gave Go |
| `tech-lead-to-frontend.md` | Tech Lead → Frontend | Planning gate passed, user gave Go |
| `tech-lead-to-infra.md` | Tech Lead → Infra | Planning gate passed, user gave Go |
| `tech-lead-to-testing.md` | Tech Lead → Testing | Planning gate passed, user gave Go |
| `backend-to-tech-lead.md` | Backend → Tech Lead | Implementation and local verification complete |
| `frontend-to-tech-lead.md` | Frontend → Tech Lead | Implementation and local verification complete |
| `infra-to-tech-lead.md` | Infra → Tech Lead | Implementation and local verification complete |
| `testing-to-tech-lead.md` | Testing → Tech Lead | Implementation and local verification complete |

### Templates

Templates are permanent. They define the mandatory fields and format for each conversation type. Do not replace or archive templates during CR transitions — they are not working artifacts.

| File | Purpose |
|---|---|
| `TEMPLATE-ba-to-tech-lead.md` | BA → Tech Lead requirement handoff |
| `TEMPLATE-ba-tech-lead-clarification.md` | Iterative clarification rounds between BA and Tech Lead |
| `TEMPLATE-tech-lead-to-ba.md` | Tech Lead → BA verification completion |
| `TEMPLATE-tech-lead-to-backend.md` | Tech Lead → Backend task delegation |
| `TEMPLATE-tech-lead-to-frontend.md` | Tech Lead → Frontend task delegation |
| `TEMPLATE-tech-lead-to-infra.md` | Tech Lead → Infra task delegation |
| `TEMPLATE-tech-lead-to-testing.md` | Tech Lead → Testing task delegation |
| `TEMPLATE-tech-lead-to-sub-agent.md` | Generic Tech Lead → sub-agent (when no role-specific template exists) |
| `TEMPLATE-backend-to-tech-lead.md` | Backend → Tech Lead execution report |
| `TEMPLATE-frontend-to-tech-lead.md` | Frontend → Tech Lead execution report |
| `TEMPLATE-infra-to-tech-lead.md` | Infra → Tech Lead execution report |
| `TEMPLATE-testing-to-tech-lead.md` | Testing → Tech Lead execution report |

---

## Rules

- **One active file per role pair.** There is never more than one live `ba-to-tech-lead.md` at a time. Replacement requires a pre-replacement check (prior CR closed, prior artifact evidence present).
- **Templates are immutable in structure.** Fields may be refined through A-Society pattern proposals — they are not modified ad hoc per CR.
- **Status tokens are exact.** Use only the vocabulary defined in `$LLM_JOURNEY_COMMUNICATION_COORDINATION` (`issued`, `in_progress`, `blocked`, `partial`, `completed`, `verified`, `needs_environment_verification`).
- **Inline snippets ≤ ~30 lines.** Larger specs live in `workflow/` or a dedicated specs file; the handoff links to it.

---

## See Also

- `$LLM_JOURNEY_COMMUNICATION_COORDINATION` — handoff protocol, bidirectional clarification loop, failure classification rules, and feedback protocol
- `$LLM_JOURNEY_WORKFLOW` — the phases that produce and consume these artifacts
