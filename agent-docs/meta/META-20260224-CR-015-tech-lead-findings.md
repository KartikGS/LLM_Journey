# Meta Findings: Tech Lead — CR-015

**Date:** 2026-02-24
**CR Reference:** CR-015
**Role:** Tech Lead
**Prior findings reviewed:**
- `agent-docs/meta/META-20260224-CR-015-testing-findings.md`
- `agent-docs/meta/META-20260224-CR-015-frontend-findings.md`
- `agent-docs/meta/META-20260224-CR-015-backend-findings.md`

---

## Conflicting Instructions

- **"Follow `base-generate` exactly" vs. explicit spec divergences authored in the same handoff.**
  The Tech Lead authored both the "Pattern: Follow `app/api/frontier/base-generate/route.ts` exactly as the implementation template" framing and the itemized divergences (no `provider` field, local extraction function, no `ADAPTATION_OUTPUT_MAX_CHARS`). These are contradictory within the Tech Lead's own output. "Follow exactly" was intended as a structural shorthand, not a literal instruction, but the Backend Agent correctly identified the conflict because the divergences were specified as explicit overrides — implying the default is "exactly." The Tech Lead's handoff authorship process had no self-check for this contradiction. Correct framing: "Follow the structural and error-handling patterns of `base-generate` — deviations are itemized below and take precedence."

- **Wait State protocol says "Start a new session" for BA — but the existing BA session is reused.**
  The Tech Lead's Wait State output (issued after the BA handoff was written) instructed: "Start a new session and assign the BA Agent role to [instructions]." The user corrected this: the existing BA session that produced `ba-to-tech-lead.md` is resumed for the acceptance phase — no new session is needed. The Wait State template in `tech-lead.md` (or the protocol the Tech Lead applied) is factually wrong for the BA handoff case. A new session loses BA's accumulated CR context, prior project-log state, and keep-in-mind.md awareness. Resuming the existing session preserves it. The correct instruction is: "Resume the existing BA session and provide the `tech-lead-to-ba.md` handoff as input."

---

## Redundant Information

- **`node -v` runtime preflight now confirmed in (at least) four locations.**
  Testing identified `tooling-standard.md` + `testing.md`. Frontend confirmed `frontend.md`. Backend confirmed `backend.md` (with cross-reference to `tooling-standard.md`). The Tech Lead's own verification workflow (`tech-lead.md`, if it mentions the preflight) would make a fifth. The Testing Agent flagged two; the chain extended it to four. The cross-referencing in `backend.md` is the best current practice, but piecemeal: a complete fix requires `tooling-standard.md` to be declared canonical and all other files to remove the duplicated instruction, replacing it with a cross-reference. This is the highest-frequency duplication finding in the CR-015 meta chain.

---

## Missing Information

- **Handoff authorship: no self-check for "follow exactly" vs. explicit overrides.**
  When the Tech Lead writes a handoff with a pattern-reference instruction ("follow X exactly") and then lists divergences from that pattern, the two can be contradictory. No step in `tech-lead.md` or the handoff authorship protocol prompts the Tech Lead to verify internal consistency between the template reference and the itemized spec. The Backend findings surfaced three concrete divergences from the "follow exactly" framing in CR-015. A self-check prompt in the handoff authorship protocol: "If you've written 'follow [pattern] exactly', verify that no subsequent spec item contradicts 'exactly.'"

- **Test table spec: no row for the negative security assertion.**
  The Tech Lead authored the Backend test table (22 tests). The positive half of the security constraint — system prompt appears in the outgoing request body for `prompt-prefix` — was a required test row. The negative half — system prompt does NOT appear in any response field — was not. Backend's manual code audit confirmed the negative holds, but no automated test formalizes it. The Tech Lead's test table authorship process did not prompt for negative-assertion coverage of security invariants. A note in the handoff template or adversarial review checklist: "For each security constraint (data must/must not appear), include both the positive and negative assertion in the test table."

- **Handoff spec: compound validation error priority not specified.**
  The Tech Lead authored the Zod schema spec with two error codes (`invalid_strategy`, `invalid_prompt`) but did not specify priority when both fields fail in a single request. The Backend Agent made a judgment call ("strategy error wins"). If the Frontend relies on the error code for UX routing, a different priority choice creates a silent mismatch. The Tech Lead's schema spec should include: "When multiple fields fail validation, return `invalid_strategy` if strategy is invalid, otherwise `invalid_prompt`."

