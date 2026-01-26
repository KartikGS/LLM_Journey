# Senior to Junior Agent Delegation Protocol

## When to Delegate

Delegate when a task has:
- Multiple clear subtasks
- Well-defined boundaries between roles
- Minimal coordination overhead

Do NOT delegate when:
- The task requires architectural decisions
- Subtasks have complex dependencies
- The task is exploratory (requirements unclear)

## Delegation Template
```
**Task Decomposition for: <FEATURE_NAME>**

**Subtask 1: <API Contract Definition>**
- Owner: API Design Agent
- Input: Feature requirements
- Output: docs/api/<feature>.md
- Blocked by: None
- Blocks: Subtask 2, 3

**Subtask 2: <Backend Implementation>**
- Owner: Backend Agent
- Input: API contract from Subtask 1
- Output: app/api/<feature>/route.ts, tests
- Blocked by: Subtask 1
- Blocks: Subtask 3

**Subtask 3: <Frontend Integration>**
- Owner: Frontend Agent
- Input: API contract from Subtask 1, working backend from Subtask 2
- Output: UI components, client hooks
- Blocked by: Subtask 1, 2
- Blocks: None

**Handoff Protocol:**
Each agent must:
1. Complete their deliverable
2. Update docs/project-log.md with status
3. Tag the next agent explicitly
```

## Example: User Preferences Feature
```
**Task Decomposition for: User Preferences Storage**

**Subtask 1: Define API Contract**
Owner: Senior Agent (you)
Deliverable: docs/api/preferences.md
Status: DONE ✓

**Subtask 2: Backend Implementation**
Owner: Backend Agent
Read: docs/api/preferences.md, docs/roles/backend.md
Implement:
- app/api/preferences/route.ts (POST, GET endpoints)
- lib/db/preferences.ts (storage layer)
- __tests__/api/preferences.test.ts
Constraints:
- Follow error handling patterns in docs/development/backend.md
- Use server-side validation
- Add OTEL tracing to endpoints
Blocked by: None (contract is ready)
Blocks: Frontend work

**Subtask 3: Frontend Integration**
Owner: Frontend Agent
Read: docs/api/preferences.md, docs/roles/frontend.md
Implement:
- lib/hooks/use-preferences.ts (React hook)
- app/ui/settings/preferences-panel.tsx (UI)
- __tests__/lib/hooks/use-preferences.test.ts
Constraints:
- Must be responsive (mobile/tablet/desktop)
- Must handle loading/error states gracefully
- Must follow visual design system
Blocked by: Subtask 2 (needs working API)
Blocks: None

**Integration Checklist:**
- [ ] API contract reviewed
- [ ] Backend tests passing
- [ ] Frontend tests passing
- [ ] End-to-end flow verified
- [ ] docs/project-log.md updated
```