# Contributing Guide

## Branching Strategy
We follow a strict branching model to ensure stability and clarity.

- **main**: Production-ready code. Protected branch.
- **feat/CR-XXX**: Feature branches for specific Change Requirements.
- **fix/CR-XXX**: Bug fix branches.
- **chore/CR-XXX**: Maintenance, tooling, or refactoring.
- **refactor/CR-XXX**: Code restructuring without behavioral changes.
- **hotfix/CR-XXX**: Critical production fixes.
- **spike/CR-XXX**: Experimental/research work (do not merge to main).

**Format**: `<type>/<CR-ID>-<description>`
Example: `feat/CR-002-git-guidelines`

## Commit Message Standard
We follow [Conventional Commits](https://www.conventionalcommits.org/).

**Format**: `<type>(<scope>?): <description>`

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Scopes
Allowed scopes: `agent`, `api`, `docs`, `config`, `deps`.
Commits without a scope are allowed for global changes.

## Git Hygiene & Repository Standards
- **.gitignore**: Any tool or library that generates artifacts (dist, build, logs) MUST have those artifacts ignored.
- **Atomic Commits**: Keep changes focused. Do not mix unrelated changes.
- **Clean History**: Avoid "WIP" commits if possible, or squash them before merging.
- **Review Checklist**:
    - No temporary files/logs tracked.
    - `package.json` and `pnpm-lock.yaml` updated for dependency changes.
    - Documentation updated.
