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

### Entry Lifecycle
- When adding a new completion entry, label it `Recent Focus`.
- Demote the previous `Recent Focus` entry to `Previous`.
- Keep at most **3** `Previous` entries visible. Move older entries to the `## Archive` section at the bottom of this file.
- Use consistent prefix labels: `Recent Focus` (1 entry max), `Previous` (up to 3).

### Canonical Transition Example
Before adding a new completion:
- Recent Focus: `CR-010`
- Previous: `CR-009`, `CR-008`, `CR-007`

After adding `CR-011`:
- Recent Focus: `CR-011`
- Previous: `CR-010`, `CR-009`, `CR-008`
- Archive: includes `CR-007` (and older)

Validation rules:
- Exactly one `Recent Focus`
- At most three `Previous`
- Anything older than those three is moved to `Archive`

## Current State
-   **Status**: Vision & Roadmap Finalized.
-   **Recent Focus**: [S][TEST] **E2E Baseline Stabilization**: `CR-010` - Resolved landing-page selector/route assertion drift and transformer transient-state fragility; restored green full-suite E2E in local-equivalent execution - **Completed**.
-   **Previous**: [M][TEST] **Model Adaptation Page (Stage 2)**: `CR-009` - Implemented `/models/adaptation` with strategy comparison, lightweight interactive selector, continuity links, and passing quality gates - **Completed**.
-   **Previous**: [S][TEST] **Health Check Hardening**: `CR-008` - Fixed middleware rate-limit state mutation, added window-boundary coverage, and standardized legacy CR status interpretation - **Completed**.
-   **Previous**: [S][TEST] **Pipeline Stabilization**: `CR-007` - Restored `test/lint/build` quality gates after regression; no shim-based workaround introduced - **Completed**.


## Next Priorities
-   [ ] [M] Implement/Refine Transformers (Foundations) page content.
-   [ ] [M] Consider follow-up CR for advanced Model Adaptation simulation (beyond lightweight interaction baseline).
-   [ ] [L] Implement RAG pipeline (Retrieval-Augmented Generation).
-   [ ] [L] Setup Evaluation & Observability framework.

## Archive
-   [S] **Visual Enhancement**: `CR-006` - Premium overhaul of Transformer Page with glassmorphism and animations - **Completed**.
-   [S] **Visual Enhancement**: `CR-005` - Premium visual enhancement for Home Page and Navbar with glassmorphism, gradient glows, and framer-motion animations - **Completed**.
-   [S] **Navbar Alignment**: `CR-004` - Aligned navbar routes, names, and icons with project vision - **Completed**.
-   [S][DOC] **Git Guidelines**: Implemented `CR-002`. Standardized on Conventional Commits, `feat/CR-ID` branching, and `husky` enforcement. - **Completed**.
-   [S][DOC] **Agent Refinement**: Hardened `AGENTS.md` and `roles/ba.md` with strict reading checks and governance protocols - **Completed**.
-   [S][M] **Standard Kit**: Defined CR-001 for library standardization and governance - **Completed**.
-   [S][DOC] **Agent Meta-Refinement**: Codified "Permission to Disagree," "Mandatory Reading Check," and "BA-Senior Consultation" in agent docs - **Completed**.
-   [S][DOC] Vision Finalization: Added explicit audience targeting and canonical roadmap URIs - **Completed**.
