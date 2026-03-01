# LLM Journey — File Path Index

This is the single source of truth for key file locations in `agent-docs/`.

When a file moves, update **only this table**. All docs reference the variable name (`$VAR`), so a single row change here propagates the correct path to every consumer.

## Convention

- In prose and references across `agent-docs/`, use `$VARIABLE_NAME` instead of a raw file path.
- When following a reference, look up the variable in the table below to get the current path.
- To move a file: (1) update the **Path** cell below, (2) grep for the variable name to confirm no hardcoded path remnants exist in active docs.

---

## Index Table

| Variable | Current Path | Description |
|---|---|---|
| `$TOOLING_STANDARD` | `/agent-docs/llm-journey/project-tooling/standard.md` | Package manager (pnpm), Node.js version, testing stack (Jest/Playwright), linting (ESLint/Prettier), E2E command canon, targeted lint rules |
