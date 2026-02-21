# Meta Synthesis: CR-014

**Date:** 2026-02-20
**Findings sources:**
- `agent-docs/meta/META-20260220-CR-014-frontend-findings.md`
- `agent-docs/meta/META-20260220-CR-014-backend-findings.md`
- `agent-docs/meta/META-20260220-CR-014-tech-lead-findings.md`
- `agent-docs/meta/META-20260220-CR-014-ba-findings.md`

**Synthesis agent:** Tech Lead (meta-improvement mode)

---

## Summary

CR-014 meta-analysis surfaced **34 distinct findings** after deduplication from ~65 raw items across four agents. CR-013 fixes held well for standard CRs; CR-014's domain (external API failure + multi-file content update + provider format migration) exercised boundaries that CR-013 didn't reach. Three dominant failure clusters: **(1) role-doc-to-role-doc conflicts** that produce genuinely ambiguous behavior (verification order reversal, backend scoped-vs-full-suite, scope gate firing before delegation is read); **(2) template structural gaps** that forced informal workarounds across multiple CRs (no Implementation Decisions field, no Tech Lead Recommendations section, no env var field, no incident N/A mechanism); **(3) meta-process tracking gap** — Phase 1 findings accumulate but no artifact guarantees Phase 2 synthesis is initiated. One CR-013 High-priority fix (H8 — Reading Confirmation Template) appears not yet implemented; it is re-raised here as Low priority since the same proposal applies without modification.

---

## High Priority

| # | Finding (Consolidated) | Source(s) | Affected Doc + Section | Decision | Change Summary |
|---|---|---|---|---|---|
| H1 | Verification command order reversed between `frontend.md` and `frontend-refactor-checklist.md` (lint→tsc vs. tsc→lint) | Frontend-C1, Tech Lead validates | `frontend-refactor-checklist.md` / Step 5 | Fix | Align refactor-checklist to frontend.md order (canonical); add cross-reference. |
| H2 | Backend Scope Gate fires on test-file presence before delegation statement is read — no "unless already delegated" exception | Backend-S1, Tech Lead validates | `backend.md` / Scope Gate | Fix | Add exception clause: unless active handoff explicitly delegates test scope to Backend. |
| H3 | `backend.md` says scoped verification is backend's job; handoff DoD can require full suite — no declared precedence rule | Backend-C1, Backend-U1 | `backend.md` / Execution Responsibilities | Fix | Add precedence rule: handoff DoD takes precedence over role-doc default; require reporting both scoped and full-suite results when handoff mandates full suite. |
| H4 | Runtime preflight (`node -v`) required by `tooling-standard.md` and `testing-strategy.md` but not echoed in `frontend.md` or `backend.md` execution sections — discovered reactively after command failure | Frontend-EPC1, Backend-M2, Tech Lead validates | `frontend.md` / Verification & Reporting Protocol; `backend.md` / Checklist | Fix | Add `node -v` preflight note to frontend.md verification section and backend.md checklist. |
| H5 | No `## Tech Lead Recommendations` section in `TEMPLATE-tech-lead-to-ba.md`; no corresponding BA closure checklist item — Tech Lead quality observations bypass BA product-intent review | Tech Lead-M3, BA-M5 | `TEMPLATE-tech-lead-to-ba.md`; `ba.md` / BA Closure Checklist | Fix | Add conditional `## Tech Lead Recommendations` section to template; add review item to BA closure checklist. |
| H6 | No `## Implementation Decisions (Tech Lead Owned)` section in plan template — BA-deferred decisions embedded in prose across Constraints/Notes with no designated artifact location | Tech Lead-M1, BA-M4 | `agent-docs/plans/TEMPLATE.md` | Fix | Add dedicated section after Configuration Specifications. |
| H7 | Meta-improvement protocol Phase 1 has no tracking artifact requirement — Phase 2 synthesis depends on manual user initiation with no `project-log.md` hook | Tech Lead-EPC2, BA-EPC1 | `meta-improvement-protocol.md` / Phase 1 | Fix | Add Phase 1 Completion Requirement: create a `Next Priority` entry in `project-log.md` when all findings files are complete. |

---

## Medium Priority

