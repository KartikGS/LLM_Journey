# LLM Journey

A comprehensive web application that demonstrates the progression of Large Language Models (LLMs) from base models to advanced agents. This interactive platform showcases various LLM improvements and techniques over time.

## Overview

LLM Journey is an educational platform built with Next.js that walks through the evolution of language models, from basic transformer architectures to sophisticated agent systems. The application features reference materials, and practical implementations of key LLM concepts.

## Features

### Core Modules

- **Transformer**: A decoder-only self-attention transformer model (~0.2M parameters) trained on the Shakespeare dataset, running locally via ONNX Runtime
- **LLM**: See how scaling transformer improves text generation
- **Fine-tuning**: Explore fine-tuning methods for adapting pre-trained models
- **Tools**: Integration with external tools and APIs
- **RAG (Retrieval-Augmented Generation)**: Implementation of RAG for enhanced context-aware responses
- **Agents**: Advanced agent systems with reasoning capabilities
- **MCP (Model Context Protocol)**: Protocol-based model interactions
- **Deployment**: Best practices for deploying LLM applications
- **Safety**: Safety considerations and guardrails for LLM applications
- **Evaluation**: Methods for evaluating LLM performance

### Technical Highlights

- **Local Inference**: Client-side model inference using ONNX Runtime Web
- **Interactive Chat Interface**: Real-time interaction with various LLM implementations
- **Model Loading**: Dynamic model loading with progress tracking
- **Hugging Face Integration**: Support for Hugging Face model inference
- **Modern UI**: Responsive design with dark mode support

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

## License

Temp.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [React Documentation](https://react.dev)

## Acknowledgments

This project is designed as an educational resource to understand the evolution and capabilities of Large Language Models.
