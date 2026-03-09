# LLM Journey — Agent-Docs Guide

This document explains why each significant file and folder in `a-docs/` exists: its purpose, what it owns, what would break if it were removed, what must not be consolidated with it, and who reads it.

It is Curator context. It is not required reading for all agents. Other agents use the index (`$LLM_JOURNEY_AGENTS` → `$LLM_JOURNEY_INDEXES`) to find files and their role docs to understand what to read.

---

## Root-Level Files

### `agents.md` — `$LLM_JOURNEY_AGENTS`

**Why it exists:** Every agent session starts here. It is the universal entry point: orientation, reading protocol, role index, authority hierarchy, and FAQ. Without it, agents have no shared starting point and no way to know what to read before acting.

**What it owns:** The session-start protocol (context attestation requirement), the two-layer reading structure, the interface/contract index, authority and conflict-resolution rules, and the role index.

**What breaks without it:** Agent sessions begin without orientation. Reading requirements are unknown. Role boundaries are undefined. The context attestation requirement ("Context loaded…") disappears from the protocol.

**Do not consolidate with:** `$LLM_JOURNEY_WORKFLOW` — workflow is the execution loop (phases, handoffs, delegation invariants). `agents.md` is the onboarding gateway and authority registry. These serve different sessions states: `agents.md` is read once at session start; workflow is consulted throughout execution.

**Who reads it:** Every agent, as the mandatory first read in every session.

---

### `a-docs-guide.md` — `$LLM_JOURNEY_AGENT_DOCS_GUIDE`

**Why it exists:** To give the Curator accurate rationale context before making maintenance decisions. Without it, a Curator maintaining files must guess at purpose, leading to consolidation errors (merging files that look similar but serve distinct purposes) and purpose drift (adding content to a file based on topic adjacency rather than ownership).

**What it owns:** The rationale record for every significant file and folder in this project's agent-docs.

**What breaks without it:** The Curator cannot confirm full context load. Maintenance decisions become guesswork. Files risk being merged, deleted, or repurposed incorrectly.

**Do not consolidate with:** `$LLM_JOURNEY_STRUCTURE` — that file explains folder placement rules ("where does new content go?"). This file explains purpose ("why does this file exist?"). Both are needed; neither substitutes for the other.

**Who reads it:** Curator, as a required context read at session start.

---

## `indexes/`

### `indexes/main.md`

**Why it exists:** To decouple file references from file locations. Every agent that references a file uses a `$VARIABLE_NAME` looked up here. When a file moves, one row update propagates the correct path everywhere — no grep-and-replace across docs.

**What it owns:** The single source of truth for all significant file paths in `a-docs/` (and `a-society/general/` templates used by this project). Every `$VARIABLE_NAME` in any doc resolves from this table.

**What breaks without it:** Path variables break across all docs. A file move requires finding and updating every hardcoded path in every doc that references it. New files added without index entries create undiscoverable orphans.

**Do not consolidate with:** `$LLM_JOURNEY_AGENTS` — agents.md uses the index but is not the index. These have separate concerns: agents.md is the session gateway; the index is the path registry.

**Who reads it:** Every agent at session start (via the "resolve `$VAR` references" instruction in `$LLM_JOURNEY_AGENTS`). Curator when adding, moving, or removing files.

---

## `project-information/`

### `vision.md` — `$LLM_JOURNEY_VISION`

**Why it exists:** To anchor all product decisions to the core bet: "architectural ideas that led from transformers to agents, not APIs." Without a written vision, agents cannot evaluate whether a proposed addition belongs, and reviewers cannot push back on scope drift with evidence.

**What it owns:** The mission, non-goals, dual-audience definition (learner-user / developer-user), trade-off priority rules when audiences conflict, the "From Tensors to Teams" mental model, the 10-stage roadmap with canonical route URIs.

**What breaks without it:** The Owner loses its evaluation criteria. BA agents cannot assess audience alignment. The 10-stage roadmap has no authoritative source. Scope drift goes unchecked.

**Do not consolidate with:** `$LLM_JOURNEY_ARCHITECTURE` — architecture describes the technical system; vision describes the educational product. `$LLM_JOURNEY_PRINCIPLES` — principles describe product-level UX rules; vision describes mission and scope.

**Who reads it:** Owner (required); Curator (required context load); BA (should read for audience and outcome framing); any agent writing product-facing content.

---

### `structure.md` — `$LLM_JOURNEY_STRUCTURE`

**Why it exists:** To define placement rules for new content — where does a new file or folder go? Without it, agents make arbitrary placement decisions that fragment the codebase and docs over time.

**What it owns:** The repository folder layout, key `a-docs/` subdirectory purposes, and placement rules (colocation, shared-when->2-consumers, no-stale-docs invariant).

**What breaks without it:** New files are placed arbitrarily. The `a-docs/` subdirectory layout drifts. Agents cannot determine whether a new principle belongs in `project-principles/`, `thinking/`, or `development/`.

**Do not consolidate with:** `$LLM_JOURNEY_AGENT_DOCS_GUIDE` — this file answers "where does new content go?"; the a-docs guide answers "why does this specific existing file exist?". `$LLM_JOURNEY_ARCHITECTURE` — architecture describes the application system, not the docs structure.

**Who reads it:** Owner (required); Curator (required context load); Frontend and Infra sub-agents (required role-specific read).

---

### `architecture.md` — `$LLM_JOURNEY_ARCHITECTURE`

**Why it exists:** To define the non-negotiable system constraints that all technical agents must preserve. Without it, agents make changes that break security boundaries, observability safety, or the rendering strategy without realizing those constraints exist.

**What it owns:** The high-level component overview, data flow diagrams, architectural invariants (observability safety, security boundaries, threat model scope, component rendering strategy). Cross-references `$LLM_JOURNEY_OBSERVABILITY` for the observability design principle.

