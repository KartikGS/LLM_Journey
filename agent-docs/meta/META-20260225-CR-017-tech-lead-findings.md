# Meta Findings: Tech Lead — CR-017

**Date:** 2026-02-25
**CR Reference:** CR-017
**Role:** Tech Lead
**Prior findings reviewed:**
- `agent-docs/meta/META-20260225-CR-017-backend-findings.md`
- `agent-docs/meta/META-20260225-CR-017-frontend-findings.md`

---

## Conflicting Instructions

- **TL-CI-1: Hard Rule prohibits specific zones but does not define what Tech Lead *can* directly change.**
  `tech-lead.md` Hard Rule: "Tech Lead does NOT write feature code in `app/`, `components/`, `hooks/`, feature tests." For CR-017 I needed to create `lib/utils/record.ts`, update `.env.example`, add `"engines"` to `package.json`, and create `.nvmrc`. None of these paths are mentioned in the Hard Rule or in any Tech Lead-owned zones list. I inferred that "not feature code" = "infrastructure / config / shared utilities" and proceeded. The inference was correct but was a judgment call. When I cross-referenced Backend's Ownership Quick Matrix to check if `lib/utils/` was Backend-owned, I found it was also absent there. Two role docs with negative-space definitions and a shared directory that falls through both.
  - *Execution moment:* Pre-Implementation Self-Check for `lib/utils/record.ts` — no doc confirmed Tech Lead ownership; proceeded by elimination.
  - `evolvability` · `portability`

- **TL-CI-2: Plan spec for the cap test was structurally incorrect, and the flaw propagated through the full pipeline uncorrected.**
  My CR-017 plan spec for the cap test read: set `process.env.ADAPTATION_OUTPUT_MAX_CHARS = '10'` before calling the already-imported `POST`. Simultaneously, §1 of the same plan specified `ADAPTATION_OUTPUT_MAX_CHARS` as a module-level `const` (matching `FRONTIER_OUTPUT_MAX_CHARS`). These two specs are structurally incompatible — a module-level constant reads env at module load time, not per-test. My plan's Adjacent Risks section correctly identified this ("Module-level constant testability") and even named `jest.isolateModules()` as the workaround. But when I wrote the Backend handoff, I propagated the verbatim incorrect test code from the plan spec without updating it to the `jest.isolateModules()` pattern I had already identified as correct. The BA's handoff to me contained the same incorrect code (sourced from my plan). The Backend agent caught the incompatibility independently and resolved it correctly — but this required a judgment call that I had already made, then failed to communicate.
  - *Execution moment:* Writing `tech-lead-to-backend.md` handoff §4 (cap test spec) — knew the spec needed `isolateModules()` from my own Adjacent Risks analysis, but copied verbatim plan code instead.
  - `evolvability` · `portability`

---

## Redundant Information

- **TL-RI-1: Freshness Pre-Replacement Check evidence is published into three separate handoff reports as Historical Notes, then discarded when those reports are next replaced.**
  I wrote a `[Historical Note]` section into `tech-lead-to-backend.md`, `tech-lead-to-frontend.md`, and `tech-lead-to-ba.md`, each containing the same evidence: "CR-015-plan.md exists, prior CR-015 status was completed/verified, replacement permitted." This check is a *gate* — it should control whether the write proceeds, not become an output artifact. The evidence has a lifespan of exactly one CR (until the file is replaced again). Publishing it into the handoff report creates maintenance noise without durable value: the next Tech Lead replacing the same files will perform the same check and write a new Historical Note overwriting this one. If the evidence is worth preserving for audit, it belongs in a dedicated audit file; if it's only a gate, it should be verified silently.
  - *Execution moment:* Writing all three `[Historical Note]` sections in succession — noticed I was writing the same evidence formula three times.
  - `evolvability` · `collaboration`

