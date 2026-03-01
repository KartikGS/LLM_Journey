# Route Contract Template

## Route
- Method: `POST|GET|PUT|PATCH|DELETE`
- Path: `/api/...`

## Purpose
- [One-paragraph description of endpoint intent and product behavior it supports.]

## Ownership
- Implementing role: `Backend`
- Consuming role(s): `Frontend`, `Testing`

## Request Contract
### Headers
- `content-type`: `application/json` (if applicable)
- [Other required headers]

### Body
```json
{
  "example": "payload"
}
```

### Validation Rules
- [Explicit input constraints and limits]

## Response Contract
### Success Response(s)
- Status: `200`
```json
{
  "example": "success"
}
```

### Controlled Error / Fallback Response(s)
- Status: `400|401|403|404|409|422|429|5xx|...`
```json
{
  "error": {
    "code": "example_error_code",
    "message": "Human-readable description"
  }
}
```

## Status Code Matrix
| Condition | Status | Body Shape |
| :--- | :--- | :--- |
| [valid request] | `200` | [success shape] |
| [validation failure] | `400` | [error shape] |
| [upstream quota/failure fallback] | `200` or `5xx` | [fallback/error shape] |

## Observability Contract
- Required trace/span name:
- Required span attributes:
- Required log fields:
- Sensitive fields that must be redacted:

## Security Notes
- Secret handling expectations:
- Abuse protections / rate limits:
- Data exposure constraints:

## Consumer Notes (Frontend/Testing)
- Stable fields guaranteed for UI rendering:
- Known fallback modes / reason codes:
- Selector/semantics impact (if any):

## Change Log
- `YYYY-MM-DD`: [change summary]