| # | Finding (Consolidated) | Source(s) | Affected Doc + Section | Decision | Change Summary |
|---|---|---|---|---|---|
| M1 | Pre-Replacement Check minimum evidence unspecified — all three roles self-constructed different heuristics | Frontend-M2, Backend-RWS3, Tech Lead-U2, BA validates | `workflow.md` / Conversation File Freshness Rule | Fix | Add minimum evidence standard: `plans/CR-XXX-plan.md` exists AND conversation file or CR artifact shows `status: completed`. |
| M2 | Intentional dead code created by a CR constraint has no persistence mechanism beyond the active handoff — future agents will see an untested branch with no documented intent | Backend-EPC1, Backend-EPC2, Tech Lead-EPC1, BA validates | `tech-lead.md` / Verification Checklist | Fix | Add checklist item: when intentional dead code is preserved by CR constraint, add a code comment referencing the intent and create a follow-up CR candidate for deferred removal. |
| M3 | TL Adversarial Diff Review has no check for undisclosed sub-agent deviations (changes present in files but absent from `[Changes Made]` / `[Deviations]` sections) | Tech Lead-M2 | `tech-lead.md` / Adversarial Diff Review | Fix | Add check bullet: compare sub-agent report sections against actual file changes line-by-line. |
| M4 | Test name staleness after contract change has no systematic checklist trigger — test assertions updated but test name still described old format | Backend-O2, Tech Lead-O1 | `tech-lead.md` / Adversarial Diff Review | Fix | Add check bullet: for tests where assertions were updated due to a format/contract change, verify the test name still accurately describes what is being tested. |
| M5 | ADR decision test boundary ambiguous for format migrations within an existing provider type — "provider type" is listed as an ADR trigger but migrating an existing type's behavior is not introducing a new type | Tech Lead-M4 | `tech-lead.md` / Architecture & ADRs | Fix | Extend non-ADR example to include: "format migration within an existing provider type where the provider-type token is unchanged." |
| M6 | Post-Verification Drift Check (added in CR-013 H7) has no operational definition — HOW to verify is unspecified; check is trivially satisfied in same-session execution but undefined for multi-session gaps | Tech Lead-U1 | `workflow.md` / Verification Phase step 6 | Fix | Add mechanism note: trivially satisfied in same-session sequential execution; for multi-session gaps, re-read feature files or compare modification timestamps. |
| M7 | CSS class side-effects of text-content changes not addressed in scope guidance or completion template — unreported deviation resulted; `[Deviations]` section has no prompt for this category | Frontend-M1, Frontend-O1, Tech Lead validates | `TEMPLATE-frontend-to-tech-lead.md` / `[Deviations]` | Fix | Add prompt: CSS class changes accompanying text content updates must be reported even when handoff specifies "text content only." |
| M8 | CR template has no structured `## Environment Variable Changes` section — env var additions scattered across ACs, handoff prose, and Constraints; CR artifact (permanent record) has no searchable field | Tech Lead-O3, BA-M3 | `requirements/CR-template.md` | Fix | Add conditional `## Environment Variable Changes` section. |
| M9 | `"Out-of-Scope But Must Be Flagged"` section exists in `TEMPLATE-tech-lead-to-backend.md` but `backend.md` never explains WHY or WHEN Tech Lead pre-populates it — Backend incorrectly identified section as missing | Backend-U2 (corrected by Tech Lead-O4) | `backend.md` / Scope Gate | Fix | Add one-paragraph explanation: each item is a pre-agreed stop-and-report trigger for edge cases Tech Lead identified before implementation began. |
| M10 | `## Baseline Failure Snapshot` marked "Required for Regression/Incident CRs" but provides no N/A mechanism for external service failures that are not reproducible by any local command | BA-C1, BA-O3 | `requirements/CR-template.md` / Baseline Failure Snapshot | Fix | Add inline comment allowing informed omission: "N/A — external service failure; baseline not reproducible locally. See Notes." |
| M11 | No BA-level evidence-sufficiency standard for external API root cause claims — BA role says "Evidence Over Intuition" and Decision Matrix mandates a command baseline, but both obligations are structurally impossible for external service failures | BA-M1 | `ba.md` / BA Decision Matrix | Fix | Add qualifier to incident row: for external API failures where no local command can reproduce the failure, qualify root cause as "suspected — requires Tech Lead live API probe to confirm." |
| M12 | Wait State rule does not address co-occurrence of permitted direct changes and handoff batch issuance in same execution turn — permissive reading is functionally correct but unsupported by protocol text | Tech Lead-C2 | `workflow.md` / The Delegation Invariant | Fix | Clarify: permitted direct changes (e.g., `.env.example`, config files) may be completed in the same turn as handoff issuance; Wait State begins after all permitted changes + handoffs are complete. |