- **Handoff spec: output truncation — silence read as "omit" when intent was undefined.**
  `base-generate` applies `extractedOutput.slice(0, FRONTIER_OUTPUT_MAX_CHARS)` before returning output. The CR-015 Backend handoff said "follow exactly" but never mentioned output truncation — no `ADAPTATION_OUTPUT_MAX_CHARS`, no `.slice()`. The Backend Agent correctly omitted it (unspecified), and the Tech Lead noted it in the BA handoff as a follow-up recommendation. But "follow exactly" created genuine uncertainty, and the correct intent (no truncation for chat completions, which are more concise by design) was never documented. Explicit silence is needed: "No output truncation — chat completions format with instruct models produces bounded outputs. Omit the `FRONTIER_OUTPUT_MAX_CHARS` pattern."

- **Handoff spec: per-tab terminal label variants not specified.**
  The Frontend handoff specified everything about the terminal console (dark `bg-gray-900`, macOS dots, `$` prompt prefix, match `FrontierBaseChat` exactly) but was silent on per-tab label variants. `FrontierBaseChat` uses a static `frontier_base_output.txt`. With three strategy tabs, a per-tab label is required — the Frontend Agent correctly inferred `full_finetuning_output.txt`, `lora_peft_output.txt`, `prompt_prefix_output.txt`, and the Testing Agent was able to write assertions against these. But the Testing handoff's terminal label assertion strategy depended on the Frontend Agent's undocumented inference. A complete handoff spec would have declared the label pattern explicitly.

- **Asymmetric "Known Environmental Caveats" across handoffs — Tech Lead ownership.**
  The Testing handoff included: "System Node.js is v16.20.1 — use `nvm use 18`." The Frontend and Backend handoffs did not. All three agents faced the same environment. The Backend Agent discovered the mismatch independently. The Frontend Agent had pnpm refuse to run under v16 entirely. The Tech Lead had this information when writing all three handoffs — it was not discovered mid-execution. The omission from the Frontend and Backend handoffs was a Tech Lead authorship oversight, not a doc gap. The pattern to formalize: every handoff should include a "Known Environmental Caveats" section, populated by the Tech Lead from the project environment snapshot.

---

## Unclear Instructions

- **"No other data-testids are required beyond this list" — floor or prohibition?**
  The Frontend findings surfaced this. From the Tech Lead's authorship intent, "required" meant "these are the minimum required by the contract" — addition was permitted but must be documented. The phrase was ambiguous enough that "required" could also be read as "permitted." The Tech Lead's intended meaning was not encoded in the text. Unambiguous phrasing: "These 9 are the required minimum. Do not add others without documenting them in your completion report."

- **Adversarial diff review: "read each modified file against the ACs" — not formalized as a checklist.**
  `tech-lead.md` describes the adversarial diff review responsibility but does not provide a structured checklist of what to verify per file. The Tech Lead's CR-015 adversarial review was thorough (identified the output truncation gap, confirmed ADAPTATION_SYSTEM_PROMPT containment, verified all 9 testids) but relied on judgment about what to check. The residual risk (output truncation) was flagged but not treated as blocking. A standardized check list — at minimum: security invariants, contract compliance, scope boundary preservation, deleted files confirmed gone — would make the review more consistent across CRs and across Tech Lead instances.

- **Residual risk threshold in adversarial review: "flag in recommendations" vs. "block verification."**
  The Tech Lead identified the output truncation gap during adversarial review and documented it as a follow-up recommendation rather than requiring Backend to add a fix before quality gates. The adversarial review protocol has no documented threshold for distinguishing: (a) residual risk acceptable for this CR — flag in recommendations; from (b) residual risk requires remediation before this CR closes. The output truncation decision could have gone either way. A one-line heuristic would help: "Block if the gap creates a security or data-integrity risk. Flag as recommendation if it's a quality/performance trade-off."

---

## Responsibility / Scope Concerns

- **Quality gate fallback: Frontend Agent couldn't run verification — no protocol for this.**
  The Frontend handoff instructed the Frontend Agent to run `pnpm lint` and `pnpm exec tsc --noEmit`. Node v16.20.1 + pnpm incompatibility meant the Frontend Agent couldn't execute these. The Tech Lead ran all quality gates independently. But there is no documented protocol for: "what happens when a sub-agent cannot execute their verification step?" The Tech Lead's implicit assumption — "I'll run quality gates if sub-agents cannot" — is reasonable but undocumented. The protocol should state: "If a sub-agent reports inability to run verification commands due to environment constraints, the Tech Lead is responsible for running quality gates before issuing the BA handoff."

