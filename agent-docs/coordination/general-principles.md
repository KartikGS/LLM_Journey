# General Principles (Cross-Project)

These principles are intended to work across projects, not just LLM Journey.

## 1) Clarify Before Building
- Resolve ambiguity before implementation.
- Make assumptions explicit and testable.

## 2) Evidence Over Intuition
- Prefer command output, reproducible checks, and concrete references.
- When uncertain, probe the system instead of guessing.

## 3) Measurable Quality
- Use measurable acceptance criteria where possible.
- Avoid vague standards like "fast" or "clean" without thresholds.

## 4) Reversible Change
- Prefer changes with simple rollback paths.
- Avoid coupling unrelated modifications in one step.

## 5) Contract Preservation
- Treat routes, selectors, API contracts, and accessibility semantics as explicit contracts.
- If a contract must change, record and communicate the change clearly.

## 6) Scope Integrity
- Respect role boundaries and documented ownership.
- Escalate when requests cross scope or decision authority.

## 7) Failure Transparency
- Classify failures clearly (`CR-related`, `pre-existing`, `environmental`, `non-blocking warning`).
- Do not hide blockers; report early with evidence.