- **TL-RI-2: Node.js runtime minimum (`20.x`) appears in four locations in this CR's artifact trail.**
  `tooling-standard.md` (canonical), `tech-lead.md` verification checklist (cross-references tooling-standard but also names `20.x`), `tech-lead-to-backend.md` Known Environmental Caveats (inlined recovery command), `tech-lead-to-frontend.md` Known Environmental Caveats (same). Confirmed by Backend (B-RI-2) and Frontend (F-RI-1) who each found three-location duplication from their own trails. The combined CR trail has four. If the minimum changes to `22.x`, both handoff templates, `tech-lead.md`, and `tooling-standard.md` all need synchronized updates.
  - *Execution moment:* Writing both handoffs' `§ Known Environmental Caveats` sections — realized I was inlining the same `nvm use 20` command already in `tooling-standard.md`.
  - `evolvability`

---

## Missing Information

- **TL-MI-1: Write tool read-before-write constraint is not documented in any workflow or handoff protocol doc.**
  The `tech-lead.md` Conversation File Freshness Pre-Replacement Check instructs reading the target file to confirm the prior CR's status. I read only the header lines (offset:1/limit:5) because the freshness check only needs the Subject and Status fields. The subsequent Write calls for `tech-lead-to-backend.md` and `tech-lead-to-frontend.md` both failed with "File has not been read yet." The Write tool requires the *full file* to have been read, not just a subset. Nothing in `workflow.md`, `tech-lead.md`, or `handoff-protocol.md` mentions this constraint. The failure caused two retry cycles (read fully → re-attempt write) for both handoff files. This is a concrete, recoverable failure that recurs in any session where a partial read (freshness check) precedes a write.
  - *Execution moment:* Immediately after both handoff write failures — the error message was clear but the fix was undocumented.
  - `portability` · `evolvability`

- **TL-MI-2: Plan template has no reminder to validate test-code compatibility with the module loading model it accompanies.**
  The plan template has a test spec section for new tests to be delegated to Backend. For CR-017, I wrote test spec code assuming per-test env var changes, while simultaneously specifying a module-level constant for the same env var. A one-line caveat in the plan template — "if the spec includes tests for module-level env constants, verify the test code uses `jest.isolateModules()` or an equivalent pattern" — would have caught this before the spec reached the Backend handoff. The plan template currently has no test-code review step.
  - *Execution moment:* Writing plan §3 (test spec) and §1 (ADAPTATION_OUTPUT_MAX_CHARS constant definition) in succession without noticing the incompatibility.
  - `evolvability` · `portability`

- **TL-MI-3: No documented procedure for the "AC partially completed by Tech Lead before delegation" pattern.**
  AC-2 (Config contract) was split: I updated `.env.example` directly (the documentation half), then delegated the constant implementation and cap application to Backend (the code half). In the handoff I wrote: "Do NOT modify `.env.example` — already updated by Tech Lead." Backend's findings (B-MI-3) flagged that this phrasing discouraged them from verifying my work. From the Tech Lead side: there is no workflow step that says "after Tech Lead direct changes, list the completed AC sub-tasks in the handoff so Backend can verify the TL-completed portion if desired." The split-AC pattern is natural when Tech Lead owns config and Backend owns code — but it's currently handled informally.
  - *Execution moment:* Writing `.env.example` update and then handoff §4 Out-of-Scope note — realized I was asserting my own completion without offering a verification path.
  - `collaboration` · `portability`

- **TL-MI-4: No documented notification path for when BA acceptance completes after the Tech Lead's Wait State.**
  After writing `tech-lead-to-ba.md`, `tech-lead.md` instructs the Tech Lead to enter Wait State. The BA acceptance happened (CR-017 requirements file updated to Done with full AC evidence), but there is no protocol for how the Tech Lead learns this. In practice the user manages the transition, but the meta-improvement protocol asks who is responsible and via what signal. A "BA completion signal" (e.g., requirements file status change to `Done`, or a ba-to-tech-lead.md update) would close this loop. Currently, if a session resumed without the user's narration, the Tech Lead would have no way to know CR-017 was Done without re-reading the requirements file proactively.
  - *Execution moment:* The BA's acceptance was surfaced only via the system-reminder showing the requirements file modification — outside the documented protocol.
  - `collaboration`

