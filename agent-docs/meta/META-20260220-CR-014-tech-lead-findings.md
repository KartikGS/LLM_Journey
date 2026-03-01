# Meta Findings: Tech Lead — CR-014

**Date:** 2026-02-20
**CR Reference:** CR-014
**Role:** Tech Lead
**Prior findings reviewed:**
- `agent-docs/meta/META-20260220-CR-014-frontend-findings.md`
- `agent-docs/meta/META-20260220-CR-014-backend-findings.md`

---

## Conflicting Instructions

- **E2E trigger decision is declared in two locations without a designated canonical source.** When deciding whether to require an E2E handoff for CR-014, I consulted `workflow.md`'s "Testing Handoff Trigger Matrix" (which I was directed to use by tech-lead.md's Verification Checklist) and `testing-strategy.md`'s "Tech Lead Verification Matrix." Both were consistent for CR-014, but they are separate declarations of the same policy. If a future CR produces different answers in each matrix (e.g., workflow matrix says no, testing-strategy matrix says yes), there is no declared canonical source. The `testing-strategy.md` header says it is canonical for E2E triage/classification, but it says nothing about being canonical over `workflow.md`'s trigger matrix for Tech Lead planning decisions.

- **`workflow.md`'s Wait State rule is ambiguous when the Tech Lead has permitted direct changes to issue in the same turn as sub-agent handoffs.** The Wait State rule says: "Once the full planned handoff batch is created, the Tech Lead Agent MUST stop and report back to the User." In CR-014, I issued the Backend and Frontend handoffs AND updated `.env.example` (a Tech Lead–permitted direct change) in the same execution turn. A strict reading of the rule implies: issue handoffs → immediately enter Wait State, no further changes. A permissive reading allows: complete all permitted Tech Lead actions + issue handoffs → enter Wait State. Neither reading is declared. I proceeded with the permissive reading, which is functionally correct but unsupported by explicit protocol text.

---

## Redundant Information

- **The Pre-Implementation Self-Check Protocol is described in two locations.** `tech-lead.md` owns the canonical three-step checklist (List Files → Classify Each File → Decision Gate). `workflow.md` also includes a "Pre-Implementation Self-Check (Tech Lead)" section, which says: "Summary rule: if any target file is feature code, delegate and enter Wait State. This section intentionally avoids repeating the full checklist to prevent policy drift." The intent is good — `workflow.md` explicitly defers — but having two sections with this name creates a situation where an agent navigating `workflow.md` encounters the topic and must then navigate to `tech-lead.md` to find the actual checklist. A single pointer ("see `tech-lead.md` Pre-Implementation Self-Check") in workflow.md would be cleaner.

- **"Verification scope" appears as a concept in both `testing-strategy.md` and `tech-lead.md` with slightly different framing.** `testing-strategy.md` says: "sub-agent verification is scoped to affected files... Tech Lead verification runs the full suite." `tech-lead.md`'s Verification Checklist says to "Run quality gates in sequence per the Tech Lead Verification Matrix in testing-strategy.md." The scope split is consistent, but `tech-lead.md`'s checklist does not explicitly mention that sub-agents are NOT expected to run `pnpm build` — that implication is derivable only from `testing-strategy.md`. A Tech Lead reviewing sub-agent reports has no doc-backed guidance on whether a missing `pnpm build` step in a sub-agent report is a compliance issue or intentional scope limitation.

---

## Missing Information

- **No explicit "Implementation Decisions" section in the plan template.** The CR-014 BA handoff explicitly left one decision to Tech Lead: whether to repurpose `'huggingface'` or introduce a `'huggingface-router'` type. This is the correct pattern — BA scopes the What, Tech Lead owns the How. But `TEMPLATE.md`'s sections are: Technical Analysis, Discovery Findings, Configuration Specifications, Critical Assumptions, Proposed Changes, etc. I recorded this decision under "Configuration Specifications," which is adjacent but not exact (config specs are about values, not architectural choices). A dedicated `## Implementation Decisions (Tech Lead Owned)` section would make this handoff pattern explicit and searchable.

- **No doc-backed guidance on how to detect undisclosed sub-agent deviations.** The Adversarial Diff Review checklist in `tech-lead.md` says: "Look for edge cases," "Look for debug artifacts (console.log, commented-out code)," and "Never trust the sub-agent's verification blindly." None of these prompts specifically target undisclosed deviations — changes the sub-agent made but did not report in their `[Deviations]` section. In CR-014, the Frontend Agent's deviation section said "none" but CSS classes changed alongside content. I caught this through a full line-by-line read, but there was no checklist item that directed me there. A prompt like "Do any file changes appear that are not accounted for in the sub-agent's `[Changes Made]` or `[Deviations]` sections?" would systematize this catch.

