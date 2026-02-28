# BA to Tech Lead Handoff

## Subject
`CR-023 — Purpose-Driven Observability Refinement`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing BA handoff context: `CR-022`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-022-plan.md` ✓
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-022-adaptation-page-upgrade-and-cleanup.md` status is `Done` ✓
- Result: replacement allowed for new CR context.

## Objective

CR-023 corrects two concrete bugs and two design-level observability gaps across the four API routes. All changes are Backend-scoped (route files + metrics library). No API contracts, response shapes, or UI components are touched.

**Three distinct change groups:**

1. **Proxy route cleanup** (`app/api/otel/trace/route.ts`): Remove the span entirely (no parent context, metrics+logs already cover all signals), wrap all metric calls in `safeMetric()` (crash-risk fix), remove the success `logger.info` (noise).

2. **Dead metric removal** (`lib/otel/metrics.ts`): Remove `getTelemetryTokenErrorsCounter()` and its backing variable — never called anywhere, no error path exists in the token route.

3. **AI provider latency histograms** (`app/api/frontier/base-generate/route.ts`, `app/api/adaptation/generate/route.ts`): Record upstream latency in milliseconds after the AI provider `fetch()` completes on the success path. Adaptation histogram includes `strategy` as a dimension. Add supporting histogram getter(s) to `lib/otel/metrics.ts`.

## Linked Artifacts
- CR: `agent-docs/requirements/CR-023-purpose-driven-observability-refinement.md`

## Audience & Outcome Check
- **Human User intent**: Correct the observability instrumentation so each route's signals match its operational purpose — no more, no less.
- **Developer-user impact**: The codebase becomes a cleaner reference implementation. Each route demonstrates deliberate observability choices: the proxy uses metrics + logs only (security/control boundary with no trace context); the token issuer uses a single counter (trivial operation); generation routes use spans + counters + latency histograms (product-critical, external dependency).
- **No learner-user impact**: All changes are server-side infrastructure. No page content, UI, or product behavior changes.

## Suggested Execution Mode
**Single Backend sub-agent, sequential within session.** All three change groups touch the Backend domain exclusively. The histogram getter additions to `lib/otel/metrics.ts` are a prerequisite for the generation route changes — the sub-agent should complete group 2 and add histogram getters (group 3 metrics setup) before updating the route files.

## Key Design Decisions for Tech Lead Resolution
1. **Shared vs. separate histograms for generation latency**: A single `generation_upstream_latency` histogram with a `route` dimension vs. separate `frontier_generate.upstream_latency` and `adaptation_generate.upstream_latency` histograms — either is acceptable. Prefer the approach that's consistent with the existing counter naming convention (`frontier_generate.*`, `adaptation_generate.*`), but this is a Tech Lead call.
2. **Proxy route test updates**: Existing unit tests for the proxy route may assert on span behavior. These must be updated. Confirm scope before starting implementation — `grep` for span-related assertions in `__tests__/`.
3. **`getTelemetryTokenErrorsCounter` import audit**: Run `grep -rn "getTelemetryTokenErrorsCounter"` before removing from `lib/otel/metrics.ts` to confirm no call sites exist outside the metrics file itself.

## Acceptance Criteria Summary (full detail in CR-023)
- AC-1: Proxy route contains no `startActiveSpan`, `SpanKind`, `SpanStatusCode`, or `getTracer` usage
- AC-2: All metric calls in proxy route wrapped in `safeMetric()`
- AC-3: Proxy route contains no `logger.info(...)` call
- AC-4: `lib/otel/metrics.ts` contains no `getTelemetryTokenErrorsCounter` or `telemetryTokenErrors`
- AC-5: Frontier route records upstream latency (ms) after successful AI provider `fetch()`
- AC-6: Adaptation route records upstream latency (ms) with `strategy` dimension after successful AI provider `fetch()`
- AC-7: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` all pass

## Constraints
- No new npm packages — existing OTel histogram infrastructure in `lib/otel/metrics.ts` is sufficient.
- TypeScript strict mode must remain satisfied.
- Error- and warn-level logs in the proxy route must not be removed.
- Upstream latency must only be recorded when `fetch()` completes with a response — not on timeout or connection-failed fallback paths.
- No API response contracts, `data-testid` attributes, or route paths are changed.

## Risk Notes
- The proxy route span removal is intentional and documented as a design decision in the CR notes. If the Tech Lead identifies a reason to retain a span (e.g., a use case not covered in the BA analysis), surface it before implementing rather than silently keeping it.
- The dead metric removal is safe if the import audit returns zero call sites. If a call site is found, flag it to the BA before proceeding — it would change the scope of this CR.