---

## Unclear Instructions

- **TL-UI-1: Parallel delegation (issuing multiple handoffs simultaneously) is practiced but not documented.**
  The CR-017 plan identified Backend and Frontend tasks as fully independent ("Parallel mode"). I issued both handoffs in a single response (one `tech-lead-to-backend.md` write + one `tech-lead-to-frontend.md` write). `workflow.md` describes the handoff lifecycle sequentially: one agent, then Tech Lead review, then next agent. There is no documented "parallel mode" for Tech Lead delegation — whether it's permitted, whether the Tech Lead should wait for both to complete before running quality gates, or whether there's a coordination risk when two agents both read the same base files simultaneously. I improvised the obvious approach (wait for both, then run gates once), but a documented parallel delegation mode would remove the judgment call for future Tech Leads.
  - *Execution moment:* Writing both handoff files simultaneously — noted the workflow docs implied sequential but this was clearly the right approach.
  - `collaboration` · `portability`

- **TL-UI-2: Adversarial diff review scope is not defined relative to files already read during planning.**
  `tech-lead.md` instructs an adversarial diff review of all modified files after receiving sub-agent reports. During CR-017 planning, I had already read the full content of both route files and `page.tsx`. When sub-agent reports arrived, the adversarial review re-read the same files in full. For the Backend-modified files (routes + test file), the re-read was valuable — the files had changed since my planning read and re-reading confirmed the Backend changes were correct. For `page.tsx` (Frontend-modified), the re-read was identical to the planning read because the file change was a single string at line 134. The protocol doesn't clarify whether "adversarial diff review" means "re-read the full file" or "read the diff/changed sections." Clarifying this would reduce redundant full-file reads for Frontend changes that are obviously contained.
  - *Execution moment:* Reading `page.tsx` in full for adversarial review — realized I had read the same content during planning and the only change was one string at a known line.
  - `collaboration`

---

## Responsibility / Scope Concerns

- **TL-RS-1: A known spec conflict from the plan's Adjacent Risks analysis was not resolved before handoff issuance — resolution was implicitly delegated to Backend.**
  My plan correctly identified the module-caching incompatibility in the Adjacent Risks section. I even named the fix: "Tests that set the env var *after* module import won't see the new value. Use `jest.isolateModules()` to re-import the route with the env var already set." But when writing the Backend handoff, I copied the verbatim (incorrect) test code from the plan's test spec section without applying the `jest.isolateModules()` fix I had already specified. The Backend agent had to independently identify the conflict, make the judgment call, and file a deviation report. The correct Tech Lead behavior: if the Adjacent Risks analysis identifies a required pattern (isolateModules), the handoff spec must incorporate that pattern — not just flag it in a preflight note and leave it to Backend to resolve. Pre-Implementation Self-Check findings should update the spec, not just record the risk.
  - *Execution moment:* Comparing plan §1 (Adjacent Risks: module-level constant) against plan §3 (cap test spec: direct POST call) — the conflict was visible in my own plan document.
  - `collaboration` · `evolvability`

- **TL-RS-2: `lib/utils/` is not in any role's Ownership Quick Matrix, creating a creation-authority gap for shared utilities.**
  Backend's findings (B-RS-2) noted this from their perspective: Backend was only importing from `lib/utils/record.ts`, so ownership didn't block execution. From the Tech Lead perspective, creating `lib/utils/record.ts` required asserting Tech Lead authority over a directory not listed in the Hard Rule (prohibited) or the Backend matrix (Backend-owned) or the Frontend matrix (Frontend-owned). For this CR, I was the one creating the file, so I unilaterally classified it as Tech Lead-owned infrastructure. But the matrix gap means any future agent who needs to create or modify a `lib/utils/` file will face the same undocumented authority question. The matrix should have an explicit entry for `lib/utils/` (or `lib/` in general) specifying who creates shared utilities and whether Backend can modify them when explicitly delegated.
  - *Execution moment:* Pre-Implementation Self-Check for `lib/utils/record.ts` — no ownership doc confirmed this was permitted; proceeded on inference.
  - `portability` · `evolvability`

