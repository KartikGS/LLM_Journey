# Meta Findings: Backend — CR-015

**Date:** 2026-02-24
**CR Reference:** CR-015
**Role:** Backend Agent
**Prior findings reviewed:** `agent-docs/meta/META-20260224-CR-015-testing-findings.md`

---

## Conflicting Instructions

- **"Follow `base-generate/route.ts` exactly as the implementation template" vs. explicit spec divergences in the same handoff.**
  The handoff opened with "Pattern: Follow `app/api/frontier/base-generate/route.ts` exactly as the implementation template" and then itemized at least three places where the adaptation route deliberately deviates: (a) no `provider` field in config (base-generate supports `openai | huggingface`; adaptation is always chat completions), (b) a local extraction function instead of reusing `extractProviderOutput()` ("implement a local extraction function — do NOT import from `base-generate/route.ts`"), and (c) no output truncation constant (`base-generate` has `FRONTIER_OUTPUT_MAX_CHARS = 4000` and applies `.slice()` before returning live output — the adaptation handoff never mentions this). "Follow exactly" and "implement a local extraction function" are not compatible instructions. I resolved each divergence by treating the specific item spec as overriding the "follow exactly" framing, but each required a judgment call. "Follow the structure and error-handling patterns of" would be a more accurate instruction.

---

## Redundant Information

- **`node -v` runtime preflight is now in three locations, not two.**
  The Testing Agent identified the same rule in `tooling-standard.md` and `testing.md`. From the Backend perspective, it also appears in `backend.md` (Checklist item: "Did I run `node -v` before verification commands and confirm runtime is Node ≥ 20.x per `tooling-standard.md`?"). The `backend.md` version cross-references `tooling-standard.md`, which is better than the undeclared duplication in `testing.md`, but three locations with varying phrasing still represent drift risk. If the minimum version changes from 20.x to 22.x, two locations would need updating even with the cross-reference approach.

---

## Missing Information

- **Outer catch sentinel strategy: TypeScript strict mode breaks the `base-generate` "follow exactly" pattern.**
  `base-generate`'s outer catch uses `'frontier-base-unknown'` as the sentinel modelId — a plain string, unconstrained. The adaptation route's `createFallbackResponse()` takes a `StrategyId` parameter (TypeScript enum constraint: `'full-finetuning' | 'lora-peft' | 'prompt-prefix'`). The template's pattern cannot be followed literally because an arbitrary string is not a valid `StrategyId`. I chose `'full-finetuning'` as the sentinel with no doc guidance. The handoff said "Follow `base-generate` exactly" but gave no instruction for this type-level structural difference. A note in the handoff or the base-generate template annotation ("outer catch uses sentinel value X — for typed routes, use the first enum value") would remove this judgment call entirely.

- **Compound validation failure priority (`invalid_strategy` vs `invalid_prompt` when both are invalid).**
  The handoff specifies two distinct error codes: `invalid_strategy` for bad strategy and `invalid_prompt` for bad prompt. It does not specify which code takes priority when both `prompt` and `strategy` fail in a single request (e.g., `{ prompt: '', strategy: 'not-a-strategy' }`). Zod's `safeParse` returns all issues simultaneously. I implemented "strategy error wins" (check `issues.some(i => i.path.includes('strategy'))` first) but this choice was arbitrary. If the frontend relies on the error code to display specific guidance, a different priority order could cause a UX mismatch. The handoff should specify: "If multiple fields are invalid, return `invalid_strategy` if strategy is invalid, otherwise `invalid_prompt`."

- **Output truncation (`FRONTIER_OUTPUT_MAX_CHARS`): carried forward or omitted?**
  `base-generate/route.ts` applies `extractedOutput.slice(0, FRONTIER_OUTPUT_MAX_CHARS)` before returning live output. The adaptation handoff said "Follow `base-generate` exactly" but never mentioned output truncation — no `ADAPTATION_OUTPUT_MAX_CHARS` constant, no `.slice()` instruction. I omitted it because it wasn't specified, but "follow exactly" created genuine uncertainty. If the adaptation models can return very long outputs (the LLaMAntino model is a 8B instruct model — verbosity is plausible), the absence of truncation could produce unexpectedly large response payloads. Whether to apply truncation is a product decision; the handoff should explicitly state "no output truncation" or specify the limit.

- **No instruction for verifying the negative security assertion (response does NOT contain system prompt).**
  The handoff's security constraint states: "The system prompt string must NOT appear in any response payload field, log message, or span attribute." The test table covers the positive half (Test: "System prompt injection — prompt-prefix": verify request body INCLUDES system message). There is no prescribed test for the negative half: verify that the response JSON returned to the client does NOT contain the system prompt string. I audited the code path manually and confirmed the system prompt is only used in `buildMessages()` to construct the outgoing provider request — it never touches response construction. But no test formalizes this. A missing test row: "Verify response payload does not contain ADAPTATION_SYSTEM_PROMPT string."

