# Meta Synthesis: CR-013

**Date:** 2026-02-19
**Findings sources:**
- `agent-docs/meta/META-20260219-CR-013-backend-findings.md`
- `agent-docs/meta/META-20260219-CR-013-tech-lead-findings.md`
- `agent-docs/meta/META-20260219-CR-013-ba-findings.md`

**Synthesis agent:** Tech Lead (meta-improvement mode)

---

## Summary

CR-013 meta-analysis surfaced **39 distinct findings** across three agents (after deduplication from ~60 raw items). The dominant failure pattern is **single-source-of-truth violations**: the same rule written in multiple docs with no declared canonical source, guaranteeing drift. A second cluster is **checklist coverage gaps** — no phase (Backend execution, TL verification, BA acceptance) has an explicit check for debug artifacts or post-verification file changes, and a live production code issue (BA-O1) slipped through all three because of exactly this gap. The third cluster is **wording precision failures**: "READ-ONLY", "first action", and "pause and wait" are technically wrong or ambiguous in ways that create hesitation or block agents. No findings indicate architectural instability; all fixes are doc changes only.

---

## High Priority

| # | Finding (Consolidated) | Source(s) | Affected Doc + Section | Decision | Change Summary |
|---|---|---|---|---|---|
| H1 | "READ-ONLY by default" phrasing creates hesitation even when delegation is explicit | B-C1, BA validates | `backend.md` / Boundaries | Fix | Replace "READ-ONLY by default" with "Out-of-scope by default"; inline the delegation exception. |
| H2 | Dangling `/agent-docs/api/` reference — directory does not exist | B-M1, TL validates | `backend.md` / Boundaries + Checklist | Fix | Replace phantom path with "contracts specified in the Tech Lead handoff." |
| H3 | "First action" in Mandatory Reading Check is technically violated by the Read tool itself | B-U3, BA validates | `AGENTS.md` / After Reading | Fix | Change "first action" → "first output message." |
| H4 | Debug artifact hygiene missing from all three phases (Backend, TL, BA) | B-M3, TL-M2, BA-M5, BA-O1 | `backend.md` / Checklist; `tech-lead.md` / Verification Checklist | Fix | Add explicit debug-artifact check items to Backend Checklist and TL Adversarial Diff Review. BA path handled by BA-M5 note (no block, flag and notify). |
| H5 | Approval Gate exception wording diverges across `tech-lead.md` and `workflow.md` | TL-C1 | `tech-lead.md` / The Approval Gate | Fix | Remove exception wording from `tech-lead.md`; cross-reference `workflow.md` step 5 as canonical. |
| H6 | No decision rule for adversarial-review findings that fail non-AC criteria | TL-M1, TL-S1, BA-M1 | `tech-lead.md` / Verification Checklist | Fix | Add finding classification rule after Adversarial Diff Review. |
| H7 | No protocol for post-verification user-made modifications (live gap; caused BA-O1) | TL-M3, TL-S2, BA validates | `workflow.md` / Verification Phase | Fix | Add "Post-Verification Drift Check" step before BA handoff is issued. |
| H8 | Mandatory Reading Confirmation output is identical every session — ceremony with no signal | B-W2, TL-W1, BA-W2 | `AGENTS.md` / After Reading — Mandatory Output Check | Fix | Replace full-list requirement with exception-based attestation model. |

---

## Medium Priority

