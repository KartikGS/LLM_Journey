# Meta Improvement Protocol (Simplified Backward Pass)

## Purpose
Standardize how agents capture, synthesize, and implement documentation/process improvement feedback. 
Improvement is now framed as the **backward pass** to the workflow's forward pass. Findings re-enter the workflow as standard new **trigger inputs** — there is no separate complex improvement workflow.

## When To Use
Run the backward pass when a CR encounters significant execution friction, instruction conflicts, or process clarity issues, or periodically to maintain doc health.

---

## The Backward Pass Flow

The backward pass traverses the path actually taken by the instance under review — from terminal node back to entry node. In a branching graph, only the edges that fired during this instance are reviewed.

### 1. Producing Findings
- **Who goes first:** The role closest to the implementation friction (typically the downstream Sub-Agents: Backend, Frontend, Testing).
- **Carry-forward:** Their findings are passed backward up the graph (to the Tech Lead, then BA). Each agent reviews prior findings and adds their own.
- **Output:** Each agent writes a findings file using `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`.
  - Format: `a-docs/improvement/reports/META-YYYYMMDD-<CR-ID>-<role>-findings.md`

### 2. Synthesis & Trigger Inputs
- After the backward pass reaches the entry node, the **Improvement Agent** (or Tech Lead) reads the compiled findings.
- The synthesis process deduplicates items and decides: **Fix**, **Defer**, or **Reject**.
- **Re-entering the Workflow:** Approved fixes do not enter a separate "Phase 3". Instead, they re-enter the main workflow as **new trigger inputs** (i.e., new Change Requirements linked to `[S][DOC][ALIGN]`).

---

## Useful Lenses (Judgment Aids)

When evaluating improvements, consider these lenses (as guidance, not mandatory per-finding tags):
1. **Portability Boundary Lens**: Is the instruction reusable across projects, or project-specific?
2. **Collaboration Throughput Lens**: Does this rule force unnecessary serialization?
3. **Evolvability Lens**: Does this change reduce future edit cost?

---

## Guardrails
- **No Multi-Phase Overkill:** Do not run massive multi-agent improvement chains for every minor CR. Run the backward pass when the friction warrants it.
- **Workflow Re-entry:** All actionable improvements must go through the standard entry node as new trigger inputs rather than bypassing the standard workflow.
- **No Orthogonal Processes:** The backward pass is just a reflection phase; implementation uses the normal project constraints.
