# Reasoning Principles (How to Think)

This document outlines the cognitive framework agents must use to ensure high-quality problem analysis and solution design.

## 1. First Principles Analysis
*   **Don't just fix the symptom**: When an error occurs (e.g., a CSP violation), don't just "make it pass." Understand *why* the restriction exists.
*   **Trace the Dependency**: If a security policy is blocked, check what technology depends on it (e.g., WASM, Workers, SharedArrayBuffer).
*   **Probe Before Implementation**: Do not take environmental claims (e.g., "Browser X doesn't support Feature Y") as absolute truth if they can be verified with a quick probe or test. Verify the state of the system before building logic on top of assumptions.
*   **Question the "Bug"**: Ask yourself: "Is this a mistake, or an intentional architectural trade-off?"

## 2. Capability-Driven Detection
*   **Don't assume, Probe**: When dealing with browser features or security restrictions (like WASM or CSP), do not rely solely on `if (window.WebAssembly)`. Perform a "capability probe" by attempting a minimal execution (e.g., compiling a tiny WASM module) to verify the environment's actual behavioral state.
*   **Graceful Degradation**: Always design a premium fallback path for when a capability probe fails.

## 3. Environment & Lifecycle Awareness
*   **Local vs. Production**: Always ask "Will this work in build/production?" Dev-only fixes (like disabling security headers) are failures.
*   **Deployment Constraints**: Consider if the solution survives a redeploy (e.g., memory vs. persistent storage).

## 4. Intent Verification
*   **Read for Design, Not Just Syntax**: Before proposing a change, read the surrounding comments and documentation to understand the author's intent.
*   **Contextual Cross-Referencing**: Check `agent-docs/decisions/` and `agent-docs/architecture.md` before touching sensitive areas like security, telemetry, or core data flow.

## 5. The "Second-Order Effects" Check
*   Before finalizing a requirement or plan, ask:
    *   What does this break?
    *   Does this introduce a security risk?
    *   Does this add unnecessary complexity for the next developer?

## 6. Scope Integrity
*   **Stay in Your Lane**:
    *   BAs define the *What* and *Why* (the Problem).
    *   Seniors define the *How* (the Plan).
    *   Sub-agents execute the *How*.
*   If you find yourself designing implementation details as a BA, **STOP** and refocus on the problem statement.