---

## Engineering Philosophy Concerns

- **TL-EP-1: There is no spec-validation step between plan approval and handoff issuance.**
  The Tech Lead execution flow is: plan → user approval → handoff issuance. The approval gate is a user decision on scope and approach; it does not validate whether the handoff spec is internally consistent. For CR-017, my plan had an internally inconsistent test spec (module-level constant + per-test env change). The user approved the plan at the scope level — the inconsistency was in a detail-level code block. The handoff issuance step has no reminder to validate spec consistency before writing handoffs. Adding a "spec consistency check" reminder to tech-lead.md's handoff issuance procedure — specifically: "cross-check test specs against implementation specs for module loading assumptions" — would have caught this. A lightweight 30-second review.
  - *Execution moment:* Issuance phase — moving from plan approval directly to writing handoffs without a cross-check step.
  - `evolvability` · `portability`

- **TL-EP-2: Bundled CRs trade "fewer CR round-trips" for "higher planning complexity per round-trip" without documenting the tradeoff.**
  CR-017 bundled 5 `[S]` items explicitly to reduce context-switching. The execution still required the same sequential Tech Lead → (Backend + Frontend) → Tech Lead pipeline. The parallel gain was Backend + Frontend running simultaneously, saving approximately one agent round-trip. Meanwhile, the plan had to analyze 5 separate tasks across 3 ownership zones (Backend, Frontend, Tech Lead direct), increasing the planning and plan-review complexity. The BR for bundling (from `project-log.md`: "avoid creating a separate CR for each") is sound, but the tradeoff — simpler CRs vs fewer CR cycles vs planning load — is undocumented. Future Tech Leads/BAs making bundling decisions have no framework for evaluating when bundling helps vs when it increases cognitive load without proportional throughput gain.
  - *Execution moment:* Planning phase for CR-017 — managing 5 task analyses in a single plan vs the expected planning overhead for a single-task CR.
  - `collaboration` · `portability`

---

## Redundant Workflow Steps

- **TL-RW-1: Historical Note sections in handoff files conflate a workflow gate with a report artifact.**
  The Conversation File Freshness Pre-Replacement Check is a gate: "is the prior CR closed?" If yes, proceed. If no, stop. The check result does not need to be published in the handoff file that replaces the prior content — the very act of replacing the file is the evidence that the gate was passed. But the protocol (as I implemented it) required writing a `[Historical Note]` section into each handoff with the gate evidence. This section is discarded when the file is next replaced and serves no audit function because the replacement itself overwrites it. Backend (B-RW-1) and Frontend (separately) flagged the self-written-report version of this ceremony. The Tech Lead version creates three such notes across three handoff files per CR. The gate should be silent; only a failed gate (blocked write) should produce a visible artifact.
  - *Execution moment:* Writing three `[Historical Note]` sections sequentially — noticed the evidence formula was identical across all three and would be overwritten next CR.
  - `evolvability` · `collaboration`

- **TL-RW-2: Full adversarial re-read of `page.tsx` duplicated the planning read with no new information.**
  During CR-017 planning, I read `page.tsx` in full to confirm the current `<h3>` text and understand surrounding structure. The adversarial diff review re-read `page.tsx` in full. The only change was one string at line 134 — a change I had not made and could have confirmed by checking line 134 specifically. The protocol (tech-lead.md) says "adversarial diff review" but does not say "full file re-read required." For Frontend changes that are clearly contained (single-line copy change with no structural impact), the adversarial review could be: read only the changed line and its immediate context. The full file re-read adds time without surfacing anything a targeted read would miss.
  - *Execution moment:* Reading the full `page.tsx` adversarially — confirmed after reading that no new information was found relative to the planning read.
  - `collaboration`

---

## Other Observations