- **No standard for the "Tech Lead Recommendation" pattern in the BA handoff.** When my adversarial review finds a quality concern not covered by any AC, `tech-lead.md` says: "document as 'Tech Lead Recommendation' in the BA handoff and create a follow-up CR candidate." But `TEMPLATE-tech-lead-to-ba.md` has no `## Tech Lead Recommendations` section — only `## Technical Retrospective` and `## Deployment Notes`. I wrote recommendations under "Technical Retrospective," which is plausible but not a named pattern the BA is directed to look for. If the BA's acceptance protocol doesn't prompt for this section, recommendations risk going unprocessed. The template should have a dedicated `## Tech Lead Recommendations` section with a corresponding BA check: "review each recommendation and decide: create follow-up CR / defer / reject."

- **The ADR decision test has a boundary ambiguity when the change is "format migration within an existing provider type."** `tech-lead.md` says: "Create an ADR when the change introduces a new top-level concept (provider type, auth mechanism, rendering boundary, observability contract)." For CR-014, I was migrating the HF provider from one API format to another — same provider type token (`'huggingface'`), different request/response format, different endpoint URL. "Provider type" is listed as an ADR trigger, but I was not creating a new provider type — I was changing the behavior of an existing one. The test is ambiguous on this boundary. I resolved correctly (no ADR), but the reasoning required constructing an interpretation the doc doesn't explicitly support. Adding "changing the behavior of an existing top-level concept" to the non-ADR examples would close this.

---

## Unclear Instructions

- **The "Post-Verification Drift Check" has no operational definition of how to detect drift.** `workflow.md` says: "Before issuing the BA handoff, confirm that feature files verified in steps 1–5 have not been modified after verification was recorded." In CR-014, I ran quality gates, immediately wrote the BA handoff in the same session turn. The check is trivially satisfied in synchronous single-session execution — no drift is possible between consecutive tool calls. But the protocol does not say HOW to verify drift: check file modification timestamps? Re-run a targeted test? Re-read the file? Without an operational definition, the check is either always trivially satisfied (same-session) or ambiguously scoped (multi-session gaps). The doc should specify the mechanism and note when it is trivially satisfied.

- **The Conversation File Freshness Rule's Pre-Replacement Check does not define minimum evidence.** I read four files (two current conversation files + two plan-glob results) before replacing handoff files for CR-014 — the rule says "confirm the prior CR's conversation content is captured in its plan, completion report, or CR artifact" but does not define what confirmation requires. I self-constructed the check: plan file exists + conversation file shows `status: completed` + CR in project-log shows `Completed`. This is reasonable but invented. The rule should specify: "Minimum evidence: `plans/CR-XXX-plan.md` exists AND the outbound report file shows `status: completed` for the prior CR." (Confirmed by both sub-agents independently — this finding is cross-role.)

---

## Responsibility / Scope Concerns

- **`pnpm build` failing can only be caught at Tech Lead verification, never at sub-agent verification.** The scope split (`testing-strategy.md`) assigns `pnpm build` to the Tech Lead Verification Matrix but not to sub-agent DoD. For CR-014, Backend changed `route.ts` and tests; Frontend changed `page.tsx`. Either change could theoretically cause a build failure. If `pnpm build` had failed in CR-014, the sequence would be: Tech Lead discovers it → re-delegates to the responsible sub-agent → sub-agent fixes → re-reports → Tech Lead re-verifies. This is a potentially expensive loop for a check that could be done earlier. The sub-agent DoD templates should include `pnpm build` as either mandatory or recommended (with "flag build failures to Tech Lead if unexpected") to surface build errors before the Tech Lead integration gate.

- **The Tech Lead is simultaneously required to "not write feature code" and to perform an "Adversarial Diff Review" of feature code.** This is intentional and correct — reading is not writing — but the role doc framing creates a subtle tension. Tech Lead reads feature files for review but cannot edit them directly. If the adversarial review finds a defect, the correction requires creating a new sub-agent handoff, entering Wait State, and iterating. For CR-014 this wasn't needed (review was clean), but the protocol overhead for a "found one small bug, fix it" scenario is substantial. The doc does not acknowledge this asymmetry — reading is permitted, fixing requires delegation regardless of size.

---

## Engineering Philosophy Concerns

- **Intentional dead code created by a CR constraint has no persistence mechanism beyond the handoff.** CR-014 explicitly froze `extractProviderOutput()`'s HF array path (`Array.isArray(payload)`) as intentionally dead code — the HF Router uses completions format, not array format, so the branch is unreachable for live traffic. This was enforced only by the handoff instruction. After CR-014 closes, the intent lives only in the plan and handoff files — there is no code comment, no `keep-in-mind.md` entry, and no ADR pointing to this function. A future agent refactoring `extractProviderOutput()` will see an untested branch with no coverage and reasonable motivation to remove it. `keep-in-mind.md` is the correct venue for temporary constraints, but the rule says: "Add here → Fix root cause → Move to permanent doc → Delete from here." A "keep this dead code pending future cleanup decision" entry doesn't fit the lifecycle model well. The system needs a pattern for "intentional dead code with documented removal deferral."

