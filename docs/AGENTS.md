# AGENTS.md - Canonical Entry Point

> [!IMPORTANT]
> **READ THIS FIRST.**
> Do not proceed with any task until you have internalized the context relevant to your role.

## 1. What is this project?
LLM Journey is an educational platform built with Next.js that demonstrates the evolution of Large Language Models. It is a reference implementation for advanced agentic patterns, RAG, and model fine-tuning.

## 2. Required Read Order

**Everyone reads:**
1. [Project Vision](./project-vision.md)
2. [Architecture](./architecture.md)
3. [Folder Structure](./folder-structure.md)
4. [Project Log](./project-log.md)

**Then, based on your role:**
- Business Analyst → [roles/ba.md](./roles/ba.md)
- Frontend → [roles/frontend.md](./roles/frontend.md)
- Backend → [roles/backend.md](./roles/backend.md)
- Infra → [roles/infra.md](./roles/infra.md)
- Testing → [roles/testing.md](./roles/testing.md)
- Observability → [roles/observability.md](./roles/observability.md)

Role-specific docs refine responsibilities but do not override system-wide constraints defined in Architecture and Testing Strategy.

## 3. Interfaces & Contracts
Failed coordination kills projects. Stick to these contracts:

### Process & Workflow
- **How we work:** [Workflow](./workflow.md)
- **Git process:** [Git Guidelines](./git-guidelines.md)

### Code Quality
- **Code standards:** [Style Guide](./development/style-guide.md)
- **Testing approach:** [Testing Strategy](./testing-strategy.md)

### System Contracts
- **API contracts:** [API Contracts](./api/)

## 4. Operational Memory

**Before starting work:**
- Check [Project Log](./project-log.md) for current state
- Check [Keep in Mind](./keep-in-mind.md) for recent gotchas

**When making architectural changes:**
- Read [Decisions](./decisions/) for context
- Add a new decision record if this change introduces a new constraint or tradeoff.

---
**Constraint:**
- Do not invent policies, standards, or requirements
- If a rule is not written in `docs/`, assume it does not exist
- Ask the user before proceeding when intent is ambiguous

## Execution Modes

Not all Change Requirements require full agent orchestration.

### Fast Path
Used when:
- Docs-only changes
- Trivial UI tweaks
- Test fixes
- No architectural impact

Flow:
Human → Senior Developer Agent → (Optional) Sub Agent

---

### Standard Path
Used when:
- New features
- API changes
- Non-trivial UI or backend work

Flow:
Human → BA Agent → Senior Developer Agent → Sub Agents

---

### Heavy Path
Used when:
- Architectural changes
- Cross-cutting concerns
- Multi-phase or long-running work

Flow:
Human → BA Agent → Senior Developer Agent  
→ BA Agent (scope split if required)  
→ Senior Developer Agent → Sub Agents

BA ↔ Senior feedback must follow docs/prompts/ba-to-senior-feedback.md


## 5. Authority & Conflict Resolution

When sources of truth conflict, resolve in this order:

**Scope & Intent Conflicts**
- BA Agent owns requirement clarity and scope
- Senior Developer Agent owns technical feasibility and execution

1. Tests (define expected behavior)
2. Code (current implementation)
3. Architecture & Vision docs (define intent)
4. Workflow & Style docs (define process)

If documentation and tests disagree, tests win.
If intent is unclear, stop and ask the user.

## 6. After Reading - What Now?

Once you’ve read the required docs:

1. **Verify your task is clear**
   - Do you understand the goal?
   - Do you know what success looks like?
   - Are constraints explicit?

2. **Check for blockers**
   - Review [Project Log](./project-log.md) for dependencies
   - Check [Keep in Mind](./keep-in-mind.md) for known issues

3. **Execute**
   - Follow [Workflow](./workflow.md)
   - Update [Project Log](./project-log.md) when done

4. **If stuck**
   - Don't guess
   - Don't invent requirements
   - Ask the user