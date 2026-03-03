# LLM Journey — Coordination

This folder contains the standing protocols that govern how agents communicate, hand off work, escalate issues, and resolve disagreements. These are permanent documents — they are not replaced per CR. They change only when the underlying process changes.

---

## Contents

| File | Purpose |
|---|---|
| `handoff-protocol.md` | Status model, handoff formats and required fields for each role-pair transition, scope-override synchronization, and bidirectional clarification loop rules |
| `feedback-protocol.md` | How agents report discrepancies, false assumptions, and logical flaws discovered during execution; resolution path and priority rules |
| `conflict-resolution.md` | What to do when agents disagree — escalation paths and authority matrix |
| `TL-session-state.md` | Tech Lead's per-CR session state tracker — Coordinator session counts, execution outcome, pre-replacement checks |

---

## Relationship to Conversations

The protocols here govern the artifacts in `$LLM_JOURNEY_COMMUNICATION_CONVERSATIONS`. The handoff protocol defines what each conversation file must contain and when it is produced. The feedback protocol defines how conversation files are used to report and resolve blockers.

Agents do not modify coordination protocols mid-CR. If a protocol gap is discovered during execution, note it in the relevant conversation artifact and escalate — do not improvise an inline fix.

---

## See Also

- `$LLM_JOURNEY_COMMUNICATION_CONVERSATIONS` — the active handoff and report files these protocols govern
- `$LLM_JOURNEY_WORKFLOW` — the execution phases that trigger each handoff