- **The meta-improvement protocol's Phase 2 (Synthesis) and Phase 3 (Implementation) have no tracking artifact in the project workflow.** Phase 1 findings files exist. But there is no mechanism that creates a follow-up entry in `project-log.md` or `requirements/` when meta-analysis is initiated. After this session ends, Phase 2 requires the user to manually initiate a new synthesis session. If that doesn't happen, the findings files sit inert. The meta-improvement protocol should specify: Phase 1 completion → Tech Lead (or BA) creates a `Next Priority` entry in `project-log.md` referencing the findings files, so the synthesis work has a guaranteed tracking artifact in the same system that tracks CRs.

---

## Redundant Workflow Steps

- **Reading `keep-in-mind.md` as a mandatory role-specific step produced zero actionable information for CR-014.** The file had one active warning (Diagnostic Fallback UIs — a BrowserGuard concern unrelated to HF inference or comparison table content). Reading it required ~30 seconds plus context processing. The "Every Task" mandatory read in `tech-lead.md` does not condition this on relevance — it is always required. A lightweight scoping mechanism (e.g., "Read if the CR touches browser behavior, WASM, E2E environment, or security constraints") would preserve the safety value while reducing overhead for CRs where it is clearly irrelevant.

- **The plan template's `## Architecture-Only Freeze Checklist (Conditional)` section requires a read-and-discard for non-architecture-only CRs.** The instruction says "Delete this section if this is not an Architecture-Only CR." I read the section, reasoned about applicability, and discarded it. The template could instead use a guard at the section header — e.g., "Skip this section entirely unless CR intent is architecture-only" — to signal skip-ability before the reader processes the content.

- **The Reading Confirmation Template output ("I have read: Universal... Role-Specific...") is a process declaration that provides no decision-relevant content to the user.** I produced this output at the start of the session. It confirms compliance but the user cannot act on it — it is neither a plan nor a question. The confirmation is useful for auditing but would be better embedded as the opening line of the actual plan output ("Plan for CR-014 — context loaded from: [list]") rather than as a separate preceding block that delays the substantive output.

---

## Other Observations

- **The stale test name `'should send HF request body format (inputs + parameters)'` was caught in adversarial review but has no systematic checklist trigger.** After CR-014, this test correctly validates the NEW format (`{ model, prompt, max_tokens, temperature }`) but its name still references the OLD format (`inputs + parameters`). The Tech Lead Adversarial Diff Review checklist prompts for logic errors, edge cases, and debug artifacts — it does not include: "For tests where assertions were updated due to a format/contract change, verify the test name still accurately describes what is being tested." This is a precision gap in the checklist.

- **The `HF_MAX_NEW_TOKENS` constant name is semantically stale after the format migration.** The constant was originally named for the HF Inference API's `max_new_tokens` parameter. Post-CR-014, it is used as `max_tokens: HF_MAX_NEW_TOKENS` in the completions body. The value (256) is correct; the name implies HF-API specificity that no longer applies. No doc or checklist prompted consideration of whether constant names remain accurate after a format migration. This is minor but signals a gap: the adversarial review checklist focuses on correctness of values and logic, not on semantic accuracy of identifiers after a format change.

- **The "Out-of-Scope But Must Be Flagged" section IS present in `TEMPLATE-tech-lead-to-backend.md`.** The Backend Agent's finding claims this pattern "does not appear in `TEMPLATE-tech-lead-to-backend.md`" — this is factually incorrect; the section exists with two placeholder items. What is missing is not the template section but an explanation in the backend role doc of WHY this section exists and what the Tech Lead is signaling by pre-populating it. The template has the form; the role docs lack the rationale. This finding should be recategorized from "Missing from template" to "Missing explanation of purpose in role doc."

- **The BA handoff `## Deployment Notes` section has no structured field for environment variable changes.** I wrote free-text deployment notes describing the four env vars required for live HF inference. The `TEMPLATE-tech-lead-to-ba.md` provides no prompt for env var changes specifically. For any CR that adds, removes, or redefines env vars (a common pattern for provider integrations), a structured `New/Changed Env Vars:` field in the deployment notes would make BA acceptance more deterministic and reduce the risk of env var documentation being buried in prose.

---

## Prior Findings: Assessment

**Frontend Findings:**

- [Conflicting verification command order in frontend.md vs. frontend-refactor-checklist.md] → **Validated**. From the Tech Lead side: `testing-strategy.md`'s Command Sequencing Rule (the canonical source for Tech Lead verification) specifies `test → lint → tsc → build`. Frontend role docs give different order without pointing to this canonical source. The fix is for frontend role docs to cross-reference `testing-strategy.md` as the canonical command sequence source.

