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
