# API Contract: Frontier Base Generate

## Route
- Method: `POST`
- Path: `/api/frontier/base-generate`

## Purpose
Provide Stage 1 frontier interaction for Transformers page by returning live base-model output when provider configuration is available, and deterministic fallback output when live generation is unavailable.

## Ownership
- Implementing role: `Backend`
- Consuming role(s): `Frontend`, `Testing`

## Request Contract
### Headers
- `content-type: application/json`

### Body
```json
{
  "prompt": "Explain why scaling matters"
}
```

### Validation Rules
- `prompt` must be a string.
- Trimmed `prompt` length must be between `1` and `2000` characters.
- Invalid JSON or invalid `prompt` returns controlled `400` response.

## Response Contract
### Success: Live Mode
- Status: `200`
```json
{
  "mode": "live",
  "output": "...non-empty generated text...",
  "metadata": {
    "label": "Frontier Base Model",
    "modelId": "frontier-base-model-id",
    "assistantTuned": false,
    "adaptation": "none",
    "note": "Pretrained on internet-scale text; not assistant fine-tuned."
  }
}
```

### Success: Fallback Mode
- Status: `200`
```json
{
  "mode": "fallback",
  "output": "...deterministic curated text...",
  "reason": {
    "code": "missing_config",
    "message": "Frontier provider is not configured. Showing deterministic fallback output."
  },
  "metadata": {
    "label": "Frontier Base Model",
    "modelId": "frontier-base-model-id-or-placeholder",
    "assistantTuned": false,
    "adaptation": "none",
    "note": "Pretrained on internet-scale text; not assistant fine-tuned."
  }
}
```

### Controlled Validation Error
- Status: `400`
```json
{
  "error": {
    "code": "invalid_json | invalid_prompt",
    "message": "Request body must be valid JSON."
  }
}
```

## Fallback Reason Codes
- `missing_config`
- `invalid_config`
- `quota_limited`
- `timeout`
- `upstream_auth`
- `upstream_error`
- `invalid_provider_response`
- `empty_provider_output`

## Status Code Matrix
| Condition | Status | Body Shape |
| :--- | :--- | :--- |
| Valid prompt + provider success | `200` | `mode: "live"` |
| Missing/invalid provider config | `200` | `mode: "fallback"` |
| Provider quota/auth/timeout/upstream failure | `200` | `mode: "fallback"` |
| Invalid JSON | `400` | `error` |
| Invalid prompt | `400` | `error` |

## Environment Contract
- `FRONTIER_API_URL`
- `FRONTIER_MODEL_ID`
- `FRONTIER_API_KEY` (secret)
- `FRONTIER_TIMEOUT_MS` (optional)

## Observability Contract
- Span name: `frontier.base_generate`
- Span attributes include: `http.method`, `http.route`, `frontier.configured`, `frontier.timeout_ms`, `frontier.model_id`, `frontier.mode`, and `frontier.reason_code` where applicable.
- Logs must not include secrets (`FRONTIER_API_KEY` or raw auth headers).

## Security Notes
- Provider credentials remain server-side only.
- API key must never be returned in response payloads.
- Upstream failures return controlled fallback/error responses.

## Consumer Notes (Frontend/Testing)
- Frontend should branch on `mode` (`live` vs `fallback`).
- In fallback mode, render `reason.message` text for product end-user clarity.
- Validation failures are explicit HTTP `400` with `error.code`.

## Change Log
- `2026-02-16`: Initial contract added for CR-012.
