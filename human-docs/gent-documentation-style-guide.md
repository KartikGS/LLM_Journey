# Agent Documentation Style Guide

This document defines **how documentation should be written** so that AI agents (and humans) can quickly understand, navigate, and operate within this repository.

The goal is **low ambiguity, high intent clarity, and deterministic navigation**.

---

## 1. Core Principles

### 1.1 Optimize for Intent First
Agents reason in terms of **intent**, not filenames.

✅ Good:
```md
- Check [Architecture](/agent-docs/architecture.md) for system design
````

❌ Bad:

```md
- Check /agent-docs/architecture.md
- Check [/agent-docs/architecture.md](/agent-docs/architecture.md)
```

**Rule:**

> Link text should describe *what knowledge the agent will gain*, not where the file lives.

---

### 1.2 One Concept per Document

Each document should answer **one primary question**.

| Document        | Primary Question            |
| --------------- | --------------------------- |
| architecture.md | How is the system designed? |
| workflow.md     | How do contributors work?   |
| testing.md      | How do we test and why?     |
| decisions/*     | Why was X decided?          |

Avoid multi-purpose docs.

---

### 1.3 Deterministic Navigation

Agents should never guess **where to look next**.

Every doc must contain:

* What this document is for
* When an agent should read it
* Where to go next (if applicable)

---

## 2. Linking Rules (Critical)

### 2.1 Always Use Semantic Links

Use **descriptive nouns** for link text.

✅ Correct:

```md
[Architecture]
[Workflow]
[Testing Strategy]
[API Contracts]
```

❌ Incorrect:

```md
[this]
[here]
[link]
[/agent-docs/architecture.md]
```

---

### 2.2 Prefer Absolute Paths

Always link from repo root.

✅ Good:

```md
[Architecture](/agent-docs/architecture.md)
```

❌ Bad:

```md
[Architecture](../architecture.md)
```

**Why:**
Agents may read documents out of directory context.

---

### 2.3 Inline Code Paths Are Non-Navigational

Use backticks **only** when the path is not meant to be followed.

✅ Correct:

```md
The tests live in `__tests__/integration`.
```

❌ Incorrect:

```md
Check `agent-docs/architecture.md` for details.
```

---

## 3. Document Structure Template

All agent-facing documents should follow this structure:

```md
# <Document Title>

## Purpose
What this document explains and why it exists.

## When to Read This
Clear triggers for when an agent should consult this document.

## Key Concepts
Bullet list of the main ideas.

## Details
The actual content.

## Related Documents
Explicit navigation to next resources.
```

---

## 4. Section Naming Conventions

Use **predictable, repeatable headings**.

Preferred section names:

* Purpose
* Scope
* Non-Goals
* Responsibilities
* Constraints
* Invariants
* Failure Modes
* Trade-offs
* Examples
* Related Documents

Avoid creative or vague headings:

* “Thoughts”
* “Notes”
* “Misc”
* “Overview-ish”

---

## 5. Language & Tone

### 5.1 Direct and Operational

Agents perform best with **imperative, explicit language**.

✅ Good:

```md
Agents MUST update this file when changing system boundaries.
```

❌ Bad:

```md
It might be a good idea to consider updating this file.
```

---

### 5.2 Avoid Implicit Knowledge

Never assume context.

❌ Bad:

```md
This works like usual.
```

✅ Good:

```md
This follows the same request lifecycle described in [Architecture](/agent-docs/architecture.md).
```

---

### 5.3 Stable Vocabulary

Use the **same term everywhere** for the same concept.

❌ Bad:

* Agent
* Worker
* Assistant
* Executor

✅ Good:

* Agent (everywhere)

If multiple roles exist, define them once:

```md
- Agent: Autonomous actor
- Senior Agent: Reviews and validates work
```

---

## 6. Explicit Constraints & Invariants

Agents need to know **what must not change**.

Always label constraints clearly:

```md
## Invariants
- API contracts are backward-compatible.
- Telemetry must not block request flow.
```

```md
## Non-Goals
- This system does not handle real-time streaming.
```

---

## 7. Decision Documentation (ADRs)

All irreversible or high-impact decisions must live in `/agent-docs/decisions/`.

Each ADR must include:

* Context
* Decision
* Alternatives considered
* Consequences

Agents should never infer architectural intent from code alone.

---

## 8. Agent Entry Points

Every repo must expose **clear starting points**.

### Required Files

* `AGENTS.md` → How agents should operate
* `project-log.md` → Current state & priorities
* `agent-docs/architecture.md` → System design

Agents should never scan the repo blindly.

---

## 9. Cross-Document Navigation Rules

Every document should link to:

* Its **parent concept**
* Its **next logical step**

Example:

```md
## Related Documents
- [Architecture](/agent-docs/architecture.md)
- [Workflow](/agent-docs/workflow.md)
```

---

## 10. Anti-Patterns (Avoid These)

❌ Long narrative prose without structure
❌ Files that mix process, architecture, and decisions
❌ Links without explanation
❌ “TODO” without owner or intent
❌ Implicit workflows hidden in code

---

## 11. Golden Rule

> **If an agent had no prior context, could it:
>
> 1. Understand why this document exists?
> 2. Know when to read it?
> 3. Know where to go next?**

If not — rewrite.

---

## 12. Example: Perfect Agent-Friendly Line

```md
Before modifying request flow, review [Architecture](/agent-docs/architecture.md) and record decisions in [ADRs](/agent-docs/decisions/).
```

Clear intent. Clear navigation. Zero ambiguity.

---

End of guide.