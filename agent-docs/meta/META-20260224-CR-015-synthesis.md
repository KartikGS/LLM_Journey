# Meta Synthesis: CR-015

**Date:** 2026-02-24
**Findings sources:**
- `agent-docs/meta/META-20260224-CR-015-testing-findings.md`
- `agent-docs/meta/META-20260224-CR-015-backend-findings.md`
- `agent-docs/meta/META-20260224-CR-015-frontend-findings.md`
- `agent-docs/meta/META-20260224-CR-015-tech-lead-findings.md`
- `agent-docs/meta/META-20260224-CR-015-ba-findings.md`
**Synthesis agent:** Tech Lead (meta-improvement mode)

---

## Summary

CR-015's five-agent meta chain produced 47 raw findings, consolidating to 32 distinct items after de-duplication. Three systemic gaps dominate: (1) the Conversation File Freshness Pre-Replacement Check exists only in `workflow.md` and is undiscoverable from any role doc — a miss risk validated by all five agents symmetrically; (2) `testing-contract-registry.md` has no process hook ensuring currency after a CR closes — confirmed at 4 of 5 role boundaries; (3) `tech-lead.md`'s Wait State template gives factually wrong instructions for BA acceptance, degrading acceptance quality when followed. A secondary cluster of handoff-authorship gaps (missing negative security assertions, compound error priority, per-tab labels, output truncation silence) signals that the Tech Lead handoff template lacks self-checks for common spec omissions. Overall doc health is sound — agents resolved all gaps through judgment — but several gaps could produce silently wrong outcomes on future CRs without the same judgment being applied.

---

## High Priority

| # | Finding | Source Role(s) | Affected Doc / Section | Decision |
|---|---|---|---|---|
| H-01 | Pre-Replacement Check not referenced in any role doc | All 5 | 5 role docs / handoff-write sections | **Fix** |
| H-02 | `testing-contract-registry.md` — no update trigger, no process owner | Testing, Frontend, Tech Lead, BA | `tech-lead.md` / Adversarial Review; `ba.md` / Closure Checklist | **Fix** |
| H-03 | Wait State template instructs "Start new session" for BA acceptance — factually wrong | Tech Lead, BA | `tech-lead.md` / Wait State Output | **Fix** |
| H-04 | Negative security assertion absent from test table spec and BA Closure Checklist | Backend, Tech Lead, BA | `tech-lead.md` / Adversarial Review; `ba.md` / Closure Checklist | **Fix** |

---

### H-01 — Pre-Replacement Check not in role docs

The Conversation File Freshness Pre-Replacement Check is defined in `workflow.md` and is non-trivial (requires reading 2 artifacts to verify prior CR closure). No role doc references it. The Testing Agent found it via `workflow.md` Layer 1 only; Backend, Frontend, BA, and Tech Lead all validated the same symmetric miss risk.

**Principle:** Do not duplicate the check text. Add one cross-reference sentence per role doc pointing to `workflow.md`. Implementation agent should locate the exact handoff-write instruction in each file.

**`testing.md` — Preflight Communication section**

_Before (opening line):_
```
Before writing or modifying tests, publish a short **Preflight** note in `/agent-docs/conversations/testing-to-tech-lead.md`
```

_After (insert as first line of section):_
```
**Pre-Replacement Check (mandatory):** Before replacing `testing-to-tech-lead.md`, complete the Conversation File Freshness Pre-Replacement Check per `workflow.md`. Do not write until prior CR closure is confirmed.

Before writing or modifying tests, publish a short **Preflight** note in `/agent-docs/conversations/testing-to-tech-lead.md`
```

**`backend.md` — Checklist section**

_After (add as first checklist item, before the `node -v` item):_
```
- [ ] Before replacing `backend-to-tech-lead.md`: completed the Conversation File Freshness Pre-Replacement Check per `workflow.md` (prior CR plan exists + prior file shows `status: completed`)?
```

**`frontend.md` — Verification & Reporting Protocol section**

_After (insert before "Run runtime preflight"):_
```
**Pre-Replacement Check (mandatory):** Before replacing `frontend-to-tech-lead.md`, complete the Conversation File Freshness Pre-Replacement Check per `workflow.md`. Do not write until prior CR closure is confirmed.
```

**`ba.md` — near the `ba-to-tech-lead.md` output instruction** (implementer: search for "ba-to-tech-lead.md")

