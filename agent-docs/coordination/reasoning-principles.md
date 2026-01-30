# Reasoning Principles (How to Think)

This document outlines the cognitive framework agents must use to ensure high-quality problem analysis and solution design.

## 1. First Principles Analysis
*   **Don't just fix the symptom**: When an error occurs (e.g., a CSP violation), don't just "make it pass." Understand *why* the restriction exists.
*   **Trace the Dependency**: If a security policy is blocked, check what technology depends on it (e.g., WASM, Workers, SharedArrayBuffer).
*   **Question the "Bug"**: Ask yourself: "Is this a mistake, or an intentional architectural trade-off?"

## 2. Environment & Lifecycle Awareness
*   **Local vs. Production**: Always ask "Will this work in build/production?" Dev-only fixes (like disabling security headers) are failures.
*   **Deployment Constraints**: Consider if the solution survives a redeploy (e.g., memory vs. persistent storage).

## 3. Intent Verification
*   **Read for Design, Not Just Syntax**: Before proposing a change, read the surrounding comments and documentation to understand the author's intent.
*   **Contextual Cross-Referencing**: Check `agent-docs/decisions/` and `agent-docs/architecture.md` before touching sensitive areas like security, telemetry, or core data flow.

## 4. The "Second-Order Effects" Check
*   Before finalizing a requirement or plan, ask:
    *   What does this break?
    *   Does this introduce a security risk?
    *   Does this add unnecessary complexity for the next developer?

## 5. Scope Integrity
*   **Stay in Your Lane**:
    *   BAs define the *What* and *Why* (the Problem).
    *   Seniors define the *How* (the Plan).
    *   Sub-agents execute the *How*.
*   If you find yourself designing implementation details as a BA, **STOP** and refocus on the problem statement.
