# LLM Journey — File Path Index

This is the single source of truth for key file locations in `a-docs/`.

When a file moves, update **only this table**. All docs reference the variable name (`$VAR`), so a single row change here propagates the correct path to every consumer.

## Convention

- In prose and references across `a-docs/`, use `$VARIABLE_NAME` instead of a raw file path.
- When following a reference, look up the variable in the table below to get the current path.
- To move a file: (1) update the **Path** cell below, (2) grep for the variable name to confirm no hardcoded path remnants exist in active docs.

---

## Index Table

| Variable | Current Path | Description |
|---|---|---|
| `$TOOLING_STANDARD` | `/LLM_Journey/a-docs/project-tooling/standard.md` | Package manager (pnpm), Node.js version, testing stack (Jest/Playwright), linting (ESLint/Prettier), E2E command canon, targeted lint rules |
| `$LLM_JOURNEY_VISION` | `/LLM_Journey/a-docs/project-information/vision.md` | Project mission, dual-audience definition (learner-user / developer-user), mental model, implementation strategy, and 10-stage roadmap |
| `$LLM_JOURNEY_STRUCTURE` | `/LLM_Journey/a-docs/project-information/structure.md` | Repository folder layout and key `a-docs/` subdirectory reference |
| `$LLM_JOURNEY_AGENTS` | `/LLM_Journey/a-docs/agents.md` | Agent entry point for LLM Journey — universal standards, reading protocol, authority, and role index |
| `$LLM_JOURNEY_ROLE_BA` | `/LLM_Journey/a-docs/roles/ba.md` | Business Analyst role — requirements, scope, acceptance criteria, clarification, and closure |
| `$LLM_JOURNEY_ROLE_TECH_LEAD` | `/LLM_Journey/a-docs/roles/tech-lead.md` | Tech Lead role — planning, delegation, technical decisions, and CR execution model |
| `$LLM_JOURNEY_ROLE_COORDINATOR` | `/LLM_Journey/a-docs/roles/coordinator.md` | CR Coordinator role — adversarial review, quality gates, and sub-agent handoffs |
| `$LLM_JOURNEY_ROLE_IMPROVEMENT` | `/LLM_Journey/a-docs/roles/improvement.md` | Improvement Agent role — agent-docs system improvements only |
| `$LLM_JOURNEY_ROLE_BACKEND` | `/LLM_Journey/a-docs/roles/sub-agents/backend.md` | Backend Engineer sub-agent — API routes, security, and observability |
| `$LLM_JOURNEY_ROLE_FRONTEND` | `/LLM_Journey/a-docs/roles/sub-agents/frontend.md` | Frontend Engineer sub-agent — UI/UX, components, and accessibility |
| `$LLM_JOURNEY_ROLE_INFRA` | `/LLM_Journey/a-docs/roles/sub-agents/infra.md` | Infrastructure sub-agent — deployment, CI/CD, and global security |
| `$LLM_JOURNEY_ROLE_TESTING` | `/LLM_Journey/a-docs/roles/sub-agents/testing.md` | Testing sub-agent — E2E, contract assertions, and test infrastructure |
| `$LLM_JOURNEY_ARCHITECTURE` | `/LLM_Journey/a-docs/project-information/architecture.md` | System overview, high-level components, data flow, and architectural invariants |
| `$LLM_JOURNEY_LOG` | `/LLM_Journey/a-docs/project-information/log.md` | Current state, recent focus, next priorities, and archive |
| `$LLM_JOURNEY_PRINCIPLES` | `/LLM_Journey/a-docs/project-information/principles.md` | Project-specific product and UX principles for LLM Journey |
| `$LLM_JOURNEY_WORKFLOW` | `/LLM_Journey/a-docs/workflow/main.md` | Agent execution loop — phases, handoff protocols, invariants, and escalation rules |
| `$LLM_JOURNEY_WORKFLOW_PLANS` | `/LLM_Journey/a-docs/workflow/plans/main.md` | Tech Lead execution plan template and historical CR plans |
| `$LLM_JOURNEY_WORKFLOW_REPORTS` | `/LLM_Journey/a-docs/workflow/reports/main.md` | Investigation report template, example, and historical reports |
| `$LLM_JOURNEY_WORKFLOW_REQUIREMENTS` | `/LLM_Journey/a-docs/workflow/requirements/main.md` | CR requirements template, directory guide, and historical CR artifacts |
| `$LLM_JOURNEY_DEV` | `/LLM_Journey/a-docs/development/main.md` | Development standards — general principles, project structure, API route requirements, code quality conventions |
| `$LLM_JOURNEY_CONTRIBUTION` | `/LLM_Journey/a-docs/development/contribution.md` | Contribution guidelines — branching strategy, commit message format, git hygiene |
| `$LLM_JOURNEY_TECHNICAL_CONTEXT` | `/LLM_Journey/a-docs/development/technical-context.md` | Technical configuration cheat sheet — endpoints, tooling, constraints, security context |
| `$LLM_JOURNEY_TESTING` | `/LLM_Journey/a-docs/development/testing/main.md` | Testing strategy — philosophy, tooling, E2E policy, coverage guarantees |
| `$LLM_JOURNEY_TESTING_CONTRACTS` | `/LLM_Journey/a-docs/development/testing/contract-registry.md` | Durable test contract registry — routes, selectors, and OTel metrics getter names |
| `$LLM_JOURNEY_DESIGN_TOKENS` | `/LLM_Journey/a-docs/development/frontend/main.md` | Design tokens and visual system — single source of truth for visual values |
| `$LLM_JOURNEY_FRONTEND_REFACTOR` | `/LLM_Journey/a-docs/development/frontend/refactor-checklist.md` | Frontend refactor checklist — safety steps for rendering-boundary and shared UI changes |
| `$LLM_JOURNEY_GOVERNANCE` | `/LLM_Journey/a-docs/governance/main.md` | Governance overview — entry point for API contracts and architectural decisions |
| `$LLM_JOURNEY_GOVERNANCE_API` | `/LLM_Journey/a-docs/governance/api/main.md` | API contract rules and contents index |
| `$LLM_JOURNEY_GOVERNANCE_DECISIONS` | `/LLM_Journey/a-docs/governance/decisions/main.md` | Architecture Decision Records index and ADR template |
| `$LLM_JOURNEY_DEV_BACKEND` | `/LLM_Journey/a-docs/development/backend.md` | Backend development standards — API routes, observability patterns, streaming, and SSE |
| `$LLM_JOURNEY_COMMUNICATION` | `/LLM_Journey/a-docs/communication/main.md` | Communication folder entry point — inter-agent handoffs (conversations) and standing protocols (coordination) |
| `$LLM_JOURNEY_COMMUNICATION_CONVERSATIONS` | `/LLM_Journey/a-docs/communication/conversations/main.md` | Active handoff/report files for the current CR and permanent templates governing their format |
| `$LLM_JOURNEY_COMMUNICATION_COORDINATION` | `/LLM_Journey/a-docs/communication/coordination/main.md` | Standing protocols — handoff protocol, feedback protocol, conflict resolution, TL session state |
| `$LLM_JOURNEY_THINKING` | `/LLM_Journey/a-docs/thinking/main.md` | General principles — cross-role operational rules for every agent |
| `$LLM_JOURNEY_THINKING_REASONING` | `/LLM_Journey/a-docs/thinking/reasoning.md` | Reasoning framework — cognitive heuristics and decision-making patterns for agents |
| `$LLM_JOURNEY_THINKING_KEEP_IN_MIND` | `/LLM_Journey/a-docs/thinking/keep-in-mind.md` | Operational reminders — hard stops and common failure modes every agent must check |
| `$LLM_JOURNEY_IMPROVEMENT` | `/LLM_Journey/a-docs/improvement/main.md` | Improvement philosophy — principles for evaluating and implementing doc improvements |
| `$LLM_JOURNEY_IMPROVEMENT_PROTOCOL` | `/LLM_Journey/a-docs/improvement/protocol.md` | Meta improvement protocol — phases, roles, and guardrails for meta-analysis cycles |
| `$LLM_JOURNEY_IMPROVEMENT_REPORTS` | `/LLM_Journey/a-docs/improvement/reports/main.md` | Improvement reports index — naming conventions and links to report template files |
| `$LLM_JOURNEY_IMPROVEMENT_TEMPLATE_LIGHTWEIGHT` | `/a-society/general/improvement/reports/template-lightweight.md` | Lightweight synthesis report template |
| `$LLM_JOURNEY_IMPROVEMENT_TEMPLATE_FINDINGS` | `/a-society/general/improvement/reports/template-findings.md` | Per-agent findings report template |
| `$LLM_JOURNEY_IMPROVEMENT_TEMPLATE_SYNTHESIS` | `/a-society/general/improvement/reports/template-synthesis.md` | Synthesis report template |
| `$LLM_JOURNEY_IMPROVEMENT_TEMPLATE_BACKLOG` | `/a-society/general/improvement/reports/template-backlog.md` | Alignment backlog template |
