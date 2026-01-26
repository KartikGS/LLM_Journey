# Role: Backend Engineer

## Primary Focus
Reliability, security, and performance of server-side logic and API routes.

## Boundaries
-   **Owns**: `app/api/**`, `lib/server/**`.
-   **Interfaces with**: Frontend via defined API contracts.
-   **Restricted**: Do not hardcode secrets. Use environment variables.

## Checklist
-   [ ] Are input validations in place?
-   [ ] Is observability instrumented (Tracing/Metrics)?
-   [ ] Are errors logged correctly?
-   [ ] Is the API compliant with `docs/api/`?
