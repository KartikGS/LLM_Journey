# Git Hygiene & Repository Standards

This document defines the standards for maintaining a clean and professional repository. All agents are required to follow these guidelines before submitting work.

## 1. The .gitignore rule
Any tool, library, or framework introduced or configured must have its generated artifacts added to `.gitignore`.
- **Pre-Implementation**: Check if the tool creates folders (e.g., `dist/`, `build/`, `test-results/`).
- **Post-Implementation**: Run a `git status` check. If untracked files appear that are not source code, add them to `.gitignore`.

## 2. Commit logic
- Keep changes focused. Avoid "bloat" commits that mix feature logic with configuration changes unless they are strictly related.
- Use descriptive commit messages if applicable.

## 3. Branching (if used)
- Follow the specific branching strategy defined by the Senior Developer or the Project Lead.

## 4. Final Review Checklist
- [ ] No temporary files (logs, debug dumps) are tracked.
- [ ] Documentation is updated alongside code changes.
- [ ] New environment variables are documented in `.env.example`.
- [ ] New dependencies are properly recorded in `package.json` and `pnpm-lock.yaml`.
