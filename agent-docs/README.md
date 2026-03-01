# Agent Docs: A Practical Guide to Structured AI-Assisted Development

## What Is This?

"Agent docs" is a folder of structured documentation — typically `agent-docs/` — that gives AI assistants (and humans) consistent, persistent context across sessions. It replaces the anti-pattern of re-explaining your project to an AI every time you open a new chat.

The core problem it solves: **AI sessions are stateless. Your project is not.**

Without agent docs, every session starts from zero. With agent docs, every session starts from a shared, versioned understanding of what you're building, why, how you work, and what's already been decided.

---

## Section 1: Core Mental Model

Before getting into specifics, internalize this layered structure. Every file in agent docs serves one of these purposes:

| Layer | What It Captures | Decay Rate | Examples |
|---|---|---|---|
| **Principles** | How to think and work — cross-project | Very slow | `general-principles.md`, `reasoning-principles.md` |
| **Vision & Architecture** | Why this exists, what it does, what must never break | Slow | `project-vision.md`, `architecture.md` |
| **Decisions** | Why specific choices were made | Frozen (immutable) | `decisions/ADR-001-*.md` |
| **Change History** | What changed, when, and why | Frozen after closed | `requirements/CR-001-*.md` |
| **Current State** | What's alive right now | Fast (updated every CR) | `project-log.md` |
| **Gotchas** | Temporary warnings from recent mistakes | Fast (entries retire) | `keep-in-mind.md` |

**Key insight**: New sessions should start by reading the current-state layer first, then the decision/architecture layer if relevant, then the principles layer if in doubt. Don't reload everything every time.

---

## Section 2: Starting a New Project

The risk with a new project is spending more time on process than product. Start with the **Minimum Viable Agent Docs (MVAD)** — five files that prevent the most common failure modes.

### The 5 Files to Write First

**1. `project-vision.md`** — write this before you write a single line of code.

It must answer:
- What is this project for? (one sentence)
- Who is it for? (be specific — "developers with 2+ years Python experience" not "developers")
- What should a user be able to do after using it?
- What is this project explicitly **NOT**? (non-goals prevent scope creep)

If you cannot write this, you are not ready to build.

**2. `technical-context.md`** — the cheat sheet.

Include: dev server port, framework, package manager, key libraries, browser or environment constraints. This prevents the most common form of agent drift: re-discovering the same environmental facts every session.

**3. `AGENTS.md`** — the entry point.

Defines: what roles exist, what each role reads before starting, and the authority hierarchy. Start minimal — three roles maximum for small projects. The file's job is to ensure any new session starts by loading the right context.

**4. `project-log.md`** — the anchor.

Even on day one, write: "Current State: Project initialized. Vision and technical context established." Add a `Next Priorities` section with your first planned change. This file is the first thing you read in every new session.

**5. `workflow.md`** — how changes happen.

Define the lifecycle of a change: from idea → scoped requirement → implementation → acceptance. Even a five-step version of this prevents the implicit assumption that "just doing it" is a valid workflow.

### Defer These Until You Need Them

- Multiple specialized roles (start with one "planner" role)
- Formal CR numbering (start when you hit your third or fourth change)
- Architecture Decision Records (write them as decisions are made, not retroactively)
- Meta-improvement protocol (add this once you have enough history to improve from)

### Order of Operations for a New Project

```
1. Write project-vision.md       ← forces clarity on WHY
2. Write technical-context.md    ← forces clarity on WHAT you're building with
3. Write AGENTS.md (minimal)     ← forces clarity on HOW you work
4. Write project-log.md          ← establishes the anchor
5. Write workflow.md             ← establishes change lifecycle
6. Start building. First significant change → CR-001.
```

---

## Section 3: Starting on an Existing Project

The challenge here is different: you have momentum, existing decisions, and undocumented assumptions. The risk is creating docs that describe what *should* exist rather than what *does* exist.

### Phase 1: Archaeology (1-2 days)

Do not write prescriptive documentation yet. First, document what actually exists.

```bash
git log --oneline -50       # recent direction
git log --stat -20          # which files change most often
```

From this:
- Map the folder structure → skeleton for `architecture.md`
- Identify what nobody touches (stable) vs. what breaks often (→ `keep-in-mind.md` candidates)
- List the decisions that are already baked in → candidates for ADRs

**The test**: Can someone read your `architecture.md` and correctly predict where in the codebase a given feature lives? If not, it's not accurate enough yet.

### Phase 2: Capture Implicit Decisions

For each major architectural choice already made (choice of framework, database, auth strategy, deployment model), write a minimal ADR:

```markdown
# ADR-001: [Decision Title]
Status: Accepted
Date: [approximate date]
Context: [What problem were you solving?]
Decision: [What did you choose?]
Consequences: [What does this enable or constrain?]
```