- **Contract registry update — ownership gap, Tech Lead handoff never triggers it.**
  The BA handoff (`tech-lead-to-ba.md`) documented 9 new `data-testid` contracts and noted 6 removed. The testing handoff scoped Testing work to `navigation.spec.ts` only. Neither the Tech Lead nor the Testing Agent handoff included an instruction to update `testing-contract-registry.md`. The Tech Lead's adversarial review step is the natural trigger point: when the review identifies contract changes, it should prompt the Tech Lead to add a registry update instruction to the Testing or BA handoff. Currently, registry maintenance has no process hook — it can only be caught by an agent who proactively checks the registry during their execution.

- **Pre-Replacement Check for parallel handoff issuance: no guidance on single-CR, multi-file case.**
  Before writing `tech-lead-to-frontend.md` and `tech-lead-to-backend.md`, the Tech Lead performed the Pre-Replacement Check for both. Both files contained CR-014 content. CR-014 closure was verified once (project-log "Completed" status). The protocol requires the check "before replacing" — applied literally, two files require two checks. But both files' prior content belonged to the same closed CR. No guidance says: "for multi-file handoff issuance within a single CR transition, verify closure once for the prior CR and apply to all files from that CR." The check was redundantly performed twice. A note in the protocol would reduce ceremony: "If replacing multiple handoff files all containing content from the same prior CR, one closure verification covers all."

---

## Engineering Philosophy Concerns

- **"Follow [pattern] exactly" as a handoff instruction is structurally unstable for evolving patterns.**
  The CR-015 Backend handoff used "follow `base-generate` exactly" as a shorthand for "follow the same structural and error-handling approach." But `base-generate` will continue to evolve (the project-log lists output cap and `toRecord()` extraction as future work). Any future route that uses "follow `base-generate` exactly" will inherit both the intentional patterns and the currently-deferred cleanup items. The philosophy issue: "follow exactly" conflates "adopt the pattern" with "copy the implementation" — two different intents. Handoffs should specify which aspect of the pattern is mandatory (structure, error handling) and which can be adapted (constants, truncation, provider config).

- **Tech Lead is sole author of test table specs — but has no automated feedback on coverage.**
  The Backend test table (22 tests) was authored entirely by the Tech Lead. Gaps (negative security assertion, compound validation priority) were only identified by the Backend Agent during implementation and surfaced in meta-findings. The Tech Lead has no mechanism during plan authorship to validate test table completeness against the security constraints and error codes specified in the same document. This is a structural gap: test coverage intent and spec completeness are validated only retrospectively (by the implementing agent or in meta-analysis), never prospectively (by the Tech Lead during authorship).

---

## Redundant Workflow Steps

- **Conversation File Freshness Pre-Replacement Check for files the Tech Lead always authors.**
  The Tech Lead performs the Pre-Replacement Check before replacing `tech-lead-to-frontend.md`, `tech-lead-to-backend.md`, and `tech-lead-to-testing.md`. For these files, the Tech Lead is always the author — no other agent writes to them. The risk profile the check guards against (replacing an active handoff mid-CR) is low for the issuing agent's own files: the Tech Lead knows which CRs are active. The check adds value when a file the Tech Lead is about to replace might contain content from a still-active CR. In CR-015, all three files contained CR-014 content, and CR-014 was clearly closed. The check was ceremonial. Per the Testing Agent's finding: the check is highest-value for files an agent *receives*; for files an agent *authors*, a simple "is the prior CR closed?" inline check would suffice.

- **Two-layer context pre-load: redundant confirmations when the handoff is self-contained.**
  The Tech Lead's pre-execution context load (Layer 1 + Layer 2 + role-specific required readings) involves 10+ files. For CR-015, the handoff-to-sub-agents was authored by the Tech Lead who had already done this load during planning. The verification phase (reviewing sub-agent reports, running adversarial diff) required reading sub-agent outputs and modified files — not the Layer 1 stack again. The pre-load is designed for a cold session; for a continued session, it's already loaded. The Backend Agent's finding about "two-layer context loading adds ceremony for well-specified handoffs" applies symmetrically to the Tech Lead's continued session: re-reading Layer 1 files in a resumed session adds no decision value.

---

## Other Observations

