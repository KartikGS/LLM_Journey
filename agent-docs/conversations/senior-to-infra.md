# Handoff: Senior Developer to Infrastructure Engineer

## Context
We are stabilizing the E2E suite. Webkit is failing due to CSP enforcing HTTPS on local dev, and the telemetry proxy is rate-limiting test requests.

## Task
Modify `middleware.ts` to allow conditional CSP and rate-limit bypass during E2E tests.

### Implementation Details
1. **Define Environment Flags**:
   - `isProd`: `process.env.NODE_ENV === 'production'`
   - `isE2E`: `process.env.E2E === 'true'` (You may need to check if this env var is already available or suggest adding it).

2. **Conditional CSP**:
   - The CSP header currently includes `upgrade-insecure-requests` and `Strict-Transport-Security`.
   - These should ONLY be active if `isProd && !isE2E`.
   - This allows Webkit to connect to `http://localhost:3001` during local E2E runs.

3. **Rate Limit Bypass**:
   - Identify if the request is from `localhost` or if `isE2E` is true.
   - Bypass the 429 (Too Many Requests) logic for these cases to prevent telemetry rate-limiting.

## Constraints
- Do not use hardcoded values.
- Ensure security is not compromised in production.

## Report
Please provide your report in `agent-docs/conversations/infra-to-senior.md`.
