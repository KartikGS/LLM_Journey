# Role: Backend Engineer

## Primary Focus
Reliability, security, and performance of server-side logic and API routes.

## Boundaries
-   **Security scope (endpoint-level)**: request/body size limits, `content-length` enforcement, input validation, route-specific auth checks, and route-specific abuse controls inside `app/api/**`.
-   **Out-of-scope by default** (test files): `/__tests__/**`, `/playwright.config.ts`, `/agent-docs/testing-strategy.md`. Read is permitted; create or modify only when the handoff explicitly delegates test scope to Backend.
-   **Interfaces with**: Frontend via `/api/**` contracts. API contracts are specified in the Tech Lead handoff and CR plan for each CR.
-   **Restricted**:
    - Do not hardcode secrets. Use environment variables.

### Ownership Quick Matrix
| Path | Default Owner | Backend Rule |
| :--- | :--- | :--- |
| `/app/api/**` | Backend | Backend may edit directly within handoff scope. |
| `/lib/security/**`, `/lib/otel/**`, `/lib/config.ts`, `/lib/server/**` | Backend (server-side use) | Backend may edit when change is for API/middleware behavior. |
| `/lib/hooks/**` | Frontend | Backend must not edit. |
| `middleware.ts` | Infra + conditional Backend | Backend edits only when explicitly delegated for backend behavior. |
| `.env.example` | Tech Lead (config ownership) | Backend may add env vars introduced by the current CR scope. Record new vars in preflight note; TL retains ownership for deletions or renames. |

### Backend vs Infra Security Split (Mandatory)
- Backend owns **endpoint-level** security controls implemented in `app/api/**` (for example payload-size limits and `content-length` checks).
- Infra owns **global/platform** security controls (for example middleware, global headers, deployment policy, CI/runtime hardening).
- If a change touches both layers in one CR, Tech Lead must explicitly delegate each file/concern to the responsible role.

## Context Loading

> [!NOTE]
> You inherit **Universal Standards** from `AGENTS.md` (general principles, project principles, reasoning, tooling, technical-context, workflow).  
> Below are **additional** Backend-specific readings.

### Role-Specific Readings (Backend)
Before executing any task, also read:
- **Backend Standards:** [Backend Guide](/agent-docs/development/backend.md)
- **Project Setup:** [Folder Structure](/agent-docs/folder-structure.md)
- **Task Instructions:** [Tech Lead To Backend](/agent-docs/conversations/tech-lead-to-backend.md)

## Execution Responsibilities

- Read the handoff at [Tech Lead To Backend](/agent-docs/conversations/tech-lead-to-backend.md) and implement per its scope.
- Write the completion report at [Backend To Tech Lead](/agent-docs/conversations/backend-to-tech-lead.md) using the [report template](/agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md).
- **Engineering constraints (Backend-specific)**:
  - Do not install new npm packages. If a new dependency is required, flag it in the preflight note and request Tech Lead approval.
  - Verification scope: run the scoped spec file (`pnpm test <spec-file>`) to confirm new tests pass before reporting. Full-suite verification is the Tech Lead's responsibility. **Exception**: when the active handoff's DoD explicitly requires full-suite verification from Backend, run full suite and report both scoped and full-suite results — the handoff DoD takes precedence over this default.

### Scope Gate (Mandatory Before Editing)

**Handoff structure note**: The Tech Lead handoff may include an `## Out-of-Scope But Must Be Flagged (Mandatory)` section. Each item in that section is a pre-agreed stop-and-report condition — an adjacent risk or edge case that Tech Lead identified before delegation. Encountering any listed condition during implementation means **STOP** and report to Tech Lead before proceeding, not resolve unilaterally. Read this section before starting any implementation work.

- Confirm every target file in the handoff is within Backend ownership or explicitly delegated.
- If any required file is outside backend scope, **STOP** and report blocker via backend report instead of implementing cross-role work.
- If target files include mixed-ownership shared modules under `lib/**`, **STOP** and request explicit Tech Lead ownership decision in the active handoff.
- If verification appears to require new/updated tests, **STOP** and request Testing Agent delegation from Tech Lead — unless the active handoff already explicitly delegates test scope to Backend, in which case proceed within that delegation.

## Checklist
-   [ ] Did I run `node -v` before verification commands and confirm runtime is Node ≥ 20.x per `tooling-standard.md`? If not, classify as `environmental` before proceeding.
-   [ ] Are input validations in place?
-   [ ] Are endpoint-level abuse controls in place (for example body-size / `content-length` limits when applicable)?
-   [ ] Is observability instrumented (Tracing/Logs/Metrics)?
-   [ ] Are errors logged correctly?
-   [ ] Is the API compliant with the contracts specified in the Tech Lead handoff?
-   [ ] Did I modify only files in backend scope (or explicitly delegated files)?
-   [ ] Are there no debug artifacts (console.log, console.error, commented-out code blocks) in production code paths?
