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
> **Canonical source**: This section is the single source of truth for runtime preflight requirements. Role docs cross-reference here and do not duplicate this text.

- Run `node -v` once per execution session before verification commands.
- If runtime is below the documented minimum, classify as an **environmental mismatch** in the role report instead of silently downgrading requirements.
- If the mismatch is pre-existing and already tracked in `project-log.md`, proceed and document it in the active report.
- If the mismatch is new and below the documented minimum, halt and report to Tech Lead before running verification commands.
- **Recovery path**: Use `nvm use <documented-version>` (or equivalent version manager command) to activate the documented runtime version. Re-run the preflight check after switching. If the version manager is unavailable, report as a blocker via the feedback protocol — do not proceed with a mismatched runtime.

## Testing Stack
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright
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
- Detailed triage/classification policy is canonical in `/agent-docs/testing-strategy.md`.

## Quality & Linting
- **Linter**: ESLint
- **Formatter**: Prettier (standard config)
- **TypeScript**: Strict mode enabled.

### Targeted File Linting (Per-Domain Verification)

`pnpm lint` runs ESLint project-wide. Running the full suite during per-domain verification (e.g., Backend verifying only its route files) will fail if any unrelated domain file has a lint error, blocking unrelated verification gates.

Use targeted linting for per-domain self-verification:
```
pnpm lint --file path/to/file.ts
# Examples:
pnpm lint --file app/api/models/adaptation/generate/route.ts
pnpm lint --file app/api/foundations/frontier-base-generate/route.ts
```

**Scope rule:**
- Sub-agents (Backend, Frontend): use targeted linting for their own domain files during self-verification.
- Testing Agent or CR Coordinator: run full-suite `pnpm lint` as the final integration gate — this is the authoritative pass.
- A targeted lint pass does not substitute for the full-suite gate. Both may be needed in the same CR cycle.
