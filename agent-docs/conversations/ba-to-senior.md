# Handoff: CR-002 - Git Guidelines & Standards

**Role**: Senior Developer
**Status**: Ready for Planning

## Objective
Implement a "High-Quality Engineering" standard for Git usage to ensure history legibility and agent safety. This is a foundational governance task that establishes the rules of the road for all future contributors (human and agent).

## Key Deliverables
1.  **Documentation**: Create `CONTRIBUTING.md` with explicit branching and commit rules.
2.  **Enforcement**: Configure `husky` + `commitlint` to reject non-compliant commit messages locally.

## Context & Rationale
-   **Why now?**: As we scale to multiple agents, the risk of "history rot" increases. We need machine-readable history for potential future automation.
-   **Why these rules?**: Conventional Commits + Feature Branching are industry standards that minimize coordination friction.

## Definition of Done
-   [ ] `CONTRIBUTING.md` exists and matches the criteria in `CR-002`.
-   [ ] `npm install` installs `husky` hooks automatically.
-   [ ] `git commit -m "bad message"` fails with a helpful error.
-   [ ] `git commit -m "feat(docs): update readme"` succeeds.
-   [ ] **Performance**: The hook runs in <2s (no network, no build).

## Constraints
-   **Do NOT** implement PR templates or CI/CD pipelines in this task.
-   **Do NOT** force-push or re-write existing history.
-   **Do NOT** block local-only branching, but enforcing push-standard is fine (though `husky` `commit-msg` is local-only by default, which is acceptable).

## Reference
-   [CR-002 Requirement](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/requirements/CR-002-git-guidelines.md)
