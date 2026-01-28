# BA → Senior Developer Feedback Protocol

This protocol defines how the **Business Analyst (BA)** and **Senior Developer Agent**
collaborate **after initial handoff** when execution reality diverges from original scope.

The goal is to **contain scope drift early** and prevent wasted implementation effort.

---

## When This Protocol Is Used

The BA → Senior feedback loop is triggered when:

- Senior discovers unexpected complexity
- Implementation requires architectural changes not identified earlier
- Task size exceeds original scope classification
- Acceptance criteria are ambiguous or insufficient
- New constraints or tradeoffs emerge during planning

This protocol is **not** used for:
- Minor implementation questions
- Sub-agent clarification
- Code-level decisions

---

## Message Format

FROM: Senior Developer Agent
TO: BA Agent
TYPE: FEEDBACK
SUBJECT: Scope / Requirement Re-evaluation Needed

Original Scope:

Size: <S | M | L>

Execution Mode: <Fast | Standard | Heavy>

Issue Identified:
<What changed or was discovered>

Impact:

☐ Scope expansion

☐ Architectural impact

☐ Timeline increase

☐ Risk increase

Recommendation:

☐ Proceed with updated scope

☐ Split into multiple CRs

☐ Require ADR

☐ Clarify acceptance criteria

Blocking:
YES | NO

Supporting Context:

Relevant files

Docs references

Constraints discovered


---

## BA Agent Responsibilities Upon Feedback

The BA agent must:

1. Re-evaluate scope and assumptions
2. Clarify intent with the human **if needed**
3. Decide one of the following:
   - Update scope and re-issue Senior prompt
   - Split CR into smaller tracked units
   - Escalate architectural decision (ADR required)
4. Update `docs/project-log.md` accordingly

---

## Authority Clarification

- BA Agent **owns scope and intent**
- Senior Developer Agent **owns feasibility and execution**
- No implementation proceeds under unclear scope

If alignment cannot be reached:
→ STOP and ask the human.