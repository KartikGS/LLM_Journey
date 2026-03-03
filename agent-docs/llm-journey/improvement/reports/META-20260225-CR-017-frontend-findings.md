# Meta Findings: Frontend — CR-017

**Date:** 2026-02-25
**CR Reference:** CR-017
**Role:** Frontend
**Prior findings reviewed:** none (first agent in Phase 1 chain)

---

## Conflicting Instructions

- **F-CI-1: `tsc --noEmit` verification gap between handoff and tooling-standard.md.**
  During verification, the handoff (`tech-lead-to-frontend.md`) specified `pnpm exec tsc --noEmit` as a verification command. The `tooling-standard.md` does not list `tsc --noEmit` as a project verification step at all — its "Quality & Linting" section names ESLint and Prettier but is silent on TypeScript compilation as a standalone gate. The `frontend.md` role doc declares it as mandatory step 2. The `testing-strategy.md` (referenced by `frontend.md` line 217) defines a four-step pipeline (`test → lint → tsc → build`) but that pipeline is Tech Lead closure scope, not Frontend scope. The result is that `tsc --noEmit` exists as a Frontend verification requirement solely because `frontend.md` says so, not because it traces to a project-wide gate in `tooling-standard.md`.
  - **Execution moment:** When reading `tooling-standard.md` to understand the project verification stack, I found no mention of `tsc` as a standalone check, then found it in `frontend.md` and the handoff. Two sources implied different verification scopes.
  - **Lens:** `evolvability` — if `tooling-standard.md` is updated to add or remove quality gates, the frontend role doc and handoff templates will not automatically reflect this. `portability` — a cross-project tooling standard should be the single canonical source for verification steps; role docs should reference, not redefine.

## Redundant Information

- **F-RI-1: Runtime preflight instructions appear in three places.**
  The Node.js version check and `nvm use` recovery path are documented in: (1) `tooling-standard.md` lines 17–24 (canonical source), (2) `frontend.md` lines 212–213 (cross-reference), and (3) the Tech Lead handoff `tech-lead-to-frontend.md` lines 38–39 (inline repetition). The handoff duplicates the recovery path (`nvm use 20`) rather than simply cross-referencing. For CR-017 this caused no harm, but it creates drift risk — if the documented minimum version changes, three locations need updating.
  - **Execution moment:** I read the `nvm use 20` instruction in the handoff, then re-read `tooling-standard.md` to confirm it was the same policy. The duplication was harmless but noticeable.
  - **Lens:** `evolvability` — duplication increases edit cost for version changes. `portability` — the canonical section in `tooling-standard.md` is correctly project-scoped, but the handoff template should reference it rather than inlining project-specific recovery commands.

- **F-RI-2: Visual Quality Invariant and Aesthetic North Star repeated between `frontend.md` and `design-tokens.md`.**
  The Aesthetic North Star quote ("Wow yet Professional, subtle but not too subtle.") and the reference-calibration apps (Linear, Vercel, Raycast) appear verbatim in both `frontend.md` (lines 96–98) and `design-tokens.md` (lines 11–13). Neither declares "canonical here, reference elsewhere."
  - **Execution moment:** During context loading, I read the same block twice. For CR-017 (copy-only) this was irrelevant, but for any visual CR this would raise the question: which file is the source of truth if the wording diverges?
  - **Lens:** `evolvability` — two copies means two edit sites if the north star changes. One file should own the definition and the other should cross-reference.

## Missing Information

- **F-MI-1: No "small/trivial CR" fast-path in the Frontend workflow.**
  CR-017 was a single-string copy rename. The full protocol required: reading 11+ doc files during context loading, producing a multi-section preflight, a multi-section contract evidence report, failure classification table, scope extension section, and deviations section — most of which were `none` for a one-line text change. No documented mechanism exists to scale ceremony to CR complexity. The `workflow.md` and `frontend.md` treat all CRs identically regardless of size.
  - **Execution moment:** While writing the `frontend-to-tech-lead.md` report, I filled in 7 sections with `none`/`n/a` values. The report ceremony cost was disproportionate to the change risk.
  - **Lens:** `collaboration` — requiring full-ceremony reports for trivial changes serializes the feedback loop unnecessarily and delays Tech Lead verification. `portability` — a graduated ceremony model (small/medium/large CR) would be reusable across projects.