- **The `tech-lead-to-testing.md` write failed because the file was not read first — tooling constraint not documented.**
  The first attempt to write `tech-lead-to-testing.md` failed with a tool error: "File has not been read yet. Read it first before writing." This is a Claude Code tooling constraint (Edit/Write requires prior Read of existing files). The Tech Lead's workflow does not document this constraint, so the failed write was a surprise. The fix was immediate (read then write), but the delay was unnecessary. A note in the handoff issuance protocol: "Before replacing any existing file, read it first — even if content will be entirely discarded. This satisfies the tooling requirement for existing file writes."

- **The explicit "do NOT import from `base-generate/route.ts`" anti-pattern callout was high-value.**
  The Backend handoff's explicit prohibition on importing `extractProviderOutput()` from `base-generate` prevented a coupling that would have been a natural implementation choice. This mirrors the Frontend Agent's observation about "Do NOT render all three chat panels simultaneously" — explicit anti-pattern callouts in handoffs identify specific failure modes that a "follow the pattern" instruction cannot. Pattern-reference instructions produce correct structure; anti-pattern callouts prevent specific wrong implementations. Both are needed for complete handoff coverage.

- **Env vars section ("Already Added to .env.example") removed a class of conflict risk.**
  Including "Env Vars Already Added to .env.example — do NOT modify `.env.example`" in the Backend handoff was high-ROI. Without it, an agent following the `backend.md` rule ("Backend may add env vars introduced by the current CR scope") might have added them redundantly or overwritten Tech Lead content. This pattern — explicitly listing what the Tech Lead has pre-configured and instructing sub-agents not to repeat it — is applicable whenever the Tech Lead performs any file modifications that sub-agents might otherwise attempt independently.

- **Quality gate counts in DoD ("≥111 total tests") became outdated between planning and execution.**
  The Backend handoff DoD specified "pnpm test passes (≥111 total tests, no regressions)." After Backend implemented 22 new tests, the suite had 133 tests. The ≥111 lower bound was still satisfied, but the stated count was already stale relative to the actual pre-delegation baseline. For future CRs, the DoD test count should be stated as "≥ [current baseline at time of handoff issuance]" and updated to the exact count at handoff issuance time, not the pre-planning count.

---

## Prior Findings: Assessment

- **Testing: `testing.md` "publish" framing vs. `workflow.md` Freshness Rule** → **Validated and Extended** — `tech-lead.md` has the same gap: it instructs "write [handoff file]" without referencing the Freshness Rule or the Pre-Replacement Check. The Tech Lead discovered the Pre-Replacement Check requirement via `workflow.md` (Layer 1), not via the role doc. Symmetric miss risk across all role docs.

- **Testing: `node -v` duplicated in `tooling-standard.md` and `testing.md`** → **Extended** — Now confirmed in (at least) four locations: `tooling-standard.md`, `testing.md`, `frontend.md`, `backend.md`. The Backend version has a cross-reference; the others do not. Canonical-source declaration in `tooling-standard.md` with cross-references replacing duplicated text is the correct fix.

- **Testing: handoff did not instruct Testing Agent to update `testing-contract-registry.md`** → **Owned** — The gap originates in Tech Lead handoff authorship. The adversarial diff review step is the natural trigger for contract registry update instructions but did not prompt one. Fix requires a process hook in the adversarial review or BA handoff template.

- **Testing: runtime mismatch "classify environmental" doesn't say proceed or halt** → **Validated** — Tech Lead ran quality gates under v18 (below documented minimum of v20.x), made the pragmatic call to proceed, and reported it as a pre-existing environmental failure. The protocol was silent on the proceed/halt decision. Extended: the Tech Lead's judgment call was not documented in `tech-lead.md`, making it unrepeatable by a future Tech Lead instance facing the same condition.

- **Testing: `testing.md` does not reference Pre-Replacement Check** → **Validated** — Same gap in `tech-lead.md`. The Pre-Replacement Check is discoverable only via `workflow.md`. Symmetric across all role docs.

- **Testing: TEMPLATE referenced but not read** → **Not reproduced** — Tech Lead read `TEMPLATE-tech-lead-to-ba.md` before writing `tech-lead-to-ba.md`. The template and live file formats were consistent for this CR.

- **Testing: no explicit owner for `testing-contract-registry.md`** → **Validated** — The registry is not in the Tech Lead's required readings or adversarial review checklist. Ownership gap is cross-cutting; the Tech Lead is the most natural trigger point (adversarial review identifies contract changes) but the registry update is not assigned to any role's output checklist.

- **Testing: Pre-Replacement Check asymmetric ceremony for agent-written files** → **Validated** — The Tech Lead performed the check before all three handoff files. In all cases the prior CR was clearly closed. Ceremony cost was low; decision value was zero.

