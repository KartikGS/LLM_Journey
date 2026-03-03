# LLM Journey — Communication

This folder contains everything that governs how agents communicate with each other during project execution: the active handoff artifacts for the current CR, and the standing protocols that define how those artifacts are produced and consumed.

---

## Structure

```
communication/
├── conversations/    ← live handoff/report files + permanent templates
└── coordination/     ← standing protocols: handoff rules, feedback, conflict resolution
```

---

## Sub-Folders

### `conversations/` — `$LLM_JOURNEY_COMMUNICATION_CONVERSATIONS`

The active inter-agent handoff and report files for the current CR. Each file represents a live communication channel between two roles (e.g., `ba-to-tech-lead.md`, `tech-lead-to-backend.md`). Files are replaced when a new CR begins, after confirming the prior CR is closed.

Also contains the permanent templates that define mandatory fields and format for each conversation type.

### `coordination/` — `$LLM_JOURNEY_COMMUNICATION_COORDINATION`

The standing protocols that govern all agent communication: the handoff protocol (status model, required fields, bidirectional clarification loop), feedback protocol (how blockers and discrepancies are reported), conflict resolution (escalation paths and authority), and the Tech Lead's session state tracker.

These documents change only when the process itself changes — not per CR.

---

## The Relationship Between the Two

Coordination defines the rules. Conversations are the artifacts produced under those rules.

When you need to know **what format** a handoff must follow or **what status token** to use: read `$LLM_JOURNEY_COMMUNICATION_COORDINATION`.

When you need to read or write the **active handoff** for the current CR: go to `$LLM_JOURNEY_COMMUNICATION_CONVERSATIONS`.

---

## See Also

- `$LLM_JOURNEY_WORKFLOW` — the execution phases that trigger and consume these communication artifacts
- `$LLM_JOURNEY_AGENTS` — role index and universal standards