_After (insert before the output write instruction):_
```
**Pre-Replacement Check (mandatory):** Before replacing `ba-to-tech-lead.md`, complete the Conversation File Freshness Pre-Replacement Check per `workflow.md`. Do not write until prior CR closure is confirmed.
```

**`tech-lead.md` — Execution & Coordination, before "Formalize Handoffs"**

_Before:_
```
-  **Formalize Handoffs**: Create sub-agent prompts in `agent-docs/conversations/tech-lead-to-<role>.md`.
```

_After (insert as preceding bullet):_
```
-  **Pre-Replacement Check (mandatory before any handoff write):** For each `tech-lead-to-<role>.md` file, complete the Conversation File Freshness Pre-Replacement Check per `workflow.md` before replacing. If replacing multiple handoff files that all contain content from the same prior closed CR, one closure verification covers all.
-  **Formalize Handoffs**: Create sub-agent prompts in `agent-docs/conversations/tech-lead-to-<role>.md`.
```

---

### H-02 — `testing-contract-registry.md` no update trigger, no owner

Contract changes are documented in Frontend completion reports but have no process hook ensuring registry updates before CR closure. The Tech Lead adversarial review is the earliest detection point; the BA Closure Checklist is the last gate.

**`tech-lead.md` — Adversarial Diff Review, after the existing check bullets**

_After (add as new check bullet):_
```
    - **Check**: If the diff includes `data-testid` additions, removals, or renames — or route path changes — verify that an instruction to update `testing-contract-registry.md` is included in the Testing or BA handoff before issuing the Wait State.
```

**`ba.md` — Closure Checklist, after the existing 9 items**

_After (add as new checklist item):_
```
- [ ] If this CR changed any `data-testid` contracts or route contracts (additions, removals, renames): confirm `testing-contract-registry.md` has been updated, or create a follow-up tracking item in project-log `Next Priorities` with the Testing Agent as responsible party.
```

---

### H-03 — Wait State "Start new session" for BA

The current instruction is factually wrong for BA acceptance: a new BA session loses accumulated CR context (original intent, constraints, accepted trade-offs), materially degrading acceptance quality. Sub-agent execution roles (Backend, Frontend, Testing) benefit from fresh context; BA acceptance is context-dependent and should be treated as an exception.

**`tech-lead.md` — Wait State Output, item 4**

_Before:_
```
4. Clear instruction: *"Start a new session and assign the [Role] to execute this handoff."*
   - If the user explicitly overrides this and asks to continue in the same session, Tech Lead may proceed while still respecting role boundaries and delegation invariants.
```

_After:_
```
4. Clear instruction — role-dependent:
   - **Sub-agent execution roles** (Backend, Frontend, Testing, Infra): *"Start a new session and assign the [Role] to execute this handoff."*
   - **BA acceptance** (after issuing `tech-lead-to-ba.md`): *"Resume the existing BA session that produced `ba-to-tech-lead.md` and provide `tech-lead-to-ba.md` as input. Do not start a new session — the BA's accumulated CR context is required for accurate acceptance verification."*
```

---

### H-04 — Negative security assertion gap

For CR-015, the security constraint "system prompt must NOT appear in any response field" was verified by manual code audit only. The test table covered the positive half (system prompt appears in outgoing request); no automated test formalizes the negative half. This is a structural gap in both handoff authorship and BA closure verification.

**`tech-lead.md` — Adversarial Diff Review, after the existing check bullets**

_After (add as new check bullet):_
```
    - **Check**: For each security constraint of the form "X must/must not appear in Y", verify the test table includes both the positive assertion (X appears in the expected location) and the negative assertion (X does not appear in the disallowed location). A positive-only test does not satisfy a containment invariant.
```

**`ba.md` — Closure Checklist, after the existing items**

_After (add as new checklist item):_
```
- [ ] For security constraints of the form "X must NOT appear in Y": verify a test or explicit code-path audit covers the negative assertion. A passing positive test alone does not satisfy a containment invariant.
```

---

## Medium Priority