---

## Unclear Instructions

- **Verification scope default in `backend.md` vs. full suite in handoff DoD — requires active reconciliation.**
  `backend.md` states: "Verification scope: run the scoped spec file (`pnpm test <spec-file>`) to confirm new tests pass before reporting. Full-suite verification is the Tech Lead's responsibility. **Exception**: when the active handoff's DoD explicitly requires full-suite verification from Backend, run full suite." The handoff DoD specifies "`pnpm test` passes (≥111 total tests, no regressions)" — which is full suite. To know the exception applies, an agent must: (a) read the `backend.md` default, (b) read the DoD carefully enough to recognize `pnpm test` = full suite, (c) mentally map the DoD requirement onto the `backend.md` exception clause. This three-step reconciliation works but is fragile. An agent reading `backend.md` first and internalizing "run scoped spec" as the rule might miss the exception even after reading the DoD. The role doc could be clearer: "Check the handoff DoD first; if it specifies `pnpm test` (full suite), that overrides this default."

---

## Responsibility / Scope Concerns

- **The security constraint "system prompt must not appear in response" is owned by neither Backend tests nor Testing E2E tests.**
  The Backend test table (delegated in the handoff) covers system prompt injection (positive assertion: it appears in the outgoing request). The Testing handoff scoped E2E work to `navigation.spec.ts`. Neither agent's test table includes the negative assertion: "response payload received by the client does not contain ADAPTATION_SYSTEM_PROMPT." This security invariant is currently enforced only by Backend's manual code review. If a future refactor accidentally surfaced the system prompt in a response field, no automated test would catch it. Ownership should be explicitly assigned — most naturally to Backend's unit test scope since it requires intercepting and inspecting the mocked response object.

---

## Engineering Philosophy Concerns

- **Deterministic fallback text is coupled to agent handoff docs, with no in-code traceability.**
  The `FALLBACK_TEXT` record in `route.ts` uses exact string literals specified in the handoff document. The test file duplicates the same strings (`const FALLBACK_TEXT = { ... }`) to verify exactness. There is no comment in the route file or test file indicating that these strings are governed by the handoff spec and must not be paraphrased. If a future developer rewrites the fallback for copyediting reasons (e.g., fixing a typo or rewording), the test will catch it — but they may not understand why the test cares about exact wording. A code comment linking to the spec origin would make the constraint self-documenting: `// Exact strings per CR-015 handoff — do not paraphrase.`

- **Sentinel strategy in outer catch is an undocumented unreachability assumption.**
  The outer catch handler uses `'full-finetuning'` as the strategy for `createFallbackResponse()`. This is only semantically acceptable if the outer catch is genuinely unreachable in practice (i.e., all error paths are handled by inner try-catch blocks). This assumption is correct but undocumented — a future developer adding a new code path inside the span callback that could throw an unhandled exception would receive a `'full-finetuning'`-attributed fallback regardless of what strategy was requested. The `base-generate` equivalent uses `'frontier-base-unknown'` as an obviously-sentinel string. A comment at the outer catch site — `// safety net: strategy may not be in scope; 'full-finetuning' is a sentinel for unreachable paths` — would communicate the intent.

---

## Redundant Workflow Steps

- **Scope gate check for new file creation is trivially satisfied but mechanically required.**
  `backend.md` Scope Gate (Mandatory Before Editing) requires: "Confirm every target file in the handoff is within Backend ownership or explicitly delegated." For `app/api/adaptation/generate/route.ts` — a new file that doesn't yet exist — there is no existing ownership to confirm. The directory path (`app/api/**`) implies Backend ownership per the Ownership Quick Matrix. The check adds no decision value for creation scenarios; it is designed for modification scenarios where a file might belong to Infra or Frontend. The scope gate instruction could clarify: "For new file creation, confirm the target directory is within Backend ownership per the Ownership Quick Matrix."

- **Two-layer context loading when the handoff is self-contained.**
  Before touching any implementation, I loaded 7 files (general-principles, project-principles, reasoning-principles, tooling-standard, technical-context, workflow, backend.md) before reading the handoff. The CR-015 handoff is unusually well-specified: it re-states every constraint (response shape, OTel pattern, env vars, fallback structure, test template reference) directly. In practice, every decision made during implementation was answerable from the handoff alone. The Layer 1 + Layer 2 pre-reads served as guardrails, but for this CR added ~7 confirmatory reads with no novel decision value. This is a structural cost that pays off for ambiguous handoffs and provides no return for well-specified ones. Not a recommendation to remove the requirement — but it suggests that handoff quality directly determines the value-to-ceremony ratio of the pre-load phase.

---

## Other Observations