- **TL-OO-1: `nvm install 20` was required before `nvm use 20` — same gap as Backend B-OO-3.**
  When activating Node v20 for quality gate execution, `nvm use 20` failed because v20 was not installed (only v18.19.0 was available). I ran `nvm install 20` to download v20.20.0, then `nvm use 20`. `tooling-standard.md`'s recovery path says "Use `nvm use <documented-version>`" but doesn't address the case where the version isn't installed. Both Tech Lead and Backend encountered this independently in the same CR session — confirming it's a real, reproducible gap. The tooling-standard.md recovery path should read: "Use `nvm use <documented-version>` (or `nvm install <documented-version>` if not yet available)."
  - `portability`

- **TL-OO-2: BA evidence format in the closed requirements file uses absolute file paths that are machine-specific.**
  The system-reminder showed the BA updated `CR-017-small-backlog-fixes-and-runtime-alignment.md` with AC evidence formatted as `[file.ts](/home/kartik/Metamorphosis/LLM_Journey/app/api/...)`. The absolute path prefix (`/home/kartik/Metamorphosis/LLM_Journey/`) would break if the repository is cloned to a different machine or path. Project-relative paths (`app/api/adaptation/generate/route.ts:14`) are more portable and are the format used throughout other agent docs. This is a BA process observation, flagged from Tech Lead audit perspective.
  - `portability`

- **TL-OO-3: The "Assumptions To Validate" section in handoffs functioned as intended — confirmed by sub-agent reports.**
  Both sub-agent reports explicitly referenced the Assumptions sections and confirmed all three assumptions clean before implementation. Backend's meta-findings (B-OO-2) rated this section as "high-value and well-structured." This validates the CR-015/CR-016 handoff template improvement. The section converts implicit expectations into testable preconditions. Worth preserving as mandatory in both Backend and Frontend handoff templates. CR-016 doc hardening added it to the templates; this CR confirms it's working.

- **TL-OO-4: The plan's "Pre-Implementation Self-Check" table is the right tool for ownership classification, but it has no fall-through for unmatched directories.**
  When classifying `lib/utils/record.ts` in the Pre-Implementation Self-Check, the file didn't match any row in the ownership matrix (Backend `lib/security/**`, `lib/otel/**`, etc.; Frontend `lib/hooks/**`; Tech Lead direct not listed at all). The check table has no "else" branch. A "if not in any listed path, classify as Tech Lead direct and document rationale" rule would convert the fall-through from a judgment call into a defined behavior.
  - `evolvability`

---

## Lens Coverage (Mandatory)

- **Portability Boundary:** Several findings are cross-project patterns: the Write tool read-before-write constraint (TL-MI-1) affects any agent-based system using file replacement workflows; the spec-validation step between plan approval and handoff issuance (TL-EP-1) is a general coordination pattern; parallel delegation mode (TL-UI-1) and adversarial review scoping (TL-UI-2) are general multi-agent workflow concerns; the nvm install gap (TL-OO-1) is a portable dev environment setup pattern. Project-specific: `.env.example` split-AC pattern (TL-MI-3), Tech Lead direct zones (TL-CI-1), BA evidence path format (TL-OO-2).

- **Collaboration Throughput:** The primary serialization costs for Tech Lead are: (1) plan approval gate requires user interaction even for small, pre-confirmed scope CRs (TL-EP-2); (2) Pre-Replacement Check Historical Notes add write ceremony without durable value (TL-RW-1); (3) the spec-conflict propagation pattern (TL-CI-2, TL-RS-1) created one Backend deviation report cycle that could have been avoided with a handoff spec consistency check. The parallel delegation mode being undocumented (TL-UI-1) creates risk of unnecessary serialization if a future Tech Lead defaults to sequential delegation.

- **Evolvability:** The primary evolvability risks are: (1) four-location Node version embedding (TL-RI-2) creates synchronized edit cost; (2) `lib/utils/` ownership gap in the matrix (TL-RS-2) will recur with every new shared utility; (3) the plan template's missing test-code compatibility reminder (TL-MI-2) will cause the same module-caching spec conflict on the next CR that adds a module-level env constant; (4) Historical Notes in handoff files are overwritten each CR, making the evidence non-durable (TL-RW-1).

