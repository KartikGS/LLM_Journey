# Meta Findings: Backend — CR-023

**Date:** 2026-02-28
**CR Reference:** CR-023 — Purpose-Driven Observability Refinement
**Role:** Backend
**Prior findings reviewed:** none (first agent in CR-023 Phase 1 chain)

---

## Conflicting Instructions

**BCK-023-C1 — "Do NOT modify: any other test file" vs. DoD requiring `pnpm test` to pass**

The handoff explicitly stated: "Do NOT modify: Any frontend component, any other test file, `lib/otel/token.ts`, any config file." The DoD's AC-7 required `pnpm test` to pass. Adding new exported functions to `lib/otel/metrics.ts` (a Backend-owned file) and calling them in routes causes test mocks in Testing-owned test files to become stale. The two constraints are structurally incompatible for any CR that adds metric getters: the scope gate blocks modifying the mocks; the DoD requires passing tests. I hit this exact conflict, raised it as a blocker, and it was resolved by user override. The conflict was not a misreading — it was a genuine design gap.

**Grounding:** Post-implementation `pnpm test` produced 10 failures in `__tests__/api/frontier-base-generate.test.ts` and `__tests__/api/adaptation-generate.test.ts`. Blocker reported; scope extension required. `collaboration`, `evolvability`

---

## Redundant Information

**BCK-023-R1 — "Assumptions To Validate" section duplicates TL discovery findings already in the plan**

The handoff contained an "Assumptions To Validate" section (4 items, each with pre-confirmed evidence). The same 4 assumptions with the same confirmation evidence also appeared in `CR-023-plan.md` under "Critical Assumptions." Backend was asked to validate assumptions the TL had already confirmed during discovery with specific line references. For an `[S]` CR with low-risk assumptions, this adds read time with no safety delta — it's a ceremony that optimizes for form (the template expects this section) over function.

**Grounding:** Reading the handoff and then reading the plan and finding the assumption confirmations stated identically in both. `evolvability`

---

## Missing Information

**BCK-023-M1 — Test mock cascade for metric infrastructure additions is not documented anywhere**

When Backend adds new exported functions to `lib/otel/metrics.ts`, every test file that mocks `@/lib/otel/metrics` with a closed factory object (`jest.mock('@/lib/otel/metrics', () => ({ ... }))`) will silently return `undefined` for the new function — and if the test-side `safeMetric` implementation is `(fn) => fn()` (no error handling), calling `undefined()` inside `safeMetric` propagates a TypeError into the route's outer catch block. The effect is invisible until `pnpm test` fails with wrong content-type or wrong response-shape assertions that appear completely unrelated to the metric change.

No guidance exists in `backend.md`, the handoff template, or `testing-strategy.md` to tell Backend: "adding a new metric getter to `lib/otel/metrics.ts` is a Testing mock-cascade event — flag it in preflight and identify all `jest.mock('@/lib/otel/metrics', ...)` blocks across the test suite before implementing."

**Grounding:** Root-cause analysis of the 10 test failures after implementation. The cascade was completely predictable in retrospect but not anticipated during preflight because there was no guidance to check for it. `collaboration`, `evolvability`

**BCK-023-M2 — `safeMetric`'s test-vs-production behavior divergence is undocumented**

In production, `safeMetric` is `try { fn() } catch { console.error(...) }` — metric failures are swallowed and logged. In tests across this codebase, `safeMetric` is consistently implemented as `(fn: () => void) => fn()` — metric failures propagate as unhandled exceptions into the route's error boundary. This divergence is a load-bearing contract: it means any metric call that throws in a test environment will produce a visible failure (good for test fidelity), while the same call in production is silently swallowed (good for operational safety). But this contract is nowhere documented. An agent adding new metric calls has no way to know that the test-side `safeMetric` is deliberately non-resilient without reading every test file.

**Grounding:** Diagnosing why `safeMetric(() => getFrontierGenerateUpstreamLatencyHistogram().record(...))` produced a fallback JSON response in tests despite `safeMetric`'s try/catch in production code. `evolvability`, `portability`

**BCK-023-M3 — nvm sourcing not addressed in Runtime Preflight recovery path**

`tooling-standard.md` states: "Use `nvm use <documented-version>` to activate the documented runtime version." But this command only works if nvm is sourced in the current shell. On this project, nvm is NOT sourced in the default shell profile — the default runtime is v16.20.1. The documented recovery path fails silently (`nvm: command not found`) without the prior sourcing step. The preflight guidance is technically correct but operationally incomplete: it needs the sourcing command (`export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"`) to be part of the recovery sequence.

**Grounding:** `node -v` returned `v16.20.1` on session start. `nvm use 20` returned "nvm: command not found." Had to discover the sourcing step independently before the recovery path worked. This is the same environmental state as prior sessions (CR-022 backend showed v20.20.0 passing — meaning prior sessions had nvm sourced somehow). `portability`