| # | Finding | Source Role(s) | Affected Doc / Section | Decision |
|---|---|---|---|---|
| M-01 | `node -v` runtime preflight duplicated in 4+ files, no canonical source declared | Testing, Backend, Frontend, Tech Lead | `tooling-standard.md` (declare canonical); `testing.md`, `frontend.md` (replace with cross-refs) | **Fix** |
| M-02 | "Follow [pattern] exactly" vs. explicit divergences — no handoff authorship self-check | Backend, Tech Lead | `tech-lead.md` / Execution & Coordination | **Fix** |
| M-03 | Known Environmental Caveats — absent from Backend and Frontend handoffs; asymmetric | Testing, Backend, Frontend, Tech Lead | `tech-lead.md` / handoff authorship | **Fix** |
| M-04 | BA spec terminology (`tab selector`) propagated to accessibility conflict; `frontend.md` radiogroup rule too broad | Frontend, Tech Lead, BA | `frontend.md` / Accessibility; `ba.md` / BA Quality Checklist | **Fix** |
| M-05 | CR Immutability Rule excludes AC closure annotation — needs explicit carve-out | BA | `workflow.md` / Allowed Post-Closure Edits | **Fix** |
| M-06 | Tech Lead Recommendations bypass Deviation Severity Rubric when not framed as "deviations" | BA | `ba.md` / Deviation Severity Rubric | **Fix** |
| M-07 | "Individual verification" in AC annotation is ambiguous between citation completeness and independent re-read | BA | `workflow.md` / Acceptance Phase step 2 | **Fix** |
| M-08 | Compound validation priority not specified for multi-field error codes | Backend, Tech Lead | `tech-lead.md` / handoff authorship self-check | **Fix** |
| M-09 | No instruction to read referenced pattern component before implementing | Frontend, Tech Lead | `tech-lead.md` / handoff authorship | **Fix** |
| M-10 | No documented protocol when sub-agent cannot run verification commands | Tech Lead, BA | `tech-lead.md` / Adversarial Review | **Fix** |
| M-11 | `backend.md` verification scope default buried — DoD override not front-loaded | Backend | `backend.md` / Verification Scope | **Fix** |

---

### M-01 — `node -v` duplication

Confirmed in: `tooling-standard.md`, `testing.md`, `frontend.md`, `backend.md` (4 locations). `backend.md` already cross-references `tooling-standard.md` — that is the correct pattern. Canonical source needs declaring; duplicated text needs replacing with cross-references.

**`tooling-standard.md` — Runtime Preflight section** (add declaration at top of section):
```
> **Canonical source**: This section is the single source of truth for runtime preflight requirements. Role docs cross-reference here; they do not duplicate this text.
```

**`testing.md` — Runtime Preflight section**

_Before:_
```
- Run `node -v` once per execution session before verification commands.
- Record the observed version in the testing report if it impacts classification.
```

_After:_
```
- Run runtime preflight per `tooling-standard.md` Runtime Preflight (canonical source). Record the observed version in your report if it affects classification.
```

**`frontend.md` — Verification & Reporting Protocol section**

_Before:_
```
- Run runtime preflight: `node -v`. If below Node ≥ 20.x (per `tooling-standard.md`), classify as `environmental` in the report before running any verification commands.
```

_After:_
```
- Run runtime preflight per `tooling-standard.md` Runtime Preflight (canonical source). If below the minimum version, classify as `environmental` in the report before running any verification commands.
```

_(No change to `backend.md` — its cross-reference to `tooling-standard.md` is already the correct pattern.)_

---

### M-02 — "Follow exactly" self-check gap

**`tech-lead.md` — Execution & Coordination, as a sub-bullet under Formalize Handoffs**

_After (insert):_
```
   - **Self-check before issuing**: If the handoff uses "follow [pattern] exactly" as a reference instruction, verify that no subsequent spec item contradicts "exactly." Preferred framing: "Follow the structure and error-handling patterns of [pattern] — deviations are itemized below and take precedence."
```

---

### M-03 — Known Environmental Caveats asymmetric across handoffs

The Tech Lead had environment information (Node v16.20.1, nvm path, pnpm requirements) at handoff-issuance time but included it only in the Testing handoff. Backend and Frontend discovered the mismatch independently. All sub-agents in a CR face the same environment — this is a Tech Lead authorship gap, not a role-doc gap.

**`tech-lead.md` — Execution & Coordination, as a sub-bullet under Formalize Handoffs**

