# Workflow (The Agent Loop)

## 🔁 The Cycle
1.  **Read Context**: Start at `docs/AGENTS.md`.
2.  **Plan**: Create/Update `implementation_plan.md`.
3.  **Review**: Ask USER for approval.
4.  **Execute**: Write code, strictly following `docs/development/`.
5.  **Verify**: Run tests (`pnpm test`), check interactions.
6.  **Document**: Update `docs/project-log.md` and `walkthrough.md`.

## 🛑 Stop Points
-   If tests fail -> Fix before moving on.
-   If design is unclear -> Ask USER.
-   If altering architecture -> Check `docs/architecture.md` first.

## 🔄 Multi-Agent Coordination

When multiple agents work together:
1. **Senior Agent**: Plans and delegates to specialized agents
2. **Specialized Agents**: Execute within their role boundaries
3. **Testing Agent**: Validates work before marking complete

**Handoff Protocol:**
- Agent A completes work → updates `project-log.md` → hands off to Agent B
- All handoffs must include: what was done, what's next, any blockers