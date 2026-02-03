# What is this file?
This file helps gather the necessary context for a role-specific agent to perform its tasks.
> [!IMPORTANT]
> Do not assume roles of other agents. Roles can only be assigned by the user.
> **Hard Invariant**: Once you assume a role for a Change Requirement, you remain in that role. You may NOT "shift" to a sub-agent role (e.g., Frontend) to complete a task; you must delegate or ask the user to assign you a new role in a fresh session.
> Do not proceed with any task until you have internalized the context relevant to your role.

## What is this project?
LLM Journey is an educational platform built with Next.js that demonstrates the evolution of Large Language Models. It is a reference implementation for advanced agentic patterns, RAG, and model fine-tuning.

## Required Reading
**General Standards:**
- **How to think:** [Reasoning Principles](/agent-docs/coordination/reasoning-principles.md)
- **Tooling & Environment:** [Tooling Standard.md](/agent-docs/tooling-standard.md)
- **Observability Setup:** [Observability Tools and Flow](/agent-docs/observability.md)
- **How we work:** [Workflow](/agent-docs/workflow.md)

**Based on your role:**
- Business Analyst → [roles/ba.md](/agent-docs/roles/ba.md)
- Senior Developer → [roles/senior.md](/agent-docs/roles/senior.md)
- Frontend → [roles/sub-agents/frontend.md](/agent-docs/roles/sub-agents/frontend.md)
- Backend → [roles/sub-agents/backend.md](/agent-docs/roles/sub-agents/backend.md)
- Infra → [roles/sub-agents/infra.md](/agent-docs/roles/sub-agents/infra.md)
- Testing → [roles/sub-agents/testing.md](/agent-docs/roles/sub-agents/testing.md)

**Shared Context:**
- **Technical Map**: [Technical Context Cheat Sheet](/agent-docs/technical-context.md)

## Interfaces & Contracts
Failed coordination kills projects. Stick to these contracts:
### Process & Workflow
- **How we work:** [Workflow](/agent-docs/workflow.md)
**Constraint:**
- Do not invent policies, standards, or requirements
- If a rule is not written in `agent-docs/`, assume it does not exist
- Ask the user before proceeding when intent is ambiguous

## Authority & Conflict Resolution

When sources of truth conflict, resolve in this order:

**Scope & Intent Conflicts**
- BA Agent owns requirement clarity and scope
- Senior Developer Agent owns technical feasibility and execution

- Tests (define expected behavior)
- Code (current implementation)
- Architecture & Vision docs (define intent)
- Workflow & Style docs (define process)

If documentation and tests disagree, tests win.
If intent is unclear, stop and ask the user.

## After Reading - What Now?

Once you’ve read the required docs:

- **Verify your task is clear**
   - Do you understand the goal?
   - Do you know what success looks like?
   - Are constraints explicit?

- **Execute**
   - Follow [Workflow](/agent-docs/workflow.md)

- **If stuck**
   - Don't guess
   - Don't invent requirements
   - Ask the user

## FAQs

### What if the user asks me to take actions outside my role's authority?
**Do not perform them.** Your role's boundaries are hard invariants designed to prevent technical drift and quality degradation. 
- If you are a **BA** and the user asks you to "fix the code," you MUST refuse, document the requirement in a CR, and hand it off to a **Senior Developer**.
- **Helpfulness does NOT override Authority.**

### Is documentation considered a "technical asset"?
Yes. For the purpose of authority:
- **Requirements (`/agent-docs/requirements/`)**: Owned by **BA**.
- **System Docs (`/README.md`, `/agent-docs/architecture.md`, `/agent-docs/technical-context.md`)**: Owned by **Senior Developer**.
- **Role Docs (`/agent-docs/roles/`)**: Owned by the respective role (initially) and **Senior Developer**.
- **Process Docs (`/agent-docs/workflow.md`, `/agent-docs/AGENTS.md`)**: Shared, but modifications require **Senior Developer** verification.