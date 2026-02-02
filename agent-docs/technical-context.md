# Technical Context Cheat Sheet

This document provide quick access to key technical configurations and endpoints for the LLM Journey project.

## 1. Network & Endpoints
| Component | Value | Description |
| :--- | :--- | :--- |
| **Dev Server Port** | `3001` | Local development port. |
| **OTel Trace Endpoint** | `/api/otel/trace` | Proxy for exporting browser traces. |
| **OTel Token Endpoint** | `/api/telemetry-token` | Fetches short-lived telemetry tokens. |

## 2. Infrastructure & Tooling
| Tool | Target | Notes |
| :--- | :--- | :--- |
| **pnpm** | Package Manager | **Mandatory.** Do not use npm/yarn. |
| **Playwright** | E2E Testing | Use tags: `@critical`, `@smoke`. |
| **WASM Path** | `/onnx-runtime/` | Location of ONNX Web binaries. |

## 3. Key Constraints
- **Model Loading**: Can take up to 60s. Use bounded timeouts in tests.
- **Context Window**: 32 characters for the base Transformer model.
- **Framework**: Next.js 15 (App Router).
- **Environment Flags**: `E2E=true` disables HSTS, `upgrade-insecure-requests`, and rate-limiting for tests.
- **Browser Support**: Modern browsers with `wasm-unsafe-eval` support (Chrome 95+, FF 102+, Safari 17.4+).

## 4. Operational Invariants
- **Telemetry failure boundary**: Tracing failures must never crash the UI.
- **Git Hygiene**: Add all tool-generated artifacts to `.gitignore`.