---

## Prior Findings: Assessment

**Backend Findings (META-20260225-CR-017-backend-findings.md):**

- B-CI-1 (Handoff test spec vs module-level constant contradiction) → **Extended** — The root cause is that my plan's Adjacent Risks section correctly identified the incompatibility and named the fix, but my handoff spec propagated the incorrect test code without applying the fix. The issue originates at the plan-to-handoff transition, not just in the handoff spec. See TL-CI-2, TL-RS-1, TL-EP-1.

- B-RI-1 (toRecord duplication mentioned in 4 places) → **Validated** — The natural consequence of the follow-up → CR → handoff pipeline. No structural fix available without changing how recommendations are closed in prior artifacts. Low-priority observation.

- B-RI-2 (Node runtime in 3 locations) → **Extended** — Tech Lead handoffs add a 4th location. See TL-RI-2.

- B-MI-1 (No guidance on testing module-level constants) → **Validated** — testing-strategy.md and development-standards.md are both silent on this. See TL-MI-2 for the plan-level fix angle.

- B-MI-2 (No dead-code removal verification strategy) → **Validated** — The handoff's instruction ("inspect the test file — no mock should return an array payload") is visual inspection. A `grep` for `generated_text` in the test file would be more systematic. Low-effort, low-risk improvement.

- B-MI-3 (.env.example update instruction discouraged verification) → **Extended** — from TL side, the split-AC pattern (TL-MI-3) is the root pattern. The "already done by Tech Lead" phrasing is a symptom of the undocumented split-AC ownership hand-off. Offering an explicit verification step ("confirm ADAPTATION_OUTPUT_MAX_CHARS is in .env.example") would close the gap without changing the split-AC model.

- B-UI-1 (Line numbers approximate, not anchored to function names) → **Validated** — For CR-017 sequential execution this was safe. For parallel execution with two agents modifying the same file, function-name anchors are safer. The handoff template should prefer function names as primary anchors with line numbers as supplementary hints.

- B-UI-2 (Sequential verification reason unstated) → **Extended** — The reason is: `node -v` must confirm compliant runtime before test results are meaningful (otherwise you may be running tests on the wrong Node version and falsely attributing passes). Once runtime is confirmed, `pnpm test`, `pnpm lint`, and `pnpm exec tsc --noEmit` are independent and could run in parallel. Stating the rationale explicitly would allow agents to apply judgment on whether strict sequential execution is required after the runtime check.

- B-RS-1 (Test infrastructure scope ambiguity) → **Validated** — The boundary between "implement delegated test" and "make test-infrastructure pattern decision" is undefined. This is a Tech Lead handoff quality responsibility: if the delegated test requires a specific infrastructure pattern (isolateModules), the handoff spec should name it. See TL-RS-1.

- B-RS-2 (`lib/utils/` not in Ownership Quick Matrix) → **Extended** — Applies to Tech Lead as well. See TL-RS-2, TL-CI-1.

- B-EP-1 (Module-level vs request-time env inconsistency) → **Validated** — Both routes use module-level for output cap constants but request-time for all other env reads (API URL, model ID, etc.). This inconsistency is a design decision that should be documented in `development-standards.md` or the Backend role doc so future contributors know which pattern to follow when adding new env vars.

- B-EP-2 (Dead-code assertion relies on negative evidence) → **Validated** — Visual inspection of mock data is adequate for this codebase's current scale but does not scale well. A coverage report showing zero hits on the removed branch would be positive evidence. This is a low-priority philosophical observation — coverage reporting is not currently in the verification pipeline.

- B-RW-1 (Pre-Replacement Check for self-written reports) → **Extended** — Tech Lead version creates three Historical Note sections per CR. The gate-vs-artifact conflation is the core issue. See TL-RW-1.

- B-RW-2 (Full context pre-load for tightly scoped handoffs) → **Validated** — Tech Lead pre-load is 9+ files for all CRs. A conditional clause for well-specified handoffs would reduce ceremony. Extended by TL-UI-2 (adversarial review scope is similarly over-broad for contained changes).