---

## Low Priority

| # | Finding Summary | Source(s) | Decision | Rationale |
|---|---|---|---|---|
| L1 | Reading Confirmation Template in `tech-lead.md` and `ba.md` still uses full-listing format — CR-013 synthesis H8 proposed replacing it with exception-based attestation; proposal not yet applied to these role docs | Tech Lead-RWS3, BA-RWS2 | Fix (pending — use CR-013 H8 wording verbatim) | No new proposal needed; re-raise for implementation. |
| L2 | BA Execution Mode rubric "one primary artifact" is ambiguous — could mean most-significant change OR literal file count; CR-014 required a judgment call | BA-U1 | Fix | Add clarifying note: "primary artifact = most significant functional change; secondary documentation/config file touches do not change the mode classification." |
| L3 | "Is the Learner Transformation clear?" quality checklist item in `ba.md` produces no output — no corresponding AC format, no evidence definition for educational content CRs | BA-EPC2 | Fix | Add note to Quality Checklist item: for educational content CRs, translate this into at least one measurable AC (e.g., "table enables comparison of X, Y, Z dimensions for learner"). |
| L4 | User-correcting-BA root cause loop not modeled — `ba.md` Clarification & Disagreement Protocol models Tech Lead-initiated challenges but not User-corrects-BA mid-investigation | BA-O1, BA-U2 | Fix | Add BA correction case to Protocol: "When user corrects BA analysis: acknowledge explicitly, document what changed and why the prior claim was incorrect, and continue." |
| L5 | Imprecise DOM descriptions in handoff ("standalone `<p>`" when element is inside a `<div>`) create momentary hesitation for removal tasks | Frontend-U2 | Defer | Handoff-specific phrasing issue; adding a template rule is low-value for infrequent removal tasks. Rely on Tech Lead review. |

---

## Deferred / Rejected

| # | Finding Summary | Decision | Rationale |
|---|---|---|---|
| D1 | Mandatory context loading with no relevance tiering (`keep-in-mind.md`, `folder-structure.md`, `decisions/`, `design-tokens.md` produced zero decision-relevant content for CR-014) | Defer | Systemic problem across all roles; a tiering mechanism requires dedicated design work touching all role docs and `AGENTS.md`. No single targeted fix. Schedule as standalone doc-architecture CR when overhead becomes a recurring escalation. |
| D2 | Preflight note ceremony overhead when all assumptions are locally verifiable and open questions are zero | Defer | Already deferred as D1 in CR-013 synthesis. No new signal from CR-014. The preflight note creates a formal risk record that persists across sessions even when trivially confirmed; value is marginal but non-zero. Revisit if overhead recurs after M6 (operational Drift Check note) reduces unnecessary re-verification. |
| D3 | E2E trigger decision in `testing-strategy.md` Tech Lead Verification Matrix vs. `workflow.md` Testing Handoff Trigger Matrix — no future-conflict safeguard | Reject | Both matrices were consistent for CR-014. `testing-strategy.md` line 146–147 already declares `workflow.md` as the trigger decision source of truth. Canonical chain is adequately documented. |
| D4 | `HF_MAX_NEW_TOKENS` constant name semantically stale after format migration (value correct, name implies old format) | Defer | Code-level rename; not a doc change. Defer to a future Backend refactoring CR when the constant is next touched. |
| D5 | "Audience & Outcome Check (Mandatory)" in `workflow.md` has no corresponding section in the CR template — captured implicitly in Business Context | Defer | Business Context `User Need` + `Expected Value` fields cover the same intent; adding a formal field duplicates rather than improves. Low value. |
| D6 | BA Tenet 1 "Clarification > Execution" exception doesn't address compound requests with mixed ambiguity levels across sub-items | Defer | Low frequency; BA correctly resolved CR-014 by asking one focused question. The exception is a heuristic, not an algorithm. Over-specifying creates its own ambiguity. |
| D7 | BA content-intent ownership over content phrasing decisions: no protocol for when phrasing choices require user confirmation vs. BA judgment | Defer | Over-specifies professional judgment. BA owns content intent by role; phrasing is within that authority unless the CR explicitly constrains it. |
| D8 | Pre-Implementation Self-Check declared in two locations (`tech-lead.md` canonical, `workflow.md` pointer) — pointer section still has title and content rather than being pure cross-reference | Defer | `workflow.md` already says "intentionally avoids repeating the full checklist to prevent policy drift." The redundancy is acknowledged and bounded. Risk of policy drift is low given the deference language. |

