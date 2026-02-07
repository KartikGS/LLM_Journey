# Project Log

## Scope Tags

Each active or completed entry in this log should include a lightweight scope tag
to help agents understand **expected complexity and coordination cost**.

### Allowed Tags
- `[S]` — Small, single-session change
- `[M]` — Multi-step, single-phase change
- `[L]` — Multi-phase or long-running change
- `[ADR]` — Architectural decision involved
- `[DOC]` — Documentation-only change
- `[TEST]` — Testing-only or test-driven change

Tags may be combined when appropriate.

## Current State
-   **Status**: Vision & Roadmap Finalized.
-   **Recent Focus**: [S] **Home Page Alignment**: `CR-003` - Aligned home page and transformer route with project vision - **Completed**.
-   **Recent Focus**: [S][DOC] **Git Guidelines**: Implemented `CR-002`. Standardized on Conventional Commits, `feat/CR-ID` branching, and `husky` enforcement. - **Completed**.
-   **Recent Focus**: [S][DOC] **Agent Refinement**: Hardened `AGENTS.md` and `roles/ba.md` with strict reading checks and governance protocols - **Completed**.
-   **Previous**: [S][M] **Standard Kit**: Defined CR-001 for library standardization and governance - **Completed**.
-   **Previous**: [S][DOC] **Agent Meta-Refinement**: Codified "Permission to Disagree," "Mandatory Reading Check," and "BA-Senior Consultation" in agent docs - **Completed**.
-   **Previous**: [S][DOC] Vision Finalization: Added explicit audience targeting and canonical roadmap URIs - **Completed**.

## Next Priorities
-   [ ] [M] Implement/Refine Transformers (Foundations) page content.
-   [ ] [M] Implement Model Training & Adaptation (LLM + Fine-Tuning) page.
-   [ ] [L] Implement RAG pipeline (Retrieval-Augmented Generation).
-   [ ] [L] Setup Evaluation & Observability framework.