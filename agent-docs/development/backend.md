# Backend Development Standards

## Stack
-   Next.js API Routes (Route Handlers)
-   Node.js Runtime

## Guidelines
-   Default to JSON responses for product-facing APIs (`NextResponse.json`).
-   Allowed exceptions: proxy/status/streaming endpoints may return status-only or non-JSON bodies when contract-appropriate.
-   Use `NextResponse` for all responses.
-   Handle relevant HTTP status codes explicitly (for example `200`, `202`, `204`, `400`, `401`, `404`, `415`, `429`, `500`, `503`, `504`).
-   Treat endpoint-level request hardening as backend scope: payload-size limits, `content-length` checks, and route-specific validation/auth controls where applicable.
-   If a security change is global/platform-wide (middleware/header/runtime policy), coordinate via Infra ownership and explicit Tech Lead delegation.
-   Document new or changed route contracts in `/agent-docs/api/`.
-   Follow the [Development Standards](./development-standards.md).
-   When creating or modifying utilities in `lib/server/`, apply the Leaf Utility Isolation principle documented in Development Standards — keep them dependency-free.
-   After any function extraction task, audit the source file for newly unused imports and constants and remove them before running lint.

## Verification Scope

Check the handoff DoD before applying any default here. If the DoD specifies a verification scope (e.g., full-suite `pnpm test`), that takes precedence. The role-doc default applies only when the DoD is silent on verification scope.

Default when the DoD is silent: run the scoped spec for the changed module only.
