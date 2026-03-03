# ADR 0001: Introduce an OpenTelemetry Proxy for Client Telemetry

## Status
Accepted

## Date
2026-01-23

## Context

This project collects telemetry (traces, metrics, and logs) from both
server-side and client-side code.

Directly exporting telemetry from the browser to an OpenTelemetry Collector
or third-party observability backend introduces several challenges:

- Exposure of collector endpoints and credentials to clients
- Lack of control over client telemetry volume and payload size
- Difficulty enforcing security, validation, and redaction policies
- Risk of telemetry abuse or malformed payloads affecting backend systems

Additionally, the project aims to:
- Demonstrate production-grade observability practices
- Maintain clear separation between client and backend infrastructure
- Support both local (Docker-based) and production (Grafana Cloud) setups

---

## Decision

Introduce a **server-side OpenTelemetry proxy** implemented as a Next.js API
route.

Client-side telemetry is sent to the proxy instead of directly to the
OpenTelemetry Collector. The proxy is responsible for validation, security,
and controlled forwarding of telemetry data.

---

## Architecture Overview

Client  
→ Next.js OTEL Proxy (API Route)  
→ OpenTelemetry Collector  
→ Backend Systems (Tempo, Prometheus, Loki)

---

## Responsibilities of the OTEL Proxy

The proxy performs the following functions:

### Security
- Validates short-lived telemetry tokens issued to clients
- Enforces request body size limits
- Prevents direct exposure of collector endpoints
- Redacts sensitive information before forwarding

### Observability
- Creates spans for proxy requests
- Records upstream latency and error conditions
- Emits metrics related to proxy usage and failures

### Control & Stability
- Acts as a choke point for client telemetry volume
- Allows selective forwarding or rejection of telemetry
- Enables future sampling or rate-limiting strategies

---

## Alternatives Considered

### 1. Direct Client → Collector Export
**Rejected**

Reasons:
- Requires exposing collector endpoints publicly
- Difficult to secure without complex infrastructure
- Limited ability to validate or constrain telemetry payloads
- Higher blast radius for client-side misuse

---

### 2. Direct Client → Third-Party Backend (e.g. Grafana Cloud)
**Rejected**

Reasons:
- Vendor-specific client configuration
- Credentials or API keys must be exposed to the browser
- Reduced flexibility for local development and testing
- Harder to demonstrate vendor-agnostic observability design

---

### 3. Disable Client-Side Telemetry
**Rejected**

Reasons:
- Loss of valuable client-side performance and error visibility
- Reduces observability coverage for user-facing flows
- Not aligned with the project’s educational goals

---

## Consequences

### Positive
- Improved security and control over client telemetry
- Clear separation between client code and observability infrastructure
- Consistent telemetry handling across environments
- Easier to evolve observability strategy over time

### Negative
- Additional latency for client telemetry ingestion
- Increased complexity in the backend
- Proxy itself must be observable and maintained

---

## Notes

- The proxy is designed for **controlled telemetry ingestion**, not as a
  general-purpose API gateway
- Local development uses Docker-based observability infrastructure
- Production deployment forwards telemetry to Grafana Cloud via the
  OpenTelemetry Collector
