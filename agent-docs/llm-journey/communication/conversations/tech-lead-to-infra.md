# Handoff: CR-002 - Git Guidelines & Tooling

**Role**: Infra Agent
**Status**: Ready for Execution

## Objective
Implement the "High-Quality Engineering" standard for Git usage by setting up tooling (`husky`, `commitlint`) and creating the authoritative `CONTRIBUTING.md` documentation.

## Context & Rationale
We are standardizing our commit history to ensure it is machine-readable and follows industry best practices (Conventional Commits). This is critical for future automation and to prevent "history rot" as more agents contribute.

## Execution Steps
1.  **Documentation**:
    -   Create `CONTRIBUTING.md` in the root directory.
    -   **Content**: Define Branching Strategy (main, feat, fix, etc.) and Commit Message Standard (Conventional Commits).
    -   **Reconciliation**: Review `agent-docs/development/git-hygiene.md`. Merge relevant sections into `CONTRIBUTING.md` and deprecate `git-hygiene.md` OR add cross-references if the content is complementary.
    -   Update `agent-docs/workflow.md` to reference `CONTRIBUTING.md`: "For git commit and branching standards, see root CONTRIBUTING.md".
2.  **Tooling**:
    -   Install `husky`, `@commitlint/cli`, and `@commitlint/config-conventional` as dev dependencies.
    -   Create `commitlint.config.js` with the following rule:
        -   **Valid Scopes**: `['agent', 'api', 'docs', 'config', 'deps']`.
        -   Allow commits without scope (global changes).
    -   Configure `.husky/commit-msg` to run `commitlint`.

## Constraints
-   **Performance**: The hook must run in <2s.
-   **Safety**: Do NOT define rules that require network access in the hooks.
-   **Compatibility**: Ensure `npm run prepare` (or `pnpm`) sets up hooks automatically.

## Definition of Done
-   [ ] `CONTRIBUTING.md` exists and covers branching/commit rules.
-   [ ] `git commit -m "bad message"` fails.
-   [ ] `git commit -m "feat(api): valid message"` succeeds.
-   [ ] `commitlint.config.js` enforces the specific scopes defined.
-   [ ] `agent-docs/development/git-hygiene.md` is handled (merged/referenced).

## Reference
-   [Technical Plan](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/plans/CR-002-plan.md)