- [Verification command sequence declared in two role-doc locations] → **Validated**. Same structural problem at Tech Lead level: `tech-lead.md` verification checklist and `testing-strategy.md` Tech Lead Verification Matrix are separate declarations of overlapping scope.

- [No guidance on CSS class side-effects of text content changes] → **Validated**. I caught the unreported class change in adversarial review. The completion report template missing a prompt for this is confirmed — the gap produced an unreported deviation.

- [Conversation File Freshness Rule: "confirm" not operationally defined] → **Validated**. I self-constructed the evidence standard (plan file exists + `status: completed` in report). The rule should specify minimum evidence explicitly.

- [Mandatory runtime preflight not surfaced at execution point] → **Validated**. Same gap at Tech Lead level — I used prior-session knowledge. The mandatory `node -v` from `tooling-standard.md` has no hook in `tech-lead.md`'s verification checklist.

- [Full context loading disproportionate for simple tasks] → **Validated-Extended**. Tech Lead mandatory context is broader (12 reads total for CR-014). The overhead is more justifiable given planning scope, but `keep-in-mind.md` had zero relevant content for CR-014 and was still mandatory.

- [Preflight note ceremony with zero open questions] → **Validated**. From review side: I reviewed sub-agent preflights that confirmed obvious assumptions and added no decision-relevant information. The overhead is symmetric — the sub-agent formats it, the Tech Lead reads it.

- [No lightweight escalation path for adjacent UX gaps] → **Validated**. I constructed the "Tech Lead Recommendation" pattern for the `<h3>` heading issue — this is the right behavior, but it is not a documented pattern in the BA handoff template. The system relies on Tech Lead judgment rather than a defined path.

- [Completion report template missing CSS side-effects prompt] → **Validated**. The deviations section had "none" despite a class change. A template prompt would catch this class of omission.

- [CSS text-color tier for real vs. placeholder data not documented] → **Not applicable at Tech Lead level**. Valid finding for frontend role scope.

**Backend Findings:**

- [backend.md full-suite vs. handoff full-suite conflict] → **Validated-Extended**. From Tech Lead perspective: the intent (sub-agents run scoped, Tech Lead runs full) is architecturally sound, but the backend role doc's wording doesn't acknowledge that a handoff can legitimately require full suite. The resolution should be: "Backend runs full suite when explicitly required by handoff DoD; otherwise, scoped verification is the backend default. Tech Lead always runs full suite independently."

- ["Explicitly delegated" has no defined form in handoff template] → **Validated**. I used free-text prose. A `[Delegated Scope]` block in the handoff template would be cleaner and more scannable.

- [node -v not in backend verification checklist] → **Validated**. Cross-role gap. Applies equally to Tech Lead verification checklist.

- [Full context loading overhead for 4-line change] → **Validated**. Same structural problem as Frontend finding — different specific files, same root cause.

- [Preflight note ceremony with zero open questions] → **Validated**. Same as Frontend finding.

- [Pre-replacement check operationalization] → **Validated**. Identical experience at Tech Lead level.

- ["Out-of-Scope But Must Be Flagged" not in template] → **Partially Refuted**. The section IS in `TEMPLATE-tech-lead-to-backend.md`. What is missing is the rationale/purpose explanation in the backend role doc. The finding should be redirected from "add to template" to "explain in role doc."

- [Intentional dead code with no doc hook] → **Validated**. I noted this in my BA handoff but the system has no standard mechanism for recording intentional dead code decisions with deferral intent.

- [Frozen-function invariant enforced only by handoff] → **Validated**. `keep-in-mind.md` doesn't fit well (it's for bugs/warnings, not intentional architectural deferral). System needs a pattern for this class of constraint.

- [Test name staleness after contract change] → **Validated**. I caught it in adversarial review. Adding a checklist item would systematize the catch.

- [Scope Gate fires on test files before delegation statement is read] → **Validated**. The Scope Gate check in the backend role doc should add: "...unless the active handoff explicitly delegates test scope to Backend."

- [.env.example ownership partial conflict] → **Validated**. The "Backend may add env vars" rule and the "TL already updated it, freeze" handoff pattern are compatible in outcome but create an edge case when both conditions could apply simultaneously. The rule should clarify precedence.

- [Redundant workflow steps: context loading overhead] → **Validated**. Identical root cause to Frontend finding.

- [Preflight as ceremony vs. safety] → **Validated**. Same observation from review side — when preflight produces zero new information, the format requirement costs more than it contributes.

- [Pre-replacement check: Conversation File Freshness Rule ambiguity] → **Validated**. Identical experience.
