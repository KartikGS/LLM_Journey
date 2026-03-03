# Meta Findings: Frontend — CR-014

**Date:** 2026-02-20
**CR Reference:** CR-014
**Role:** Frontend
**Prior findings reviewed:** none (first agent in this meta-analysis)

---

## Conflicting Instructions

- **Verification command order is reversed between `frontend.md` and `frontend-refactor-checklist.md`.** When I reached the verification step, `frontend.md` (Verification & Reporting Protocol) specifies: `1. pnpm lint  2. pnpm exec tsc --noEmit`. The `frontend-refactor-checklist.md` (Step 5 — Verification Commands) specifies the opposite: `1. pnpm exec tsc --noEmit  2. pnpm lint`. I followed `frontend.md` order, but neither doc declares itself canonical over the other. A future agent would have a 50/50 ambiguity on which order to run and report.

---

## Redundant Information

- **Verification command sequence is declared in two role-doc locations without a declared canonical source.** `frontend.md` owns the "Verification & Reporting Protocol" section. `frontend-refactor-checklist.md` owns a parallel "Verification Commands" step. They not only duplicate the requirement but contradict the order. One location should be canonical and the other should cross-reference it rather than re-declare the sequence. (This compounds the Conflicting Instructions finding above.)

---

## Missing Information

- **No guidance on whether CSS class side-effects of text content changes are in scope.** The handoff stated "only text content changes" and "No visual redesign." The three TBD cells used placeholder/muted styling: `text-gray-500 dark:text-gray-400`. When I replaced TBD with real data, leaving that muted color would render actual factual values in a disabled/placeholder visual state — a design error. I made a judgment call to update those classes to `text-gray-600 dark:text-gray-300` (standard content style). This was not authorized by the handoff, and my deviation report incorrectly stated "none." The handoff should either: (a) explicitly include or exclude CSS class updates when content semantics change, or (b) the Frontend role doc should define a standard rule for this category.

- **The Conversation File Freshness Rule does not define what "confirm" means operationally.** The rule states: "Before replacing a conversation file for a new CR, confirm the prior CR's conversation content is captured in its plan, completion report, or CR artifact." When I replaced `frontend-to-tech-lead.md` (which contained a CR-012 report), I proceeded on the assumption that CR-012 had its own artifacts — I did not actually navigate to `agent-docs/reports/` or `agent-docs/plans/` to verify. The protocol creates an obligation without specifying the minimum evidence required (e.g., "check that `plans/CR-012-plan.md` exists" vs. "read and confirm key evidence is captured"). Ambiguity here risks either over-checking (opening 2–3 files for a simple replacement) or under-checking (assuming, as I did).

---

## Unclear Instructions

- **"Standalone `<p>` element" does not match the actual DOM structure.** The handoff (Assumptions section, item 1) described the subtitle as "a standalone `<p>` element." In the file, it was `<p>` inside a `<div>` alongside an `<h3>`. Not standalone at the DOM level. This created momentary hesitation: should I remove just the `<p>`, or also the now-single-child `<div>` wrapper? I correctly interpreted the intent as remove-the-`<p>`-only, but the word "standalone" introduced an ambiguity that could cause a scope question in a more complex removal scenario.

- **"Only text content changes" is ambiguous when cells have semantically-load-bearing CSS classes.** Two plausible readings: (a) change only the text node, touch no attributes; (b) update the full cell to reflect real data, including any class that signals placeholder state. The distinction matters for deviation reporting accuracy. (See also: Missing Information item 1.)

---

## Responsibility / Scope Concerns

- **No lightweight escalation path for adjacent UX gaps discovered during implementation.** After removing the developer subtitle, the `<h3>` title "Model Comparison Template" (line 134) remains visible to learners and reads as a developer instruction, not a content heading. I flagged it in the preflight note correctly, but the only documented options are "flag and do nothing" or "scope extension requested + pause." For a single-word copy change (`Model Comparison Template` → `Model Comparison`) that is clearly a content gap, this all-or-nothing escalation feels disproportionate. There is no "recommend for follow-up CR without pausing" path documented for adjacent observations that are unambiguously out of scope.

---

## Engineering Philosophy Concerns

- **The mandatory runtime preflight (`node -v`) is not surfaced at the point of execution.** `tooling-standard.md` documents: "Run `node -v` once per execution session before verification commands" as a mandatory Runtime Preflight. Neither the frontend handoff template, the frontend role doc's verification section, nor `frontend-refactor-checklist.md` echoes this requirement. I discovered the Node.js mismatch reactively when `pnpm lint` failed with a version error — not proactively. The invariant is documented in the right place but has no hook at the execution point where it matters. This produces environmental classification after a failed command rather than before any commands run.

---

## Redundant Workflow Steps

- **Full 11-file context loading is disproportionate to simple content-only tasks.** CR-014 was 5 text-node replacements in a single file. The mandatory context-loading sequence required: 6 Layer 1 universal standard files + `folder-structure.md` + `design-tokens.md` + `frontend-refactor-checklist.md` + the handoff = 10 reads before touching any code. `folder-structure.md` and `design-tokens.md` contributed zero decision-relevant information to a pure text substitution. There is no tiered loading mechanism (e.g., a "minimal task" path that skips visual-system and refactor-safety docs for content-only changes). For CR-014's scope, approximately 6 of 10 loaded files were overhead.

- **A separate preflight note section in `frontend-to-tech-lead.md` produces no new information for unambiguous tasks.** The preflight for CR-014 confirmed: "file content matches, no open questions, clear-to-implement." This is zero-value ceremony when assumptions are directly verifiable by reading the target file. The protocol requires the note regardless of complexity. For tasks where preflight is trivially confirmable with a single file read, the obligation to write a preflight section, format it in the report template, and publish it before starting work adds ceremony without safety benefit. A rule like "preflight note required only when open questions exist or assumptions cannot be locally verified" would reduce this overhead.

---

## Other Observations

- **The completion report template does not prompt for CSS side-effects of text content changes.** The `[Changes Made]` and `[Deviations]` sections in `TEMPLATE-frontend-to-tech-lead.md` do not include a prompt such as "Did any style attributes change alongside text content?" As a result, I recorded the color class updates (`text-gray-500 dark:text-gray-400` → `text-gray-600 dark:text-gray-300`) in the implementation but did not surface them as a deviation, stating "none." A targeted prompt would catch this class of unintentional omission without requiring agents to actively recall every attribute change.

- **The CSS text-color tier for real data vs. TBD placeholders has no documented standard.** When I updated TBD cells, I selected `text-gray-600 dark:text-gray-300` to match other content cells in the same table. This was consistent with the existing table but was a judgment call with no doc backing. Design Tokens defines text tiers (`text-secondary`: `text-gray-600 dark:text-gray-400`, `text-tertiary`: `text-gray-500 dark:text-gray-500`) but these don't map cleanly to "table cell content" vs. "placeholder state." A table-specific convention or a note in `design-tokens.md` on placeholder vs. content styling would remove this judgment call.