**What breaks without it:** The observability safety invariant ("telemetry must never crash the UI") loses its architectural home. Server-component vs. client-component policy has no authoritative source. Security boundary definitions disappear.

**Do not consolidate with:** `$LLM_JOURNEY_OBSERVABILITY` — observability principles are extracted to their own file per the Atomic Change Site principle: a single file for a single evolving principle. Cross-reference; do not consolidate. `$LLM_JOURNEY_DEV` — development guidelines describe coding conventions; architecture describes invariant system design.

**Who reads it:** Tech Lead (required); Infra (required role read); BA (Technical Sanity Check step); any agent touching security, telemetry, or rendering boundaries.

---

### `principles.md` — `$LLM_JOURNEY_PRINCIPLES`

**Why it exists:** To capture LLM Journey-specific product principles that do not generalize across all projects. These govern UI decisions, content framing, AI disclaimer placement, and the stage-continuity contract — concerns that are specific to this educational product and would be wrong to place in the general thinking docs.

**What it owns:** Educational clarity rules, product-end-user orientation, stage continuity policy (including the bridging-callout-vs-footer-link rule), honest model framing, premium-but-readable UX guidance, resource-rich learning policy, and the AI disclaimer rules (trigger, wording, placement, accessibility, reuse).

**What breaks without it:** The AI disclaimer standard loses its home; individual agents invent ad-hoc disclaimer behavior. The stage-continuity link policy has no canonical source. Product UX rules bleed into the general thinking docs, where they would apply inappropriately to other projects.

**Do not consolidate with:** `$LLM_JOURNEY_THINKING` — thinking/main.md captures cross-project operational principles. Principles.md captures LLM-Journey-specific product rules. An agent working on a different project should apply thinking/main.md but not principles.md.

**Who reads it:** Universal Standards read — all agents, every session.

---

### `log.md` — `$LLM_JOURNEY_LOG`

**Why it exists:** To give every new agent session a snapshot of current project state: what was just completed, what is in progress, what is next. Without it, agents start without orientation and must reconstruct project state from CR artifacts.

**What it owns:** The Current State entry (one `Recent Focus`, up to three `Previous` entries), Next Priorities list (deferred items, known issues), Archive of older completed CRs, and the scope-tag taxonomy.

**What breaks without it:** Agents start each session blind to recent changes. The "Next Priorities" list of pre-existing issues (tracked in log per tooling-standard policy) disappears. CR traceability (every log entry must have a corresponding artifact) loses its anchor.

**Do not consolidate with:** `$LLM_JOURNEY_WORKFLOW_REQUIREMENTS` — CR requirements are the detailed scope and acceptance artifacts; the log is a running summary of lifecycle state. `$LLM_JOURNEY_WORKFLOW_PLANS` — plans are detailed execution artifacts; the log captures completed-state narrative only.

**Who reads it:** BA (required at session start and closure); Tech Lead (should read for pre-existing issue context); any agent that needs current project status.

---

## `project-tooling/`

### `standard.md` — `$TOOLING_STANDARD`

**Why it exists:** To establish the mandatory tooling contract that every agent must honor before running verification commands. Without it, agents use `npm` instead of `pnpm`, run commands on the wrong Node.js version, or apply the wrong lint scope — producing invalid verification evidence.

**What it owns:** Package manager mandate (pnpm only), Node.js version floor (>=20.x), framework/port/theme/browser support, the Runtime Preflight protocol (canonical source — other docs cross-reference here, not duplicate), E2E command canon, quality and linting rules, targeted vs. full-suite lint authority.

**What breaks without it:** The runtime preflight requirement has no canonical home. The lint-authority split (sub-agents use targeted lint; gate authority uses full suite) is undefined. Agents produce verification evidence using mismatched tools, which invalidates acceptance.

**Do not consolidate with:** `$LLM_JOURNEY_TECHNICAL_CONTEXT` — technical-context is a quick-reference cheat sheet that summarizes key values; tooling-standard is the canonical policy. Where they overlap, tooling-standard wins. Never merge: the cheat sheet exists for fast lookup; the policy exists for authoritative governance.

**Who reads it:** Universal Standards read — all agents, every session.

---

## `project-principles/`

### `observability.md` — `$LLM_JOURNEY_OBSERVABILITY`

**Why it exists:** To give the Purposeful Observability Principle a single file that can be updated independently from all documents that reference it. Before this file existed, observability design guidance was scattered across `$LLM_JOURNEY_ARCHITECTURE` and `$LLM_JOURNEY_DEV_BACKEND`. Any change to the principle required finding all copies — classic duplication drift.

**What it owns:** The full observability stack (traces, metrics, logs), the architectural flow (client → OTEL proxy → collector → backends), the OTEL proxy rationale, local vs. production setup, testing guarantees, and the Purposeful Observability Principle (the "spans only when parent context exists" rule).

**What breaks without it:** The Purposeful Observability Principle loses its atomic home. Architecture.md and backend.md contain only summaries — removing this file removes the authoritative design reasoning that those summaries point to. Agents making instrumentation decisions have no canonical rule to consult.

**Do not consolidate with:** `$LLM_JOURNEY_ARCHITECTURE` — architecture.md describes the observability boundary as a system invariant; this file describes the implementation, design rationale, and decision rules. `$LLM_JOURNEY_DEV_BACKEND` — backend.md cross-references this file for the instrumentation decision rule; the principle must live in its own file so changes affect only one location.

**Who reads it:** Backend (required); any agent making observability changes (cross-reference mandatory per `$LLM_JOURNEY_IMPROVEMENT` Principle 3).

---

## `thinking/`

### `main.md` — `$LLM_JOURNEY_THINKING`

**Why it exists:** To codify the seven cross-role operational principles that apply to every agent on every project: clarify before building, evidence over intuition, measurable quality, reversible change, contract preservation, scope integrity, failure transparency. Without it, these principles have no shared written home and each agent must re-derive them independently.

