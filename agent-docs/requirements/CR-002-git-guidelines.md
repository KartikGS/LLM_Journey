# Change Requirement: Git Guidelines & Standards

## metadata
- **ID**: CR-002
- **Title**: Git Guidelines & Engineering Standards
- **Author**: BA Agent
- **Status**: Draft
- **Priority**: High (Foundational)
- **Scope**: [S][DOC]

## 1. Problem Statement
The project currently lacks explicit Git guidelines. Without a standardized approach to commit messages, branching, and PRs, we risk:
-   **Unreadable History**: Making it hard to use tools like `git blame` or generate changelogs.
-   **Coordination Friction**: Agents may clobber each other's work if branch naming is ambiguous.
-   **Quality Drift**: "WIP" or "Update" commits becoming the norm.

## 2. Business Value
-   **Observability**: Clear history allows us to debug regressions faster.
-   **Automation**: "Conventional Commits" allow us to automate semantic versioning and changelogs.
-   **Agent Safety**: Strict branching rules prevent agents from accidentally pushing to `main`.

## 3. Goals
Establish a "High-Quality Engineering" standard that rivals top-tier open source projects.

## 4. Acceptance Criteria (Definition of Done)

### A. Documentation
-   [ ] Create `CONTRIBUTING.md` in the root directory.
-   [ ] Define the **Branching Strategy**:
    -   `main`: Protected, production-ready code.
    -   `feat/description`: New features.
    -   `fix/issue-id`: Bug fixes.
    -   `docs/scope`: Documentation updates.
    -   `refactor/scope`: Code restructuring without behavioral change.
    -   `hotfix/description`: Critical production fixes.
    -   `spike/description`: Experimental/research work (do not merge to main).
    -   **Enforcement**: Branch naming is mandatory for all branches pushed to `origin`. Local-only branches may use any naming convention.
-   [ ] Define the **Commit Message Standard**:
    -   Must follow [Conventional Commits](https://www.conventionalcommits.org/).
    -   Format: `type(scope): subject` (e.g., `feat(agent): add retry logic`).
    -   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`.
    -   **Valid Scopes**: `agent`, `api`, `docs`, `config`, `deps`. Omit scope if change is global.

### B. Tooling & Enforcement
-   [ ] Install `husky` to manage git hooks.
-   [ ] Install `@commitlint/cli` and `@commitlint/config-conventional`.
-   [ ] Configure a `commit-msg` hook to reject non-conformant commits.
-   [ ] (Optional) Add a `pre-commit` hook to run linting (if speed allows).

### C. Process Integration
-   [ ] Update `agent-docs/workflow.md` to reference `CONTRIBUTING.md` for git standards.

## 5. Constraints
-   **Performance**: Commit hooks must complete in <2 seconds. No network calls allowed in hooks.
-   **Rollback**: If hooks cause issues, removal is trivial: delete `.husky/` directory and revert `package.json` changes. No data loss risk.
-   **Agent Compatible**: The guidelines must be parseable by agents (i.e., clear rules, no ambiguity).

## 6. Execution Mode
-   **Standard (S+)**: This involves standard tooling but requires careful verification.
-   **Migration**: This applies to new commits only. Existing branches and commits are grandfathered. No retroactive reformatting required.

## 7. Verification Plan (Testing)
-   **Manual Test**: Attempt commit with message `WIP stuff`. Verify rejection with clear error message.
-   **Manual Test**: Attempt commit with `feat(api): valid message`. Verify success.
