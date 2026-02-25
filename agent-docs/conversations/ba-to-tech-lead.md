# BA to Tech Lead Handoff

## Subject
`CR-018 — Generation API Hardening Parity`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior outgoing BA handoff context: `CR-017`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-017-plan.md`
- Evidence 2 (prior CR closed): `agent-docs/requirements/CR-017-small-backlog-fixes-and-runtime-alignment.md` status is `Done`
- Result: replacement allowed for new CR context.

## Objective
Close hardening/governance drift between generation APIs and the OTEL boundary while preserving existing learner-facing route contracts.

## Linked Artifacts
- CR: `agent-docs/requirements/CR-018-generation-api-hardening-parity.md`
- Investigation: `agent-docs/reports/INVESTIGATION-CR-018-route-hardening-parity.md`

## Audience & Outcome Check
- Human User intent: validate and execute hardening parity for new generation routes versus OTEL baseline.
- Product End User audience: Stage 1 and Stage 2 learners using frontier/adaptation interactive flows.
- Expected outcome: reliable and secure generation interactions with stronger route-level controls and clearer operational diagnostics, without UX/contract regression.

## Clarified Requirement Summary
- Keep `/api/frontier/base-generate` and `/api/adaptation/generate` as separate external contracts.
- Reduce duplicated server-side logic across generation routes where behavior is equivalent.
- Add abuse-protection parity for generation routes (rate/body constraints) using explicit policy.
- Add route-level non-blocking metrics parity for generation routes in addition to current tracing/logging.
- Ensure contract-documentation parity in `agent-docs/api/` for touched routes.
- Add tests for new controls and negative-path containment checks.

## Acceptance Criteria Mapping
- [ ] AC-1: Separate public route contracts preserved (frontier/adaptation).
- [ ] AC-2: Duplicated generation-route server logic reduced via shared internal module/utility.
- [ ] AC-3: Explicit abuse controls (rate + body-size) applied to generation routes with controlled responses.
- [ ] AC-4: Route-level metrics added for generation request/failure/fallback outcomes, non-blocking by design.
- [ ] AC-5: No secret/system-prompt leakage in responses/logs/span attributes.
- [ ] AC-6: API contract docs updated for all touched routes (minimum adaptation route doc added).
- [ ] AC-7: Tests added/updated to verify new controls and observability safety behavior.
- [ ] AC-8: `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` pass.
- [ ] AC-9: No route-path, `data-testid`, or accessibility-semantic contract changes.

## Verification Mapping
- Route behavior + regression proof: focused API tests for frontier/adaptation routes.
- Abuse-control proof: middleware/API tests with threshold-edge and reset-window checks.
- Observability proof: metrics emission assertions plus non-blocking telemetry-failure test(s).
- Security containment proof: explicit negative assertions/audit for prohibited data leakage.
- Full quality gates in canonical sequence for closure evidence.

## Constraints
- Preserve current route paths and response envelopes for frontier/adaptation consumers.
- Preserve ADR-0001 telemetry-failure boundary behavior.
- Avoid high-cardinality metrics dimensions and avoid logging sensitive payload fields.
- No package installation unless scope extension is explicitly approved.
- If route/selector/accessibility contracts must change, pause and request scope-extension decision.

## Open Decisions
- `none` at BA stage.

## Risk Analysis
- Too-strict abuse thresholds may degrade legitimate interactions.
- Shared internal refactor can accidentally widen change scope.
- Metrics additions can become noisy if dimensions are not tightly bounded.

## Rationale (Why)
This CR addresses your three questions directly: keep product-intent route separation, but remove maintainability drift by aligning generation-route hardening, testing, and observability posture with the established OTEL boundary standards.

## Evidence Expectations for Tech Lead Handoff
- One-line evidence per AC (file/line and command outputs).
- Explicit contract-stability declaration (routes, selectors, semantics).
- Clear classification of any environmental limitations vs CR-related defects.
- Updated API contract doc references for every touched endpoint contract.
