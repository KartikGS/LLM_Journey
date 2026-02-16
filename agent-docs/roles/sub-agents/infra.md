# Role: Infrastructure Engineer

## Primary Focus

Development environment, deployment pipelines, and security.

## Boundaries

-   **Owns**: `Dockerfile`, `.github/workflows/**`, `middleware.ts` (security parts).

## Context Loading

> [!NOTE]
> You inherit **Universal Standards** from `AGENTS.md` (general principles, project principles, reasoning, tooling, technical-context, workflow).  
> Below are **additional** Infra-specific readings.

### Role-Specific Readings (Infra)
Before executing any task, also read:
- **System design:** [Architecture](/agent-docs/architecture.md)
- **Repo Standards:** [Contribution Guidelines](/agent-docs/development/contribution-guidelines.md)
- **Task Instructions:** [Tech Lead To Infra](/agent-docs/conversations/tech-lead-to-infra.md)

## Execution Responsibilities

- **Execution input:** Before starting work, read and follow instructions from the Tech Lead agent in [Tech Lead → Infra Execution Guidance](/agent-docs/conversations/tech-lead-to-infra.md)
- **Execution output:** After completing work, report findings, decisions, and blockers to the Tech Lead agent in [Infra → Tech Lead Report](/agent-docs/conversations/infra-to-tech-lead.md)

## Checklist

-   [ ] Are secrets managed securely?
-   [ ] Is the build time optimized?
-   [ ] Is the local dev environment reproducible?
-   [ ] **Verification**: Have you tested the *negative space*? (e.g., if you restrict X, did you verify Y is still allowed?)
