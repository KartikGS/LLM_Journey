# Keep In Mind (Temporary)

> [!WARNING]
> Entries here are temporary constraints or warnings derived from recent mistakes.
> **Lifecycle**: Add here -> Fix root cause -> Move to permanent doc -> Delete from here.
> **Promotion ownership**: Tech Lead promotes technical/security warnings (during Verification Phase). BA promotes content/product warnings (during Acceptance Phase). Both roles should review entries at each CR and retire any whose root causes are resolved.

## Follow the format given in the example below
### [Date Added: 2026-01-26] OTEL Proxy Token Validation
**Issue**: Agents were creating tokens without proper expiry
**Constraint**: Always set `expiresIn: '5m'` in token generation
**Root Cause**: Not documented in `/agent-docs/api/` contracts at the time
**Action**: Update API contract, then remove this warning

## Active Warnings

### [Date Added: 2026-02-02] Diagnostic Fallback UIs
**Issue**: Environment-auditing components (like `BrowserGuard`) can appear as "broken" white screens if they fail silently or take too long.
**Constraint**: Always implement visible loading/diagnostic states for security/WASM checks to help with E2E failure analysis.
**Root Cause**: Identified during CR-004 stabilization.
**Action**: Update `BrowserGuard` to show "System Audit..." state; document in `technical-context.md`.