- **F-MI-2: No guidance on what to do when `tsc --noEmit` is unavailable or skipped due to environment mismatch.**
  `tooling-standard.md` Runtime Preflight says to classify as `environmental` and halt if the mismatch is new. But during CR-017, `pnpm exec tsc --noEmit` succeeded on Node 18 (the command completed with exit code 0). The docs don't address the scenario where verification tools _run_ on a mismatched runtime but the results may be unreliable. Should I trust a passing `tsc` on Node 18 when the project requires Node 20? The protocol gives no answer.
  - **Execution moment:** After `node -v` returned `v18.19.0`, I still ran `pnpm lint` and `pnpm exec tsc --noEmit` and both passed. I classified as `environmental` in the report, but the question of result trustworthiness was unaddressed.
  - **Lens:** `portability` — "trust boundary for tool results on mismatched runtimes" is a cross-project concern. `evolvability` — documenting a clear policy (e.g., "results are valid unless the tool itself errors") would remove this judgment call.

## Unclear Instructions

- **F-UI-1: "Pre-Replacement Check" wording in `frontend.md` vs. `workflow.md` creates hesitation on _who_ performs it.**
  `frontend.md` line 210 says: "Before replacing `frontend-to-tech-lead.md`, complete the Conversation File Freshness Pre-Replacement Check per `workflow.md`." The `workflow.md` line 62 defines the pre-replacement check as mandatory for the agent who is about to write. But the check requires confirming the _prior_ CR's conversation content is captured in its plan — which is a Tech Lead artifact (`plans/CR-XXX-plan.md`). This means the Frontend agent must read Tech Lead artifacts to verify a precondition it does not own.
  - **Execution moment:** I checked that `plans/CR-015-plan.md` existed (as the Tech Lead had already done in the handoff's own pre-replacement check section). The effort was trivial, but the _authority_ question — "should I be verifying Tech Lead artifacts?" — caused a brief hesitation.
  - **Lens:** `collaboration` — the check is reasonable but the doc doesn't clarify that the Frontend agent is _verifying_ (read-only), not _owning_ the artifact. A one-line clarification would remove the ambiguity. `portability` — conversation freshness checks are reusable, but the ownership nuance is project-specific.

- **F-UI-2: "Copy-only change" is used in the handoff but is not a formally defined execution mode.**
  `tech-lead-to-frontend.md` repeatedly says "copy-only change" and the execution mode field says `feature-ui`. But `frontend.md` only defines two modes: `architecture-only` (line 34) and implicitly everything else (feature-ui). There's no documented behavior for "copy-only" — does it inherit all `feature-ui` ceremony, or should it have reduced obligations? During CR-017, I defaulted to full `feature-ui` ceremony because no alternative existed.
  - **Execution moment:** When reading the handoff, I saw `feature-ui` as the execution mode, then saw "copy-only change" repeated 4+ times. I had to decide whether "copy-only" reduced my verification obligations. It didn't, per the docs.
  - **Lens:** `collaboration` — a formally defined `copy-only` mode with reduced ceremony would improve throughput for trivial changes. `evolvability` — adding a mode requires updating `frontend.md`, handoff templates, and report templates.

## Responsibility / Scope Concerns

- **F-RS-1: Frontend agent's "Out-of-Scope But Must Be Flagged" obligation has unclear reporting path.**
  The handoff (line 74–78) says if I notice other developer-facing copy, I should "flag it in your report as a future recommendation." But the report template has no dedicated section for "future recommendations" or "out-of-scope observations." I would need to either add it to `[Deviations]` (which has a specific semantic meaning) or `[Other]` (which doesn't exist in the template). During CR-017 I did not observe other developer-facing copy so the issue was moot, but the reporting path is undefined.
  - **Execution moment:** While reading the full page source to validate the `<h3>`, I did not find other placeholder copy, so no report was needed. But I noted the template gap.
  - **Lens:** `evolvability` — adding a `[Future Recommendations]` or `[Observations]` section to the Frontend report template is a low-cost fix. `portability` — this pattern (flag-but-don't-fix) is reusable across roles.

## Engineering Philosophy Concerns

- **F-EP-1: The doc system optimizes for auditability at the expense of throughput on small changes.**
  The entire doc structure — 11 files of context loading, structured preflight, structured contract evidence, multi-section report — is designed for medium-to-large CRs where the ceremony provides safety. For CR-017 (a 1-word rename), the ceremony-to-value ratio was heavily skewed. This is not a bug per se — it's an acknowledged trade-off — but it is _undocumented_. No doc says "we know this is heavy for small CRs, here's why we accept it" or "here's how to scale it."
  - **Execution moment:** The total context-loading phase (reading 11 files) took more effort than the implementation (1 line changed) and verification (2 commands). This is the most concrete signal that the system's ceremony floor is set for a different CR size class.
  - **Lens:** `collaboration` — the ceremony floor forces a synchronous multi-turn loop (handoff → preflight → execution → report → verification → acceptance) even when a single-turn "change + verify + done" would suffice. `portability` — ceremony scaling is a cross-project concern.

## Redundant Workflow Steps

- **F-RW-1: Preflight publication as a separate step adds no value for clearly scoped, copy-only handoffs.**
  `workflow.md` line 110–114 requires a preflight note published to the report file with assumptions, adjacent risks, and open questions. For CR-017, all three were trivially empty or self-evident from the handoff ("it's a static string, no questions"). The step was completed but produced zero new information — the handoff itself had already validated the assumptions (line 67–71) and explicitly stated "no blocking questions are anticipated" (line 115).
  - **Execution moment:** I wrote the three preflight sections in the report, all essentially saying "none." The ceremony was compliant but information-free.
  - **Lens:** `collaboration` — if the preflight step could be conditionally skipped for handoffs tagged as trivial/copy-only, it would remove one serialization point. `portability` — a conditional-preflight rule (e.g., "preflight required unless handoff explicitly marks 'no-preflight-needed'") is reusable.

- **F-RW-2: Shared-component blast-radius check section in report template is mandatory even when no shared components are touched.**
  The report template includes a "Shared-component blast-radius checks" line that I filled with `[n/a]`. The `frontend-refactor-checklist.md` correctly scopes this check to "When `app/ui/**` Changes," but the _report template_ does not mark it as conditional — it's always present.
  - **Execution moment:** Filling in `[n/a]` for the blast-radius line in the report.
  - **Lens:** `evolvability` — marking the section as `(if applicable)` in the template would signal that it's optional for non-shared-component CRs.

## Other Observations

- **F-OO-1: The handoff's "Assumptions To Validate" section (lines 67–71) was valuable and reduced judgment calls.**
  The explicit instruction to "confirm line 134 reads X before editing" and "confirm the heading is static JSX" eliminated the two most likely failure modes. This is a pattern worth preserving and expanding to other handoffs — it converts implicit expectations into testable preconditions.
  - **Execution moment:** I read line 134, confirmed the match, confirmed static JSX, and proceeded. The two checks took seconds and removed ambiguity.
  - **Lens:** `portability` — "Assumptions To Validate" as a required handoff section is a reusable cross-project pattern. `evolvability` — it's already present in the Tech Lead handoff template; ensuring it stays mandatory is low-cost.

---

## Lens Coverage (Mandatory)

- **Portability Boundary:** Several rules that are currently embedded in project-specific docs (`frontend.md`, handoff templates) are actually cross-project patterns: verification step canonicalization (F-CI-1), runtime trust boundaries (F-MI-2), ceremony scaling for CR size (F-MI-1, F-EP-1), and the "Assumptions To Validate" pattern (F-OO-1). These should be factored into reusable coordination docs with project-specific values parameterized.

- **Collaboration Throughput:** The primary throughput bottleneck observed in CR-017 is the fixed ceremony floor. Every CR, regardless of size, traverses the same multi-turn loop (context load → preflight → execute → report → verify → accept). For trivial CRs, this loop serializes 3+ agent sessions when a single-pass execution would be equally safe. Findings F-MI-1, F-RW-1, and F-EP-1 all point to the same root cause: no graduated ceremony model.

- **Evolvability:** The main evolvability risks are duplicated policy text (F-RI-1, F-RI-2) and template sections that are always-mandatory when they should be conditional (F-RW-2). Both increase the edit surface for future doc changes without providing proportional safety value. Resolving these would reduce the number of files that need synchronized updates when policy changes.

## Prior Findings: Assessment
(No prior findings — this is the first agent in the Phase 1 chain.)