| # | Finding (Consolidated) | Source(s) | Affected Doc + Section | Decision | Change Summary |
|---|---|---|---|---|---|
| M1 | AGENTS.md "Execute → Follow Workflow" bullet is circular — Workflow is already a required read | B-R3, TL validates, BA validates | `AGENTS.md` / After Reading — Execute | Fix | Remove the "Execute → Follow Workflow" bullet entirely. |
| M2 | Quality gate command list duplicated in `tech-lead.md` and `testing-strategy.md` | TL-R1 | `tech-lead.md` / Verification Checklist | Fix | Remove inline command list from `tech-lead.md`; keep the cross-reference to `testing-strategy.md` only. |
| M3 | Backend vs. TL verification scope distinction undocumented (sub-agent = scoped; TL = full suite) | B-M5, TL-M4, TL-P2 | `tech-lead.md` / Verification Checklist | Fix | Add one-sentence scope declaration as a note above the Verification Checklist. |
| M4 | AC evidence annotation guidance exists in 3 locations with no declared canonical source | BA-R1, BA-C2 | `workflow.md` / Acceptance Phase step 2 (canonical); `ba.md` (to be updated) | Fix | Declare `workflow.md` Acceptance Phase step 2 canonical. Implementer: read `ba.md` and replace duplicate items with cross-reference. |
| M5 | Preflight "pause and wait" is designed for async execution; ambiguous in synchronous sessions | B-U1, BA validates | `workflow.md` / Implementation Phase, Preflight Clarification | Fix | Add synchronous-session clarification parenthetical. |
| M6 | Testing sequence mandate ("MANDATORY: Specify TDD or Impl-First") has no exception for Backend-delegated tests (where TDD is structurally unavailable) | B-S1, TL-U3 | `tech-lead.md` / Technical Planning & Delegation | Fix | Add exception note: "When tests are delegated to Backend in the same handoff, TDD is unavailable; use Implementation-First and state this in the plan." |
| M7 | `keep-in-mind.md` lifecycle "Fix → Move → Delete" ownership is unassigned; file grows indefinitely | TL-O4, BA-O3 | `keep-in-mind.md`; `tech-lead.md` / Verification Checklist; `ba.md` / Closure Checklist | Fix | Split ownership by category: TL promotes technical/security warnings (Verification Phase); BA promotes content/product warnings (Acceptance Phase). Add checklist items to both. |
| M8 | Conversation Freshness Rule mandates replacing file contents without first confirming prior CR content is archived | TL-O2 | `workflow.md` / Conversation File Freshness Rule | Fix | Add mandatory pre-replacement archive check. |
| M9 | Execution Mode (Fast/Standard/Heavy) is assessed by BA but disappears from all artifacts | BA-M2 | `requirements/CR-template.md` / Business Context | Fix | Add `**Execution Mode:**` field to CR template. |
| M10 | No "Done (user validation pending)" status option; CRs silently conflate technical closure with product validation | BA-M3 | `requirements/CR-template.md` / Status | Fix | Add `Done (user validation pending)` to the status option list. |
| M11 | backend.md Boundaries prose and Ownership Quick Matrix duplicate file-to-role mappings | B-R1, BA validates pattern | `backend.md` / Boundaries | Fix | Reduce prose to items not represented in the matrix; matrix is the authoritative scannable reference. |
| M12 | backend.md Execution Responsibilities is filler — restates what `workflow.md` mandates for all agents | B-R2, BA validates | `backend.md` / Execution Responsibilities | Fix | Replace with Backend-specific engineering constraints: no new npm packages without TL approval; run scoped spec before reporting. |
| M13 | meta-improvement-protocol.md Phase 1 has no entry-point check for BA: BA can run without prior findings files existing | BA-O2 | `meta-improvement-protocol.md` / Phase 1 | Fix | Add BA entry-point check: confirm Backend and TL findings files exist before BA writes findings. |
| M14 | `agent-docs/meta/` directory existence is undocumented; first agent must create it blindly | TL-O3 | `meta-improvement-protocol.md` / Phase 1 Output | Fix | Add "create `agent-docs/meta/` directory if absent" note next to Phase 1 output path. |
| M15 | Runtime mismatch is classified but recovery path is undocumented (both CR-013 agents independently used nvm with no guidance) | B-M2 | `tooling-standard.md` / Runtime Preflight | Fix | Add documented recovery path (nvm switch + re-run preflight). Implementer: read `tooling-standard.md` for exact section. |
| M16 | CR Technical Analysis section (filled by Tech Lead) has no enforcement; closed CR-013 with it blank | BA-M4 | `requirements/CR-template.md` / Technical Analysis | Fix | Add "(Optional — fill if available; required for M/L/H complexity CRs)" label to make expectations explicit. |

---

## Low Priority

