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

### Runtime Preflight (Mandatory)
- Run `node -v` once per execution session before verification commands.
- If runtime is below the documented minimum, classify as an **environmental mismatch** in the role report instead of silently downgrading requirements.

## Testing Stack
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright (in implementation)
- **Mocking**: Custom mocks for ONNX and OTel as defined in `/agent-docs/testing-strategy.md`.

## E2E Command Canon
- Full E2E suite: `pnpm test:e2e`
- Single spec: `pnpm test:e2e -- __tests__/e2e/<spec>.spec.ts`
- Tag/grep focus: `pnpm test:e2e -- --grep "<pattern|@tag>"`
- Navigation example: `pnpm test:e2e navigation`

## E2E Runtime Notes
- `test:e2e` script sets `E2E=true` and should be preferred over raw `playwright test` for project verification.
- Playwright expects local server on port `3001` from project config.
- If constrained execution prevents binding/starting webServer, local-equivalent execution is required for valid E2E classification.

## Quality & Linting
- **Linter**: ESLint
- **Formatter**: Prettier (standard config)
- **TypeScript**: Strict mode enabled.