---

## Unclear Instructions

**BCK-023-U1 — "Do NOT modify: any other test file" implies no test cascade, but this is never stated**

The constraint "Do NOT modify: any other test file" is unambiguous as a prohibition. What is unclear is the implied assumption underneath it: that the implementation changes will not require test mock updates. For CRs that touch shared infrastructure (like `lib/otel/metrics.ts`), this assumption is false. The constraint reads as a scope boundary but functions as a trap: an agent following it correctly will produce a DoD-failing test suite; an agent that violates it to make tests pass is out of scope.

The missing signal is: when this constraint is written, does the TL believe the test mocks are comprehensive, or is this a genuine "testing scope only" policy that requires a Testing Agent followup? These are two very different intents with the same surface wording.

**Grounding:** The moment I finished implementation and ran `pnpm test` — the conflict became apparent only at verification time, not at planning time. `collaboration`

---

## Responsibility / Scope Concerns

**BCK-023-S1 — lib/otel/metrics.ts additions are Backend-owned but their test coverage is Testing-owned: a structural handoff gap**

`lib/otel/metrics.ts` is Backend-owned. The test files that mock it (`frontier-base-generate.test.ts`, `adaptation-generate.test.ts`) are Testing-owned (by the Testing Ownership Rule). Every time Backend adds a new metric getter to `lib/otel/metrics.ts`, the Testing-owned mock objects must be updated. This is not a one-off coordination problem — it's a structural ownership split that will repeat every time the metrics file gains a new export.

The current process has no bridge: Backend cannot update Testing files without scope extension; Testing cannot anticipate which new getters Backend will add without reading the Backend handoff. The result is either (a) a guaranteed scope extension request every time, or (b) a Testing Agent handoff that must run in tandem with every Backend observability CR.

**Grounding:** Every observability CR that adds metric getters (this one, and any future one) will hit this exact split. The 2-line mock fix that required a scope extension and blocker report is disproportionate ceremony for a structurally predictable event. `collaboration`, `evolvability`

---

## Engineering Philosophy Concerns

**BCK-023-E1 — No documented "Observability Design Principle" to guide what should and shouldn't be instrumented**

CR-023's entire purpose was correcting observability that was added without understanding its purpose: a span on an infrastructure proxy route with no parent trace context (every span is a disconnected root — trace volume with nothing to link to). The Rationale section of the handoff explains the principle clearly: "The proxy is a security/control boundary… It has no parent trace context… The span is instrumenting the infrastructure, not a product operation."

This is a concrete, articulable principle: **instrument product operations, not infrastructure plumbing; disconnected root spans with no parent context are noise, not signal; metrics and logs are sufficient where traces cannot link.** But this principle exists only in the CR rationale text — not in `backend.md`, not in `architecture.md`, not in any reusable guidance. Future routes will add spans with the same flawed premise unless the principle is captured somewhere persistent.

This finding directly encodes the user's observation: observability should be added with understanding of the purpose and tradeoffs, not applied as a blanket pattern. The tradeoff between trace richness (spans that link) vs. trace noise (disconnected roots) and the rule for when metrics+logs suffice — none of this is written down.

**Grounding:** Reading the CR-023 handoff Rationale section and recognizing it contained a portable observability principle that would prevent this class of mistake in any future route, but would be lost when this CR's artifacts are archived. `portability`, `evolvability`

**BCK-023-E2 — The "Telemetry Safety Invariant" is in architecture.md but Backend agents have no routine prompt to cross-reference it**

`architecture.md` contains the invariant: "Telemetry must never block, crash, or degrade user-facing functionality." CR-023's `safeMetric()` wrapping directly enforces this. But the Backend agent is not instructed to read `architecture.md` during context loading (it's not in the Backend required readings list). The invariant was discoverable only because the handoff mentioned it. Without the handoff reference, a Backend agent modifying metric call sites would have no prompt to check if their change violates this architectural invariant.

**Grounding:** `backend.md` required readings are: `backend.md`, `folder-structure.md`, `tech-lead-to-backend.md`. `architecture.md` is not listed. `portability`, `evolvability`

---

## Redundant Workflow Steps

**BCK-023-W1 — Pre-Replacement Check for backend-to-tech-lead.md when TL attestation is already present adds a re-read with near-zero safety value**