| # | Finding Summary | Source(s) | Decision | Rationale |
|---|---|---|---|---|
| L1 | Plan template Architecture-Only Freeze Checklist appears in every CR body, including non-arch CRs | TL-R3 | Fix | Add "Delete this section if not an Architecture-Only CR" note at section top in `TEMPLATE.md`. |
| L2 | Contract Delta Assessment in plan template always empty for Backend-only CRs | TL-W2 | Fix | Add conditional note at section top: "If backend-only scope, replace this section with 'No contract changes — backend-only scope.'" |
| L3 | `workflow.md` Technical Planning Phase step 3 (Execution Audit) does not cross-reference the Freshness Rule it implements | TL-U1 | Fix | Append "(See Conversation File Freshness Rule below.)" to step 3 text. |
| L4 | Configuration Specifications section in plan template has no stated purpose | TL-M5 | Fix | Add one-line purpose comment: "Record TL decisions that sub-agents would otherwise have to guess (constant values, valid option sets, default behaviors for failure paths)." |
| L5 | ADR trigger criteria are too broad; a cautious TL would create an ADR for every non-trivial backend change | TL-S3 | Fix | Add a sharper decision test to `tech-lead.md` Architecture & ADRs: "New top-level concept (provider type, auth mechanism, rendering boundary) → ADR required. Extension of an existing documented pattern (new value in existing enum, new route following existing structure) → ADR not required." |
| L6 | `TEMPLATE-backend-to-tech-lead.md` has Preflight Status before Overall Status; reviewers want overall state first | B-O1 | Fix | Reorder template: move `[Status]` (overall) before `[Preflight Status]`. |
| L7 | No documented path for Backend discovering a needed env var during implementation | B-S2 / TL-C3 (partial) | Fix | Add to `backend.md` Scope Gate: "If implementation reveals a new env var is required, record it in the preflight note (`env var discovery: VAR_NAME — purpose: ...`) and await Tech Lead resolution before modifying `.env.example`." |
| L8 | `decisions/` required reading will not scale past ~5 ADRs | TL-O1 | Defer | Low urgency while ADR count is 1. Revisit at count ≥ 5 with a triage rule. |
| L9 | BA Quality Checklist (pre-handoff) and BA Closure Checklist (post-acceptance) have overlapping items without declared phase scope | BA-W1 | Defer | Requires reading `ba.md` in detail; minor friction, no agent blocks on this. Schedule for dedicated BA doc cleanup CR. |

---

## Deferred / Rejected

| # | Finding Summary | Decision | Rationale |
|---|---|---|---|
| D1 | Preflight ceremony when all assumptions are pre-confirmed (B-W1) | Defer | Partially refuted by TL: CR-013 preflight produced a formal risk record that was referenced during verification, even though no new information was surfaced. Lighter-weight form (one-liner confirming assumption acceptance) is acceptable as a future doc-only CR if friction recurs. |
| D2 | BA scope concentration: content ownership will degrade as stages 4–10 are designed (BA-S1) | Defer | Future concern; no current CR is blocked. Revisit when stage 5+ design begins. |
| D3 | Pre-CR Tech Lead feasibility consultation not operationalized in workflow (BA-U2) | Defer | Significant workflow phase addition; requires User decision on process architecture. Not a current blocker. |
| D4 | Product Shaping not operationalized in workflow steps (BA-U1) | Defer | Same as D3; structural change to Requirement Analysis Phase. Pair with D3 in a dedicated workflow CR. |
| D5 | Handoff type-extension instructions should specify all-path field values, not just happy path (B-C2, B-M4) | Defer | Handoff templates do not yet have a standardized type-extension section. Requires template design work before a doc fix is meaningful. |
| D6 | `project-principles.md` reading irrelevant to Backend agents (B-P1) | Defer | Scoping required reads by role affects all role docs and AGENTS.md Layer 1. Requires User decision on the scoping model. |
| D7 | BA Tenet 1 "MUST ask" vs. conditional exception is structurally unstable (BA-C1) | Defer | Tenet wording is authority-sensitive; restructuring requires BA role doc review and User approval. Schedule as part of BA doc cleanup CR. |
| D8 | BA-U2 output format for BA handoff validation is unspecified (TL-U2) | Defer | Synchronous sessions work without a formal output requirement. Revisit if multi-session async workflow is adopted. |
| D9 | Investigation report has no defined consumer or downstream flow (BA-U3) | Defer | Low frequency; no CR has required an investigation report yet. Document when the pattern first occurs. |

---

## Decision Needed

_All three decision items were resolved by the Human User after synthesis was drafted. Decisions recorded below for traceability._

1. **DN1 — RESOLVED:** `console.log(upstreamResponse)` at `route.ts:357` was removed directly by the Human User. No follow-up CR required for this instance. H4 and H7 doc fixes address the systemic gap.

