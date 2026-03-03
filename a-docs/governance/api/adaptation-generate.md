# API Contract: Adaptation Generate

## Route
- Method: `POST`
- Path: `/api/adaptation/generate`

## Purpose
Stage 2 adaptation interaction — live model output per strategy when configured; deterministic strategy-specific fallback when not configured.

## Ownership
- Implementing role: `Backend`
- Consuming role(s): `Frontend`, `Testing`

## Request Contract
### Headers
- `content-type: application/json`

### Body
```json
{
  "prompt": "Explain why scaling matters",
  "strategy": "full-finetuning"
}
```

### Validation Rules
- `prompt` must be a string.
- Trimmed `prompt` length must be between `1` and `2000` characters.
- `strategy` must be one of `"full-finetuning"`, `"lora-peft"`, or `"prompt-prefix"`.
- Invalid JSON, invalid `prompt`, or invalid `strategy` returns controlled `400` response.

## Response Contract
### Success: Live Mode
- Status: `200`
```json
{
  "mode": "live",
  "output": "...non-empty generated text...",
  "metadata": {
    "strategy": "full-finetuning",
    "modelId": "configured-model-id"
  }
}
```

### Success: Fallback Mode
- Status: `200`
```json
{
  "mode": "fallback",
  "output": "...deterministic curated text for strategy...",
  "reason": {
    "code": "missing_config",
    "message": "Adaptation provider is not configured. Showing deterministic fallback output."
  },
  "metadata": {
    "strategy": "full-finetuning",
    "modelId": "model-not-configured"
  }
}
```

### Controlled Validation Error
- Status: `400`
```json
{
  "error": {
    "code": "invalid_json | invalid_prompt | invalid_strategy",
    "message": "Human-readable description"
  }
}
```

## Fallback Reason Codes
- `missing_config`
- `quota_limited`
- `timeout`
- `upstream_auth`
- `upstream_error`
- `invalid_provider_response`
- `empty_provider_output`

## Status Code Matrix
| Condition | Status | Body Shape |
| :--- | :--- | :--- |
| Valid prompt/strategy + provider success | `200` | `mode: "live"` |
| Missing/invalid provider config | `200` | `mode: "fallback"` |
| Provider quota/auth/timeout/upstream failure | `200` | `mode: "fallback"` |
| Invalid JSON | `400` | `error` |
| Invalid prompt | `400` | `error` |
| Invalid strategy | `400` | `error` |

## Environment Contract
- `FRONTIER_API_KEY` (secret) — the only required env variable for generation auth. All other settings (URL, model IDs, timeout, output cap) are versioned in `lib/config/generation.ts`.

## Observability Contract
- Span name: `adaptation.generate`
- Span attributes include: `http.method`, `http.route`, `adaptation.strategy`, `adaptation.configured`, `adaptation.model_id`, `adaptation.mode`, and `adaptation.reason_code` where applicable.
- Logs must not include `FRONTIER_API_KEY` or `ADAPTATION_SYSTEM_PROMPT` content.

## Security Notes
- `FRONTIER_API_KEY` is server-only.
- `ADAPTATION_SYSTEM_PROMPT` is server-only.
- Neither appears in responses, logs, or span attributes.

## Consumer Notes (Frontend/Testing)
- Frontend should branch on `mode` (`live` vs `fallback`).
- Validation failures are explicit HTTP `400` with `error.code`.

## Change Log
- `2026-02-25`: CR-019 — non-secret generation settings moved to `lib/config/generation.ts`; `invalid_config` reason code removed (no longer reachable); Environment Contract updated to `FRONTIER_API_KEY`-only.
- `2026-02-25`: Initial contract added for CR-018.