- B-OO-1 (Known Environmental Caveats section effective) → **Validated** — Sub-agent reports confirm the section worked. Positive signal for the CR-015/CR-016 template improvement.

- B-OO-2 (Assumptions To Validate section high-value) → **Validated** — See TL-OO-3.

- B-OO-3 (nvm install 20 not in recovery path) → **Extended** — Tech Lead encountered the same issue. Two independent confirmations in the same CR. See TL-OO-1.

- B-OO-4 (pnpm not on PATH after nvm switch) → **Validated** — Tech Lead also required the pnpm PATH workaround. This is environment-specific but the Known Environmental Caveats template guidance could mention it.

**Frontend Findings (META-20260225-CR-017-frontend-findings.md):**

- F-CI-1 (tsc --noEmit not in tooling-standard.md) → **Validated** — The four-gate pipeline (`test → lint → tsc → build`) is defined in `testing-strategy.md` as Tech Lead closure scope, not in `tooling-standard.md`. Role docs (frontend.md, backend.md) then selectively adopt sub-gates. The canonical source for all quality gate definitions should be `tooling-standard.md`, with role docs cross-referencing.

- F-RI-1 (Runtime preflight in 3 places) → **Extended to 4 locations.** See TL-RI-2.

- F-RI-2 (Aesthetic North Star in two places) → **Validated** — Not directly relevant to Tech Lead role for this CR. Low-priority doc duplication.

- F-MI-1 (No small/trivial CR fast-path) → **Validated** — CR-017's 1-line Frontend change traversed the same full-ceremony path as a major feature CR. The plan approval gate is the most impactful serialization point for truly trivial changes. Documenting a "copy-only / trivial" execution mode with reduced ceremony would improve throughput without safety regression.

- F-MI-2 (tsc trustworthiness on mismatched runtime) → **Extended** — From Tech Lead perspective: the Tech Lead quality gate run under compliant runtime (v20.20.0) is the authoritative pass. Sub-agent runs under mismatched runtime are indicative but not authoritative. The protocol should state this explicitly: "Tech Lead verification under compliant runtime is the authoritative quality gate; sub-agent results under mismatched runtime are advisory and classified as environmental."

- F-UI-1 (Pre-Replacement Check ownership ambiguity) → **Validated** — Frontend is correct that it's verifying (read-only) a Tech Lead artifact, not owning it. A one-line clarification ("The agent performing this check verifies, not owns, the plan artifact") removes the hesitation.

- F-UI-2 (copy-only mode undefined) → **Validated** — Worth defining as a formal execution mode with reduced ceremony obligations. Would also help Tech Lead when planning: knowing the execution mode at plan time would allow issuing a shorter/simpler handoff.

- F-RS-1 (Out-of-scope observation reporting path undefined) → **Validated** — The handoff template `[Scope Extension]` section was the intended landing spot but its name doesn't signal "future recommendations." A renamed or split section (`[Scope Extension]` + `[Out-of-Scope Observations for Next Priorities]`) would clarify.

- F-EP-1 (Ceremony-to-value ratio for small CRs) → **Validated** — The Tech Lead planning phase is the heaviest ceremony point proportionally. For CR-017's 1-line Frontend task, the plan + user approval loop consumed more artifact surface than the implementation. Acknowledged trade-off; should be documented as an explicit design choice.

- F-RW-1 (Preflight publication for copy-only handoffs) → **Validated** — Applies equally when Tech Lead performs the preflight check for its own direct changes. A conditional-preflight mechanism (Tech Lead marks "no-preflight-needed" for obviously-contained tasks) would help.

- F-RW-2 (Shared-component blast-radius always mandatory in report template) → **Validated** — The template should mark this section as `(if applicable)`.

- F-OO-1 (Assumptions To Validate section high-value) → **Validated** — See TL-OO-3. Confirmed working from both Tech Lead and Backend perspectives.
