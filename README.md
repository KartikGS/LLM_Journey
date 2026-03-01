# LLM Journey

**Stop calling APIs. Start building systems.**

LLM Journey is a guided learning environment for **software engineers with basic ML familiarity** who want to reason about LLM systems end-to-end. It is a systems-level reference implementation that strips away the magic, revealing the progression from raw self-attention to autonomous agentic teams.

> **Note:** This project is not a prompt-engineering cookbook or an API wrapper showcase. It is about understanding the architectural ideas that make these systems work.

---

## Who This Is For

LLM Journey serves two audiences. Both are first-class.

**Learner-user** — A software engineer who visits the website to understand LLM system architecture. Their goal is conceptual clarity, progressive narrative, and hands-on demonstrations. They judge success by whether they can reason about the system after reading — not by the elegance of code they never see.

**Developer-user** — A software engineer who reads the codebase as a reference implementation to build their own AI system: a production Next.js app integrating ONNX, streaming APIs, OpenTelemetry, and multi-provider LLM routing. They judge success by whether the code is architecturally legible, pattern-consistent, and production-realistic.

---

## The Learning Narrative: From Tensors to Teams

Each stage solves a fundamental limitation of the previous one.

| Stage | Topic | Route | Status |
| :---: | :--- | :--- | :--- |
| 1 | **Transformers (Foundations)** — Why self-attention is the engine, and what weights cannot tell you | `/foundations/transformers` | Live |
| 2 | **Model Adaptation** — Alignment is a fragile layer of data, not an inherent property of scale | `/models/adaptation` | Live |
| 3 | **Context Engineering** — Reliable LLM systems are built on context design, not temperature settings | `/context/engineering` | Planned |
| 4 | **RAG (Retrieval)** — Stop models from hallucinating by anchoring them in external reality | `/systems/rag` | Planned |
| 5 | **Agents & Tool Use** — The shift from chatbot to agent happens when you hand the model a steering wheel | `/agents/basic` | Planned |
| 6 | **Multi-Agent Systems** — Solving complex problems by introducing roles, delegation, and overhead | `/agents/multi` | Planned |
| 7 | **MCP (Standardization)** — Externalize capability safely using standardized interfaces | `/protocols/mcp` | Planned |
| 8 | **Eval & Observability** — Production AI is 10% model and 90% monitoring, evaluation, and security | `/ops/observability` | Planned |
| 9 | **Safety & Security** | `/ops/safety` | Planned |
| 10 | **Deployment** | `/ops/deployment` | Planned |

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19, Tailwind CSS |
| **Language** | TypeScript (strict mode) |
| **ML Runtime** | ONNX Runtime Web (browser-side inference via WASM) |
| **Package Manager** | pnpm (required — do not use npm, yarn, or bun) |
| **Observability** | OpenTelemetry (traces, metrics, logs) — server + client |
| **Testing** | Jest + React Testing Library (unit/integration), Playwright (E2E) |

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **pnpm** (only supported package manager — see [Tooling Standard](agent-docs/tooling-standard.md))

### Browser Support

This project uses WebAssembly (WASM) for client-side inference with a strict Content Security Policy requiring `wasm-unsafe-eval`.

| Browser | Minimum Version |
| :--- | :--- |
| Chrome / Edge | 95+ |
| Firefox | 102+ |
| Safari | 17.4+ |

### Installation

```bash
git clone https://github.com/KartikGS/LLM_Journey
cd LLM_Journey
pnpm install
```

### Environment Setup

Copy the environment template and add any required API keys:

```bash
cp .env.example .env.local
# Edit .env.local — add FRONTIER_API_KEY for live frontier model inference
```

The app runs without API keys by default (fallback mode is active for all AI routes).

### Development Server

```bash
pnpm dev
# App available at http://localhost:3001
```

### Quality Gates

```bash
pnpm test               # Unit + integration tests (Jest)
pnpm lint               # ESLint
pnpm exec tsc --noEmit  # TypeScript type check
pnpm build              # Production build
pnpm test:e2e           # E2E tests (Playwright, requires local server on port 3001)
```

### Production Build

```bash
pnpm build
pnpm start
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  ┌───────────────────┐   ┌───────────────────────────┐ │
│  │ ONNX Runtime Web  │   │ Frontier / Adaptation     │ │
│  │ (tiny model,      │   │ Chat UI (SSE streaming    │ │
│  │  browser WASM)    │   │  from server API routes)  │ │
│  └───────────────────┘   └───────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
           │                          │
           │                          ▼
           │               ┌─────────────────────────┐
           │               │  Next.js API Routes     │
           │               │  /api/frontier/         │
           │               │  /api/adaptation/       │
           │               │  /api/otel/trace  ──────┼──► OTel Collector
           │               │  /api/telemetry-token   │    (Grafana Tempo)
           │               └─────────────────────────┘
           │
           ▼
   Web Worker → ONNX Runtime
   (browser inference, no server round-trip)
```

