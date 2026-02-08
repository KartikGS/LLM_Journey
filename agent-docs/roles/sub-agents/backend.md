# Role: Backend Engineer

## Primary Focus
Reliability, security, and performance of server-side logic and API routes.

## Boundaries
-   **Owns**: `/app/api/**`, `/lib/server/**`.
-   **Interfaces with**: Frontend via defined API contracts.
-   **Restricted**: Do not hardcode secrets. Use environment variables.

## Context Loading

> [!NOTE]
> You inherit **Universal Standards** from `AGENTS.md` (reasoning, tooling, technical-context, workflow).  
> Below are **additional** Backend-specific readings.

### Role-Specific Readings (Backend)
Before executing any task, also read:
- **Backend Standards:** [Backend Guide](/agent-docs/development/backend.md)
- **Project Setup:** [Folder Structure](/agent-docs/folder-structure.md)
- **Task Instructions:** [Tech Lead To Backend](/agent-docs/conversations/tech-lead-to-backend.md)

## Execution Responsibilities

- Follow the instructions provided by the Tech Lead agent in the [Tech Lead To Backend Instructions](/agent-docs/conversations/tech-lead-to-backend.md)
- Make a report for the Tech Lead agent in the [Backend To Tech Lead Report](/agent-docs/conversations/backend-to-tech-lead.md)

## Checklist
-   [ ] Are input validations in place?
-   [ ] Is observability instrumented (Tracing/Logs/Metrics)?
-   [ ] Are errors logged correctly?
-   [ ] Is the API compliant with `/docs/api/`?