- **Testing: "Known Environmental Caveats" section added disproportionate clarity** → **Owned** — The Tech Lead included this in the Testing handoff but omitted it from the Backend and Frontend handoffs. All three agents faced the same environment. The asymmetry was a Tech Lead authorship oversight.

- **Frontend: `frontend.md` radiogroup rule vs. handoff "tab selector" terminology** → **Assessed** — The Tech Lead chose "tab" framing deliberately: switching between strategy panels is semantically a tablist pattern (panels of content with tab-key navigation to the panel). The `frontend.md` radiogroup rule applies to "exactly one option active" generally but does not carve out tablist as an exception for panel-switching controls. The Frontend Agent's choice of `role='tablist'` was correct for the interaction pattern. The gap is in `frontend.md`: the rule should acknowledge tablist as a valid single-select pattern for panel-switching, distinct from radiogroup for option-selection.

- **Frontend: no instruction to read referenced pattern component before implementing** → **Owned** — The Tech Lead handoff said "Pattern fidelity: must follow `FrontierBaseChat`'s visual and interaction pattern exactly" without saying "Read `FrontierBaseChat.tsx` before writing." The Frontend Agent made the right call; the handoff relied on good judgment. Fix: handoff template should include "Read referenced pattern components before implementing" as an explicit step when pattern fidelity is required.

- **Frontend: terminal console header label not specified for per-tab variants** → **Owned** — A complete handoff specification covering the terminal label was absent. The Frontend Agent's inferred naming convention (`full_finetuning_output.txt` etc.) was sound; the Testing Agent was able to write assertions against it. But the dependency was undocumented. Labeled as an authorship gap above.

- **Frontend: `animate-pulse` gray zone when fidelity + prohibition overlap** → **Assessed** — The prohibition in `frontend.md` is element-scoped ("background glows"). The `FrontierBaseChat` usages are on loading indicator text and cursor blink. No conflict exists at the implementation level. The handoff could have explicitly noted: "`FrontierBaseChat`'s `animate-pulse` usages (loading indicator, cursor blink) are permitted — they serve state communication, not decoration." Absence of explicit permission creates a gray zone but not a real conflict.

- **Frontend: "no other data-testids required" — floor or prohibition?** → **Owned** — Ambiguous wording authored by the Tech Lead. Labeled as an authorship gap above. Unambiguous phrasing identified.

- **Frontend: file deletion vs. editing — reversibility not flagged in handoff** → **Assessed** — The handoff's explicit "Files to Delete" section is sufficient authorization. The reversibility principle in `workflow.md` applies to architectural decisions, not individual file operations. However, the adversarial review checklist could include "confirm deleted files are gone and no import references remain" as an explicit step — which the Tech Lead did perform (confirmed in BA handoff), but without a protocol prompt.

- **Backend: "follow exactly" vs. explicit divergences** → **Owned** — Labeled as a conflicting instruction above. The Tech Lead's own authorship process had no self-check for this contradiction.

- **Backend: outer catch sentinel StrategyId type constraint** → **Validated** — The type-level structural difference between `base-generate`'s unconstrained string and `adaptation`'s `StrategyId` union was not anticipated in the handoff. The Backend Agent's judgment call (`'full-finetuning'` as sentinel) was reasonable. A handoff note would have removed the uncertainty.

- **Backend: compound validation failure priority** → **Owned** — Labeled as missing information above.

- **Backend: output truncation omitted from "follow exactly" handoff** → **Owned** — Labeled as missing information above.

- **Backend: no negative security assertion test** → **Owned** — Labeled as missing information above.

- **Backend: verification scope reconciliation (`backend.md` default vs. handoff DoD)** → **Validated** — The Tech Lead's DoD used "pnpm test" (full suite) without explicitly invoking the `backend.md` exception clause. An agent must actively reconcile the role doc default against the DoD. The Tech Lead could make the override explicit: "DoD requires full suite — this overrides the `backend.md` scoped-spec default per the Exception clause."

- **Backend: scope gate for new file creation trivially satisfied** → **Validated** — No decision value for creation scenarios. The scope gate should be narrowed to modification scenarios where ownership is non-obvious.

- **Backend: no Known Environmental Caveats in Backend handoff** → **Owned** — Tech Lead authorship oversight. All agents faced the same environment; the asymmetry was a Tech Lead error.

- **Backend: env vars section was high-value friction removal** → **Validated** — The "Already Added to .env.example" section pattern is worth formalizing in the Backend handoff template.