The workflow requires Backend to complete its own Pre-Replacement Check before replacing `backend-to-tech-lead.md`, even when the incoming handoff already contains a completed Pre-Replacement Check stub (TL attestation). The trust model says Backend "may trust this attestation without independently re-verifying plan artifacts or CR status." But the Write tool still requires a prior Read — meaning Backend must read `backend-to-tech-lead.md` regardless. The Read is correct (it's the Write tool constraint), but the Pre-Replacement Check section of the report then documents an attestation-trust decision that adds no safety check — it's form without substance when TL attestation is present.

**Grounding:** Reading `backend-to-tech-lead.md` before writing, then writing a Pre-Replacement Check section citing the TL attestation that already confirmed everything. The Check adds zero independent verification but costs format compliance ceremony. `evolvability`

---

## Other Observations

**BCK-023-O1 — Targeted linting standard (M-01 from CR-022) was implemented and worked correctly**

The `pnpm lint --file` pattern documented in `tooling-standard.md` was used directly in CR-023. No guesswork was required. This is a successful meta-improvement loop closure: BCK-022-01 identified the gap, M-01 was marked Fix, it was implemented, and the next Backend agent benefited immediately. Worth noting as a positive signal that the meta process produces concrete, durable improvements.

**Grounding:** Using `pnpm lint --file app/api/otel/trace/route.ts --file lib/otel/metrics.ts ...` without hesitation, finding the command in `tooling-standard.md` exactly as expected.

**BCK-023-O2 — The CR-023 handoff is an example of a well-specified deletion scope (span removal)**

The handoff specified exact removal targets: which span calls to remove, which to keep, what the result should look like, and why. This gave Backend high confidence that the span removal was complete without requiring independent discovery. The "Out-of-Scope But Must Be Flagged" section was also effective — it pre-enumerated the stop conditions. This handoff format (removal-heavy CRs benefit from explicit "what stays, what goes, why") is worth capturing as a template principle.

---

## Lens Coverage (Mandatory)

- **Portability Boundary**: BCK-023-E1 (Observability Design Principle) and BCK-023-M2 (safeMetric divergence) are directly portable to any project using OTel. They belong in `backend.md` under Observability or a standalone observability guide — not buried in a single CR's rationale. BCK-023-M3 (nvm sourcing) is project-environment-specific and belongs in `tooling-standard.md` Runtime Preflight as a project-local detail.

- **Collaboration Throughput**: BCK-023-C1 and BCK-023-S1 are the same structural gap viewed from two angles. Every observability CR that adds metric getters will serialize unnecessarily through a scope extension request and user override unless the ownership split is bridged — either by making metric mock updates part of Backend delegation scope by default, or by always pairing a Testing task with Backend observability CRs.

- **Evolvability**: BCK-023-E1 (observability principle) and BCK-023-M2 (safeMetric divergence) will cost re-discovery every CR that touches observability infrastructure if not documented. BCK-023-M1 (test mock cascade) will recur verbatim on the next metric getter addition. These three findings compound — they're all about the same knowledge gap around how observability infrastructure changes propagate through the codebase.

---

## Prior Findings: Assessment

(First agent in CR-023 chain — no prior findings to assess. Prior cycle CR-022 synthesis cross-referenced below for regression tracking.)

- **CR-022 M-01 (targeted linting standard)** → Confirmed implemented. `pnpm lint --file` was available and used without friction in CR-023. No regression.
- **CR-022 M-03 (ghost handler / client-server contract parity)** → Status unclear — the backend guidance note ("cleanup CRs that remove server error codes must flag remaining client-side handlers") was not observed in `backend.md` during context load. Either not implemented yet or implemented elsewhere. CR-023 did not exercise this path, so no regression confirmed, but the gap may still exist.
- **CR-022 M-02 (Negative Space Rule)** → Used successfully in AC-1, AC-2, AC-3 grep verification. Rule appears to be internalized via handoff DoD specification rather than a standalone named standard. If it's in `testing-strategy.md` now, it's available; if not, this CR confirms it's still only in handoff artifacts.

---

## Top 5 Findings (Ranked)

1. BCK-023-C1 | "Do NOT modify test files" + DoD `pnpm test` pass = structural conflict when metric infrastructure adds new getters | `roles/sub-agents/backend.md` / Scope Gate + handoff template | `collaboration`, `evolvability`
2. BCK-023-E1 | No documented observability design principle — "instrument product operations not infrastructure plumbing" exists only in one CR's rationale, will be lost on archival | `agent-docs/development/backend.md` / Observability section | `portability`, `evolvability`
3. BCK-023-S1 | lib/otel/metrics.ts additions are Backend-owned; their test mocks are Testing-owned — a structurally recurring ownership gap for every observability CR | `roles/sub-agents/backend.md` / Ownership Quick Matrix; `workflow.md` / Testing Handoff Trigger Matrix | `collaboration`, `evolvability`
4. BCK-023-M2 | safeMetric test-vs-production behavior divergence undocumented — tests propagate errors, production swallows them; critical contract for metric addition but nowhere written | `agent-docs/development/backend.md` / Observability section; `testing-strategy.md` | `evolvability`, `portability`
5. BCK-023-M3 | nvm recovery path in Runtime Preflight is incomplete — `nvm use 20` silently fails without sourcing step; preflight instructs the command but not the prerequisite | `agent-docs/tooling-standard.md` / Runtime Preflight | `portability`
