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
-   **Recent Focus**: [S] **HF Router Migration and Comparison Table Concretization**: `CR-014` - Migrated HF provider to featherless-ai router (OpenAI completions format); filled comparison table with Meta-Llama-3-8B concrete values; removed developer-facing subtitle; all quality gates passing (111 tests) - **Completed**.
-   **Previous**: [S] **Hugging Face Inference API Provider Support**: `CR-013` - Extended frontier base-generate endpoint with dual-provider support (`FRONTIER_PROVIDER=huggingface|openai`); 7 new HF-specific unit tests; all quality gates passing - **Completed**.
-   **Previous**: [M][TEST] **Transformers Stage Narrative Upgrade (Tiny -> Frontier -> Adaptation Bridge)**: `CR-012` - Reframed Stage 1 with `How -> Try -> Frontier -> Issues -> Next Stage`, added secure live/fallback frontier base inference, and synchronized API/component/E2E contracts - **Completed**.
-   **Previous**: [M] **Server-First Rendering Boundary for UI Pages**: `CR-011` - Refactored Home, Transformers, and Model Adaptation to server-first composition with targeted client islands for user input; preserved styling system and quality gates - **Completed**.


## Next Priorities
-   [ ] [S] **Comparison card heading rename**: `<h3>` reads "Model Comparison Template" — developer-facing language on a learner page. Rename to learner-facing copy (e.g., "Tiny vs Frontier: By the Numbers"). (Flagged by Tech Lead in CR-014 retrospective.)
-   [ ] [S] **`extractProviderOutput()` dead code cleanup**: HF array path (`Array.isArray(payload)`) is now unreachable for the `huggingface` provider after router migration. Candidate for removal once confirmed no other path exercises it. (Flagged by Tech Lead in CR-014 retrospective.)
-   [ ] [S] **Node.js environment upgrade**: System Node v16.20.1 is below documented minimum (>=20.x). Upgrade to v20+ to meet tooling standard. (Pre-existing from CR-013; escalated by Tech Lead in CR-014.)
-   [ ] [M] Consider follow-up CR for advanced Model Adaptation simulation (beyond lightweight interaction baseline).
-   [ ] [L] Implement RAG pipeline (Retrieval-Augmented Generation).
-   [ ] [L] Setup Evaluation & Observability framework.

## Archive
-   [S][TEST] **E2E Baseline Stabilization**: `CR-010` - Resolved landing-page selector/route assertion drift and transformer transient-state fragility; restored green full-suite E2E in local-equivalent execution - **Completed**.
-   [M][TEST] **Model Adaptation Page (Stage 2)**: `CR-009` - Implemented `/models/adaptation` with strategy comparison, lightweight interactive selector, continuity links, and passing quality gates - **Completed**.
-   [S][TEST] **Health Check Hardening**: `CR-008` - Fixed middleware rate-limit state mutation, added window-boundary coverage, and standardized legacy CR status interpretation - **Completed**.
-   [S][TEST] **Pipeline Stabilization**: `CR-007` - Restored `test/lint/build` quality gates after regression; no shim-based workaround introduced - **Completed**.
-   [S] **Visual Enhancement**: `CR-006` - Premium overhaul of Transformer Page with glassmorphism and animations - **Completed**.
-   [S] **Visual Enhancement**: `CR-005` - Premium visual enhancement for Home Page and Navbar with glassmorphism, gradient glows, and framer-motion animations - **Completed**.
-   [S] **Navbar Alignment**: `CR-004` - Aligned navbar routes, names, and icons with project vision - **Completed**.
-   [S][DOC] **Git Guidelines**: Implemented `CR-002`. Standardized on Conventional Commits, `feat/CR-ID` branching, and `husky` enforcement. - **Completed**.
-   [S][DOC] **Agent Refinement**: Hardened `AGENTS.md` and `roles/ba.md` with strict reading checks and governance protocols - **Completed**.
-   [S][M] **Standard Kit**: Defined CR-001 for library standardization and governance - **Completed**.
-   [S][DOC] **Agent Meta-Refinement**: Codified "Permission to Disagree," "Mandatory Reading Check," and "BA-Senior Consultation" in agent docs - **Completed**.
-   [S][DOC] Vision Finalization: Added explicit audience targeting and canonical roadmap URIs - **Completed**.
