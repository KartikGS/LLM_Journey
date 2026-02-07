# Technical Plan - CR-002: Git Guidelines & Engineering Standards

## Technical Analysis
- **Current State**: Project uses Git but lacks enforced commit standards, automated hooks, or explicit contribution guidelines. `package.json` exists in root.
- **Key Challenges**: Ensuring the `commit-msg` hook is performant (<2s) and works across different environments (local/CI).

## Discovery Findings
- Root directory contains `package.json`, `.gitignore`, and `.git/`.
- `husky` and `commitlint` are not currently installed.
- `agent-docs/development/git-hygiene.md` exists but needs to be aligned with or referenced by the new `CONTRIBUTING.md`.

## Critical Assumptions
- User has `npm` or `pnpm` installed and available in the environment (Verified by previous file lists showing `pnpm-lock.yaml`).
- Changes to `package.json` (devDependencies) are acceptable.
- `husky` v9+ is compatible with the current project setup.

## Proposed Changes
### Documentation
- **[NEW] `CONTRIBUTING.md`**: Define branching model and commit standards.
- **[MODIFY] `agent-docs/workflow.md`**: Add section referencing `CONTRIBUTING.md`: "For git commit and branching standards, see root CONTRIBUTING.md".
- **[MODIFY] `agent-docs/development/git-hygiene.md`**: Infra agent to review and either merge relevant content into `CONTRIBUTING.md` (and deprecate) or add cross-references.

### Tooling (Infra)
- **[MODIFY] `package.json`**: Install `husky`, `@commitlint/cli`, `@commitlint/config-conventional`.
- **[NEW] `commitlint.config.js`**: Configure conventional commits with scopes: `['agent', 'api', 'docs', 'config', 'deps']`. Allow scope-less commits for global changes.
- **[NEW] `.husky/commit-msg`**: Add hook to run commitlint.

## Architectural Invariants Check
- [x] **Agent Compatibility**: Guidelines are regular and parseable (Conventional Commits).
- [x] **Performance**: Husky hooks are local and fast (no network).

## Delegation & Execution Order
| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | Infra | Install dependencies (`husky`, `commitlint`), configure hooks (scopes rule), create `CONTRIBUTING.md`, and reconcile `git-hygiene.md`. |
| 2 | Senior | Manual verification: Test both rejection (`git commit -m "bad"`) and acceptance (`git commit -m "feat(api): good"`) cases. Verify hook speed. |

## Operational Checklist
- [ ] **Artifacts**: Ensure `.husky` is committed but `_` (husky script helpers) are handled correctly.
- [ ] **Rollback**: Delete `.husky/` and remove deps from `package.json`.
- [ ] **Branch Naming**: CR-002 requires branch name validation, but `commit-msg` hooks don't validate branch names. We will defer strict technical enforcement (pre-push hook) to a future CR/CI rule to keep this task focused, relying on `CONTRIBUTING.md` policy for now.

## Definition of Done (Technical)
- [ ] `npm run prepare` (or automatic via postinstall) sets up husky.
- [ ] `git commit -m "bad message"` is rejected.
- [ ] `git commit -m "feat(agent): good message"` is accepted.
- [ ] Commit hook completes in <2s (verify with `time git commit`).
- [ ] `CONTRIBUTING.md` is present in root.