Even if the decision feels obvious, write it down. "We chose PostgreSQL because the team knows it" is a valid ADR. Future agents (and humans) will stop second-guessing it.

### Phase 3: Honest Project Log

Write `project-log.md` reflecting **current actual state**, not aspirational state:

```markdown
## Current State
- Status: [What is built and working today]
- Recent Focus: [The last thing that was completed]

## Next Priorities
- [ ] [Known item 1]
- [ ] [Known item 2]
```

Resist the urge to backfill perfect historical entries. One honest current-state entry is worth more than ten fabricated historical ones.

### Phase 4: Your First CR as a Forcing Function

Pick the next change you're going to make. Write it as a Change Requirement (CR). This is your forcing function to understand whether your agent-docs are good enough. If writing the CR reveals that your context docs are missing key information, fix that first.

The CR will feel bureaucratic the first time. By the third or fourth, it will feel like the fastest path to implementation.

---

## Section 4: Using the Knowledge Already in Agent Docs

### The Two-Layer Reading Pattern

The most important structural insight in agent docs is the **two-layer reading pattern**:

- **Layer 1 (Universal)**: Read once, applies to all roles, all sessions. Principles, project vision, architecture, workflow, tooling.
- **Layer 2 (Role-specific)**: Read at session start for your current role. Adds role-specific context on top of universal standards.

This prevents the common failure of agents loading 10,000 tokens of context that are 80% irrelevant to the current task.

**Practical rule**: At session start, load the current-state layer (`project-log.md`, active conversation/handoff files). Load the architecture/decision layer only if your task touches those areas. Load the principles layer only when you're uncertain about approach.

### When to Consult Each Layer

| Question | Where to look |
|---|---|
| "Why does this code look this way?" | Closed CRs + ADRs |
| "What should I work on next?" | `project-log.md` Next Priorities |
| "Is this a known constraint?" | `keep-in-mind.md` + `architecture.md` Invariants |
| "How do we handle X technically?" | `technical-context.md` |
| "What did we decide about Y?" | `decisions/ADR-*.md` |
| "What was changed in the last cycle?" | Closed `requirements/CR-*.md` |
| "What are the non-negotiables?" | `architecture.md` Architectural Invariants |

### The `keep-in-mind.md` Pattern

This file is a temporary layer for warnings that don't yet have a permanent home. Every entry should have:
- What the issue is
- The constraint it imposes
- Root cause (if known)
- What needs to happen for this entry to be retired

Entries should be reviewed at the end of every major change cycle. A `keep-in-mind.md` that grows without entries retiring is a sign of deferred root cause analysis.

---

## Section 5: Is This Workflow Right for My Project?

The BA→TechLead→SubAgent→BA loop is designed for multi-agent, multi-session execution with clear role separation. Not every project needs all of it.

### The Four Questions That Determine Your Workflow

**1. Who is doing the work?**

| Setup | Recommended simplification |
|---|---|
| Solo human | No delegation; collapse BA+TechLead into "planning phase" in same session |
| Solo + AI assistant | Keep BA+TechLead phases distinct but in same session; skip sub-agent formalism |
| Small team (2-3) | Each person takes a role-oriented posture; keep handoff files for async clarity |
| AI-heavy (mostly agent sessions) | Full workflow; emphasis on Wait States, context-loading, handoff ceremonies |

**2. How often do requirements change mid-implementation?**

- Rarely → lighter BA phase (one-question clarification, not full Q&A loop)
- Often → full BA phase, because upstream clarity prevents downstream rework

**3. What is the blast radius of a mistake?**

- Low (personal project, early prototype) → lightweight ceremony, trust your own judgment
- High (production data, security, shared APIs) → more ceremony, explicit scope gates

**4. How long are your working sessions?**

- Single session start-to-finish → Wait State machinery is less critical
- Multi-day, resumed sessions → context-loading and handoff protocols become essential

### The Invariants That Matter Regardless of Scale

These four principles apply whether you use the full workflow or a stripped-down version:

1. **Clarify before building** — one question asked upfront prevents hours of rework.
2. **Scope integrity** — know what is in scope and what isn't before implementation starts. Changes to scope are explicit, not absorbed silently.
3. **Traceability** — if you or a future agent can't find out *why* something was done the way it was, you'll re-debate it. CRs and ADRs exist to stop that loop.
4. **Context loading** — every session starts by loading the right context. "Right" means current state + relevant decisions, not everything.

### A Lightweight Workflow for Solo/Small Projects