---

## Decision Needed

_Both decision items resolved by the Human User. Decisions recorded below for traceability._

- **DN1 — RESOLVED (Conditional)**: The `## Environment Variable Changes` section in `CR-template.md` (M8) is a **conditional section** — include only when the CR adds, removes, or redefines environment variables; delete if not applicable. Proposed wording in M8 below reflects this decision.

- **DN2 — RESOLVED (BA)**: Phase 1 completion tracking (H7) is **BA's responsibility**. BA creates the `Next Priority` entry in `project-log.md` when all Phase 1 findings files are complete. Proposed wording in H7 below is updated to reflect BA as the named owner.

---

## Proposed Change Details

Exact before/after wording for all Fix items, verified against source files read in this session.

---

### H1 — Verification command order (`frontend-refactor-checklist.md` / Step 5)

`frontend.md` (lint → tsc) is correct and consistent with `testing-strategy.md` pipeline order. `frontend-refactor-checklist.md` Step 5 is reversed and must be aligned.

```
BEFORE (frontend-refactor-checklist.md, lines 29–31):
## 5. Verification Commands (Mandatory Order)
1. `pnpm exec tsc --noEmit`
2. `pnpm lint`

AFTER:
## 5. Verification Commands (Mandatory Order)
Run in the order specified in `frontend.md` Verification & Reporting Protocol (canonical source for frontend command sequence):
1. `pnpm lint`
2. `pnpm exec tsc --noEmit`
```

No change to `frontend.md` — its order is already correct.

---

### H2 — Backend Scope Gate test-delegation exception (`backend.md` / Scope Gate)

```
BEFORE (backend.md, line 51):
- If verification appears to require new/updated tests, **STOP** and request Testing Agent delegation from Tech Lead.

AFTER:
- If verification appears to require new/updated tests, **STOP** and request Testing Agent delegation from Tech Lead — unless the active handoff already explicitly delegates test scope to Backend, in which case proceed within that delegation.
```

---

### H3 — Backend scoped vs. handoff full-suite precedence (`backend.md` / Execution Responsibilities)

```
BEFORE (backend.md, line 45):
  - Verification scope: run the scoped spec file (`pnpm test <spec-file>`) to confirm new tests pass before reporting. Full-suite verification is the Tech Lead's responsibility.

AFTER:
  - Verification scope: run the scoped spec file (`pnpm test <spec-file>`) to confirm new tests pass before reporting. Full-suite verification is the Tech Lead's responsibility. **Exception**: when the active handoff's DoD explicitly requires full-suite verification from Backend, run full suite and report both scoped and full-suite results — the handoff DoD takes precedence over this default.
```

---

### H4 — Runtime preflight hook in role verification sections

**`frontend.md`** — add to start of Verification & Reporting Protocol:

```
BEFORE (frontend.md, Verification & Reporting Protocol, line 210):
- Run verification commands in this exact order:
  1. `pnpm lint`
  2. `pnpm exec tsc --noEmit`

AFTER:
- Run runtime preflight: `node -v`. If below Node ≥ 20.x (per `tooling-standard.md`), classify as `environmental` in the report before running any verification commands.
- Run verification commands in this exact order:
  1. `pnpm lint`
  2. `pnpm exec tsc --noEmit`
```

**`backend.md`** — add checklist item at end of Checklist section:

```
ADD (backend.md, after line 60):
-   [ ] Did I run `node -v` before verification commands and confirm runtime is Node ≥ 20.x per `tooling-standard.md`? If not, classify as `environmental` before proceeding.
```

---

### H5 — Tech Lead Recommendations section (`TEMPLATE-tech-lead-to-ba.md` + `ba.md`)

**`TEMPLATE-tech-lead-to-ba.md`** — add section between Technical Retrospective and Deployment Notes:

```
BEFORE (TEMPLATE-tech-lead-to-ba.md, lines 34–39):
## Technical Retrospective
- [Trade-offs]
- [Follow-up recommendations]

## Deployment Notes
- [Dependencies/config/runtime impact]

AFTER:
## Technical Retrospective
- [Trade-offs]
- [Follow-up recommendations]

## Tech Lead Recommendations (Conditional)
<!-- Populate when adversarial review finds quality concerns not covered by any AC, or when adjacent UX/copy/naming observations fall outside current CR scope. For each: state the observation and recommend one of: create follow-up CR / defer to project-log Next Priority / resolve in keep-in-mind.md. BA reviews and decides at acceptance. Leave as `none` if no recommendations. -->
- [Recommendation or `none`]

## Deployment Notes
- [Dependencies/config/runtime impact]
```

**`ba.md`** — add to BA Closure Checklist (after the debug artifacts item):

```
ADD (ba.md, after the "No debug artifacts" checklist line):
- [ ] Review `## Tech Lead Recommendations` in `tech-lead-to-ba.md` (if populated): for each, decide — create follow-up CR / add to project-log `Next Priority` / reject with rationale.
```

---

### H6 — Implementation Decisions section (`agent-docs/plans/TEMPLATE.md`)

Add section after Configuration Specifications, before Critical Assumptions:

```
ADD to TEMPLATE.md (after the Configuration Specifications section):

## Implementation Decisions (Tech Lead Owned)
<!-- Document technical choices explicitly deferred from BA handoff scope to Tech Lead authority. For each: state the decision question, options considered, chosen approach, and rationale. If the BA handoff contained no deferred decisions, write "none." -->
- [Decision or `none`]
```

---

### H7 — Phase 1 completion tracking (`meta-improvement-protocol.md` / Phase 1)

Add after the Per-Agent Findings File Format block, before the Phase 2 section:

```
ADD to meta-improvement-protocol.md (end of Phase 1 section):

**Phase 1 Completion Requirement**: When all agent findings files for a CR are complete,
**BA** MUST create a `Next Priority` entry in `agent-docs/project-log.md` referencing
the findings file paths. This is BA's project governance responsibility — the same
mechanism BA uses to ensure follow-through on all deferred work. Without this entry,
Phase 2 (Synthesis) has no guaranteed trigger in the standard project workflow.

Example `project-log.md` entry:
> **Meta-Synthesis Pending (CR-XXX)** — Phase 1 complete. Run Phase 2 synthesis.
> Findings: `agent-docs/meta/META-YYYYMMDD-CR-XXX-[role]-findings.md` (×N).
> Start a new session using the Phase 2 prompt from `meta-improvement-protocol.md`.
```

---

### M1 — Pre-Replacement Check minimum evidence (`workflow.md` / Freshness Rule)

```
BEFORE (workflow.md, line 62):
- **Pre-Replacement Check (Mandatory)**: Before replacing a conversation file for a new CR,
  confirm the prior CR's conversation content is captured in its plan, completion report,
  or CR artifact. Do not replace until this is verified.

AFTER:
- **Pre-Replacement Check (Mandatory)**: Before replacing a conversation file for a new CR,
  confirm the prior CR's conversation content is captured in its plan, completion report,
  or CR artifact. **Minimum evidence**: `plans/CR-XXX-plan.md` exists AND the outgoing
  conversation file or CR artifact shows `status: completed` (or equivalent closure signal)
  for the prior CR. Do not replace until this is verified.
```

---

### M2 — Intentional dead code persistence (`tech-lead.md` / Verification Checklist)

Add checklist item after the debug-artifact check:

```
ADD to tech-lead.md Verification Checklist (after "Artifact & ADR Update" item):
- [ ] **Intentional Dead Code**: If this CR preserves or creates an intentionally dead code
  path (e.g., a format-flexibility branch frozen by handoff constraint), add a code comment
  at the call site referencing the intent (`// Intentionally preserved: see CR-XXX plan`)
  and create a follow-up CR candidate for deferred removal decision. Do not rely solely on
  the handoff file to persist this constraint.
```

---

### M3 — Undisclosed sub-agent deviations check (`tech-lead.md` / Adversarial Diff Review)

```
ADD to tech-lead.md Adversarial Diff Review check bullets (after the debug-artifacts check):
    - **Check**: Compare sub-agent's `[Changes Made]` and `[Deviations]` sections against
      actual file changes line-by-line. Any undisclosed change (present in files, absent
      in report) must be classified as an unreported deviation and handled per the Finding
      classification rule below.