**What it owns:** The seven general engineering principles. These are cross-project and would apply equally to an agent working on a writing project or a research project.

**What breaks without it:** The cross-project operational baseline disappears. Agents working from intuition rather than shared principles produce inconsistent quality decisions.

**Do not consolidate with:** `$LLM_JOURNEY_PRINCIPLES` — project principles are LLM-Journey-specific product rules. This file is project-agnostic. `$LLM_JOURNEY_THINKING_REASONING` — reasoning is cognitive heuristics for decision-making; this file is operational rules for execution.

**Who reads it:** Universal Standards read — all agents, every session.

---

### `reasoning.md` — `$LLM_JOURNEY_THINKING_REASONING`

**Why it exists:** To give agents cognitive heuristics for high-quality problem analysis and decision-making — the "Talk Back" rule, first-principles analysis, capability-driven detection, environment/lifecycle awareness, quantifiable engineering, reversibility principle, intent verification, second-order effects, scope integrity, logic loop prevention, and the deviation protocol.

**What it owns:** Reasoning behavior at decision time. These are not operational rules ("do X") but cognitive patterns ("how to think about X before doing it").

**What breaks without it:** Agents make changes without probing assumptions, trust false environmental claims, fail to check second-order effects, or "just do it" to be efficient in violation of delegation invariants.

**Do not consolidate with:** `$LLM_JOURNEY_THINKING` — thinking/main.md is operational rules; reasoning.md is cognitive heuristics. Both serve the same agent but at different moments: operational rules govern execution behavior; reasoning heuristics govern decision-making quality.

**Who reads it:** Universal Standards read — all agents, every session.

---

### `keep-in-mind.md` — `$LLM_JOURNEY_THINKING_KEEP_IN_MIND`

**Why it exists:** To provide a fast-lookup checklist of hard operational rules and common failure modes — role integrity, context-before-action, don't-invent, path discipline, failure reporting, scope discipline. These are condensed reminders, not full policy text.

**What it owns:** Quick-reference hard rules extracted from longer policy documents. Actionable reminders for frequent failure modes.

**What breaks without it:** Agents have no quick-reference checklist for the most common protocol violations. The reminders exist in longer docs, but they are buried. This file surfaces the critical ones as a scannable list.

**Do not consolidate with:** `$LLM_JOURNEY_THINKING` or `$LLM_JOURNEY_THINKING_REASONING` — those files are full policy; this file is a condensed checklist. The value of this file is its brevity and scannability. Merging it would bury the reminders in longer text.

**Who reads it:** Every agent (loaded via Universal Standards). Particularly valuable when an agent is about to take an action that crosses a boundary or requires self-check.

---

## `roles/`

The `roles/` folder contains one file per named role. Each role file is the definitive statement of that role's authority, responsibilities, required context, and working style. Role files are required reading for the agent assigned that role. They are not cross-role reading (a BA does not need to read tech-lead.md to do BA work).

### `owner.md` — `$LLM_JOURNEY_ROLE_OWNER`

**Why it exists:** To define the universal entry point role: the agent that evaluates all contributions against the core bet, routes work to the appropriate workflow, and escalates direction questions to the human. Without it, agents start sessions without an orientation layer, and scope drift goes unreviewed.

**What it owns:** Vision alignment evaluation criteria (the five tests: vision, scope, placement, duplication, quality), workflow routing table, handoff output format, escalation triggers.

**Who reads it:** Owner agent at session start (required).

---

### `curator.md` — `$LLM_JOURNEY_ROLE_CURATOR`

**Why it exists:** To define the agent responsible for a-docs structural health. Without it, no agent owns documentation maintenance as a primary responsibility, and the agent-docs system accumulates stale, misplaced, or duplicated content.

**What it owns:** Curator authority (maintenance within `a-docs/`, a-docs-guide ownership, migration tasks, pattern observation), hard rules (never write to `general/` unilaterally, no direction changes), context loading requirements (including first-priority task: create this guide if missing), pattern-distillation criteria for a-society proposals.

**Who reads it:** Curator agent at session start (required).

---

### `ba.md` — `$LLM_JOURNEY_ROLE_BA`

**Why it exists:** To define the agent that transforms ambiguous change requests into executable problem statements. Without it, the project has no role dedicated to requirement clarity, scope control, and acceptance criteria definition — and the Tech Lead receives vague handoffs.

**What it owns:** BA authority boundaries (owns scope/AC; may NOT write code), the BA closure checklist (AC annotation requirements, deviation handling, log update, CR status change), negative assertion rule, Technical Sanity Check procedure.

**Who reads it:** BA agent at session start (required).

---

### `tech-lead.md` — `$LLM_JOURNEY_ROLE_TECH_LEAD`

**Why it exists:** To define the agent that owns technical decision-making, execution planning, and system integrity. Without it, the tech-lead vs. sub-agent authority boundary is undefined, and agents self-delegate to sub-agent tasks or write feature code without proper handoffs.

**What it owns:** The hard rule against writing feature code (with the exhaustive list of permitted direct changes), pre-implementation self-check, the CR execution model (Session A → Coordinator sessions → Session B), handoff formalization rules, verification phase responsibilities.

**Who reads it:** Tech Lead agent at session start (required).

---

### `coordinator.md` — `$LLM_JOURNEY_ROLE_COORDINATOR`

**Why it exists:** To enable the CR Coordinator model — a lightweight session that reviews one sub-agent's output, runs quality gates, and delivers a conclusion summary — without loading full project context. Without it, the Tech Lead's Session B must re-load all sub-agent context, consuming context budget on material already reviewed.

**What it owns:** Session entry protocol (load only TL-session-state + sub-agent report + modified files), execution mode guidance (background task vs. interactive session), adversarial diff review obligations, bash-denied fallback protocol.

