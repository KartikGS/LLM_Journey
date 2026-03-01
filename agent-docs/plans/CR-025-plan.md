# Technical Plan - CR-025: README Refresh and Documentation Governance

## Technical Analysis

CR-025 is a pure `[S][DOC]` change requiring no feature code modifications.
Two linked outcomes:
1. Rewrite `README.md` to reflect current project reality and serve both audiences.
2. Add a mandatory "Documentation Impact" field to CR planning/execution artifacts and the BA closure checklist.

All files to be modified fall within the Tech Lead permitted direct-edit zone (`README.md`, `agent-docs/**`).
No sub-agents required. No feature code touched.

## Discovery Findings

**README.md stale issues confirmed:**
- Line 52: "pnpm (or npm/yarn/bun)" — directly contradicts `tooling-standard.md` ("NEVER use npm or yarn").
- Project structure block references `app/base-llm/`, `app/fine-tuning/`, `app/rag/`, `app/tools/`, `app/mcps/` — none of these routes/directories exist. Current structure is `app/foundations/`, `app/models/`, `app/api/`.
- "Key Components" section names (`BaseLLMChat`, `InteractLLM`, `ChatInput`, `LoadButton`) do not map to current codebase components.
- Route roadmap in README does not reference the 10-stage canonical roadmap from `project-vision.md`.
- `cd LLM-Journey` in clone instructions (directory is `LLM_Journey`).
- Missing: dual-audience framing, agentic CR workflow, `human-docs/` docs map entry.
- Missing: any mention of the multi-provider LLM routing, streaming, SSE patterns.

**Actual project structure (verified):**
```
app/
  foundations/transformers/   ← Stage 1 (live)
  models/adaptation/          ← Stage 2 (live)
  api/
    frontier/                 ← Frontier base inference routes
    adaptation/               ← Adaptation inference routes
    otel/                     ← OTel proxy (ADR-0001)
    telemetry-token/          ← Short-lived token issuance
  ui/                         ← Shared UI components
lib/
  config/                     ← Generation configs, stage metadata
  llm/                        ← LLM orchestration
  otel/                       ← Metrics, tracing
  security/                   ← Security utilities
  server/                     ← Shared server utilities
components/                   ← React components
```

**Process guardrail target files confirmed:**
- `agent-docs/plans/TEMPLATE.md` — needs `## Documentation Impact` section
- `agent-docs/conversations/TEMPLATE-tech-lead-to-frontend.md` — needs Documentation Impact field in DoD
- `agent-docs/conversations/TEMPLATE-tech-lead-to-backend.md` — needs Documentation Impact field in DoD
- `agent-docs/conversations/TEMPLATE-tech-lead-to-testing.md` — needs Documentation Impact field in DoD
- `agent-docs/conversations/TEMPLATE-tech-lead-to-infra.md` — needs Documentation Impact field in DoD
- `agent-docs/roles/ba.md` → BA Closure Checklist — needs doc-impact verification item

**Contract Delta Assessment:**
- Route contracts changed? No
- `data-testid` contracts changed? No
- Accessibility/semantic contracts changed? No
- Testing handoff required per workflow matrix? No — pure doc/process change

## Implementation Decisions (Tech Lead Owned)

1. **Documentation Impact field placement in TEMPLATE.md**: Add as a new mandatory section between `Operational Checklist` and `Definition of Done`. This ensures it is evaluated at planning time, before execution begins.

2. **Documentation Impact field placement in handoff templates**: Add as a named field inside the `Definition of Done` section of each template. This binds doc-impact delivery to the same gate as functional DoD — not as a separate afterthought. Format: `[ ] Documentation Impact: [required — files updated | not-required — rationale]`.

3. **BA Closure Checklist placement**: Add the doc-impact verification item after the existing `data-testid` registry check — both are contract-preservation checks at the same lifecycle stage.

4. **Scope of handoff template updates**: All four sub-agent templates (Frontend, Backend, Testing, Infra) will receive the field to ensure the guardrail is consistent across delegation paths. AC-4 requires "at least one"; covering all four avoids partial enforcement.

5. **README canonical truth sources**: Per BA handoff reversal risk, all commands/policy lines will be verified against `tooling-standard.md`, `technical-context.md`, and `workflow.md` before writing. No line will contradict a canonical source.

## Critical Assumptions

- All files to modify are in the Tech Lead permitted direct-edit zone — confirmed via Pre-Implementation Self-Check.
- Stages 3–10 are not yet implemented; README roadmap will list them as planned/upcoming, not as live routes.
- `human-docs/` content is already present (confirmed: 4 files exist) and should be referenced in the README docs map.

## Proposed Changes

### Phase 1: README.md Rewrite
- Remove stale: alternative package manager mention, stale project structure block, stale component names, stale directory names.
- Add: dual-audience framing, 10-stage roadmap, accurate project structure, pnpm-only setup, agentic workflow entry point, `human-docs/` in docs map.
- Keep: mission/vision section (largely accurate), observability infrastructure section (accurate), browser support section (accurate).

### Phase 2: Process Guardrail Additions
- `agent-docs/plans/TEMPLATE.md`: Add `## Documentation Impact` section.
- `TEMPLATE-tech-lead-to-frontend.md`: Add Documentation Impact DoD item.
- `TEMPLATE-tech-lead-to-backend.md`: Add Documentation Impact DoD item.
- `TEMPLATE-tech-lead-to-testing.md`: Add Documentation Impact DoD item.
- `TEMPLATE-tech-lead-to-infra.md`: Add Documentation Impact DoD item.
- `agent-docs/roles/ba.md`: Add Documentation Impact verification to BA Closure Checklist.

## Delegation & Execution Order

| Step | Agent | Task Description |
| :--- | :--- | :--- |
| 1 | Tech Lead (direct) | README.md rewrite |
| 2 | Tech Lead (direct) | Process guardrail additions to templates + ba.md |

## Delegation Graph (MANDATORY)

- **Execution Mode**: Sequential (direct Tech Lead execution — no sub-agents)
- **Dependency Map**: Step 2 does not depend on Step 1 outputs, but sequential order recommended per BA handoff suggestion (README first, then guardrails informed by final wording).
- **Final Verification Owner**: Tech Lead (direct execution, no sub-agent handoff)

## Operational Checklist

- [x] **Environment**: No hardcoded values (doc-only change).
- [x] **Observability**: N/A (doc-only change).
- [x] **Artifacts**: No new `.gitignore` entries needed.
- [x] **Rollback**: Git revert on any of the modified files. All changes are doc-only.

## Documentation Impact

- **required**: `README.md` (primary), `agent-docs/plans/TEMPLATE.md`, `agent-docs/conversations/TEMPLATE-tech-lead-to-*.md` (4 files), `agent-docs/roles/ba.md`

## Definition of Done (Technical)

- [ ] `README.md` contains all AC-1 required sections with audience-aware structure.
- [ ] All README setup/tooling commands consistent with canonical sources (no npm/yarn/bun, Node >=20, port 3001).
- [ ] Stale project structure, component names, and route references removed.
- [ ] `agent-docs/plans/TEMPLATE.md` includes `## Documentation Impact` section.
- [ ] At least one handoff template (all four updated) includes Documentation Impact field in Definition of Done.
- [ ] `agent-docs/roles/ba.md` BA Closure Checklist includes doc-impact verification item.
- [ ] No app runtime behavior, routes, API contracts, or accessibility semantics changed.
- [ ] `pnpm build` passes (no code changes; confirm no doc-caused breakage).
