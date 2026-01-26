# Keep In Mind (Temporary)

> [!WARNING]
> Entries here are temporary constraints or warnings derived from recent mistakes.
> **Lifecycle**: Add here -> Fix root cause -> Move to permanent doc -> Delete from here.

## Follow the format given in the example below
### [Date Added: 2026-01-26] OTEL Proxy Token Validation
**Issue**: Agents were creating tokens without proper expiry
**Constraint**: Always set `expiresIn: '5m'` in token generation
**Root Cause**: Not documented in `docs/api/telemetry.md`
**Action**: Update API contract, then remove this warning

## Active Warnings
*(None active currently)*