**Who reads it:** CR Coordinator agent at session start (required).

---

### `improvement.md` — `$LLM_JOURNEY_ROLE_IMPROVEMENT`

**Why it exists:** To define the agent that synthesizes per-agent findings into an approved improvement plan and implements approved changes. Without it, Phase 2 and Phase 3 of the improvement protocol have no defined authority owner.

**What it owns:** Phase 2 synthesis responsibilities, Phase 3 implementation scope, permitted direct change scope (all of `a-docs/`, shared infra docs only), what the Improvement Agent must NOT do (no CR artifacts, no feature code, no product improvements).

**Who reads it:** Improvement Agent at session start (required).

---

### `sub-agents/backend.md` — `$LLM_JOURNEY_ROLE_BACKEND`

**Why it exists:** To define the ownership boundary for server-side API routes and the specific implementation patterns Backend must follow: observability patterns, metric mock cascade check, SSE span lifecycle, safeMetric production vs. test behavior, client-server contract parity.

**What it owns:** Backend ownership quick matrix, backend vs. infra security split, OTel span lifecycle during streaming (the `streamingActive` flag pattern), SSE client-side parsing requirement, verification scope defaults.

**Who reads it:** Backend sub-agent, when the Tech Lead issues a backend handoff (required).

---

### `sub-agents/frontend.md` — `$LLM_JOURNEY_ROLE_FRONTEND`

**Why it exists:** To define frontend ownership boundaries and point the Frontend agent to the design tokens and refactor checklist it must use. Without it, the Frontend agent lacks an authoritative boundary between its responsibilities and Backend/Infra.

**What it owns:** Frontend ownership declaration (`app/ui/**`, `app/[feature]/**`, `lib/hooks/**`), required role-specific reads (structure, design tokens, refactor checklist, handoff file).

**Who reads it:** Frontend sub-agent, when the Tech Lead issues a frontend handoff (required).

---

### `sub-agents/infra.md` — `$LLM_JOURNEY_ROLE_INFRA`

**Why it exists:** To define the global/platform security and deployment ownership boundary — distinct from the endpoint-level security owned by Backend. Without it, the infra vs. backend security split is undefined and both roles risk stepping on each other.

**What it owns:** Infra ownership declaration (Dockerfile, CI workflows, middleware security parts, global runtime policy), infra vs. backend security split definition.

**Who reads it:** Infra sub-agent, when the Tech Lead issues an infra handoff (required).

---

### `sub-agents/testing.md` — `$LLM_JOURNEY_ROLE_TESTING`

**Why it exists:** To define the testing ownership boundary — the Testing Agent owns `__tests__/` and is read-only on application source code. Without it, sub-agents self-authorize test edits during implementation, and the testing ownership invariant (test creation belongs to the Testing Agent unless explicitly delegated) has no authority anchor.

**What it owns:** Testing ownership declaration, read-only boundary on application source, escalation obligation when selectors or environmental assumptions are wrong.

**Who reads it:** Testing sub-agent, when the Tech Lead issues a testing handoff (required).

---

## `workflow/`

### `main.md` — `$LLM_JOURNEY_WORKFLOW`

**Why it exists:** To define the full agent execution loop: the phases (Requirement Analysis, Technical Planning, Implementation, Verification, Acceptance), the invariants (delegation invariant, scope extension invariant, shared component blast-radius invariant), the Testing Handoff Trigger Matrix, and the Conversation File Freshness Rule. Without it, agents invent their own process, handoffs are inconsistent, and scope extensions go untracked.

**What it owns:** The end-to-end CR execution protocol. This is the most detailed operational doc in the system — it is the authoritative source for when to enter Wait State, what a Go/No-Go requires, when a testing handoff is mandatory, and how CR Coordinator sessions work. It cross-references `$TOOLING_STANDARD` and role docs for canonical sub-rules but does not duplicate them.

**What breaks without it:** Every phase of CR execution loses its written protocol. The Go/No-Go exception conditions are undefined. The conversation file freshness pre-replacement check disappears.

**Do not consolidate with:** `$LLM_JOURNEY_AGENTS` — agents.md is the session gateway and authority registry; workflow/main.md is the execution protocol. Role docs cross-reference workflow for phase-specific rules without duplicating them.

**Who reads it:** Universal Standards read — all agents, every session.

---

### `workflow/plans/` — `$LLM_JOURNEY_WORKFLOW_PLANS`

**Why it exists (folder + index):** `plans/main.md` is the canonical plan template that every Tech Lead plan must follow. The individual `CR-XXX-plan.md` files are the execution artifacts produced per CR. Together, they form the historical record of "how each CR was planned."

**What `plans/main.md` owns:** The mandatory sections for a Tech Lead plan: technical analysis, discovery findings, configuration specs, implementation decisions, contract delta assessment, delegation graph, operational checklist, documentation impact, and definition of done. Cross-references `$LLM_JOURNEY_WORKFLOW` for semantics.

**What individual plan files own:** Per-CR technical decisions, delegation assignments, and execution mode records. They are retained as historical artifacts per the retention policy in `$LLM_JOURNEY_WORKFLOW`.

**Notable atypical artifact:** `plans/agent-doc-improvements-plan.md` exists outside the `CR-XXX` naming pattern — it is a pre-naming-convention artifact. Do not delete; treat as historical.

**Who reads it:** Tech Lead (required when authoring a plan); sub-agents (must read the linked plan before executing a handoff); BA (consult during acceptance to understand technical decisions).

---

### `workflow/reports/` — `$LLM_JOURNEY_WORKFLOW_REPORTS`

**Why it exists:** To hold investigation reports and ad-hoc analysis artifacts — distinct from meta-improvement reports (which belong in `$LLM_JOURNEY_IMPROVEMENT_REPORTS`). Without this separation, investigation artifacts (root-cause analysis docs, E2E issue analyses) are mixed with meta-improvement synthesis files, which confuses agents searching for investigation context.

