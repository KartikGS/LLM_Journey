# Architecture

## System Overview
LLM Journey is a Next.js application (App Router) integrating client-side inference (ONNX Runtime) and server-side orchestration.

## High-Level Components
-  **Frontend**: React 19, Tailwind CSS. Responsible for Chat UI, visualizations, and user interaction.
-  **Inference Engine**: ONNX Runtime Web. Runs small models entirely in the browser.
-  **Server API**: Next.js API Routes. Handles heavier orchestration, external tool calls, and telemetry.
-  **Observability**: OpenTelemetry-based tracing pipeline (Client -> Proxy -> Collector -> Backend) for client observability and OpenTelemetry Traces, Logs and Metrics setup for server.

## Data Flow
-   **Chat**: User Input -> `ChatInput` -> `useLLM` Hook -> Web Worker -> ONNX Runtime -> Response.
-   **Telemetry**: App -> OTel SDK -> `/app/api/otel/trace` (Proxy) -> OTel Collector.

## Architectural Invariants

The following constraints are non-negotiable and must be preserved by all changes:

### Observability Safety
- Telemetry must never block, crash, or degrade user-facing functionality
- Failures in tracing, metrics, or logging are always swallowed or isolated
- The OTEL proxy is a **failure boundary**, not a reliability dependency

### Security Boundaries
- All external inputs are treated as untrusted
- Request payload sizes are explicitly constrained
- Client telemetry is authenticated using short-lived tokens
- Sensitive information is redacted before logging or export

### Threat Model Scope
In scope:
- Excessive request payloads
- Client-side telemetry abuse
- Script injection via CSP violations

Out of scope:
- Distributed denial-of-service attacks
- Advanced bot detection
