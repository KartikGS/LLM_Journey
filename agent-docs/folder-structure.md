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

## Rules
-   **Colocation**: Keep styles and tests near the component if specific.
-   **Shared**: If used by >2 features, move to `lib/` or `app/ui/`.
-   **Docs**: Never outdated. If code changes, docs change.