**What `reports/main.md` owns:** The investigation report template, an example of a complete BA lifecycle (CR-007), and the distinction between this folder and the improvement reports folder.

**What individual report files own:** Point-in-time investigations (`INVESTIGATION-CR-XXX-*.md`) and ad-hoc analysis (`E2E-issue-analysis.md`). These are historical artifacts once produced.

**Do not consolidate with:** `$LLM_JOURNEY_IMPROVEMENT_REPORTS` — improvement reports (`META-*`) record meta-analysis friction findings. Investigation reports record product/test defect root causes. These serve different roles and different lookup contexts.

**Who reads it:** BA (when drafting investigation-driven CRs); Tech Lead (when diagnosing a regression); any agent following a cross-reference to a specific investigation.

---

### `workflow/requirements/` — `$LLM_JOURNEY_WORKFLOW_REQUIREMENTS`

**Why it exists:** To hold the source-of-truth record of every Change Requirement: scope, acceptance criteria, status, and closure evidence. Without it, the project has no auditable record of what was agreed, what was implemented, and whether it was accepted.

**What `requirements/main.md` owns:** The CR template, naming convention, status model, legacy status mapping, historical integrity rules (closed CRs are immutable), allowed post-closure edits, and the amendment log requirement.

**What individual CR files own:** The full lifecycle record for a single change: initial scope → clarified scope → AC evidence annotations → closure. The `Done` status + AC annotations are the evidence that a CR was properly accepted.

**What breaks without it:** Traceability disappears. The BA closure checklist has nowhere to annotate acceptance evidence. The `$LLM_JOURNEY_LOG` has no artifacts to point to.

**Do not consolidate with:** `$LLM_JOURNEY_WORKFLOW_PLANS` — plans record how a CR was executed technically; requirements record what was scoped and whether it was accepted. These are distinct lifecycle records with distinct owners (BA owns requirements; Tech Lead owns plans).

**Who reads it:** BA (required — author and closure owner); Tech Lead (required — reads the CR before planning); any agent that needs to verify a CR's scope or status.

---

## `communication/`

### `main.md` — `$LLM_JOURNEY_COMMUNICATION`

**Why it exists:** To serve as the entry point for the communication folder — explaining the two-subfolder structure and the relationship between them. Without it, agents landing in the `communication/` folder have no context for which subfolder to read.

**What it owns:** Explanation of `conversations/` vs. `coordination/` and the rule "coordination defines the rules; conversations are the artifacts produced under those rules."

**Who reads it:** Referenced when an agent needs to navigate the communication structure; also loaded by roles when context-loading `$LLM_JOURNEY_COMMUNICATION`.

---

### `communication/conversations/` — `$LLM_JOURNEY_COMMUNICATION_CONVERSATIONS`

**Why it exists:** To hold the live inter-agent handoff and report files for the current CR — the actual communication artifacts between role pairs — plus the permanent templates that govern their format.

**What the active files own:** Each `[role-pair].md` file is a single-CR working artifact. It carries the live handoff or report for one role pair (e.g., `ba-to-tech-lead.md`, `tech-lead-to-backend.md`). These files are replaced at CR boundaries (after the pre-replacement check confirms the prior CR is closed).

**What the TEMPLATE files own:** The mandatory field definitions and format for each conversation type. Templates are permanent — they are not working artifacts and are never replaced at CR boundaries. The current templates are: BA-to-TL, TL-to-BA, TL-to-Backend, TL-to-Frontend, TL-to-Infra, TL-to-Testing, Backend-to-TL, Frontend-to-TL, Infra-to-TL, Testing-to-TL, and a BA-TL-clarification loop template.

**What breaks without it:** Inter-agent communication has no persistent artifact. Pre-replacement checks cannot function (they require reading the outgoing file before replacing it). Template format is lost; each new session invents handoff structure ad hoc.

**Do not consolidate with:** `$LLM_JOURNEY_COMMUNICATION_COORDINATION` — coordination holds the *rules* governing how these artifacts are produced and consumed. Conversations hold the artifacts themselves. Merging would confuse live working artifacts with standing policy.

**Who reads it:** Every agent that issues or receives a handoff (required, per the relevant handoff protocol).

---

### `communication/coordination/` — `$LLM_JOURNEY_COMMUNICATION_COORDINATION`

**Why it exists:** To hold the standing protocols that govern all agent communication. These are permanent process documents that change only when the process changes — not per CR. Without them, each handoff invents its own status vocabulary, format, and escalation path.

**What it owns (folder):** Four protocol documents:

- **`handoff-protocol.md`**: The canonical status model (issued / in_progress / blocked / partial / completed / verified / needs_environment_verification), required fields per role-pair handoff, the bidirectional clarification loop rules, failure classification rules (CR-related / pre-existing / environmental / non-blocking warning), scope override synchronization requirements, and the AC-ID alignment requirement. *This is the most-referenced coordination file.*
- **`feedback-protocol.md`**: How agents report discrepancies, false assumptions, and logical flaws discovered during execution. Defines the Sub-Agent → Tech Lead and Tech Lead → BA reporting paths, resolution protocol, and environmental blocker validation requirements.
- **`conflict-resolution.md`**: What to do when agents disagree — escalation paths and authority matrix. Currently a brief stub; its content will grow as conflict patterns emerge.
- **`TL-session-state.md`**: The Tech Lead's per-CR session state tracker. Contains the CR ID, Session A/B outcome, pre-replacement check evidence for `tech-lead-to-ba.md`, Coordinator session records, and the Workflow Health Signal. This file is replaced at each new CR (with pre-replacement check). It enables the CR Coordinator model by giving Coordinator sessions a compact context load instead of requiring full Layer 1/2 project context.

