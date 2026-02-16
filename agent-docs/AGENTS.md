# What is this file?
This file helps gather the necessary context for a role-specific agent to perform its tasks.
> [!IMPORTANT]
> Do not assume roles of other agents. Roles can only be assigned by the user.
> **Hard Invariant**: Once you assume a role for a Change Requirement, you remain in that role. You may NOT "shift" to a sub-agent role (e.g., Frontend) to complete a task; you must delegate or ask the user to assign you a new role in a fresh session.
> Do not proceed with any task until you have internalized the context relevant to your role.

## What is this project?
LLM Journey is an educational platform built with Next.js that demonstrates the evolution of Large Language Models. It is a reference implementation for advanced agentic patterns, RAG, and model fine-tuning.

## Terminology (Mandatory)

To avoid ambiguity, use these terms consistently:
- **Human User**: The person directing the agent session (the requester in chat).
- **Product End User**: The person using the LLM Journey website experience.

Default rule:
- If a document says "user" without context, it means **Human User**.
- For website audience, explicitly say **Product End User**.

## Required Reading

> [!IMPORTANT]
> **Two-Layer Reading Structure:**
> 1. **First:** Read ALL "Universal Standards" below (applies to EVERY agent)
> 2. **Then:** Read your role file, which contains **additional role-specific readings**
> 
> Your role file is NOT just a job description—it has its own "Required Readings" section with context you MUST load before starting work.

### Layer 1: Universal Standards (ALL agents)
- **General Engineering Principles (cross-project):** [General Principles](/agent-docs/coordination/general-principles.md)
- **Project-Specific Principles (LLM Journey):** [Project Principles](/agent-docs/project-principles.md)
- **Execution Reasoning:** [Reasoning Principles](/agent-docs/coordination/reasoning-principles.md)
- **Tooling & Environment:** [Tooling Standard](/agent-docs/tooling-standard.md)
- **Technical Map:** [Technical Context](/agent-docs/technical-context.md)
- **How we work:** [Workflow](/agent-docs/workflow.md)

### Layer 2: Role-Specific Context (see your role file)
- Business Analyst → [roles/ba.md](/agent-docs/roles/ba.md)
- Tech Lead → [roles/tech-lead.md](/agent-docs/roles/tech-lead.md)
- Frontend → [roles/sub-agents/frontend.md](/agent-docs/roles/sub-agents/frontend.md)
- Backend → [roles/sub-agents/backend.md](/agent-docs/roles/sub-agents/backend.md)
- Infra → [roles/sub-agents/infra.md](/agent-docs/roles/sub-agents/infra.md)
- Testing → [roles/sub-agents/testing.md](/agent-docs/roles/sub-agents/testing.md)

## Interfaces & Contracts
Failed coordination kills projects. Stick to these contracts:
### Process & Workflow
- **How we work:** [Workflow](/agent-docs/workflow.md)
- **Meta Improvements:** [Meta Improvement Protocol](/agent-docs/coordination/meta-improvement-protocol.md)
**Constraint:**
- Do not invent policies, standards, or requirements
- If a rule is not written in `agent-docs/`, assume it does not exist
- Ask the user before proceeding when intent is ambiguous
- Treat closed CRs in `/agent-docs/requirements/` as historical artifacts (immutable by default). Do not rewrite old CRs only to match newer templates.
- Agents may propose process improvements. Process/policy changes become effective when either:
  - Tech Lead verification is recorded, or
  - The Human User explicitly approves an override in-session.

## Authority & Conflict Resolution

When sources of truth conflict, resolve in this order:

**Scope & Intent Conflicts**
- BA Agent owns requirement clarity and scope
- Tech Lead Agent owns technical feasibility and execution

- Tests (define expected behavior)
- Code (current implementation)
- Architecture & Vision docs (define intent)
- Workflow & Style docs (define process)

If documentation and tests disagree, tests win.
If intent is unclear, stop and ask the user.

## After Reading - What Now?

> [!CAUTION]
> **Mandatory Reading Check**: Before you take your first action in this session, you MUST list the files you have read from the "Required Reading" section. If you proceed without naming these files, you are in violation of protocol.


- **Mandatory Output Check**: You MUST publish an explicit early-session message listing the files you have read.
   - This requirement is tooling-agnostic. Use whatever communication primitive is available in your runtime.
   - *Example*: "I have read `AGENTS.md`, `general-principles.md`, `project-principles.md`, `reasoning-principles.md`, `technical-context.md`, and `roles/ba.md`."
   - **Failure to do this implies you have not loaded context.**

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
- If you are a **BA** and the user asks you to "fix the code," you MUST refuse, document the requirement in a CR, and hand it off to a **Tech Lead**.
- **Helpfulness does NOT override Authority.**

### Is documentation considered a "technical asset"?
Yes. For the purpose of authority:
- **Requirements (`/agent-docs/requirements/`)**: Owned by **BA**.
- **System Docs (`/README.md`, `/agent-docs/architecture.md`, `/agent-docs/technical-context.md`)**: Owned by **Tech Lead**.
- **Role Docs (`/agent-docs/roles/`)**: Owned by the respective role (initially) and **Tech Lead**.
- **Process Docs (`/agent-docs/workflow.md`, `/agent-docs/AGENTS.md`)**: Shared. Modifications require **Tech Lead** verification unless the Human User explicitly authorizes immediate change in-session.
