# Testing Contract Registry

This file tracks durable test contracts that should remain stable unless a CR explicitly changes them.

## Update Protocol (Mandatory)

**When to update:** This registry must be updated at the Tech Lead / BA handoff boundary for every CR that adds, removes, or renames a route, `data-testid`, accessibility contract, or OTel metrics getter. This is a hard invariant — not a best-effort artifact.

**Who updates it:** Tech Lead Session B is the designated update point. Before authoring `tech-lead-to-ba.md`, the Tech Lead confirms the registry reflects the CR's contract changes. If a CR introduces testid or route changes that were discovered mid-execution (not at plan time), the CR Coordinator flags the need in their conclusion summary.

**CR Coordinator check:** During adversarial diff review, if any `data-testid` additions, removals, or renames — or route path changes — are present in the diff, verify that the Tech Lead handoff to BA includes a registry update instruction. If not, classify as an AC-blocking gap (registry is a contract artifact, not optional documentation).

**BA closure check:** The BA Closure Checklist item "confirm `testing-contract-registry.md` is updated" at closure applies. The registry must be accurate before the BA annotates contract-related ACs.

**Freshness at CR start:** A stale registry at the start of a CR creates a false baseline for BA acceptance. Before beginning acceptance verification for a contract-touching CR, the BA should confirm the registry was updated in Tech Lead Session B. If not, the BA must update it or flag the gap before annotating AC evidence.

## How to Use
- Update this registry when routes, `data-testid` contracts, accessibility semantics, or OTel metrics getters become stable product contracts.
- For CRs that intentionally change these contracts, include old->new mapping in plan/handoff/report artifacts.
- Use this as baseline context. Per-CR handoffs can narrow or extend scope.

## Route Contracts (Current)
- `/`
- `/foundations/transformers`
- `/models/adaptation`

## Transformers Stage Contracts (Current)
- Structural sections:
  - `transformers-hero`
  - `transformers-how`
  - `transformers-try`
  - `transformers-frontier`
  - `transformers-issues`
  - `transformers-next-stage`
  - `transformers-comparison`
- Continuity:
  - `transformers-continuity-links`
  - `transformers-link-home`
  - `transformers-link-adaptation`
- Frontier interaction:
  - `frontier-form`
  - `frontier-input`
  - `frontier-submit`
  - `frontier-status`
  - `frontier-output`

## Adaptation Stage Contracts (Current)
- `adaptation-page`
- `adaptation-hero`
- `adaptation-why-adapt` (added CR-022)
- `adaptation-strategy-comparison`
- `adaptation-chat`
- `adaptation-chat-tab-full-finetuning`
- `adaptation-chat-tab-lora-peft`
- `adaptation-chat-tab-prompt-prefix`
- `adaptation-chat-form`
- `adaptation-chat-input`
- `adaptation-chat-submit`
- `adaptation-chat-output`
- `adaptation-chat-status`
- `adaptation-limitations` (added CR-022)
- `adaptation-continuity-links`
- `adaptation-link-transformers`
- `adaptation-link-context`

## OTel Metrics Contracts (Current)

These are the canonical getter function names and their corresponding metric instrument names exported from `lib/otel/metrics.ts`. Tests that spy on or assert metrics counters must use these exact getter names — a mismatched name will silently fail to intercept the real instrument. Before implementing a metrics test, verify the getter name here rather than inferring it from a handoff.

| Getter function | Instrument name | Type | Description |
|---|---|---|---|
| `getTelemetryTokenRequestsCounter` | `telemetry_token.requests` | Counter | Total telemetry token requests |
| `getTelemetryTokenErrorsCounter` | `telemetry_token.errors` | Counter | Telemetry token errors by type |
| `getOtelProxyRequestsCounter` | `otel_proxy.requests` | Counter | Total OTEL proxy requests |
| `getOtelProxyRequestSizeHistogram` | `otel_proxy.request_size` | Histogram | OTEL proxy request body sizes in bytes |
| `getOtelProxyUpstreamLatencyHistogram` | `otel_proxy.upstream_latency` | Histogram | Upstream collector response latency in ms |
| `getOtelProxyErrorsCounter` | `otel_proxy.errors` | Counter | OTEL proxy errors by type |
| `getFrontierGenerateRequestsCounter` | `frontier_generate.requests` | Counter | Total frontier base-generate requests |
| `getFrontierGenerateFallbacksCounter` | `frontier_generate.fallbacks` | Counter | Frontier base-generate fallback outcomes by reason code |
| `getAdaptationGenerateRequestsCounter` | `adaptation_generate.requests` | Counter | Total adaptation generate requests |
| `getAdaptationGenerateFallbacksCounter` | `adaptation_generate.fallbacks` | Counter | Adaptation generate fallback outcomes by reason code |

**Maintenance:** The Backend agent must update this table when any CR adds, renames, or removes a metrics instrument. Trigger: any CR that modifies `lib/otel/metrics.ts`.