**What breaks without it:** Status tokens become inconsistent. The failure classification taxonomy disappears. The CR Coordinator cannot load a compact context (it depends on TL-session-state.md). Scope overrides mid-CR are not synchronized across artifacts.

**Do not consolidate with:** `$LLM_JOURNEY_COMMUNICATION_CONVERSATIONS` — conversations are the live artifacts; coordination files are the standing rules. Merging them would require replacing rule docs at CR boundaries, destroying the standing protocol.

**Who reads it:** Handoff protocol: Tech Lead and all sub-agents (required before issuing/receiving handoffs). Feedback protocol: any sub-agent that discovers a blocker. TL-session-state: CR Coordinator at session entry (required). Tech Lead when authoring the session state.

---

## `governance/`

### `main.md` — `$LLM_JOURNEY_GOVERNANCE`

**Why it exists:** To serve as the entry point for the governance folder — indexing the API contracts and ADR subdirectories. Without it, agents have no way to discover which governance artifacts exist or which entry point to read first.

**What it owns:** The index and purpose description for `api/` and `decisions/`.

**Who reads it:** Tech Lead (required when making architecture-level decisions); any agent that needs to locate governance artifacts.

---

### `governance/api/` — `$LLM_JOURNEY_GOVERNANCE_API`

**Why it exists:** To hold the source-of-truth contracts for all `/app/api/**` endpoints. Without it, Frontend and Backend have no shared written record of the request/response shape, and contract changes go untracked.

**What `api/main.md` owns:** The contract rules (every new/modified endpoint must have a contract doc), the index maintenance obligation (Backend adds entries; TL adversarial review checks currency), and the contents list of current contract docs.

**What individual API contract files own:**
- `route-contract-template.md`: The required structure for per-route contract docs.
- `shared-types.md`: Common data structures used across Frontend and Backend.
- `frontier-base-generate.md`: Contract for `POST /api/frontier/base-generate`.
- `adaptation-generate.md`: Contract for `POST /api/adaptation/generate`.

**What breaks without it:** Backend and Frontend negotiate contracts verbally per CR. A route change has no durable record. The Tech Lead adversarial review loses its "missing entry is a blocking finding" gate.

**Do not consolidate with:** `$LLM_JOURNEY_TESTING_CONTRACTS` — the test contract registry tracks `data-testid`, routes, and OTel getter names used in tests; the API contract docs track request/response shapes and route behavior semantics. These are distinct contract domains.

**Who reads it:** Backend (required — update contracts when routes change); Frontend (required — read contracts before implementing API calls); Tech Lead (required during adversarial review).

---

### `governance/decisions/` — `$LLM_JOURNEY_GOVERNANCE_DECISIONS`

**Why it exists:** To record significant architectural decisions as ADRs — status, context, decision, and consequences. Without it, an agent changes a system that has a deliberate architectural reason for its current design (such as the telemetry proxy design), not knowing that an ADR exists to explain why the design must be preserved.

**What `decisions/main.md` owns:** The ADR template and the ADR index.

**What individual ADR files own:** Each ADR records one architectural decision. Current ADRs: `ADR-0001-telemetry-proxy.md`.

**What breaks without it:** Architectural decisions made during CRs are lost. Future agents reverse deliberate design choices without evidence that the decision was intentional.

**Do not consolidate with:** `$LLM_JOURNEY_ARCHITECTURE` — architecture.md describes the current system shape and invariants; ADRs record the *why* behind past architectural decisions. Both are needed: architecture.md tells you what exists; ADRs tell you why it exists the way it does.

**Who reads it:** Tech Lead (required when touching security, telemetry, or core data flow — per `$LLM_JOURNEY_THINKING_REASONING`); any agent making a change that touches an ADR-covered area.

---

## `development/`

### `main.md` — `$LLM_JOURNEY_DEV`

**Why it exists:** To define the cross-cutting coding conventions and quality expectations: clarity over cleverness, testability, security and observability as first-class concerns, the leaf utility isolation principle, API route development requirements, frontend responsiveness rules, and the self-review checklist.

**What it owns:** The general development standards that apply across Backend and Frontend. This is the "how to write code" doc, distinct from the "how the system is structured" doc (`$LLM_JOURNEY_ARCHITECTURE`) and the "what libraries to use" doc (`$TOOLING_STANDARD`).

**What breaks without it:** The leaf utility isolation principle has no home. The general API route observability requirements are undefined. Frontend responsiveness and UI consistency rules disappear.

**Do not consolidate with:** `$LLM_JOURNEY_DEV_BACKEND` — backend.md contains backend-specific patterns (SSE, streaming span lifecycle, metric mock cascade); main.md contains shared standards. `$LLM_JOURNEY_DESIGN_TOKENS` — frontend/main.md contains the visual system; dev/main.md contains coding conventions that apply to both backend and frontend.

**Who reads it:** Backend (required role read); Frontend (required role read); any agent writing application code.

---

### `contribution.md` — `$LLM_JOURNEY_CONTRIBUTION`

**Why it exists:** To define the git hygiene contract: branching strategy, commit message format (Conventional Commits), and the repository hygiene checklist. Without it, agents produce inconsistent commit history and branch names that obscure the CR they belong to.

**What it owns:** Branch naming (`feat/CR-XXX`, `fix/CR-XXX`, etc.), commit type taxonomy, allowed scopes, .gitignore policy, atomic commit requirement.

**What breaks without it:** Branches have no CR tracing. Commits are untyped. .gitignore maintenance is undefined.

**Do not consolidate with:** `$LLM_JOURNEY_DEV` — development/main.md governs coding quality; contribution.md governs git workflow. Distinct concerns with distinct audiences (contribution.md is particularly relevant at the commit/branch step, not during implementation).

**Who reads it:** Infra (required); Testing (required); any agent committing or branching.

---