2. **DN2 — APPROVED (full ownership transfer):** Backend may apply `.env.example` changes as standard practice when introducing new env vars — no explicit delegation required. The L7 fix is updated below to reflect this decision (Backend owns the edit; reports in preflight). `backend.md` Ownership Quick Matrix and `tech-lead.md` Permitted Direct Changes table must both be updated.

3. **DN3 — RESOLVED:** `ba.md` was read in this session. Exact before/after wording for M4, M7-BA, and H4-BA is provided in the detail section below.

---

## Proposed Change Details

Exact before/after wording for all Fix items, verified against source files read in this session. Items marked with _(implementer: verify)_ require reading an additional file before applying.

---

### H1 — READ-ONLY phrasing (`backend.md` / Boundaries)

```
BEFORE (line 12):
- **READ-ONLY by default**: `/__tests__/**`, `/playwright.config.ts`, `/agent-docs/testing-strategy.md`.

AFTER:
- **Out-of-scope by default** (test files): `/__tests__/**`, `/playwright.config.ts`,
  `/agent-docs/testing-strategy.md`. Read is permitted; create or modify only when the
  handoff explicitly delegates test scope to Backend.
```

Also remove the now-redundant Restricted bullet (current line 16): `- Do not create or modify tests unless the handoff explicitly delegates test scope to Backend.` — this is now covered inline above.

---

### H2 — Dangling `/agent-docs/api/` reference (`backend.md`)

```
BEFORE (line 13):
- **Interfaces with**: Frontend via `/api/**` contracts documented in `/agent-docs/api/`.

AFTER:
- **Interfaces with**: Frontend via `/api/**` contracts. API contracts are specified in the
  Tech Lead handoff and CR plan for each CR.
```

```
BEFORE (Checklist, line 60):
- [ ] Is the API compliant with `/agent-docs/api/` contracts?

AFTER:
- [ ] Is the API compliant with the contracts specified in the Tech Lead handoff?
```

---

### H3 — "First action" ambiguity (`AGENTS.md` / After Reading)

```
BEFORE (line 86):
**Mandatory Reading Check**: Before you take your first action in this session, you MUST list
the files you have read from the "Required Reading" section. If you proceed without naming
these files, you are in violation of protocol.

AFTER:
**Mandatory Reading Check**: Your first output message in this session MUST attest that
required context has been loaded. If you proceed without this output, you are in violation
of protocol.
```

---

### H4 — Debug artifact hygiene (`backend.md` + `tech-lead.md`)

**backend.md** — add to Checklist (after line 61):
```
- [ ] Are there no debug artifacts (console.log, console.error, commented-out code blocks)
  in production code paths?
```

**tech-lead.md** — update Adversarial Diff Review bullet:
```
BEFORE:
    - **Check**: Look for edge cases (e.g. strictness bugs, off-by-one errors) that tests
      might miss.

AFTER:
    - **Check**: Look for edge cases (e.g. strictness bugs, off-by-one errors) that tests
      might miss.
    - **Check**: Look for debug artifacts (console.log, console.error, commented-out code
      blocks, TODO markers) in production code paths.
```

**ba.md — BA Closure Checklist** — add after line 175 (`Human-facing closure note sent`):
```
- [ ] No debug artifacts spotted in verified production code paths. If found after TL
  verification: flag in CR Notes, notify user directly. Does not block closure.
```

---

### H5 — Approval Gate exception divergence (`tech-lead.md`)

`workflow.md` step 5 is already the more precise version ("pure discovery sessions with no execution/delegation handoff") and requires no change. Only `tech-lead.md` needs updating:

```
BEFORE (tech-lead.md, line 243):
**Skip this step only if the task is strictly `[S][DOC]` (Documentation-only) or simple
discovery.**

AFTER:
**Skip condition:** See `workflow.md` Technical Planning Phase step 5 for the precise
exception criteria (canonical source — do not duplicate here).
```

---

### H6 — Non-AC adversarial finding rule (`tech-lead.md` / Verification Checklist)

Add after the Adversarial Diff Review check bullets:

```
    - **Finding classification rule**: If a finding fails an explicit AC → block closure
      and re-delegate to the responsible sub-agent. If a finding is a quality concern not
      covered by any AC → document as "Tech Lead Recommendation" in the BA handoff and
      create a follow-up CR candidate. Do NOT fold non-AC improvements into the current CR
      scope without explicit scope extension approval.
```

---

### H7 — Post-verification drift (`workflow.md` / Verification Phase)

Add as new step 6 (renumber current step 6 "Output" to step 7):

```
6. **Post-Verification Drift Check (Mandatory):** Before issuing the BA handoff, confirm
   that feature files verified in steps 1–5 have not been modified after verification was
   recorded — whether by an agent or by the Human User directly. If drift is detected,
   a re-verification pass is required. Note the drift in the BA handoff with the original
   and current file state.
```

---

### H8 — Mandatory Reading Check (`AGENTS.md` / After Reading)

```
BEFORE (lines 86–91):
> [!CAUTION]
> **Mandatory Reading Check**: Before you take your first action in this session, you MUST
> list the files you have read from the "Required Reading" section. If you proceed without
> naming these files, you are in violation of protocol.

- **Mandatory Output Check**: You MUST publish an explicit early-session message listing
  the files you have read.
   - This requirement is tooling-agnostic. Use whatever communication primitive is
     available in your runtime.
   - *Example*: "I have read `AGENTS.md`, `general-principles.md`, ..."
   - **Failure to do this implies you have not loaded context.**

AFTER:
> [!CAUTION]
> **Mandatory Reading Check**: Your first output message in this session MUST attest that
> required context has been loaded. If you proceed without this output, you are in
> violation of protocol.

- **Mandatory Output Check**: Publish an explicit early-session message confirming context
  is loaded.
  - **Standard form** (all required readings loaded per your role file, no skips):
    _"Context loaded per `<role>.md` required readings. Conditional reads: [none | list].
    No skips."_
  - **Full listing form** (required if any file was intentionally skipped): List each file
    individually and include a one-line rationale for each skip.
  - This requirement is tooling-agnostic. Use whatever communication primitive is
    available in your runtime.
  - **Failure to do this implies you have not loaded context.**
```

---

### M1 — Circular "Execute" bullet (`AGENTS.md` / After Reading)

```
BEFORE (lines 99–100):
- **Execute**
   - Follow [Workflow](/agent-docs/workflow.md)

AFTER:
[Remove this bullet entirely. "Follow Workflow" is already enforced by Layer 1 Universal
Standards required reading. Workflow is listed at line 36.]
```

---

### M2 — Quality gate commands in `tech-lead.md`

```
BEFORE (Verification Checklist):
- [ ] Run quality gates in sequence (per `testing-strategy.md`):
  1. `pnpm test`
  2. `pnpm lint`
  3. `pnpm exec tsc --noEmit`
  4. `pnpm build`

AFTER:
- [ ] Run quality gates in sequence per the Tech Lead Verification Matrix in
  `testing-strategy.md`. (Canonical command list and conditionality rules live there;
  not duplicated here.)
```

---

### M3 — Verification scope declaration (`tech-lead.md` / Verification Checklist)

Add as a note block above the checklist items:

```
> **Verification scope**: Sub-agent verification is scoped to affected files (proves new
> work passes locally). Tech Lead verification runs the full suite (proves integration with
> the rest of the system is intact). Running both is intentional — they serve different
> purposes.
```

---

### M4 — AC guidance canonical source (`ba.md`)

`workflow.md` Acceptance Phase step 2 is already the canonical and correct wording. No change to `workflow.md`.

**ba.md — Required Outputs, Acceptance Verification & Closure (line 139):**
```
BEFORE:
   - **AC Evidence Annotation**: When verifying each AC, mark it `[x]` in the CR document
     with a one-line evidence reference (e.g., `[x] Gradient glows — Verified: page.tsx
     L62-68`). This creates an audit trail of what was checked.

AFTER:
   - **AC Evidence Annotation**: Per `workflow.md` Acceptance Phase step 2 (canonical
     source for format and evidence requirements).
```

**ba.md — BA Closure Checklist (line 171):**
```
BEFORE:
- [ ] Every AC marked with `[x]` + one-line evidence reference

AFTER:
- [ ] Every AC marked with `[x]` + one-line evidence reference (per `workflow.md`
  Acceptance Phase step 2)
```

_(The Closure Checklist item can retain the brief reminder but must attribute the canonical source to avoid drift.)_

---

### M5 — Preflight pause in synchronous sessions (`workflow.md`)

```
BEFORE (Implementation Phase, Preflight Clarification step 3, last sentence):
If open questions are non-empty and materially affect validity/scope, pause and wait for
Tech Lead clarification.

AFTER:
If open questions are non-empty and materially affect validity/scope, pause and wait for
Tech Lead clarification. *(In synchronous sessions: flag the question in your preflight
output and await a response in the same session turn before continuing implementation.)*
```

---

### M6 — Testing sequence exception (`tech-lead.md` / Technical Planning & Delegation)

```
BEFORE (Determine Delegation bullet):
      - Deciding between Test-Driven Development (TDD) or Implementation-First is a
        Tech Lead technical decision.

AFTER:
      - Deciding between Test-Driven Development (TDD) or Implementation-First is a
        Tech Lead technical decision.
      - **Exception**: When tests are explicitly delegated to Backend (not Testing Agent)
        in the same handoff, TDD is structurally unavailable. Use Implementation-First
        and state this explicitly in the plan.
```

---

### M7 — `keep-in-mind.md` lifecycle ownership

**keep-in-mind.md** — Add at top (or lifecycle note):
```
**Promotion ownership:** Tech Lead promotes technical/security warnings during Verification
Phase. BA promotes content/product warnings during Acceptance Phase. Both roles should
review entries at each CR and retire any whose root causes are resolved.
```

**tech-lead.md** Verification Checklist — add:
```
- [ ] Review `keep-in-mind.md`: promote or retire any technical/security entries whose
  root causes are resolved by this CR.
```

**ba.md — BA Closure Checklist** — add after line 175 (alongside H4-BA item above):
```
- [ ] Review `keep-in-mind.md`: promote or retire any content/product entries whose root
  causes are resolved by this CR.
```

---

### M8 — Freshness Rule archive check (`workflow.md`)

```
BEFORE (Conversation File Freshness Rule, after the last bullet):
- Historical traceability belongs in CR artifacts (`requirements/`, `plans/`, `reports/`,
  `project-log.md`), not in accumulated conversation transcripts.

AFTER (add immediately after):
- **Pre-Replacement Check (Mandatory)**: Before replacing a conversation file for a new
  CR, confirm the prior CR's conversation content is captured in its plan, completion
  report, or CR artifact. Do not replace until this is verified.
```

---

### M9 — Execution Mode field in CR template

```
BEFORE (Business Context section, lines 7–8):
## Business Context
**User Need:**
**Expected Value:**

AFTER:
## Business Context
**User Need:**
**Expected Value:**
**Execution Mode:** [Standard | Fast | Heavy]
```

---

### M10 — Deferred user validation status in CR template

```
BEFORE (line 4):
[Draft | Clarified | In Progress | Done | Blocked]

AFTER:
[Draft | Clarified | In Progress | Done | Done (user validation pending) | Blocked]
```

---

### M11 — backend.md prose + matrix duplication

After H1 (READ-ONLY → Out-of-scope) and H2 (Interfaces with) are applied, the Boundaries prose section will be left with items that exactly duplicate the Ownership Quick Matrix rows. Remove or consolidate them:
- Keep in prose: **Security scope (endpoint-level)** — not in the matrix.
- Keep in prose: the **Restricted** block (secrets + delegation exception).
- Remove from prose: all `Owns`, `Not owned`, `Conditional Ownership` bullets — these map 1-to-1 to matrix rows. Let the matrix be the single reference.

---

### M12 — Execution Responsibilities filler (`backend.md`)

```
BEFORE (lines 44–47):
## Execution Responsibilities

- Follow the instructions provided by the Tech Lead agent in the [Tech Lead To Backend
  Instructions](/agent-docs/conversations/tech-lead-to-backend.md)
- Make a report for the Tech Lead agent in the [Backend To Tech Lead Report](...)
  using [Backend Report Template](...)

AFTER:
## Execution Responsibilities

- Read the handoff at [Tech Lead To Backend](/agent-docs/conversations/tech-lead-to-backend.md)
  and implement per its scope.
- Write the completion report at [Backend To Tech Lead](/agent-docs/conversations/backend-to-tech-lead.md)
  using the [report template](/agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md).
- **Engineering constraints (Backend-specific)**:
  - Do not install new npm packages. If a new dependency is required, flag it in the
    preflight note and request Tech Lead approval.
  - Verification scope: run the scoped spec file (`pnpm test <spec-file>`) to confirm new
    tests pass before reporting. Full-suite verification is the Tech Lead's responsibility.
```

---

### M13 — meta-improvement-protocol.md BA entry-point check

Add before Phase 1 "Output per agent":

```
**BA entry-point check**: Before beginning BA findings, verify that Backend (or other
downstream sub-agent) and Tech Lead findings files exist for this CR in `agent-docs/meta/`.
If they do not exist, pause and request the missing agent meta sessions before proceeding.
BA findings without carry-forward context are incomplete per protocol.
```

---

### M14 — meta/ directory creation note

```
BEFORE (Phase 1, Output per agent):
`agent-docs/meta/META-YYYYMMDD-<CR-ID>-<role>-findings.md`

AFTER:
`agent-docs/meta/META-YYYYMMDD-<CR-ID>-<role>-findings.md`
> Note: Create the `agent-docs/meta/` directory if it does not yet exist before writing
> findings files.
```

---

### M15 — Runtime mismatch recovery path _(implementer: read `tooling-standard.md`)_

Add to the Runtime Preflight section, after "classify as an environmental mismatch":

```
**Recovery path**: Use `nvm use <documented-version>` (or equivalent version manager
command) to activate the documented runtime version. Re-run the preflight check after
switching. If the version manager is unavailable, report as a blocker via the feedback
protocol — do not proceed with a mismatched runtime.
```

---

### M16 — CR Technical Analysis section enforcement

```
BEFORE (CR-template.md, line 55):
## Technical Analysis (filled by Tech Lead)

AFTER:
## Technical Analysis (filled by Tech Lead — required for M/L/H complexity; optional for [S])
```

---

### L1–L7 details (brief)

**L1** (`TEMPLATE.md` / Architecture-Only Freeze Checklist): Add `> [!NOTE] Delete this section if this is not an Architecture-Only CR.` at section top.

**L2** (`TEMPLATE.md` / Contract Delta Assessment): Add `> [!NOTE] If backend-only scope (no route, data-testid, or accessibility contract changes), replace this section with: "No contract changes — backend-only scope."` at section top.

**L3** (`workflow.md` / Technical Planning Phase step 3): Append `(See Conversation File Freshness Rule below.)` to end of step 3 text.

**L4** (`TEMPLATE.md` / Configuration Specifications section header): Add comment: `<!-- Purpose: Record TL decisions that sub-agents would otherwise have to guess (constant values, valid option sets, default behaviors for failure paths on type extensions, etc.). -->`.

**L5** (`tech-lead.md` / Architecture & ADRs): Add after the trigger list:
```
**Decision test**: Create an ADR when the change introduces a new top-level concept
(provider type, auth mechanism, rendering boundary, observability contract). Do NOT create
an ADR when the change extends an existing documented pattern (new value in an existing
config enum, new route following an existing handler structure).
```

**L6** (`TEMPLATE-backend-to-tech-lead.md`): Reorder template sections — move `[Status]` (overall) before `[Preflight Status]`.

**L7 — Updated per DN2 approval** (`backend.md` / Boundaries + Ownership Quick Matrix; `tech-lead.md` / Permitted Direct Changes):

DN2 approved full ownership transfer. Backend may apply `.env.example` changes for new env vars it introduces — no explicit delegation required.

**backend.md — Ownership Quick Matrix:**
```
BEFORE:
| `.env.example` | Tech Lead (config ownership) | Backend may edit only when explicitly
  delegated in Tech Lead handoff scope. |

AFTER:
| `.env.example` | Tech Lead (config ownership) | Backend may edit to add env vars
  introduced by the current CR scope. Record new vars in preflight note; TL retains
  ownership for deletions or renames. |
```

**tech-lead.md — Permitted Direct Changes table:**
```
BEFORE:
| **Environment** | Env templates | `.env.example`, `.env.local.example` |

AFTER:
| **Environment** | Env templates | `.env.example`, `.env.local.example`. Note: Backend
  may also add new env vars to `.env.example` when directly introduced by their CR scope
  (no explicit delegation required). |
```