_After (insert):_
```
   - **Known Environmental Caveats (required section in every sub-agent handoff)**: Include any environment constraints known at handoff-issuance time (Node version, nvm path, pnpm version requirements, unavailable tooling). All sub-agents face the same environment — populate once and include in all handoffs. Do not leave agents to independently discover known mismatches.
```

---

### M-04 — Accessibility conflict (`frontend.md` radiogroup rule scope + BA Quality Checklist)

The `frontend.md` radiogroup rule is written for "exactly one option active" broadly, without acknowledging tablist as a valid ARIA alternative for panel-switching controls. Both are legitimate; the correct choice depends on interaction type (option selection vs. content panel navigation), not just cardinality.

**`frontend.md` — Accessibility & Testability Contracts**

_Before:_
```
- **Single-select controls** (exactly one option active) MUST use radio semantics:
  - container: `role="radiogroup"`
  - options: `role="radio"` + `aria-checked`
  - keyboard behavior: arrow-key navigation between options.
```

_After:_
```
- **Single-select controls** (exactly one option active) MUST use one of two ARIA patterns based on interaction type:
  - **Option selection** (choosing between discrete values — e.g. size, color, strategy): radio semantics — container `role="radiogroup"`, options `role="radio"` + `aria-checked`, arrow-key navigation between options.
  - **Panel navigation** (switching between panels of content — e.g. strategy tabs, view modes): tablist semantics — container `role="tablist"`, items `role="tab"` + `aria-selected`, associated panels `role="tabpanel"`. Arrow-key navigation within tablist; `Tab` moves focus to the active panel.
  - When a handoff explicitly names a control a "tab" or "tab selector," apply tablist semantics. When terminology is neutral ("selector," "switcher," "picker"), apply radiogroup semantics unless the control navigates between panels of content.
```

**`ba.md` — BA Quality Checklist** (add item):

_After (insert):_
```
- [ ] If the CR spec uses ARIA-semantic terminology (tab, radio, listbox, combobox, slider), verify the term aligns with the intended accessibility pattern in `frontend.md` Accessibility section before finalizing the spec. Accessibility-semantic terms in the BA spec propagate directly to Frontend Agent implementation choices.
```

---

### M-05 — CR Immutability Rule carve-out for AC annotation

AC checkbox annotation (`[ ]` → `[x]` + evidence) is a required closure action, not a retroactive rewrite of intent. The current Allowed Post-Closure Edits list omits it, creating a spurious conflict with the BA Closure Checklist requirement.

**`workflow.md` — Allowed Post-Closure Edits (item 4)**

_Before:_
```
4. **Allowed Post-Closure Edits (closed CRs only):**
   - Typo/formatting fixes, broken link fixes, or factual corrections.
   - Any such update must be logged in an `Amendment Log` section with date + reason.
   - Do **not** retroactively change acceptance intent or silently rewrite AC history.
```

_After:_
```
4. **Allowed Post-Closure Edits (closed CRs only):**
   - **AC evidence annotation** (`[ ]` → `[x]` + one-line evidence reference) and CR status change to `Done` — these are required closure actions and do not constitute retroactive rewriting of intent. No Amendment Log entry required for closure annotation.
   - Typo/formatting fixes, broken link fixes, or factual corrections. Any such update must be logged in an `Amendment Log` section with date + reason.
   - Do **not** retroactively change acceptance intent, expand or narrow AC scope, or silently rewrite AC history.
```

---

### M-06 — Tech Lead Recommendations bypass Deviation Rubric

Items framed as "Tech Lead Recommendations" in the BA handoff are not automatically evaluated through the Deviation Severity Rubric. When a recommendation touches a constraint explicitly stated in the CR, it should be classified using the rubric regardless of framing.

**`ba.md` — Deviation Severity Rubric, below the rubric table**