### `technical-context.md` — `$LLM_JOURNEY_TECHNICAL_CONTEXT`

**Why it exists:** To provide a quick-reference cheat sheet of key technical values: dev server port, OTel endpoints, pnpm mandate, WASM path, standard kit library table, framework orchestration table, key constraints, E2E execution context truth table, security and privacy context, operational invariants.

**What it owns:** Fast-lookup values only. Where any value here conflicts with a canonical policy doc (`$TOOLING_STANDARD`, role docs), the policy doc wins.

**What breaks without it:** Agents must search across multiple docs to find common values (port number, rate limits, browser support). The E2E execution context truth table (sandboxed vs. local-equivalent classification guidance) loses its home.

**Do not consolidate with:** `$TOOLING_STANDARD` — tooling-standard is the canonical policy; this file is a summary convenience. The distinction is intentional: tooling-standard has authority; technical-context has speed.

**Who reads it:** Universal Standards read — all agents, every session.

---

### `backend.md` — `$LLM_JOURNEY_DEV_BACKEND`

**Why it exists:** To capture backend-specific implementation patterns that are too detailed for the general development doc: the metric mock cascade detection procedure, the safeMetric production-vs-test divergence, the SSE span lifecycle `streamingActive` pattern, SSE client-side `{ stream: true }` decoder requirement, and client-server contract parity obligations.

**What it owns:** Backend-specific development standards and patterns. Cross-references `$LLM_JOURNEY_OBSERVABILITY` for the instrumentation decision rule.

**What breaks without it:** The metric mock cascade check disappears — agents add new OTel getter functions without running the grep pre-check, causing silent test failures. The SSE span lifecycle pattern is undocumented.

**Do not consolidate with:** `$LLM_JOURNEY_DEV` — dev/main.md is the shared baseline; backend.md is the backend-specific extension. Do not merge: the merged doc would be loaded by Frontend agents who do not need streaming span lifecycle patterns, consuming context budget unnecessarily.

**Who reads it:** Backend sub-agent (required); any agent making observability changes on server-side routes.

---

### `frontend/main.md` — `$LLM_JOURNEY_DESIGN_TOKENS`

**Why it exists:** To establish the visual system as a single source of truth for all UI values — colors, shadows, animation tokens, border radii, glassmorphism patterns, background glow layers. Without it, Frontend agents invent ad-hoc color values and animation timings that diverge from the aesthetic calibration (Linear/Vercel/Raycast reference).

**What it owns:** The complete design token system: surface colors, border colors, text colors, accent gradients, shadow scale, animation duration/spring/easing presets, border radius scale, and pattern examples. The "add it here first" rule: new tokens must be defined here before use.

**What breaks without it:** Visual drift across pages. The "wow yet professional" aesthetic is not reproducible. Dark/light theme parity has no canonical definition.

**Do not consolidate with:** `$LLM_JOURNEY_FRONTEND_REFACTOR` — the refactor checklist governs rendering boundary safety; this file governs visual values. `$LLM_JOURNEY_PRINCIPLES` — principles.md has a "Premium-but-Readable UX" principle that references the design system; the design system itself lives here.

**Who reads it:** Frontend sub-agent (required role read); any agent touching UI components.

---

### `frontend/refactor-checklist.md` — `$LLM_JOURNEY_FRONTEND_REFACTOR`

**Why it exists:** To codify the safety steps for rendering-boundary refactors and shared UI component changes. Without it, Frontend agents skip pre-edit contract inventory, fail to identify blast-radius impacts on shared components, or run verification commands out of order.

**What it owns:** The seven-step checklist: intent lock, contract inventory (before edits), boundary refactor safety rules, shared component blast-radius check, verification command order, report evidence format, and pause triggers.

**What breaks without it:** Rendering boundary refactors proceed without contract inventory. Shared component changes miss blast-radius checks. The "test maintenance carve-out" rule — allowing test repair when it is a direct structural consequence of a delegated change — has no home.

**Do not consolidate with:** `$LLM_JOURNEY_DEV` — dev/main.md is general coding standards; this checklist is a step-by-step procedure for a specific high-risk operation. Merging it would bury the checklist inside a large document.

**Who reads it:** Frontend sub-agent (required role read, specifically for refactor and shared-component tasks).

---

### `testing/main.md` — `$LLM_JOURNEY_TESTING`

**Why it exists:** To define the testing philosophy, strategy, tooling, and all policy rules that govern test production and verification: the Negative Space Rule, E2E triage ladder, E2E failure classification heuristics, provider-backed E2E determinism classification, selector reliability ladder, command sequencing rule, Tech Lead verification gates, OTel metrics mocking pattern, and the pipeline stabilization playbook.

**What it owns:** The authoritative source for all testing policy. Cross-referenced by `$TOOLING_STANDARD` (runtime preflight only) and role docs. The canonical source for E2E triage/classification (not `$TOOLING_STANDARD`, which only holds the command canon).

**What breaks without it:** The E2E classification heuristics (sandboxed vs. local-equivalent) have no home. The OTel metrics mocking pattern is undefined (testing agents write inconsistent mock blocks). The Negative Space Rule ("absence assertion + retained-path assertion, both required") disappears.

**Do not consolidate with:** `$LLM_JOURNEY_TESTING_CONTRACTS` — the contract registry is a stable lookup table of current contracts; testing/main.md is the policy governing how those contracts are tested and updated. `$TOOLING_STANDARD` — tooling-standard holds the command canon; this file holds the classification and triage policy.

**Who reads it:** Testing sub-agent (required role read); Tech Lead (consult when making Testing handoff trigger decisions); BA (consult during Technical Sanity Check for regression/test CRs).

---

### `testing/contract-registry.md` — `$LLM_JOURNEY_TESTING_CONTRACTS`

