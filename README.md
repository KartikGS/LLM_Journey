# LLM Journey

**Stop calling APIs. Start building systems.**

LLM Journey is a guided learning environment for **software engineers with basic ML familiarity** who want to reason about LLM systems end-to-end. It is a systems-level reference implementation that strips away the magic, revealing the progression from raw self-attention to autonomous agentic teams.

> **Note:** This project is not a prompt-engineering cookbook or an API wrapper showcase. It is about understanding the architectural ideas that make these systems work.

---

## 🎯 The Vision
Most LLM education treats models as black boxes. This project treats them as **engineered components**. 

By the end of this journey, you won't just know how to use an agent; you will understand the architectural evolution that made it necessary, the failure modes that make it fragile, and the trade-offs required to make it production-grade.

## 🗺️ The Learning Narrative: From Tensors to Teams
We don't just list features; we follow a **conceptual dependency chain**. Each stage solves a fundamental limitation of the previous one.

1.  **Foundations (The Engine)**: `Tensors → Transformers`. 
    *   *The Lesson:* Why self-attention is the fire that fuels the engine, and what weights *cannot* tell you.
2.  **Adaptation (The Behavior)**: `Base → Instruct → Optimized`. 
    *   *The Lesson:* Alignment is a fragile layer of data, not an inherent property of scale.
3.  **Context (The Interface)**: `Prompt → Structured Context`. 
    *   *The Lesson:* Reliable LLM systems are built on context design, not temperature settings.
4.  **Retrieval (The Memory)**: `RAG → Grounding`. 
    *   *The Lesson:* How to stop models from dreaming by anchoring them in external reality.
5.  **Agency (The Action)**: `Logic → Tool Use → Loop`. 
    *   *The Lesson:* The shift from a chatbot to an agent happens when you hand the model a steering wheel.
6.  **Coordination (The Organization)**: `Single Agent → Multi-Agent`. 
    *   *The Lesson:* Solving complex problems by introducing roles, delegation, and (unavoidably) overhead.
7.  **Protocol (The Standard)**: `Ad-hoc → MCP`. 
    *   *The Lesson:* How to externalize capability safely using standardized interfaces.
8.  **Engineering (The Reality)**: `Metrics → Observability → Safety`. 
    *   *The Lesson:* Production AI is 10% model and 90% monitoring, evaluation, and security.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 15.5.7 (App Router)
- **UI Library**: React 19.0.1
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1
- **ML Runtime**: ONNX Runtime Web 1.23.0
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm (or npm/yarn/bun)

### Browser Support

This project uses WebAssembly (WASM) for client-side inference. For security, we implement a strict Content Security Policy (CSP) that requires support for the `wasm-unsafe-eval` directive.

Supported browsers:
- **Chrome / Edge**: 95+
- **Firefox**: 102+
- **Safari**: 17.4+

### Installation

1. Clone the repository:

```bash
git clone https://github.com/KartikGS/LLM_Journey
cd LLM-Journey
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables (if needed):

```bash
# Create a .env.local file for any required API keys
# For example, if using Hugging Face API:
HF_token=your_token_here
```

### Running the Development Server

Start the development server:

```bash
pnpm dev
```

The application will be available at [http://localhost:3001](http://localhost:3001).

### Building for Production

```bash
pnpm build
pnpm start
```

### Observability Infrastructure

The project includes an observability stack using Grafana Tempo for distributed tracing and Grafana for visualization.

NOTE: The observability stack is only for local testing. For production, changes in the configuration are required.

1. Start the observability services:

```bash
cd observability
docker compose up -d
```

2. Access Grafana at [http://localhost:3000](http://localhost:3000).

3. Stop the services:

```bash
docker compose down
```

#### Component Versions

All observability components are pinned to explicit versions to ensure reproducibility.
latest tags are intentionally avoided due to potential breaking changes in metrics schemas, storage formats, and scrape behavior.

Tested stack versions:

- OpenTelemetry JS SDK: 2.3.0
- Grafana Tempo: 2.4.1
- Prometheus: 2.48.1
- Grafana: 10.2.3
- Loki: 2.9.4

## Project Structure

```
LLM-Journey/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── base-llm/         # Base LLM implementation
│   ├── fine-tuning/      # Fine-tuning module
│   ├── rag/              # RAG implementation
│   ├── tools/            # Tools integration
│   ├── mcps/             # MCP protocol implementation
│   ├── ui/               # Reusable UI components
│   └── lib/              # Utility functions and actions
├── lib/                   # Shared libraries
│   ├── llm/              # LLM generation logic
│   └── tokenizer/        # Tokenization utilities
├── public/                # Static assets
│   └── models/           # ONNX model files
└── package.json          # Project dependencies
```

## Key Components

- **BaseLLMChat**: Interactive chat interface for the base transformer model
- **InteractLLM**: Main interaction component with model loading
- **ChatInput**: Input component for user messages
- **LoadButton**: Model loading button with state management
- **Navbar**: Navigation component for module selection

## Model Information

The base model included in this project:

- **Architecture**: Decoder-only transformer with self-attention
- **Parameters**: ~0.2M
- **Training Data**: Shakespeare dataset
- **Format**: ONNX (for efficient browser-based inference)
- **Runtime**: ONNX Runtime Web (WASM backend)

**Note**: The base model is intentionally small and trained on limited data for educational purposes. Outputs may appear somewhat illogical, demonstrating the progression from basic to advanced models.

## Development

### Linting

```bash
pnpm lint
```

### Type Checking

TypeScript is configured for strict type checking. The project uses ESLint with Next.js configuration.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Documentation

The project documentation has been continuously evolved to support both human contributors and AI agents.

### [For Agents & Contributors](agent-docs/AGENTS.md)
**[Read this first.](agent-docs/AGENTS.md)**

The documentation is organized by role and stability:

-   **[agent-docs/AGENTS.md](agent-docs/AGENTS.md)**: The canonical entry point.
-   **[agent-docs/roles/](agent-docs/roles/)**: Role-specific guides (Frontend, Backend, Infra, etc.).
-   **[agent-docs/development/](agent-docs/development/)**: Coding standards and style guides.
-   **[agent-docs/api/](agent-docs/api/)**: System contracts.

## License

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [React Documentation](https://react.dev)

## Acknowledgments

This project is designed as an educational resource to understand the evolution and capabilities of Large Language Models.