**Key design decisions:**
- **"Learn with Tiny, Build with Large"**: ONNX Runtime handles tiny-model mechanics in the browser; hosted APIs handle production-scale application demos.
- **OTel proxy** ([ADR-0001](agent-docs/decisions/ADR-0001-telemetry-proxy.md)): Client telemetry is routed through a server-side proxy to prevent credential exposure, enforce payload limits, and maintain vendor-agnostic observability.
- **Server-first rendering**: Pages default to Server Components; client islands are introduced only for user-interactive surfaces.
- **SSE streaming**: Generation routes use Server-Sent Events for token-by-token streaming to the frontend.

---

## Project Structure

```
LLM_Journey/
├── app/                        # Next.js App Router
│   ├── foundations/transformers/   # Stage 1 — live
│   ├── models/adaptation/          # Stage 2 — live
│   ├── api/
│   │   ├── frontier/               # Frontier base inference (multi-provider)
│   │   ├── adaptation/             # Adaptation inference
│   │   ├── otel/trace/             # OTel telemetry proxy (ADR-0001)
│   │   └── telemetry-token/        # Short-lived client telemetry tokens
│   └── ui/                         # Shared UI components
├── components/                 # React components
├── lib/
│   ├── config/                 # Generation configs, stage metadata
│   ├── llm/                    # LLM orchestration logic
│   ├── otel/                   # Metrics + tracing setup
│   ├── security/               # Rate limiting, input validation
│   └── server/                 # Shared server utilities (SSE relay, etc.)
├── __tests__/                  # Test suite (Jest + Playwright)
│   ├── api/                    # API route integration tests
│   ├── components/             # Component tests
│   ├── lib/                    # Library unit tests
│   └── e2e/                    # Playwright E2E specs
├── agent-docs/                 # Agentic development documentation
├── human-docs/                 # Human contributor documentation
├── observability/              # Local OTel stack (Docker Compose)
└── public/
    └── onnx-runtime/           # ONNX Runtime WASM binaries
```

---

## Observability Infrastructure (Local)

The project ships a Docker Compose stack for local tracing and metrics.

```bash
cd observability
docker compose up -d
# Grafana at http://localhost:3000
# Tempo (traces), Prometheus (metrics), Loki (logs)
docker compose down
```

Pinned component versions for reproducibility:

| Component | Version |
| :--- | :--- |
| OpenTelemetry JS SDK | 2.3.0 |
| Grafana Tempo | 2.4.1 |
| Prometheus | 2.48.1 |
| Grafana | 10.2.3 |
| Loki | 2.9.4 |

> **Note:** The observability stack is for local development only. Production deployments forward telemetry to Grafana Cloud via the OTel Collector.

---

## Agentic Development Workflow

This project uses a structured multi-agent development process to keep code and documentation quality high as the system evolves.

**Entry point:** [agent-docs/AGENTS.md](agent-docs/AGENTS.md) — read this first before contributing.

**CR lifecycle (how changes land):**

```
Human User
  └─► BA Agent: clarifies intent → produces CR-XXX artifact
       └─► Tech Lead Agent: technical plan → delegates to sub-agents
            ├─► Frontend / Backend / Testing / Infra Agent (execution)
            └─► BA Agent: acceptance verification → CR marked Done
```

**Role files:**

| Role | File |
| :--- | :--- |
| Business Analyst | [agent-docs/roles/ba.md](agent-docs/roles/ba.md) |
| Tech Lead | [agent-docs/roles/tech-lead.md](agent-docs/roles/tech-lead.md) |
| Frontend | [agent-docs/roles/sub-agents/frontend.md](agent-docs/roles/sub-agents/frontend.md) |
| Backend | [agent-docs/roles/sub-agents/backend.md](agent-docs/roles/sub-agents/backend.md) |
| Testing | [agent-docs/roles/sub-agents/testing.md](agent-docs/roles/sub-agents/testing.md) |
| Infra | [agent-docs/roles/sub-agents/infra.md](agent-docs/roles/sub-agents/infra.md) |

---

## Documentation Map

| Directory | Audience | Purpose |
| :--- | :--- | :--- |
| `agent-docs/` | Agents + contributors | Role definitions, CR workflow, architecture decisions, technical contracts |
| `agent-docs/requirements/` | All | CR artifacts — change history and acceptance criteria |
| `agent-docs/decisions/` | All | Architecture Decision Records (ADRs) |
| `agent-docs/plans/` | Tech Lead + sub-agents | Technical execution plans per CR |
| `agent-docs/conversations/` | Agents | Active handoff and report files between roles |
| `human-docs/` | Human contributors | Getting started guide, style guide, personal journey notes |

---

## Model Information

The tiny base model used for browser-side inference in Stage 1:

| Property | Value |
| :--- | :--- |
| Architecture | Decoder-only transformer (self-attention) |
| Parameters | ~0.2M |
| Training data | Shakespeare dataset |
| Format | ONNX (browser WASM inference) |
| Runtime | ONNX Runtime Web |
| Context window | 32 characters |

This model is intentionally small and limited to demonstrate transformer mechanics without API costs or latency. Stage 2 onward uses hosted frontier models.

---

## License

MIT
