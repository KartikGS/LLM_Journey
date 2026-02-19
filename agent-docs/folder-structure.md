# Folder Structure

## Why these folders exist

```
LLM-Journey/
├── app/                    # Next.js App Router (Pages & API)
│   ├── api/                # Server-side logic & proxies
│   ├── [feature]/          # Feature-scoped pages
│   └── ui/                 # Shared UI components
├── lib/                    # Business Logic (Framework agnostic where possible)
│   ├── llm/                # Core inference logic
│   └── utils.ts            # Helpers
├── public/                 # Static Assets & Models
├── agent-docs/             # Documentation (You are here)
└── __tests__/              # Tests (Mirrors source structure)
```

## Key `agent-docs/` Subdirectories

| Directory | Purpose |
| :--- | :--- |
| `agent-docs/meta/` | Multi-agent meta-analysis artifacts: per-role findings files (`META-YYYYMMDD-<CR-ID>-<role>-findings.md`) and synthesis docs (`META-YYYYMMDD-<CR-ID>-synthesis.md`). See `coordination/meta-improvement-protocol.md`. |
| `agent-docs/reports/` | Investigation reports (`INVESTIGATION-XXX.md`) and ad-hoc analysis artifacts. Not for meta-analysis files — those belong in `meta/`. |
| `agent-docs/requirements/` | CR requirement documents (`CR-XXX-<slug>.md`). Owned by BA. |
| `agent-docs/plans/` | Tech Lead execution plans (`CR-XXX-plan.md`). |
| `agent-docs/conversations/` | Active handoff/report files between agents (single-CR working artifacts — replaced per CR). |
| `agent-docs/coordination/` | Cross-role protocols (workflow invariants, meta-improvement, reasoning principles). |
| `agent-docs/roles/` | Role definitions and sub-agent specs. |
| `agent-docs/decisions/` | Architecture Decision Records (ADR-XXX). |
| `agent-docs/development/` | Language/stack-specific development standards. |

## Rules
-   **Colocation**: Keep styles and tests near the component if specific.
-   **Shared**: If used by >2 features, move to `lib/` or `app/ui/`.
-   **Docs**: Never outdated. If code changes, docs change.
