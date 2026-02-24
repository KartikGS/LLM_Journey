# Meta Findings: Testing — CR-015

**Date:** 2026-02-24
**CR Reference:** CR-015
**Role:** Testing Agent
**Prior findings reviewed:** none (first agent in CR-015 meta chain)

---

## Conflicting Instructions

- **`testing.md` "Preflight" framing vs `workflow.md` Conversation File Freshness Rule.**
  `testing.md` says: "Before writing or modifying tests, publish a short Preflight note in `/agent-docs/conversations/testing-to-tech-lead.md`." The word "publish" implies writing *to* an existing file. `workflow.md` requires *replacing* the file's contents for every new CR. These instructions create two plausible readings: (a) append the preflight to the existing CR-012 content, or (b) replace the file entirely and begin with the preflight. I resolved it by applying `workflow.md` (replacement), which required the Pre-Replacement Check first. An agent reading only `testing.md` could reasonably choose (a) and silently accumulate stale CR-012 content. Neither file acknowledges the other's instruction in this context.

---

## Redundant Information

- **`node -v` runtime preflight duplicated in two files without a declared canonical source.**
  `tooling-standard.md` (Runtime Preflight section) and `testing.md` (Runtime Preflight section) both independently state: "Run `node -v` once per execution session before verification commands." The wording is nearly identical. There is no cross-reference declaring which is canonical. If one is updated (for example, to add a minimum version check command), the other will silently drift. Canonical location should be declared once and cross-referenced.

---

## Missing Information

- **The handoff did not instruct the Testing Agent to update `testing-contract-registry.md`, leaving it stale after CR-015.**
  `testing-contract-registry.md` is listed in `testing.md` as Required Reading ("Contract Baseline"). After CR-015, six `data-testid` entries in the registry are removed (`adaptation-interaction`, `adaptation-strategy-selector`, `strategy-button-*`, `adaptation-interaction-output`) and nine new ones are added. The handoff scoped work to `navigation.spec.ts` only. No instruction appeared to update the registry. I did not update it because it was out of scope, but no process flagged this gap — the registry is now stale relative to the deployed contracts. The Testing Handoff Trigger Matrix in `workflow.md` identifies when a Testing handoff is required, but does not mention contract registry updates as an output.

- **Runtime version mismatch handling: "classify as environmental" does not answer "proceed or halt?"**
  `testing-strategy.md` says: "classify any version mismatch against `tooling-standard.md` as `environmental`." This describes how to label the mismatch in a report. It does not state whether the agent may proceed under the mismatched runtime or must halt and wait for a conformant environment. In this CR, the handoff explicitly prescribed `nvm use 18`, which resolved the judgment call. Without that explicit directive, an agent would face: "I've classified v18 as environmental mismatch — do I continue or is this a blocker?" The protocol is silent on the answer.

- **`testing.md` does not reference the Conversation File Freshness Pre-Replacement Check.**
  The Pre-Replacement Check (from `workflow.md`) requires confirming the prior CR is closed before replacing `testing-to-tech-lead.md`. This check is non-trivial: it requires reading two artifacts (`plans/CR-XXX-plan.md` existence + outgoing file closure signal). `testing.md` does not mention this check at all. An agent reading only their role doc (as prescribed by the two-layer structure) would not know to perform it. The check was only discoverable via Layer 1 (`workflow.md`), which is fine architecturally, but the absence of a cross-reference in `testing.md` increases miss risk.

---

## Unclear Instructions

- **TEMPLATE-testing-to-tech-lead.md is referenced as canonical but never read.**
  `testing.md` states: "Use `agent-docs/conversations/TEMPLATE-testing-to-tech-lead.md` as the canonical report structure." During execution, I globbed the TEMPLATE path (confirmed it exists), then read `testing-to-tech-lead.md` (the live CR-012 report) to infer format, and never read the TEMPLATE file directly. The live file's format and the template file's format may diverge over time; using the live file as a format reference silently propagates any prior deviations. The instruction to "use the TEMPLATE" would be more actionable if the role doc said "read the TEMPLATE before writing your report."

---

## Responsibility / Scope Concerns

- **No explicit owner for keeping `testing-contract-registry.md` current across CRs.**
  The registry lists durable `data-testid` and route contracts. `testing-strategy.md` says "Prefer documenting durable route/selector/semantic contracts in `agent-docs/testing-contract-registry.md`" but there is no explicit ownership assignment in `testing.md` or `workflow.md`. It is not in the Testing Agent's Ownership list (`testing.md` Boundaries section lists `/__tests__/**`, `/agent-docs/testing-strategy.md`, `/playwright.config.ts`). Registry updates could silently be missed whenever a CR changes contracts but scopes the Testing handoff narrowly to spec-file changes only (as CR-015 did).

---

## Engineering Philosophy Concerns

- **`@critical` tag definition and rewritten test scope are misaligned — no re-evaluation process exists.**
  `testing-strategy.md` defines `@critical` as: "Tests that must pass for any deployment (e.g., model generation)." The example implies complex, high-value, externally-dependent behavior. The rewritten Test 2 asserts synchronous client-side tab-switching (a React `setState` call updating a terminal label string). This is meaningful but significantly simpler than the `@critical` definition's intent. The handoff explicitly prescribed preserving `@critical`, so I followed it without flagging — but the handoff's "If you believe the new test cannot be marked `@critical`, flag it in the report" clause is effectively an invitation to capture this tension. There is no documented process for reviewing tag applicability when a test is substantively rewritten. The tag will persist indefinitely unless a future agent explicitly reconsiders it.

---

## Redundant Workflow Steps

- **Pre-Replacement Check for agent-written output files has asymmetric ceremony cost.**
  The Conversation File Freshness Pre-Replacement Check was designed to protect against replacing active handoff files mid-CR (high value: prevents lost task context). Applied to `testing-to-tech-lead.md` — a file the Testing Agent itself writes, never receives — the risk profile is lower. The prior CR-012 content in that file was already complete (`[Ready for Next Agent]: yes`), and the Testing Agent has no conflicting writes from other roles. Performing the check required reading `plans/CR-012-plan.md` and `requirements/CR-012-*.md` to confirm closure — two reads that added no decision value in this case. The rule could be narrowed: Pre-Replacement Check is mandatory for files the agent *receives* (handoffs); for files the agent *writes* (reports), a simpler "prior CR complete?" inline check would suffice.

---

## Other Observations

- **The handoff's "Known Environmental Caveats" section added disproportionate clarity.**
  The explicit statement "System Node.js is v16.20.1 — use `nvm use 18`" in the handoff resolved a judgment call that the Testing Agent protocol alone could not resolve. This kind of runtime pre-diagnosis in the handoff (rather than leaving runtime discovery to the Testing Agent) meaningfully reduced friction. This pattern — Tech Lead pre-diagnosing known environmental constraints before handoff issuance — is worth formalizing in the handoff template if it isn't already.

- **Sandboxed E2E run was not attempted before local-equivalent.**
  The E2E Triage Ladder in `testing-strategy.md` says step 1 is "Re-run with the exact handoff command (no substitutions)." I went directly to local-equivalent execution (with `nvm use 18`) because the handoff proactively flagged sandboxed execution as environmentally bound to fail. Since all tests passed on the first local-equivalent run, no triage was needed. But strictly, the ladder was not followed in order. The handoff's environmental pre-diagnosis effectively short-circuited the triage ladder — whether that's a feature or a protocol deviation depends on whether the ladder is advisory or mandatory when tests pass on the first run.
