# LLM Journey — File Path Index

This is the single source of truth for key file locations in `agent-docs/`.

When a file moves, update **only this table**. All docs reference the variable name (`$VAR`), so a single row change here propagates the correct path to every consumer.

## Convention

- In prose and references across `agent-docs/`, use `$VARIABLE_NAME` instead of a raw file path.
- When following a reference, look up the variable in the table below to get the current path.
- To move a file: (1) update the **Path** cell below, (2) grep for the variable name to confirm no hardcoded path remnants exist in active docs.

---

## Index Table

| Variable | Current Path | Description |
|---|---|---|
| `$TOOLING_STANDARD` | `/agent-docs/llm-journey/project-tooling/standard.md` | Package manager (pnpm), Node.js version, testing stack (Jest/Playwright), linting (ESLint/Prettier), E2E command canon, targeted lint rules |
| `$LLM_JOURNEY_VISION` | `/agent-docs/llm-journey/project-information/vision.md` | Project mission, dual-audience definition (learner-user / developer-user), mental model, implementation strategy, and 10-stage roadmap |
| `$LLM_JOURNEY_STRUCTURE` | `/agent-docs/llm-journey/project-information/structure.md` | Repository folder layout and key `agent-docs/` subdirectory reference |
| `$LLM_JOURNEY_AGENTS` | `/agent-docs/llm-journey/agents.md` | Agent entry point for LLM Journey — universal standards, reading protocol, authority, and role index |
| `$LLM_JOURNEY_ROLE_BA` | `/agent-docs/llm-journey/roles/ba.md` | Business Analyst role — requirements, scope, acceptance criteria, clarification, and closure |
| `$LLM_JOURNEY_ROLE_TECH_LEAD` | `/agent-docs/llm-journey/roles/tech-lead.md` | Tech Lead role — planning, delegation, technical decisions, and CR execution model |
| `$LLM_JOURNEY_ROLE_COORDINATOR` | `/agent-docs/llm-journey/roles/coordinator.md` | CR Coordinator role — adversarial review, quality gates, and sub-agent handoffs |
| `$LLM_JOURNEY_ROLE_IMPROVEMENT` | `/agent-docs/llm-journey/roles/improvement.md` | Improvement Agent role — agent-docs system improvements only |
| `$LLM_JOURNEY_ROLE_BACKEND` | `/agent-docs/llm-journey/roles/sub-agents/backend.md` | Backend Engineer sub-agent — API routes, security, and observability |
| `$LLM_JOURNEY_ROLE_FRONTEND` | `/agent-docs/llm-journey/roles/sub-agents/frontend.md` | Frontend Engineer sub-agent — UI/UX, components, and accessibility |
| `$LLM_JOURNEY_ROLE_INFRA` | `/agent-docs/llm-journey/roles/sub-agents/infra.md` | Infrastructure sub-agent — deployment, CI/CD, and global security |
| `$LLM_JOURNEY_ROLE_TESTING` | `/agent-docs/llm-journey/roles/sub-agents/testing.md` | Testing sub-agent — E2E, contract assertions, and test infrastructure |
| `$LLM_JOURNEY_ARCHITECTURE` | `/agent-docs/llm-journey/project-information/architecture.md` | System overview, high-level components, data flow, and architectural invariants |
| `$LLM_JOURNEY_LOG` | `/agent-docs/llm-journey/project-information/log.md` | Current state, recent focus, next priorities, and archive |
| `$LLM_JOURNEY_PRINCIPLES` | `/agent-docs/llm-journey/project-information/principles.md` | Project-specific product and UX principles for LLM Journey |
| `$LLM_JOURNEY_WORKFLOW` | `/agent-docs/llm-journey/workflow/main.md` | Agent execution loop — phases, handoff protocols, invariants, and escalation rules |
| `$LLM_JOURNEY_WORKFLOW_PLANS` | `/agent-docs/llm-journey/workflow/plans/main.md` | Tech Lead execution plan template and historical CR plans |
| `$LLM_JOURNEY_WORKFLOW_REPORTS` | `/agent-docs/llm-journey/workflow/reports/main.md` | Investigation report template, example, and historical reports |
| `$LLM_JOURNEY_WORKFLOW_REQUIREMENTS` | `/agent-docs/llm-journey/workflow/requirements/main.md` | CR requirements template, directory guide, and historical CR artifacts |
