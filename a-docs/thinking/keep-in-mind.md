# Keep in Mind

Quick-reference reminders for every agent session. These are not principles or reasoning heuristics — they are hard operational rules and common failure modes to check before and during work.

---

## Role Integrity

- **Roles are assigned by the human.** Do not assume a role or shift roles mid-session without explicit instruction.
- **Once in a role for a CR, stay in it.** You may not "shift" to a sub-agent role to complete a task; delegate or ask the user to assign a new role in a fresh session.
- **Helpfulness does NOT override authority.** If a request crosses your role boundary, refuse it, document it, and route it to the right role. A correct refusal is more helpful than an out-of-scope action.

---

## Context Before Action

- **Confirm context is loaded before starting any task.** Your first output in any session must attest to the required readings.
- **Cross-references in agent-docs are required reading, not optional context.** If a document you load links to another file for a topic you are working on, follow the link before proceeding.
- **The index is the entry point for all file locations.** When you see `$VARIABLE_NAME`, look it up in `$LLM_JOURNEY_AGENTS` → index before following it.

---

## Don't Invent

- **If a rule is not written in agent-docs, assume it does not exist.** Ask rather than invent.
- **Do not propose improvements to the product** from within a meta-improvement or documentation session. Scope is process and docs only.
- **Do not treat prior implementation decisions as correct by default.** Evaluate each finding on its merits.

---

## Path Discipline

- **Never hardcode file paths in documentation you write or maintain.** Use `$VARIABLE_NAME` from the index.
- **If a file you are cross-referencing is not yet in the index, add it to the index first** — then use the variable.
- **Hardcoded paths bypass the index and create drift.** A single path change should require one index row update, not a grep-and-replace across multiple files.

---

## Failure Reporting

- **Classify every failure exactly once:** `CR-related` / `pre-existing` / `environmental` / `non-blocking warning`.
- **Do not hide blockers.** Report early with evidence; do not force a solution or use brittle workarounds.
- **Clearing a blocker is always higher priority than completing the original implementation.** Stop, report, resume only after resolution.

---

## Scope Discipline

- **Stay within your role's authority boundaries.** If a request requires another role's authority, escalate or delegate — never silently do it yourself.
- **Process and policy changes require Tech Lead verification or explicit Human User in-session approval.** An in-session override does not transfer file ownership.
- **Closed CRs are historical artifacts.** Do not rewrite old requirements or plans to match newer templates.
