# Improvement Reports

This folder holds all improvement reports produced during meta-analysis cycles for the LLM Journey project.

See `$LLM_JOURNEY_IMPROVEMENT_PROTOCOL` for the full protocol that governs how these reports are created, structured, and used.

---

## What Goes Here

| Report Type | Naming Convention | Produced By |
|---|---|---|
| Lightweight synthesis | `META-YYYYMMDD-<CR-ID>-lightweight.md` | Tech Lead or BA (post-CR) |
| Per-agent findings | `META-YYYYMMDD-<CR-ID>-<role>-findings.md` | Each agent in Phase 1 |
| Synthesis | `META-YYYYMMDD-<CR-ID>-synthesis.md` | Improvement Agent (Phase 2) |
| Alignment backlog | `ALIGN-YYYYMMDD-backlog.md` | Tech Lead or BA (Mode B) |

---

## Templates

Report templates are defined in `$LLM_JOURNEY_IMPROVEMENT_PROTOCOL` (embedded inline in each phase section) and as standalone files:

- Lightweight: `$LLM_JOURNEY_IMPROVEMENT_TEMPLATE_LIGHTWEIGHT`
- Per-agent findings: `$LLM_JOURNEY_IMPROVEMENT_TEMPLATE_FINDINGS`
- Synthesis: `$LLM_JOURNEY_IMPROVEMENT_TEMPLATE_SYNTHESIS`
- Alignment backlog: `$LLM_JOURNEY_IMPROVEMENT_TEMPLATE_BACKLOG`

---

## Conventions

- Report files are **not** edited after creation. They are historical artifacts once produced.
- Synthesis files may be updated with implementation notes after Phase 3 completes (per protocol).
- Do not add non-report files to this folder. Templates live in `$LLM_JOURNEY_IMPROVEMENT_TEMPLATE_LIGHTWEIGHT` (and siblings). Protocol lives in `$LLM_JOURNEY_IMPROVEMENT_PROTOCOL`.
