# CR-025: README Refresh and Documentation Governance in CR Flow

## Status
`Draft`

## Business Context

**User Need:** The root `README.md` is stale against current product reality (routes, architecture framing, package manager policy, and operational flow). A newly added developer-user audience in `project-vision.md` increases the need for accurate onboarding and contribution documentation. The Human User also wants documentation updates to be treated as first-class work in each CR so docs do not drift behind implementation.

**Expected Value:**
- New contributors (human and agent-assisted) can reliably bootstrap, understand the project scope, and execute the agentic workflow without hunting across stale docs.
- Developer-user value in `project-vision.md` is made concrete through accurate architecture/flow documentation.
- Documentation freshness becomes enforceable via CR process gates instead of optional cleanup.

**Execution Mode:** `Standard`

## Audience & Outcome Check
- **Human User intent:** Keep project docs current and make doc upkeep a default part of CR execution.
- **Product End User audience:** N/A for direct UI behavior; indirect value via higher development quality and fewer stale implementation artifacts.
- **Developer-user audience:** Primary audience for this CR. Outcome is fast, accurate project understanding and reproducible agentic contribution flow.

## Functional Requirements

1. Rewrite root `README.md` so it reflects current project state and audience split:
- project mission and dual-audience framing (learner-user + developer-user),
- up-to-date stage/route map from `project-vision.md`,
- accurate local setup/runtime/tooling (`pnpm`, Node >=20, port 3001),
- architecture and observability overview aligned with `architecture.md` and ADR-0001,
- clear agentic development workflow entry points (`agent-docs/AGENTS.md`, role flow, CR lifecycle),
- documentation map distinguishing `agent-docs/` and `human-docs/`.

2. Remove stale or contradictory README content (outdated folder map, incorrect setup guidance, non-canonical package manager guidance, stale feature/module names).

3. Add a process guardrail so documentation impact is evaluated in every CR and cannot be silently skipped:
- Tech Lead planning/handoff artifacts must include a required "Documentation Impact" decision field,
- Sub-agent execution handoffs must explicitly state documentation files to update (or record why none are needed),
- BA acceptance checklist must include a documentation-impact verification item before CR closure.

4. Ensure the new guardrail covers both codebase-facing docs (`README.md`, `agent-docs/**`) and human contributor docs (`human-docs/**`) when impacted by the CR.

5. Preserve role ownership boundaries while enabling doc updates:
- BA continues to define scope/intent,
- Tech Lead/sub-agents execute technical doc edits within delegated scope,
- process/policy wording updates in shared docs must be Tech Lead-verified per workflow rules.

## Non-Functional Requirements

- **Clarity:** README sections should use deterministic headings and explicit navigation links so both humans and agents can find next steps quickly.
- **Consistency:** All commands and runtime statements must match canonical sources (`tooling-standard.md`, `technical-context.md`, `workflow.md`).
- **Maintainability:** New process language should be minimal and enforceable (checklist/field based), avoiding broad prose that is hard to audit.

## System Constraints & Invariants

- **Constraint Mapping:**
  - `agent-docs/tooling-standard.md` (pnpm-only, Node/runtime contract)
  - `agent-docs/project-vision.md` (dual audience + canonical roadmap)
  - `agent-docs/workflow.md` (role boundaries, shared-process governance)
  - `agent-docs/AGENTS.md` (authority and conflict resolution)
  - `agent-docs/roles/ba.md` Restricted section (BA must not directly edit root `README.md`)
- **Design Intent:** This is documentation and process hardening, not feature behavior change.

## Acceptance Criteria

- [ ] **AC-1 (README Structure):** `README.md` is reorganized into audience-aware sections that include: project purpose, dual audience framing, current stage/route roadmap, setup/runtime/tooling, architecture/observability summary, agentic contribution flow, and documentation navigation.
- [ ] **AC-2 (README Accuracy):** All setup commands and policy statements in `README.md` are consistent with canonical docs (`tooling-standard.md`, `technical-context.md`, `workflow.md`) with no conflicting package-manager or runtime instructions.
- [ ] **AC-3 (Stale Content Removal):** Previously stale README content is removed or corrected, including outdated project-structure/module references that do not represent the current codebase.
- [ ] **AC-4 (CR Process Guardrail):** At least one planning artifact and one execution handoff template are updated to include a mandatory "Documentation Impact" field with explicit values (`required` + file list, or `not-required` + rationale).
- [ ] **AC-5 (Closure Guardrail):** BA closure guidance/checklist is updated so CR acceptance explicitly verifies documentation impact resolution before marking `Done`.
- [ ] **AC-6 (No Contract Drift):** This CR does not alter app runtime behavior, routes, API contracts, `data-testid` contracts, or accessibility semantics.

## Verification Mapping

- **Development Proof:**
  - File diff review for README section correctness and stale-content removal.
  - File diff review of workflow/templates/checklists showing enforceable documentation-impact fields.
  - Command-level quality gates for changed markdown/type-checked project context as needed.

- **AC Evidence Format (for closure):**
  - `[x] <AC text> — Verified: <file-or-command>, <result>`

- **User Validation:**
  - Human User can follow README from clone to dev-run and identify the next action for BA -> Tech Lead -> sub-agent flow without external clarification.

## Baseline Failure Snapshot (Required for Regression/Incident CRs)

N/A — documentation/process enhancement CR, not a runtime incident.

## Post-Fix Validation Snapshot (Filled at Closure)

- **Date**: [YYYY-MM-DD]
- **Command(s)**: [Exact command(s) used]
- **Execution Mode**: [sandboxed | local-equivalent/unsandboxed]
- **Observed Result**: [Pass/fail summary]

## Dependencies

- Blocks: none
- Blocked by: none

## Notes

- Human User stated that `human-docs/` now contains baseline contributor content and wants project docs to stay fresh as CRs land.
- Scope assumption for this draft: documentation-impact guardrail applies across `README.md`, `agent-docs/**`, and `human-docs/**` when a CR affects those domains.

## Technical Analysis (filled by Tech Lead)

**Complexity:** [Low | Medium | High]
**Estimated Effort:** [S | M | L]
**Affected Systems:**
**Implementation Approach:**

## Deviations Accepted (filled at closure by BA)

- None
