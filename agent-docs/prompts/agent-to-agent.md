# Agent-to-Agent Communication Protocol

## Message Types

### 1. QUERY (Asking for Information)
```
FROM: Frontend Agent
TO: Backend Agent
TYPE: QUERY
SUBJECT: API endpoint signature

Question: What's the expected response format for POST /api/preferences?
Context: Implementing usePreferences hook
Urgency: BLOCKING (cannot proceed)
Reference: See docs/api/preferences.md line 23 (seems incomplete)
```

### 2. HANDOFF (Transferring Ownership)
```
FROM: Backend Agent
TO: Frontend Agent
TYPE: HANDOFF
SUBJECT: User preferences API ready

Status: COMPLETE
What I did:
- Implemented POST /api/preferences
- Added GET /api/preferences
- All tests passing (see __tests__/api/preferences.test.ts)
- Added OTEL tracing

Next Steps for You:
- Build usePreferences hook
- Consume the API (contract in docs/api/preferences.md)
- Check for edge cases I may have missed

Blockers: None
Questions Welcome: Yes, I'll monitor for 24h
```

### 3. CONFLICT (Reporting Issues)
```
FROM: Frontend Agent
TO: Backend Agent
TYPE: CONFLICT
SUBJECT: API response doesn't match contract

Expected (per docs/api/preferences.md):
{
  success: boolean,
  data: { theme: string }
}

Actual (from GET /api/preferences):
{
  preferences: { theme: string }
}

Impact: BREAKING (my code is broken)
Suggested Fix: Update backend to match contract OR update contract
Urgency: HIGH
```

### 4. BLOCKED (Waiting on Dependency)
```
FROM: Frontend Agent
TO: Senior Agent
TYPE: BLOCKED
SUBJECT: Cannot proceed - API contract missing

Task: Implement user preferences UI
Blocked by: docs/api/preferences.md doesn't exist yet
Attempted: Checked docs/api/, searched codebase
Impact: Cannot start implementation
Request: Need Backend Agent to define contract first
ETA Needed: Within 2 hours to stay on schedule
```

## Communication Rules

1. **Always include TYPE** - helps routing and urgency assessment
2. **Reference specific files/lines** - no vague "the docs say..."
3. **State impact clearly** - BLOCKING, HIGH, MEDIUM, LOW
4. **Provide context** - what you tried, what you found
5. **Suggest solutions** - don't just report problems