**Why it exists:** To provide a stable baseline of current test contracts — routes, `data-testid` selectors, accessibility semantics, and OTel metrics getter names — that CRs can reference without re-deriving them from source code. Without it, each CR handoff must independently re-inventory contracts, and getter name typos in tests silently fail to intercept real instruments.

**What it owns:** Route contracts, per-stage `data-testid` contracts (Transformers, Adaptation), OTel metrics getter function names and instrument names. The update protocol (who updates it, when, and what counts as a blocking gap if it is not updated).

**What breaks without it:** Test contracts are rediscovered from source code per CR. OTel getter names must be inferred from handoffs; a typo produces a test that passes but doesn't actually intercept the metric. The BA closure check "confirm registry is updated" has nothing to check.

**Do not consolidate with:** `$LLM_JOURNEY_GOVERNANCE_API` — API contracts record request/response shapes; the contract registry records selector/route/metric contracts used in tests. Distinct domains, distinct maintenance owners.

**Who reads it:** Testing sub-agent (required role read); BA (required at acceptance for contract-touching CRs — per the update protocol); Tech Lead (adversarial review checks for registry updates when contracts change).

---

## `improvement/`

### `main.md` — `$LLM_JOURNEY_IMPROVEMENT`

**Why it exists:** To capture the meta-improvement philosophy — the five principles that guide how future process gaps should be evaluated: atomic change sites, project-agnostic folder structure, follow references, simplicity over protocol, separation of concerns. Without it, improvement decisions are made by intuition rather than principled evaluation.

**What it owns:** The five meta-improvement principles and how to apply them during synthesis. These are project-agnostic and would apply to any project using this agent-docs structure.

**What breaks without it:** The Improvement Agent makes synthesis decisions without principled criteria. The "before adding to X, ask whether X is the right home" check has no written basis. The "extend before creating" default is unwritten.

**Do not consolidate with:** `$LLM_JOURNEY_IMPROVEMENT_PROTOCOL` — the protocol defines the operational procedure (phases, session types, templates, guardrails); this file defines the decision philosophy. Both are needed: the protocol tells you *how* to run an improvement cycle; the philosophy tells you *how to evaluate* proposals during that cycle.

**Who reads it:** Improvement Agent (required role read). Any agent that discovers a potential meta-improvement.

---

### `protocol.md` — `$LLM_JOURNEY_IMPROVEMENT_PROTOCOL`

**Why it exists:** To standardize the full improvement cycle: Mode A (CR-linked meta, with lightweight-pass default and full three-phase chain when triggered), Mode B (alignment cycle for structural evolution), mandatory evolution lenses, role health indicators, and guardrails. Without it, meta-improvement is ad-hoc and inconsistent across CRs.

**What it owns:** The complete operational procedure for all improvement modes: when to use them, what sessions to start, what prompts to use, what output files to produce, and what guardrails to enforce. The canonical session prompts (use verbatim) for Phase 1, Phase 2, and Mode B sessions.

**What breaks without it:** The three-phase chain (per-agent findings → synthesis → implementation) has no defined procedure. Role health thresholds and response levels are undefined. The "carry-forward rule" (each agent's session must include all prior findings) disappears.

**Do not consolidate with:** `$LLM_JOURNEY_IMPROVEMENT` — philosophy vs. procedure, as above. `$LLM_JOURNEY_IMPROVEMENT_REPORTS` — the reports index is a directory guide for artifacts; the protocol is the governance for producing those artifacts.

**Who reads it:** Improvement Agent (required role read); Tech Lead (when running a post-CR meta pass); BA (when running a BA-led lightweight pass).

---

### `improvement/reports/` — `$LLM_JOURNEY_IMPROVEMENT_REPORTS`

**Why it exists:** To hold all meta-improvement artifacts: lightweight synthesis notes, per-agent findings files, synthesis docs, and alignment backlogs. Without it, improvement artifacts are scattered or mixed with other workflow artifacts.

**What `reports/main.md` owns:** The report type taxonomy, naming conventions, template references, and the rule that report files are historical artifacts (not edited after creation; synthesis files may receive implementation notes after Phase 3).

**What individual META files own:** Each `META-YYYYMMDD-<CR-ID>-<type>.md` file is an immutable historical artifact recording what friction was observed, what was synthesized, or what was aligned during a specific CR's meta cycle.

**Do not consolidate with:** `$LLM_JOURNEY_WORKFLOW_REPORTS` — workflow/reports holds investigation reports (product/test defect root causes); improvement/reports holds meta-improvement analysis. These are distinct artifact classes with distinct producers and consumers.

**Who reads it:** Improvement Agent (required for Phase 2 carry-forward); Tech Lead and BA (provide carry-forward input to Phase 1 sessions). The `reports/main.md` index is the entry point for locating specific meta artifacts.

---

## Folder-Level Orphan Check

Every file in `a-docs/` must appear in at least one role's required reading or be loaded on-demand during a specific named operation. Files with no assigned reader are orphans — they occupy index space and maintenance burden without influencing any agent's behavior.

Findings at guide creation time (2026-03-08):
- `communication/coordination/conflict-resolution.md` contains a stub ("What to do when agents disagree / Escalation paths / Authority matrix"). It is referenced in `$LLM_JOURNEY_COMMUNICATION_COORDINATION` and loaded when agents navigate to the coordination folder. Loaded on-demand; not an orphan. **However, it is significantly underdeveloped.** Curator flag: this file should be completed in a future alignment chunk.
- `workflow/plans/agent-doc-improvements-plan.md`: Atypical naming (predates the CR-XXX convention). Historical artifact; no active consumer. Not an orphan — it is a closed historical record. No action required.
- `workflow/plans/CR-020-foldering-feasibility.md`: CR-scoped ephemeral coordination file per the guidance in `$LLM_JOURNEY_WORKFLOW`. Should have been deleted at CR-020 closure. Curator flag: candidate for cleanup; confirm with Owner before deleting.
