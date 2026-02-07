# Technical Context Cheat Sheet

This document provide quick access to key technical configurations and endpoints for the LLM Journey project.

## Network & Endpoints
| Component | Value | Description |
| :--- | :--- | :--- |
| **Dev Server Port** | `3001` | Local development port. |
| **OTel Trace Endpoint** | `/app/api/otel/trace` | Proxy for exporting browser traces. |
| **OTel Token Endpoint** | `/app/api/telemetry-token` | Fetches short-lived telemetry tokens. |

## Infrastructure & Tooling
| Tool | Target | Notes |
| :--- | :--- | :--- |
| **pnpm** | Package Manager | **Mandatory.** Do not use npm/yarn. |
| **Playwright** | E2E Testing | Use tags: `@critical`, `@smoke`. |
| **WASM Path** | `/onnx-runtime/` | Location of ONNX Web binaries. |

## Standard Kit (Version 1.0)
> [!WARNING]
> **Governance Invariant**: Sub-agents are FORBIDDEN from installing packages. Only the Senior Developer may approve and run install commands.

| Category | Library | Purpose |
| :--- | :--- | :--- |
| **Logic & Validation** | `zod` | Runtime schema validation and type safety. |
| **State Management** | `zustand` | Global client-state management. |
| **UI Primitives** | `@radix-ui/react-*` | Unstyled, accessible component primitives. |
| **Styling Utils** | `clsx`, `tailwind-merge` | Conditional class merging. |
| **Animations** | `framer-motion` | Complex, premium UI animations. |
| **Icons** | `lucide-react` | Standard icon set. |
| **Content** | `react-markdown`, `remark-gfm` | Rendering educational markdown content. |
| **Syntax Highlighting** | `shiki` | Code block highlighting (server-side preferred). |


## Framework & Orchestration
| Layer | Tool/Pattern | Notes |
| :--- | :--- | :--- |
| **Agent Orchestration** | Single-agent loop | Main orchestration pattern. |
| **Stateful Agents** | LangGraph | For complex multi-agent flows. |
| **Conceptual Demos** | LangChain | Used for educational references. |
| **Evaluation** | Custom + Framework-inspired | RAG evaluation patterns. |
| **Observability** | OpenTelemetry | Traces, metrics, logs. |
| **E2E Testing** | Playwright | For visual and functional confidence. |

## Key Constraints
- **Model Loading**: Can take up to 60s. Use bounded timeouts in tests.
- **Context Window**: 32 characters for the base Transformer model.
- **Framework**: Next.js 15 (App Router).
- **Browser Support**: Modern browsers with `wasm-unsafe-eval` support (Chrome 95+, FF 102+, Safari 17.4+).

## Security & Privacy Context
| Feature | Policy | Rationale |
| :--- | :--- | :--- |
| **CSP: upgrade-insecure-requests** | Blocked in Dev/E2E | Prevents connection failure to localhost (HTTP). |
| **CSP: wasm-unsafe-eval** | **Mandatory** | Required for ONNX Runtime (WASM) execution. |
| **HSTS** | Production only | Prevents browser from forcing HTTPS on localhost. |
| **Rate Limiting** | 30 req/min (OTel) | Protection against telemetry spam. Disabled in E2E. |

## Operational Invariants
- **Telemetry failure boundary**: Tracing failures must never crash the UI.
- **Git Hygiene**: Add all tool-generated artifacts to `.gitignore`.
