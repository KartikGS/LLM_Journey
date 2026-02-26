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
-   **Recent Focus**: [M][DOC] **CR Process Hardening and Artifact Organization**: `CR-020` - Standardized execution-checklist and exact-artifact-path sections in handoff templates, added TL session-state gap-items/freshness stubs, codified CR-scoped ephemeral naming guidance and retention policy in workflow, documented git-strategy deferment, and produced CR-artifact foldering feasibility analysis for later Human User decision - **Completed**.
-   **Previous**: [M][TEST][DOC] **Generation Config Centralization + Parallel Meta Observations**: `CR-019` - Centralized non-secret frontier/adaptation generation settings into `lib/config/generation.ts`, retained `FRONTIER_API_KEY` as env-only secret, removed 9 non-secret generation env vars from contract and `.env.example`, aligned API docs/tests, and delivered consolidated meta-analysis findings for 5 user pointers with immediate/backlog/policy-candidate follow-ups - **Completed**.
-   **Previous**: [S][DOC] **Meta Improvement Phase 3 — CR-018 Documentation Hardening**: Implemented all 14 approved Fix items from `META-20260225-CR-018-synthesis.md` across 9 agent docs — two-session Tech Lead execution model (H-01), write-before-read constraint (H-02), risk-differentiated adversarial review (M-01), runtime preflight dedup (M-02), OTel metrics registry (M-03), terminology standardization to "Verification Gates" (M-04), metrics mocking pattern (M-05), leaf utility isolation principle (M-06), extraction lint audit guidance (M-07), verification ownership framing (M-08), snippet-first size constraint (M-09), BA assumed-gates fallback protocol (M-10), AC runtime wording alignment (M-11), AC-ID alignment rule (M-12), API index ownership (L-01) - **Completed**.
-   **Previous**: [L][TEST] **Generation API Hardening Parity**: `CR-018` - Preserved separate frontier/adaptation route contracts, extracted shared server generation utilities, added middleware abuse controls (20 req/min + 8192-byte body policy), added non-blocking generation metrics counters, added adaptation API contract doc, and expanded verification coverage (+25 tests; 159 tests passing) - **Completed**.


## Next Priorities
-   [ ] [S][DOC] **Foldering decision pending user (CR-020)**: Defer final decision until user confirms direction among Option D (index now), Option B (archive trigger >50), and Option C (long-term defer). Feasibility artifact: `agent-docs/plans/CR-020-foldering-feasibility.md`.
-   [ ] [S][DOC] **Option D follow-up (if approved): requirements index**: Create `agent-docs/requirements/INDEX.md`, backfill all CR entries, and add index-maintenance step to BA closure checklist.
-   [ ] [S][DOC] **Frontend handoff parity**: Evaluate optional execution-checklist section for `TEMPLATE-tech-lead-to-frontend.md` if friction appears.
-   [ ] [S] **Generation dead-code housekeeping**: Remove unreachable `invalid_config` branch from generation fallback code paths/types and remove unused `ADAPTATION_API_URL` constant in adaptation API tests.
-   [ ] [S][DOC] **Parallel-CR git flow decision (deferred)**: One-branch-per-CR policy and CR-number collision strategy explicitly deferred pending later user decision.
-   [ ] [S][DOC] **Quality-gate evidence consolidation** *(deferred from CR-018 meta L-02)*: Workflow audit to reduce duplicate command-evidence projection across TL handoff, CR AC lines, and post-fix snapshot. Requires redesign of the audit trail model — defer until the pattern causes a concrete acceptance error.
-   [ ] [S] **Host-level Node.js v20+ enforcement**: CR-017 added runtime contract artifacts (`package.json` engines + `.nvmrc`), but machine default still reports Node v18.19.0 outside policy. Upgrade host default/runtime bootstrap to v20+ so verification no longer depends on manual version switching.
-   [ ] [S] **Client-side `toRecord()` utility duplication**: `FrontierBaseChat.tsx` and `AdaptationChat.tsx` still keep local `toRecord()` helpers. Consider shared client utility if a third consumer appears (CR-017 Tech Lead recommendation).
-   [ ] [S] **Generation-route observability depth**: CR-018 added request/fallback counters for frontier/adaptation routes; consider bounded latency/output histograms if signal fidelity requirements increase (CR-018 Tech Lead recommendation).
-   [ ] [M] Consider follow-up CR for advanced Model Adaptation simulation (beyond lightweight interaction baseline).
-   [ ] [L] Implement RAG pipeline (Retrieval-Augmented Generation).
-   [ ] [L] Setup Evaluation & Observability framework.

## Archive
-   [M] **Small Backlog Fixes and Runtime Alignment**: `CR-017` - Added adaptation output cap (`ADAPTATION_OUTPUT_MAX_CHARS`), extracted shared server-side `toRecord()` utility, renamed learner-facing transformers comparison heading, removed unreachable frontier provider-array branch, and formalized Node runtime contract (`engines >=20.x` + `.nvmrc`); quality gates passing (134 tests) - **Completed**.
-   [S][DOC] **Meta Improvement Phase 3 Documentation Hardening**: `CR-016` - Implemented approved Fix items from `META-20260224-CR-015-synthesis.md` across workflow/role docs (pre-replacement checks, contract-registry/security closure gates, runtime preflight canonicalization, handoff self-checks, accessibility semantics, BA acceptance clarifications) - **Completed**.
-   [S] **HF Router Migration and Comparison Table Concretization**: `CR-014` - Migrated HF provider to featherless-ai router (OpenAI completions format); filled comparison table with Meta-Llama-3-8B concrete values; removed developer-facing subtitle; all quality gates passing (111 tests) - **Completed**.
-   [S] **Hugging Face Inference API Provider Support**: `CR-013` - Extended frontier base-generate endpoint with dual-provider support (`FRONTIER_PROVIDER=huggingface|openai`); 7 new HF-specific unit tests; all quality gates passing - **Completed**.
-   [M][TEST] **Transformers Stage Narrative Upgrade (Tiny -> Frontier -> Adaptation Bridge)**: `CR-012` - Reframed Stage 1 with `How -> Try -> Frontier -> Issues -> Next Stage`, added secure live/fallback frontier base inference, and synchronized API/component/E2E contracts - **Completed**.
-   [M] **Server-First Rendering Boundary for UI Pages**: `CR-011` - Refactored Home, Transformers, and Model Adaptation to server-first composition with targeted client islands for user input; preserved styling system and quality gates - **Completed**.
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
