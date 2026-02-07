# Tooling Standards

This document defines the mandatory tools and environment configurations for this project.

## Package Management
- **Manager**: `pnpm` 
- **Constraint**: NEVER use `npm` or `yarn`. Always use `pnpm` for installing dependencies and running scripts.
- **Lockfile**: `/pnpm-lock.yaml` is the source of truth for dependencies.

## Environment
- **Node.js**: >= 20.x
- **Framework**: Next.js 15 (App Router)
- **Port**: The development server runs on port `3001`.
- **Theme Support**: Dual-theme (Light and Dark mode) mandatory.
- **Browser Support**: Modern browsers with `wasm-unsafe-eval` support (Chrome 95+, FF 102+, Safari 17.4+).

## Testing Stack
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright (in implementation)
- **Mocking**: Custom mocks for ONNX and OTel as defined in `/agent-docs/testing-strategy.md`.

## Quality & Linting
- **Linter**: ESLint
- **Formatter**: Prettier (standard config)
- **TypeScript**: Strict mode enabled.