```

---

### M4 — Test name staleness (`tech-lead.md` / Adversarial Diff Review)

```
ADD to tech-lead.md Adversarial Diff Review check bullets (after M3 addition above):
    - **Check**: For tests where assertions were updated due to a format or contract change,
      verify the test name still accurately describes the behavior being tested. A test name
      referencing the pre-migration format is a test-hygiene defect.
```

---

### M5 — ADR boundary for format migrations (`tech-lead.md` / Architecture & ADRs)

```
BEFORE (tech-lead.md, lines 280–281):
**Decision test**: Create an ADR when the change introduces a new top-level concept
(provider type, auth mechanism, rendering boundary, observability contract). Do NOT create
an ADR when the change extends an existing documented pattern (new value in an existing
config enum, new route following an existing handler structure).

AFTER:
**Decision test**: Create an ADR when the change introduces a new top-level concept
(provider type, auth mechanism, rendering boundary, observability contract). Do NOT create
an ADR when the change extends an existing documented pattern (new value in an existing
config enum, new route following an existing handler structure, or a format migration within
an existing provider type where the provider-type token itself is unchanged).
```

---

### M6 — Post-Verification Drift Check mechanism (`workflow.md` / Verification Phase step 6)

```
BEFORE (workflow.md, step 6):
6. **Post-Verification Drift Check (Mandatory):** Before issuing the BA handoff, confirm
   that feature files verified in steps 1–5 have not been modified after verification was
   recorded — whether by an agent or by the Human User directly. If drift is detected, a
   re-verification pass is required. Note the drift in the BA handoff with the original
   and current file state.

AFTER:
6. **Post-Verification Drift Check (Mandatory):** Before issuing the BA handoff, confirm
   that feature files verified in steps 1–5 have not been modified after verification was
   recorded — whether by an agent or by the Human User directly. **Mechanism**: In
   synchronous single-session execution where verification and handoff issuance occur
   consecutively, this check is trivially satisfied — no drift is possible between
   sequential tool calls. In multi-session or async scenarios, re-read feature files or
   compare modification timestamps to confirm no intervening edits. If drift is detected,
   a re-verification pass is required. Note the drift in the BA handoff with the original
   and current file state.
```

---

### M7 — CSS class side-effects in deviation reporting (`TEMPLATE-frontend-to-tech-lead.md`)

```
BEFORE (TEMPLATE-frontend-to-tech-lead.md, [Deviations] section):
## [Deviations]
- `none` OR list deviations with rationale.

AFTER:
## [Deviations]
- `none` OR list deviations with rationale.
- **Note**: CSS class changes that accompany text content updates (e.g., removing
  placeholder/muted styling when replacing TBD cells with real data) must be reported
  here even when the handoff specifies "text content only." Content semantic changes
  that necessitate style changes are in-scope deviations, not violations.
```

---

### M8 — Environment Variable Changes section (`requirements/CR-template.md`)

Add after the Dependencies section, before Notes:

```
ADD to CR-template.md (between Dependencies and Notes):

## Environment Variable Changes
<!-- Required only when this CR adds, removes, or redefines environment variables. Delete section if not applicable. -->
- `VAR_NAME` — add / remove / rename: [purpose and expected value or reference]
```

---

### M9 — Out-of-Scope But Must Be Flagged rationale (`backend.md` / Scope Gate)

Add a paragraph before or within the Scope Gate section:

```
ADD to backend.md (at the start of the Scope Gate section, before the first bullet):

**Handoff structure note**: The Tech Lead handoff may include an `## Out-of-Scope But
Must Be Flagged (Mandatory)` section. Each item in that section is a pre-agreed
stop-and-report condition — an adjacent risk or edge case that Tech Lead identified
before delegation. Encountering any listed condition during implementation means STOP
and report to Tech Lead before proceeding, not resolve unilaterally. Read this section
before starting any implementation work.
```

---

### M10 — Baseline Failure Snapshot N/A mechanism (`requirements/CR-template.md`)

```
BEFORE (CR-template.md, Baseline Failure Snapshot section header):
## Baseline Failure Snapshot (Required for Regression/Incident CRs)
- **Date**: [YYYY-MM-DD]
- **Command(s)**: [Exact command(s) used]
- **Execution Mode**: [sandboxed | local-equivalent/unsandboxed]
- **Observed Result**: [Failing specs/errors with concise facts]

