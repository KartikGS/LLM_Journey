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
| `agent-docs/llm-journey/improvement/reports/` | Meta-analysis artifacts: per-role findings files, synthesis docs, alignment backlogs. See `$LLM_JOURNEY_IMPROVEMENT_REPORTS`. |
| `agent-docs/llm-journey/workflow/reports/` | Investigation reports (`INVESTIGATION-XXX.md`) and ad-hoc analysis artifacts. Not for meta-analysis files — those belong in `$LLM_JOURNEY_IMPROVEMENT_REPORTS`. |
| `agent-docs/llm-journey/workflow/requirements/` | CR requirement documents (`CR-XXX-<slug>.md`). Owned by BA. |
| `agent-docs/llm-journey/workflow/plans/` | Tech Lead execution plans (`CR-XXX-plan.md`). |
| `agent-docs/llm-journey/communication/conversations/` | Active handoff/report files between agents (single-CR working artifacts — replaced per CR) and permanent templates. See `$LLM_JOURNEY_COMMUNICATION_CONVERSATIONS`. |
| `agent-docs/llm-journey/communication/coordination/` | Cross-role protocols (handoff, feedback, conflict resolution, TL session state). See `$LLM_JOURNEY_COMMUNICATION_COORDINATION`. |
| `agent-docs/llm-journey/roles/` | Role definitions and sub-agent specs. |

## Rules
-   **Colocation**: Keep styles and tests near the component if specific.
-   **Shared**: If used by >2 features, move to `lib/` or `app/ui/`.
-   **Docs**: Never outdated. If code changes, docs change.