_After (insert):_
```
**Recommendations that touch CR constraints**: If a `## Tech Lead Recommendations` item in `tech-lead-to-ba.md` touches a constraint explicitly stated in the CR (a required pattern, a constant, a security invariant, a spec constraint), classify it as a Minor or Major deviation using this rubric — regardless of how the Tech Lead framed it. A "recommendation" label does not override a CR constraint.
```

---

### M-07 — "Individual verification" ambiguity

"Do not bulk-accept without individual verification" has two readings: (a) each AC has a distinct citation, or (b) independently re-read each cited file. For security-sensitive ACs or deleted contracts, only (b) is safe. The canonical source should specify graduated guidance.

**`workflow.md` — Acceptance Phase, step 2**

_Before:_
```
2. **AC Evidence Annotation**: For each AC in the CR, mark `[x]` with a one-line evidence reference (e.g., file + line number). Do not bulk-accept without individual verification.
```

_After:_
```
2. **AC Evidence Annotation**: For each AC in the CR, mark `[x]` with a one-line evidence reference (file + line number). Apply graduated verification:
   - **Security constraints** (data must/must not appear, auth invariants) and **deleted contracts** (removed testids, removed files, changed APIs): independently re-read the cited file/line to confirm.
   - **Additive changes** (new components, copy changes, dark mode, UI layout): trust the Tech Lead's citation with a brief source audit note.
   Do not bulk-accept all ACs with a single pass. Each AC must have a distinct evidence reference.
```

_(The `ba.md` AC annotation line already cross-references `workflow.md` as canonical source — no change needed there.)_

---

### M-08 — Compound validation priority not specified

When a handoff specifies multiple distinct error codes for a single endpoint, compound-failure priority determines which code the client sees. This is a product decision with UX consequences and must be explicit in the spec.

**`tech-lead.md` — Execution & Coordination, near the "Follow exactly" self-check**

_After (add as a parallel self-check):_
```
   - **Self-check**: If the handoff specifies multiple distinct error codes for a single endpoint, explicitly state the priority when multiple fields fail simultaneously (e.g., "if both `strategy` and `prompt` are invalid, return `invalid_strategy`"). Do not leave this as an implementation judgment call.
```

---

### M-09 — No instruction to read pattern component before implementing

When a handoff requires pattern fidelity against a named component, the agent must read that component to implement accurately. This judgment call was made correctly in CR-015 but is not guaranteed by the handoff template.

**`tech-lead.md` — Execution & Coordination, as a sub-bullet under Formalize Handoffs**

_After (insert):_
```
   - **Pattern fidelity handoffs**: When the handoff requires a sub-agent to follow a named component's pattern exactly, include an explicit step: "Read `<ComponentPath>` before writing your implementation." Do not assume the agent will infer this from the fidelity requirement alone.