AFTER:
## Baseline Failure Snapshot (Required for Regression/Incident CRs)
<!-- If the failure is an external service constraint (e.g., API tier limitation, provider
quota) not reproducible by any local command, write: "N/A — external service failure;
baseline not reproducible locally. See Background context in Notes." -->
- **Date**: [YYYY-MM-DD]
- **Command(s)**: [Exact command(s) used]
- **Execution Mode**: [sandboxed | local-equivalent/unsandboxed]
- **Observed Result**: [Failing specs/errors with concise facts]
```

---

### M11 — BA external API root cause evidence standard (`ba.md` / BA Decision Matrix)

```
BEFORE (ba.md, BA Decision Matrix, incident row):
| Incident/regression (`test/lint/build/runtime mismatch`) | Load `testing-strategy.md`
  and collect at least one command baseline (`exact command + result`) |

AFTER:
| Incident/regression (`test/lint/build/runtime mismatch`) | Load `testing-strategy.md`
  and collect at least one command baseline (`exact command + result`). **For external API
  failures** where no local command can reproduce the failure: collect code-reading evidence
  and qualify the root cause claim as "suspected cause — requires Tech Lead live API probe
  to confirm." Do not block CR finalization on an unverifiable external failure. |
```

---

### M12 — Wait State and permitted direct changes (`workflow.md` / Delegation Invariant)

```
BEFORE (workflow.md, The Delegation Invariant, Wait State):
- **The "Wait" State**:
  - **Parallel Mode**: Once the full planned handoff batch is created, the Tech Lead Agent
    MUST stop and report back to the User.
  - **Sequential Mode**: Once the current step handoff is created, the Tech Lead Agent
    MUST stop and report back to the User.

AFTER:
- **The "Wait" State**:
  - **Parallel Mode**: Once all permitted direct changes (e.g., `.env.example`, config
    files) and the full planned handoff batch are complete in the same execution turn, the
    Tech Lead Agent MUST stop and report back to the User. Permitted direct changes do not
    require a separate Wait State — they may be completed in the same turn as handoff
    issuance.
  - **Sequential Mode**: Once permitted direct changes and the current step handoff are
    complete in the same execution turn, the Tech Lead Agent MUST stop and report back to
    the User.
```

---

### L1 — Reading Confirmation Template (re-raise CR-013 H8)

`tech-lead.md` (lines 169–173) and `ba.md` (lines 99–104) still use the full-listing format proposed for replacement by CR-013 synthesis H8. No new proposal is needed — apply CR-013 H8 wording verbatim to both files. _(Implementer: read CR-013 synthesis `Proposed Change Details → H8` for exact before/after.)_

---

### L2 — BA Execution Mode "primary artifact" clarification (`ba.md` / BA Execution Mode Rubric)

```
BEFORE (ba.md, BA Execution Mode Rubric, Fast row):
| Fast | Single user-visible objective; one primary artifact touched; no cross-role dependency;
  no incident triage required |

AFTER:
| Fast | Single user-visible objective; one primary artifact touched (primary = the most
  significant functional change; secondary documentation/config file touches do not
  change the mode classification); no cross-role dependency; no incident triage required |
```

---

### L3 — Learner Transformation AC format (`ba.md` / Quality Checklist)

```
BEFORE (ba.md, Quality Checklist):
- [ ] **Is the "Learner Transformation" clear?** (Who does the user become after this?)

AFTER:
- [ ] **Is the "Learner Transformation" clear?** (Who does the user become after this?)
  For educational content CRs, translate this into at least one measurable AC (e.g.,
  "table enables learner to compare X, Y, Z dimensions across models"). A checklist item
  with no measurable AC is an incomplete check.
```

---

### L4 — User-BA root cause correction loop (`ba.md` / Clarification & Disagreement Protocol)

```
BEFORE (ba.md, Clarification & Disagreement Protocol):
- If Tech Lead challenges feasibility assumptions, BA must respond with one of:
  - `scope clarified`
  - `scope changed`
  - `requires user decision`

AFTER:
- If Tech Lead challenges feasibility assumptions, BA must respond with one of:
  - `scope clarified`
  - `scope changed`
  - `requires user decision`
- If the User corrects the BA's root cause analysis or requirement framing: acknowledge the
  correction explicitly, document what changed and why the prior claim was incorrect, and
  continue with the corrected understanding. Do not treat user correction as requiring a
  formal scope-change designation — it is an analysis update, not a scope change.
```