- **The Backend handoff lacked the "Known Environmental Caveats" section present in the Testing handoff.**
  The Testing Agent's handoff explicitly stated "System Node.js is v16.20.1 — use `nvm use 18`." The Backend handoff did not include this guidance. Both agents encountered the same environment (Node v16.20.1, pnpm requires v18.12+, nvm has v18.19.0). The Testing Agent was pre-diagnosed; the Backend Agent had to independently discover the nvm path, check `~/.nvm/versions/node/`, source `nvm.sh`, and verify pnpm worked. The environmental friction was identical; the pre-diagnosis was asymmetric. If the Tech Lead adds "Known Environmental Caveats" to the Testing handoff template, the same section should appear in the Backend handoff template. Alternatively, document the nvm recovery path in `tooling-standard.md` as an explicit example so any agent can follow it without handoff-specific guidance.

- **The "Env Vars Already Added to .env.example" section in the handoff was high-value friction removal.**
  By explicitly stating which env vars had already been added by the Tech Lead, the handoff eliminated a potential ambiguity: should Backend add them, or were they already there? Without this section, an agent following the "Backend may add env vars introduced by the current CR scope" rule in `backend.md` might have added them redundantly (or worse, overwritten Tech Lead content). Proactively listing which env vars are pre-configured — and making the "do NOT modify `.env.example`" instruction explicit — is a pattern worth formalizing in the Backend handoff template.

- **`TEMPLATE-backend-to-tech-lead.md` was read directly before writing the report (positive outcome).**
  Unlike the Testing Agent's experience (TEMPLATE referenced but not read; format inferred from the live report), I read `TEMPLATE-backend-to-tech-lead.md` as part of initial context loading alongside `backend-to-tech-lead.md`. The template and live file formats were consistent for this CR. This confirms the Testing finding's concern is valid as a risk (divergence is possible over time) even when it didn't produce friction in this specific instance.

---

## Prior Findings: Assessment

- **Testing: "Conflicting Instructions — `testing.md` Preflight publish vs `workflow.md` Freshness Rule"** → **Validated** — Backend encountered the identical issue when replacing `backend-to-tech-lead.md`. `backend.md` also says nothing about the Conversation File Freshness Rule; it was discovered only via Layer 1 (`workflow.md`). The miss risk is symmetric across Backend and Testing roles.

- **Testing: "Redundant Information — `node -v` in `tooling-standard.md` and `testing.md`"** → **Extended** — The same runtime preflight requirement is also in `backend.md`'s checklist, making it three locations total. The `backend.md` version includes a cross-reference to `tooling-standard.md`, which is marginally better structured, but three-location duplication still presents drift risk.

- **Testing: "Missing Information — contract registry not updated after CR-015"** → **Validated with lower confidence** — Backend does not own or interact with `testing-contract-registry.md` (it's not in Backend's file scope). The gap was visible in the handoff (no instruction to update the registry) but Backend had no execution friction from it. The ownership gap described by Testing is accurate; Backend cannot extend it from direct experience.

- **Testing: "Missing Information — runtime mismatch 'classify environmental' doesn't say proceed or halt"** → **Extended** — Backend faced this without the explicit handoff directive that Testing received (`nvm use 18` was in Testing's handoff but not Backend's). I discovered v16 was insufficient, found v18 via nvm, and proceeded. However, v18 is still below the documented minimum of v20.x — the recovery path in `tooling-standard.md` says "use `nvm use <documented-version>`" meaning v20, not v18. I used v18 because it was the only nvm version available and tests ran successfully. The judgment call was: "v18 is below minimum but above pnpm's requirement and tests pass — is this proceed or halt?" The protocol did not answer this.

- **Testing: "Missing Information — `testing.md` does not reference Pre-Replacement Check"** → **Validated** — `backend.md` likewise does not mention the Pre-Replacement Check. Agents reading only their role doc would not know to perform it. It was discoverable only via `workflow.md` (Layer 1). Symmetric gap.

- **Testing: "Unclear Instructions — TEMPLATE referenced but not read"** → **Partially mitigated in Backend execution** — I read the TEMPLATE directly as part of context loading and confirmed format consistency with the live file. The concern about potential format drift over time is valid, but Backend execution did not surface it as active friction. The underlying risk the Testing Agent identified (TEMPLATE and live file can diverge silently) remains accurate.

- **Testing: "Responsibility — no explicit owner for `testing-contract-registry.md`"** → **Validated** — From Backend's perspective, this is outside scope entirely. The registry's ownership gap is real; Backend has no mechanism to flag or contribute to it.

- **Testing: "Redundant Workflow Steps — Pre-Replacement Check asymmetric ceremony cost for agent-written files"** → **Validated** — Backend performed the same check before replacing `backend-to-tech-lead.md`. The prior file had `status: completed` and the plan artifact existed. The two reads added no decision value. The distinction Testing proposes (received handoffs vs. written reports) maps cleanly to Backend's experience.

- **Testing: "Other Observations — Known Environmental Caveats in handoff reduced friction"** → **Extended** — Backend's handoff lacked this section, creating the asymmetry noted above. The Testing Agent benefited from it; the Backend Agent did not. This makes the observation more actionable: the section's value is confirmed by its absence in the Backend case.