```

---

### M-10 — No protocol when sub-agent cannot run verification

In CR-015, pnpm refused to run under Node v16 for the Frontend Agent; the Tech Lead ran quality gates independently. No protocol documents when the Tech Lead steps in, which commands to run, or how the BA should evaluate the result.

**`tech-lead.md` — Adversarial Diff Review or sub-agent execution section** (add as a new subsection)

_After (insert):_
```
**Quality Gate Fallback (sub-agent environment failure):** If a sub-agent reports inability to run verification commands due to environment constraints (e.g., pnpm/Node version incompatibility), the Tech Lead is responsible for running all quality gates before issuing the BA handoff. In the BA handoff, document: (a) which commands were run by the Tech Lead, (b) which environment was used, and (c) whether the runtime mismatch is pre-existing (tracked in project-log) or CR-introduced.
```

_(See also L-10 for the corresponding BA acceptance guidance when receiving Tech Lead-run quality gates.)_

---

### M-11 — Verification scope default buried in `backend.md`

An agent internalizing "scoped spec" as the rule may miss the DoD override even after reading it. The exception should be front-loaded.

**`backend.md` — Verification Scope**

_Before:_
```
- Verification scope: run the scoped spec file (`pnpm test <spec-file>`) to confirm new tests pass before reporting. Full-suite verification is the Tech Lead's responsibility. **Exception**: when the active handoff's DoD explicitly requires full-suite verification from Backend, run full suite and report both scoped and full-suite results — the handoff DoD takes precedence over this default.
```

_After:_
```
- Verification scope: **check the handoff DoD first.** If the DoD specifies `pnpm test` (full suite), run full suite — the DoD takes precedence over this default. Otherwise, run only the scoped spec file (`pnpm test <spec-file>`). Full-suite verification is the Tech Lead's responsibility unless the DoD explicitly delegates it to Backend.
```

---

## Low Priority

| # | Finding | Source Role(s) | Decision | Proposed Change (brief) |
|---|---|---|---|---|
| L-01 | Output truncation — silence in "follow exactly" handoff read as "omit" | Backend, Tech Lead | **Fix** | `tech-lead.md` self-check: "If pattern uses a limit constant (e.g., `MAX_CHARS`), explicitly state whether the new route uses it, a different value, or intentionally omits it." |
| L-02 | Per-tab terminal label not specified | Frontend, Tech Lead | **Fix** | `tech-lead.md` self-check: "For components with per-variant user-visible labels (terminal labels, filenames, panel headings), specify the label pattern explicitly — do not rely on agent inference." |
| L-03 | "No other data-testids required" — floor or prohibition wording ambiguous | Frontend, Tech Lead | **Fix** | Canonical phrasing in `tech-lead.md` handoff template: "These N are the required minimum. Do not add others without documenting them in your completion report." Replace "no other are required" in future handoffs. |
| L-04 | BA entry-point check trivially satisfied when prior findings pre-loaded as session context | BA | **Fix** | `meta-improvement-protocol.md` Phase 1 BA entry-point check: add conditional — "If prior findings files are provided as session context, the entry-point check is satisfied. Proceed directly to findings production." |
| L-05 | AC evidence annotation two-pass ceremony (verify then annotate separately) | BA | **Fix** | `ba.md` acceptance guidance: add note — "During acceptance verification, annotate AC evidence references during each file read (combined pass). Separate verification and annotation passes are not required." |
| L-06 | File write requires prior read — Claude Code tooling constraint undocumented | Tech Lead | **Fix** | `tech-lead.md` near Formalize Handoffs: add note — "Before replacing any existing handoff file, read it first — even if the content will be entirely discarded. Required by tooling (Write requires prior Read for existing files)." |
| L-07 | BA Tenet 1 exception clause lists only explicit triggers; implicit trigger (providing `tech-lead-to-ba.md`) not listed | BA | **Fix** | `ba.md` Tenet 1 exception clause: add example — "providing `tech-lead-to-ba.md` as input signals the Acceptance Phase — proceed without clarifying questions." |
| L-08 | `frontend-refactor-checklist.md` Intent Lock step zero-value when handoff declares execution mode | Frontend | **Fix** | `frontend-refactor-checklist.md` Step 1: add conditional — "If execution mode is declared in the handoff, this step is satisfied. Confirm and proceed to Step 2." |
| L-09 | Scope gate for new file creation always trivially satisfied | Backend | **Fix** | `backend.md` Scope Gate: add clarification — "For new file creation, confirm the target directory is within Backend ownership per the Ownership Quick Matrix. The cross-role ownership check applies to modification of existing files only." |
| L-10 | BA has no guidance for accepting quality gates run by Tech Lead on behalf of sub-agent | BA | **Fix** | `ba.md` Closure Checklist or acceptance notes: add — "If the BA handoff documents that the Tech Lead ran quality gates on behalf of a sub-agent (environment constraint), accept if: (a) the runtime mismatch is pre-existing in project-log, (b) all gates passed, and (c) the Tech Lead's adversarial review confirmed no runtime-specific gaps. Log as environmental note, not CR deviation." |
| L-11 | Runtime mismatch "classify as environmental" does not answer proceed/halt | Testing, Backend, Frontend | **Fix** | `tooling-standard.md` Runtime Preflight: add — "If the mismatch is pre-existing and tracked in project-log, proceed and document. If the mismatch is new and version is below the documented minimum, halt and report to Tech Lead before running verification commands." |
| L-12 | Conversation report TEMPLATE files — role docs say "use as canonical" but not "read first"; silent divergence risk | Testing | **Fix** | `testing.md`: change "Use `TEMPLATE-testing-to-tech-lead.md` as the canonical report structure" → "Read `TEMPLATE-testing-to-tech-lead.md` before writing your report." Same pattern in other role docs that reference conversation templates. |
| L-13 | BA Closure Checklist "reject" option for Tech Lead Recommendations — no documented threshold | BA | **Defer** | Edge case; formalizing a rejection threshold adds rubric complexity for a rarely-exercised option. Sufficient to address in a future BA doc pass when a rejection scenario actually arises. |

---

## Deferred / Rejected

| # | Finding | Source Role(s) | Decision | Rationale |
|---|---|---|---|---|
| D-01 | Pre-Replacement Check has asymmetric ceremony for agent-written vs. agent-received files | Testing, Backend, Frontend, BA | **Defer** | Safety net value justifies ceremony; narrowing requires agents to self-classify file types before checking — circular. Revisit if friction persists across 2+ more CRs. |
| D-02 | `keep-in-mind.md` binary stay/retire outcome — no "partially mitigated" option | BA | **Defer** | Judgment call was correct; a third outcome adds rubric complexity. Revisit when the pattern recurs. |
| D-03 | `@critical` tag re-evaluation — no process when a test is substantively rewritten | Testing | **Defer** | Tag governance needs a broader review of `testing-strategy.md`; a single-finding patch risks incomplete coverage. |
| D-04 | Reversibility not flagged for file deletion in sub-agent handoffs | Frontend | **Defer** | Explicit "Files to Delete" scope section is sufficient authorization. Adding a reversibility annotation to deletions adds ceremony without commensurate risk reduction. |
| D-05 | Two-layer context pre-load adds ceremony for well-specified handoffs | Backend, Tech Lead | **Defer** | Pre-load is a safety net for ambiguous handoffs; an agent cannot judge handoff quality before reading it. Defer to broader workflow review. |
| D-06 | Test table sole authorship — no prospective coverage validation mechanism | Tech Lead | **Defer** | Requires tooling changes for prospective feedback. The specific symptom gaps (negative assertion: H-04; compound priority: M-08) are addressed. Broader structural gap out of scope for doc changes. |
| D-07 | DoD test count stale between planning and execution | Tech Lead | **Defer** | Lower-bound framing (`≥ N`) handles this correctly. Precision is nice-to-have; no agent was blocked. |
| R-01 | Anti-pattern callouts in handoffs are high-value (positive observation, not a gap) | Frontend, Backend, Tech Lead | **Reject** | No doc change needed. Pattern is already being practiced. |
| R-02 | `animate-pulse` gray zone — fidelity instruction vs. `frontend.md` prohibition | Frontend | **Reject** | Prohibition is element-scoped (background glows only); loading indicators and cursor blink are out of scope. No conflict at implementation level. |
| R-03 | Cross-feature component reads — no "reference-only read" category in Frontend Boundaries | Frontend | **Reject** | Read-only operations outside owned boundaries are clearly permitted by general principles. Adding a category for every read sub-case bloats the role doc without adding decision value. |
| R-04 | Quality bar for pattern-fidelity components delegated to referenced component's author | Frontend | **Reject** | Visual Quality Invariant applies independently of implementation strategy. Pattern fidelity is not a quality exemption. No doc change needed. |
| R-05 | BA spec language multiplier effect — philosophical observation | BA | **Reject** (as standalone) | Captured operationally in M-04 (BA Quality Checklist addition for accessibility terminology). |
| R-06 | Meta chain execution order (downstream → BA) confirmed correct — positive observation | BA | **Reject** | No doc gap identified. Protocol design validated. |

---

## Decision Needed

No items require Human User input before proceeding to Phase 3 approval. All proposed changes are wording additions or clarifications to existing sections — no role authority transfers, no policy reversals, no new process gates without existing precedent.

**Note for Phase 3 implementation:** M-04 touches `ba.md` BA Quality Checklist, which is a BA-scoped artifact. Per the Decision Ownership matrix in `meta-improvement-protocol.md`, this item should be reviewed by BA before `ba.md` is edited. The proposed wording is clear at principle level; BA confirmation of the exact checklist placement is appropriate.

---

## Implementation Grouping (for Phase 3)

To minimize change scatter, group edits by file:

| File | Items |
|---|---|
| `workflow.md` | M-05, M-07 |
| `tech-lead.md` | H-01, H-02, H-03, H-04, M-02, M-03, M-08, M-09, M-10, L-01, L-02, L-03, L-06 |
| `ba.md` | H-02, H-04, M-04, M-06, L-05, L-07, L-10 |
| `testing.md` | H-01, M-01, L-12 |
| `backend.md` | H-01, M-01 (no change — already cross-references), M-11, L-09 |
| `frontend.md` | H-01, M-01, M-04 |
| `tooling-standard.md` | M-01, L-11 |
| `frontend-refactor-checklist.md` | L-08 |
| `meta-improvement-protocol.md` | L-04 |

**Total Fix items:** 25 (4 High, 11 Medium, 10 Low)
**Deferred:** 7 | **Rejected:** 6
