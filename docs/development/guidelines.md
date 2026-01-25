# Development Guidelines

This document describes the coding practices, conventions, and cross-cutting
concerns to follow when contributing to this project.

The goal is to ensure consistency, security, observability, and maintainability
as the codebase grows.

---

## General Principles

- Prefer **clarity over cleverness**
- Treat **observability and security as first-class concerns**
- Keep implementations **predictable and explicit**
- Optimize for **testability, readability and debuggability**, not premature performance

---

## Project Structure

- App Router is used (`app/`)
- API routes live under `app/api`
- Shared logic should live in `lib/`
- Cross-cutting utilities (otel, security, config) must not leak into UI code

Avoid tightly coupling:
- UI components with API logic
- Business logic with framework-specific APIs

---

## API Route Development

When creating or modifying an API route, ensure the following:

### 1. Observability

Every API route **must**:
- Create or participate in a trace
- Emit meaningful span names
- Record errors using span status and logs
- Include relevant attributes (route, method, status)

Avoid:
- Silent failures
- Catching errors without logging or tracing

Example considerations:
- Is latency measurable?
- Can failures be correlated across services?

---

### 2. Security

Each API route should explicitly consider:
- Request body size limits
- Input validation
- Authentication / authorization (if applicable)
- Abuse potential (rate limiting, replay, telemetry misuse)

Rules:
- Never trust client-provided headers blindly
- Validate telemetry tokens and short-lived credentials
- Redact sensitive data before logging or exporting telemetry

---

### 3. Error Handling

- Prefer explicit error responses
- Do not leak internal error details to clients
- Log internal errors with sufficient context for debugging

---

## Frontend Development

### Responsiveness

All frontend pages must:
- Be usable on mobile, tablet, and desktop
- Avoid hardcoded widths
- Use layout primitives consistently

Test pages at:
- Small mobile viewport
- Standard desktop viewport
- Dark mode and Light mode
---

### UI Consistency

- Reuse existing components and patterns
- Avoid introducing one-off UI behaviors
- Follow existing spacing, typography, and layout conventions

If a new pattern is required:
- Abstract it into a reusable component
- Document its intended usage

---

### Performance Considerations

- Avoid unnecessary client-side JavaScript
- Prefer server components when possible
- Lazy-load heavy or non-critical components

---

## Logging & Telemetry

- Logs should be structured and meaningful
- Avoid logging large payloads
- Never log secrets, tokens, or PII

Telemetry should:
- Help answer “what happened?” and “why?”
- Be actionable, not noisy
- Serve both debugging and performance analysis

---

## Testing Guidelines

- Write unit tests for isolated logic
- Write integration tests for component interactions
- Tests should be deterministic and fast

Avoid:
- Snapshot overuse
- Testing implementation details instead of behavior

---

## Configuration & Environment

- Do not hardcode environment-specific values
- Use configuration files and environment variables
- Clearly document assumptions about local vs production behavior

---

## Code Review Checklist (Self-Review)

Before submitting code, ask:
- Is this observable in production?
- Is this secure against basic abuse?
- Is this consistent with existing patterns?
- Will a new contributor understand this in 6 months?

---

## Documentation

- Update relevant docs when behavior changes
- Architecture or security changes must be documented
- Prefer short, clear explanations over exhaustive detail
