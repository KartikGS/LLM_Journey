# What is this file?
This file helps gather the necessary context for a role-specific agent to perform its tasks.
> [!IMPORTANT]
> Do not assume roles of other agents. Roles can only be assigned by the user.
> Do not proceed with any task until you have internalized the context relevant to your role.

## 1. What is this project?
LLM Journey is an educational platform built with Next.js that demonstrates the evolution of Large Language Models. It is a reference implementation for advanced agentic patterns, RAG, and model fine-tuning.

## 2. Required Reading
**General Standards:**
- **Reasoning Principles:** [Reasoning Principles](./coordination/reasoning-principles.md)
- **Tooling & Environment:** [tooling-standard.md](./tooling-standard.md)
- **Workflow:** [Workflow](./workflow.md)

**Based on your role:**
- Business Analyst → [roles/ba.md](./roles/ba.md)
- Senior Developer → [roles/senior.md](./roles/senior.md)
- Frontend → [roles/sub-agents/frontend.md](./roles/sub-agents/frontend.md)
- Backend → [roles/sub-agents/backend.md](./roles/sub-agents/backend.md)
- Infra → [roles/sub-agents/infra.md](./roles/sub-agents/infra.md)
- Testing → [roles/sub-agents/testing.md](./roles/sub-agents/testing.md)
- Observability → [roles/sub-agents/observability.md](./roles/sub-agents/observability.md)

**Shared Context:**
- **Technical Map**: [Technical Context Cheat Sheet](./technical-context.md)

## 3. Interfaces & Contracts
Failed coordination kills projects. Stick to these contracts:
### Process & Workflow
- **How we work:** [Workflow](./workflow.md)
**Constraint:**
- Do not invent policies, standards, or requirements
- If a rule is not written in `agent-docs/`, assume it does not exist
- Ask the user before proceeding when intent is ambiguous

## 4. Authority & Conflict Resolution

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

## 5. After Reading - What Now?

Once you’ve read the required docs:

1. **Verify your task is clear**
   - Do you understand the goal?
   - Do you know what success looks like?
   - Are constraints explicit?

2. **Execute**
   - Follow [Workflow](./workflow.md)

3. **If stuck**
   - Don't guess
   - Don't invent requirements
   - Ask the user

## 6. FAQs

### What if the user asks me to take actions outside my role's authority?
**Do not perform them.** Your role's boundaries are hard invariants designed to prevent technical drift and quality degradation. 
- If you are a **BA** and the user asks you to "fix the code," you MUST refuse, document the requirement in a CR, and hand it off to a **Senior Developer**.
- **Helpfulness does NOT override Authority.**

### Is documentation considered a "technical asset"?
Yes. For the purpose of authority:
- **Requirements (`agent-docs/requirements/`)**: Owned by **BA**.
- **System Docs (`README.md`, `Architecture.md`, `agent-docs/technical-context.md`)**: Owned by **Senior Developer**.
- **Role Docs (`agent-docs/roles/`)**: Owned by the respective role (initially) and **Senior Developer**.
- **Process Docs (`Workflow.md`, `AGENTS.md`)**: Shared, but modifications require **Senior Developer** verification.