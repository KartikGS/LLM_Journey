# Workflow (The Agent Loop)

## Multi-Agent Workflow

### Phase 1: Requirement Analysis (BA Agent)
1. User provides rough CR
2. BA clarifies through Q&A
3. BA creates structured requirement document
4. BA assesses business complexity
5. BA decides whether to split into multiple CRs
6. **Output:** `docs/requirements/CR-XXX.md` + prompt for Senior Dev
7. BA reports back to user for review and approval
8. User approves or requests changes
9. If user requests changes, go back to step 2

### Phase 2: Technical Planning (Senior Developer Agent)
1. Senior reads CR from BA. Read [../conversations/ba-to-senior.md](../conversations/ba-to-senior.md) for more details.
2. Senior assesses technical complexity.
3. Senior decides single vs multi-session.
4. **MANDATORY OUTPUT:** Senior creates `agent-docs/plans/CR-XXX-plan.md` using the Standard Plan Template.
5. **MANDATORY CHECK:** Senior submits plan summary to USER for "Go/No-Go" decision.
6. Senior assigns sub-agents (if multi-agent is required).
7. **Output:** Task specifications + prompts for sub-agents in the plan file.

### Phase 3: Implementation (Sub-Agents)
1. Sub-agent receives task specification
2. Sub-agent executes within role boundaries
3. Sub-agent requests clarification if needed
4. Sub-agent completes and verifies work
5. **Output:** Implementation + tests + updated docs + report for senior dev

### Phase 4: Verification (Senior Developer Agent)
1. Senior reviews completed work reports
2. Senior ensures integration works
3. Senior updates architectural docs if needed
4. **Output:** Verified, integrated feature + report for BA

### Phase 5: Acceptance (BA Agent)
1. BA verifies acceptance criteria met
2. BA updates requirement status
3. BA notifies user
4. **Output:** Accepted CR, updated project log + report for user