```
1. [Clarify]  Write a one-paragraph scope note. What are we changing and why?
2. [Check]    Does this contradict any existing decision? (check ADRs, architecture invariants)
3. [Build]    Implement.
4. [Verify]   Did it meet the scope note? Run quality gates.
5. [Log]      Update project-log.md. If the decision was architectural, write an ADR.
```

If a task can't be described in one paragraph at step 1, you have a scoping problem, not a building problem.

---

## Section 6: Are the Roles Enough? Adding New Roles

The roles in any given agent-docs setup are project-specific. Your project's roles should reflect your actual work structure.

### Signs You Need a New Role

- A type of work consistently falls into the gap between two existing roles
- Authority over a type of decision is regularly disputed
- A specialist domain (data, security, design) regularly participates but has no defined scope
- One role is doing too many unrelated things

### Signs You're Adding Too Many Roles

- A new role's responsibilities could be captured as a constraint in an existing role
- The new role has no explicit "Does NOT" list (meaning its scope isn't actually bounded)
- You're adding a role for a one-time task (use a CR instead)

### The Five Components of Any Role Definition

Every role file must answer these questions:

**1. Primary Focus** (one sentence)
What unique problem does this role solve that no other role solves?

**2. Authority** — the three lists:
- **Owns**: What files and decisions are exclusively this role's?
- **Does NOT**: What are the hard boundaries? (This list is as important as "Owns")
- **May**: What is permissible but not primary?

**3. Interfaces With**
Which other roles does this role hand off to and receive from? What triggers each handoff?

**4. Required Readings**
Which agent-docs files must this role load before starting work?

**5. Required Outputs**
What does this role produce? What format? What must every output contain?

### Example: Adding a "Data Engineer" Role

```markdown
# Role: Data Engineer

## Primary Focus
Own data pipeline definitions, schema contracts, and data quality criteria.

## Authority
### Owns
- Data schema definitions and migration files
- Pipeline configuration and ETL logic
- Data quality acceptance criteria

### Does NOT
- Modify frontend components or API route handlers
- Write acceptance criteria for non-data features
- Make architectural decisions about application layer

### May
- Run diagnostics on pipeline health
- Propose schema changes to Tech Lead for ADR consideration

## Interfaces With
- Backend Agent: API contracts that expose data
- Tech Lead: Schema changes that require ADR

## Required Outputs
- Data schema documentation
- Pipeline health reports
- Data quality ACs for CRs that touch data
```

### Before Adding a Role, Ask

- Could this responsibility be added as a constraint within an existing role?
- Does this role have a clear, exclusive "Owns" list that doesn't overlap with existing roles?
- What does the handoff protocol look like for this role? (If you can't describe it, the role isn't well-defined yet)

---

## Section 7: Other Questions You'll Encounter

### "What's the minimum viable agent-docs setup?"

Five files (as described in Section 2): `AGENTS.md`, `project-vision.md`, `technical-context.md`, `project-log.md`, `workflow.md`. Add everything else only when the absence of that file causes a concrete problem.

### "How do I handle urgent hotfixes without the full flow?"

Define a **Fast Track exception** in your workflow:
- Applies when: root cause is clear, scope is contained to one file or function, no architectural decisions involved
- Fast Track process: one-line scope note → implement → verify → log
- Still create a CR (even a thin one) for traceability — don't skip the log

### "When can I skip the clarification phase?"

When **all three** are true:
- User intent is explicit and unambiguous
- Scope is procedural (close a CR, update a status, fix a typo)
- No plausible alternative interpretation exists

If any of these is false, ask at least one question before proceeding.

### "How do I handle disagreements between agent roles?"

Capture the disagreement with three elements:
1. The disputed assumption or constraint
2. The proposed alternatives
3. The decision owner (scope/intent disputes → BA; technical feasibility disputes → Tech Lead; unresolved → escalate to Human User)

Do not silently absorb a disagreement. Undocumented disagreements become undocumented drift.

### "What happens when requirements change mid-implementation?"

Scope Extension protocol:
1. Stop implementation on the affected part
2. Record: "scope extension requested, reason: [X]"
3. Get explicit approval from the decision owner (Tech Lead for technical scope, user for direct override)
4. Sync artifacts (update CR, update plan, update active handoff) before resuming

Do not absorb scope changes silently. Scope absorbed silently becomes scope that nobody can explain later.

### "How do I maintain agent-docs over time?"

Three mechanisms:
1. **`keep-in-mind.md` retirement**: At the end of each major cycle, review entries. If the root cause is resolved, retire the entry. A warning that never retires is a root cause never fixed.
2. **Meta-improvement cadence**: After completing a significant cycle of changes, ask: "Did the process help or create friction? What one thing would I change?" Write it as a small `[S][DOC]` CR.
3. **CR immutability**: Closed CRs are historical records — don't rewrite them. If a past decision needs clarification, create a follow-up CR or amendment note that references it.

### "How do I know if agent-docs is working?"

Green signals:
- New sessions start without rediscovering past decisions
- Scope creep is caught before implementation, not during
- Handoffs between roles or sessions are clear without clarification loops
- New contributors (human or AI) can orient from docs alone within one session
- Quality gate failures are classified clearly (CR-related vs. pre-existing vs. environmental)

Red signals:
- `keep-in-mind.md` is growing without entries retiring
- CRs are being written after implementation, not before
- Architectural decisions are being made in conversation, not in ADRs
- Sessions are starting by re-reading all of agent-docs every time

### "How do I version-control agent-docs?"

Agent-docs lives in the same repo as code — same git history, same branching. Commit agent-docs changes alongside the code changes they describe. Use conventional commits: `docs: update CR-XXX acceptance criteria`, `docs: add ADR-003 for auth strategy`.

The connection between code change and the CR that motivated it is your most valuable long-term asset.

---

## Appendix: Starter Template Structure

### Full Structure (Teams / AI-Heavy Projects)

```
agent-docs/
├── AGENTS.md                         # Entry point: roles, reading protocol, authority
├── project-vision.md                 # Why, who, what outcome, non-goals
├── project-principles.md             # Project-specific engineering principles
├── technical-context.md              # Cheat sheet: ports, tools, constraints, libraries
├── tooling-standard.md               # Package manager, testing stack, linting
├── architecture.md                   # System overview + architectural invariants
├── workflow.md                       # Change lifecycle: BA→TechLead→SubAgent→BA
├── keep-in-mind.md                   # Temporary warnings (with lifecycle ownership)
├── project-log.md                    # Current state, recent focus, next priorities
│
├── coordination/
│   ├── general-principles.md         # Cross-project engineering principles
│   ├── reasoning-principles.md       # How to analyze problems
│   ├── meta-improvement-protocol.md  # How to improve the process
│   ├── handoff-protocol.md           # Handoff format standards
│   └── feedback-protocol.md          # How to report blockers
│
├── roles/
│   ├── ba.md                         # Business Analyst: owns requirements, scope, ACs
│   ├── tech-lead.md                  # Tech Lead: owns plan, delegation, verification
│   └── sub-agents/
│       ├── frontend.md
│       ├── backend.md
│       ├── infra.md
│       └── testing.md
│
├── requirements/                     # Immutable after Done. CR-001-slug.md, CR-002-...
├── plans/                            # Tech Lead plans. CR-001-plan.md, ...
├── decisions/                        # ADRs. ADR-0001-title.md, ADR-0002-...
├── reports/                          # Investigation reports, completion reports
│
└── conversations/                    # Active handoff files — ephemeral, replaced per CR
    ├── ba-to-tech-lead.md
    ├── tech-lead-to-ba.md
    ├── tech-lead-to-frontend.md
    └── tech-lead-to-backend.md
```

### Minimal Structure (Solo / Early Stage)

```
agent-docs/
├── AGENTS.md                         # Entry point + solo role definition
├── project-vision.md                 # Why, who, what outcome, non-goals
├── technical-context.md              # Environment cheat sheet
├── workflow.md                       # Simplified 5-step change lifecycle
├── project-log.md                    # Current state + next priorities
├── keep-in-mind.md                   # Temporary warnings
├── decisions/                        # ADRs (add as decisions are made)
└── requirements/                     # CRs (add from CR-001 onward)
```

### File Bootstrap Content

**`project-log.md` (day one)**
```markdown
## Current State
- Status: Project initialized.
- Recent Focus: [none]

## Next Priorities
- [ ] [First planned change]
```

**`keep-in-mind.md` (empty)**
```markdown
# Keep In Mind (Temporary)
> Entries here are temporary constraints from recent mistakes.
> Lifecycle: Add → Fix root cause → Retire.

## Active Warnings
(none yet)
```

**`AGENTS.md` (minimal, solo)**
```markdown
# Agent Context

## Project
[One sentence description]

## How to Start Every Session
1. Read project-log.md (current state)
2. Read technical-context.md (environment)
3. Read the active CR in requirements/ (if one is in progress)
4. Confirm context loaded before proceeding

## Roles
- Planning: clarify scope, define ACs, write the CR
- Implementation: execute against the CR
- Do not start implementation without a scoped CR

## Authority
- CRs are immutable after Done
- Architectural decisions require an ADR
- Scope changes mid-implementation require explicit acknowledgment
```

---

*This guide is designed to be project-agnostic. Strip the project-specific content, fill in your own vision and constraints, and the structure scales from a solo side project to a multi-agent team workflow.*
