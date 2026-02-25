# Handoff: Tech Lead → Backend Agent

## Subject
`CR-018 — Generation API Hardening Parity: Backend Implementation`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior content: `CR-017`
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-017-plan.md` ✓
- Evidence 2 (prior CR closed): CR-017 status `Done` per `agent-docs/project-log.md` ✓
- Result: replacement allowed.

---

## Objective

Implement hardening parity between the generation API routes and the existing OTEL proxy boundary. Concretely:

1. Extract four duplicated generation-route utilities into a shared server module.
2. Add middleware abuse-control entries for both generation routes (rate limit + body size).
3. Add route-level metrics (request + fallback counters) for both generation routes.
4. Create the missing API contract doc for the adaptation route.

---

## Rationale (Why)

The OTEL proxy has explicit middleware enforcement (rate limit + body-size), route-level metrics, and a contract doc. The two generation routes were introduced incrementally and never received equivalent treatment. This creates:
- **Governance drift**: identical logic duplicated in two files with no single source of truth.
- **Security exposure**: no middleware-layer body-size enforcement on interactive generation endpoints.
- **Observability gap**: no metrics signal for generation request volume or fallback rates.
- **Traceability gap**: no contract artifact for `/api/adaptation/generate`.

This CR closes all four gaps while preserving both public route contracts exactly.

---

## Known Environmental Caveats (Mandatory)

- **Node.js runtime**: System may be below `>=20.x` documented minimum. Run `node -v` first. If below v20, activate via `nvm use 20`. If nvm is unavailable, classify as `environmental` and document — do not skip verification.
- **pnpm**: Use `pnpm` exclusively. Never `npm` or `yarn`.
- **Port**: Dev server runs on port `3001`. Not required for unit/lint/type verification.
- **E2E**: Not in scope for this handoff. Testing Agent handles full quality gates in Step 2.

---

## Constraints

### Technical Constraints
- No new package dependencies — all implementation uses existing OTel, Zod, Next.js, and TypeScript.
- All metric calls MUST be wrapped in `safeMetric(() => ...)`. Metric failures must never crash a route.
- Do NOT introduce high-cardinality metric dimensions (no prompt text, no model ID, no user identifier as labels).
- Middleware thresholds are hardcoded constants — do NOT make them env-configurable in this CR.
- Preserve all existing route response envelopes exactly. No route-path, `data-testid`, or accessibility contract changes (AC-9).

### Ownership Constraints
- Files in scope: `lib/server/generation/shared.ts` (new), `app/api/frontier/base-generate/route.ts`, `app/api/adaptation/generate/route.ts`, `middleware.ts`, `lib/otel/metrics.ts`, `agent-docs/api/adaptation-generate.md` (new).
- Do NOT modify `__tests__/` files — the Testing Agent handles all test work in Step 2.
- Do NOT modify `agent-docs/api/frontier-base-generate.md` unless a frontier route contract detail actually changes (none expected).

---

## Assumptions To Validate (Mandatory)

1. `lib/server/generation/shared.ts` does NOT yet exist — you create it. Verify with a file check before creating.
2. `parseTimeout`, `extractProviderErrorMessage`, and `mapProviderFailure` are byte-for-byte identical in both routes. Confirm by re-reading both files before extracting. If any divergence is found, **stop and flag** — do not silently reconcile.
3. `ADAPTATION_SYSTEM_PROMPT` (defined in `adaptation/generate/route.ts`) must never appear in any response payload, log field, or span attribute. Confirm this is already the case before making changes.
4. `FRONTIER_API_KEY` must never appear in any response payload, log field, or span attribute. Confirm the existing spans/logs are already clean.
5. `safeMetric` is exported from `@/lib/otel/metrics` (it is — confirmed by Tech Lead read).
6. `validateContentLength` is already imported in `middleware.ts` from `@/lib/security/contentLength` (it is — confirmed). No new imports needed for middleware body-size enforcement.

---

## Out-of-Scope But Must Be Flagged (Mandatory)

- If you find that any existing route test references the local `parseTimeout`, `extractProviderErrorMessage`, or `mapProviderFailure` by import — **stop and flag**. Do not delete from routes until confirmed safe.
- If you discover that any span attribute or logger call currently includes `FRONTIER_API_KEY` or `ADAPTATION_SYSTEM_PROMPT` text — **stop and flag before completing** (AC-5 blocker).
- Do NOT add streaming support, response envelope changes, or new HTTP status codes beyond what is spec'd here.
- Client-side `toRecord()` helpers in `FrontierBaseChat.tsx` and `AdaptationChat.tsx` are out of scope (tracked as a Next Priority in project-log.md).

---

## Scope

### Files to Create
- `lib/server/generation/shared.ts`: new shared generation utility module (spec below)
- `agent-docs/api/adaptation-generate.md`: adaptation route contract doc (spec below)

### Files to Modify
- `app/api/frontier/base-generate/route.ts`: import from shared module; add metric calls
- `app/api/adaptation/generate/route.ts`: import from shared module; add metric calls
- `middleware.ts`: add generation route entries to `API_CONFIG`
- `lib/otel/metrics.ts`: add 4 new metric getter functions

---

## Implementation Specification (Tech Lead Owned — Follow Exactly)

### 1. Create `lib/server/generation/shared.ts`

Create this file with exactly this content:

```typescript
/**
 * Shared utilities for server-side generation API routes.
 * Extracted from /api/frontier/base-generate and /api/adaptation/generate.
 */

const DEFAULT_TIMEOUT_MS = 8000;
const MIN_TIMEOUT_MS = 1000;
const MAX_TIMEOUT_MS = 20000;

export type FallbackReasonCode =
    | 'missing_config'
    | 'invalid_config'
    | 'quota_limited'
    | 'timeout'
    | 'upstream_auth'
    | 'upstream_error'
    | 'invalid_provider_response'
    | 'empty_provider_output';

export function parseTimeout(rawTimeout: string | undefined): number {
    if (!rawTimeout) {
        return DEFAULT_TIMEOUT_MS;
    }

    const parsed = Number.parseInt(rawTimeout, 10);
    if (!Number.isFinite(parsed)) {
        return DEFAULT_TIMEOUT_MS;
    }

    return Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, parsed));
}

export function extractProviderErrorMessage(payload: unknown): string | null {
    if (typeof payload !== 'object' || payload === null) {
        return null;
    }

    const root = payload as Record<string, unknown>;

    const directMessage = root.message;
    if (typeof directMessage === 'string' && directMessage.trim().length > 0) {
        return directMessage.trim();
    }

    const errorObj = root.error;
    if (typeof errorObj === 'object' && errorObj !== null) {
        const errorRecord = errorObj as Record<string, unknown>;
        const nestedMessage = errorRecord.message;
        if (typeof nestedMessage === 'string' && nestedMessage.trim().length > 0) {
            return nestedMessage.trim();
        }
    }

    return null;
}

export function mapProviderFailure(
    status: number,
    providerMessage: string | null
): { code: FallbackReasonCode; message: string } {
    if (status === 429) {
        return {
            code: 'quota_limited',
            message: 'Live provider quota is currently unavailable. Showing deterministic fallback output.',
        };
    }

    if (status === 401 || status === 403) {
        return {
            code: 'upstream_auth',
            message: 'Live provider rejected authentication. Showing deterministic fallback output.',
        };
    }

    if (status >= 500) {
        return {
            code: 'upstream_error',
            message: 'Live provider is temporarily unavailable. Showing deterministic fallback output.',
        };
    }

    return {
        code: 'upstream_error',
        message: providerMessage ?? 'Live provider request failed. Showing deterministic fallback output.',
    };
}
```

**Important**: The `extractProviderErrorMessage` implementation above uses inline object narrowing rather than `toRecord()` to avoid a dependency on `lib/utils/record`. This is intentional — the shared utility must not depend on other domain-specific utilities that may evolve independently.

---

### 2. Update `app/api/frontier/base-generate/route.ts`

**Step A — Replace local definitions with imports.**

Remove the following local definitions (they are fully replaced by the shared module):
- The `FallbackReasonCode` type (lines 26–34)
- The `parseTimeout` function
- The `extractProviderErrorMessage` function
- The `mapProviderFailure` function

Add this import at the top of the file alongside existing imports:

```typescript
import {
    type FallbackReasonCode,
    parseTimeout,
    extractProviderErrorMessage,
    mapProviderFailure,
} from '@/lib/server/generation/shared';
```

**Step B — Add metric imports.**

Add to the existing metrics/otel imports section:

```typescript
import {
    safeMetric,
    getFrontierGenerateRequestsCounter,
    getFrontierGenerateFallbacksCounter,
} from '@/lib/otel/metrics';
```

**Step C — Add metric call sites in the POST handler.**

Read the full `POST` function before making these changes.

Place a **request counter call** immediately after the two `span.setAttribute` calls at the top of the span callback (before the outer `try` block):

```typescript
span.setAttribute('http.method', 'POST');
span.setAttribute('http.route', ROUTE_PATH);
safeMetric(() => getFrontierGenerateRequestsCounter().add(1)); // ← ADD HERE
```

Place a **fallback counter call** immediately before each `return NextResponse.json<FallbackModeResponse>(...)` inside the POST handler. There are exactly six fallback return sites:

1. **Missing/invalid config fallback** (inside `if (!frontierConfig.configured)`):
   ```typescript
   safeMetric(() => getFrontierGenerateFallbacksCounter().add(1, { reason_code: issueCode }));
   return NextResponse.json<FallbackModeResponse>(...);
   ```

2. **Fetch network/abort error fallback** (inside the `catch (error)` for the `await fetch(...)` call):
   ```typescript
   safeMetric(() => getFrontierGenerateFallbacksCounter().add(1, { reason_code: reasonCode }));
   return NextResponse.json<FallbackModeResponse>(...);
   ```

3. **Upstream non-OK status fallback** (inside `if (!upstreamResponse.ok)`):
   ```typescript
   safeMetric(() => getFrontierGenerateFallbacksCounter().add(1, { reason_code: mappedFailure.code }));
   return NextResponse.json<FallbackModeResponse>(...);
   ```

4. **Unreadable response payload fallback** (inside the `catch` for `await upstreamResponse.json()`):
   ```typescript
   safeMetric(() => getFrontierGenerateFallbacksCounter().add(1, { reason_code: 'invalid_provider_response' }));
   return NextResponse.json<FallbackModeResponse>(...);
   ```

5. **Empty provider output fallback** (inside `if (!extractedOutput)`):
   ```typescript
   safeMetric(() => getFrontierGenerateFallbacksCounter().add(1, { reason_code: 'empty_provider_output' }));
   return NextResponse.json<FallbackModeResponse>(...);
   ```

6. **Outer catch-all fallback** (inside the outermost `catch (error)` block):
   ```typescript
   safeMetric(() => getFrontierGenerateFallbacksCounter().add(1, { reason_code: 'upstream_error' }));
   return NextResponse.json<FallbackModeResponse>(...);
   ```

The **live success path** (when `extractedOutput` is non-empty and response is `mode: 'live'`) receives NO fallback counter — only the request counter.

---

### 3. Update `app/api/adaptation/generate/route.ts`

**Step A — Replace local definitions with imports.**

Remove the following local definitions:
- The `FallbackReasonCode` type
- The `parseTimeout` function
- The `extractProviderErrorMessage` function
- The `mapProviderFailure` function

Add this import:

```typescript
import {
    type FallbackReasonCode,
    parseTimeout,
    extractProviderErrorMessage,
    mapProviderFailure,
} from '@/lib/server/generation/shared';
```

**Step B — Add metric imports.**

```typescript
import {
    safeMetric,
    getAdaptationGenerateRequestsCounter,
    getAdaptationGenerateFallbacksCounter,
} from '@/lib/otel/metrics';
```

**Step C — Add metric call sites in the POST handler.**

Place the **request counter call** immediately after the two `span.setAttribute` calls at the top of the span callback:

```typescript
span.setAttribute('http.method', 'POST');
span.setAttribute('http.route', ROUTE_PATH);
safeMetric(() => getAdaptationGenerateRequestsCounter().add(1)); // ← ADD HERE
```

Place **fallback counter calls** immediately before each `return NextResponse.json<FallbackModeResponse>(...)`. There are exactly six fallback return sites (same pattern as frontier):

1. **Missing/invalid config fallback** (inside `if (!config.configured)`):
   ```typescript
   safeMetric(() => getAdaptationGenerateFallbacksCounter().add(1, { reason_code: issueCode }));
   ```

2. **Fetch network/abort error fallback**:
   ```typescript
   safeMetric(() => getAdaptationGenerateFallbacksCounter().add(1, { reason_code: reasonCode }));
   ```

3. **Upstream non-OK status fallback**:
   ```typescript
   safeMetric(() => getAdaptationGenerateFallbacksCounter().add(1, { reason_code: mappedFailure.code }));
   ```

4. **Unreadable response payload fallback**:
   ```typescript
   safeMetric(() => getAdaptationGenerateFallbacksCounter().add(1, { reason_code: 'invalid_provider_response' }));
   ```

5. **Empty provider output fallback**:
   ```typescript
   safeMetric(() => getAdaptationGenerateFallbacksCounter().add(1, { reason_code: 'empty_provider_output' }));
   ```

6. **Outer catch-all fallback**:
   ```typescript
   safeMetric(() => getAdaptationGenerateFallbacksCounter().add(1, { reason_code: 'upstream_error' }));
   ```

---

### 4. Update `middleware.ts`

Add two new entries to the `API_CONFIG` object. Place them after the existing `/api/otel/trace` entry:

```typescript
'/api/frontier/base-generate': {
    rateLimit_windowMs: ONE_MINUTE,
    rateLimit_max: 20,
    contentLengthRequired: false,
    maxBodySize: 8_192,
},
'/api/adaptation/generate': {
    rateLimit_windowMs: ONE_MINUTE,
    rateLimit_max: 20,
    contentLengthRequired: false,
    maxBodySize: 8_192,
},
```

**Threshold rationale (do not deviate without flagging):**
- `rateLimit_max: 20` — interactive learner endpoint; 20/min is 4–6× a typical session peak; blocks automation.
- `maxBodySize: 8_192` — 4× the theoretical maximum for a 2000-char prompt JSON body; not brittle.
- `contentLengthRequired: false` — Browser `fetch()` JSON POST does not guarantee a `Content-Length` header. Enforcement applies when the header is present; absence is not rejected.

No other middleware logic changes.

---

### 5. Update `lib/otel/metrics.ts`

Add four new module-level variables (after the existing OTEL proxy variable declarations):

```typescript
// Pre-defined metrics for frontier generation
let frontierGenerateRequests: Counter | null = null;
let frontierGenerateFallbacks: Counter | null = null;

// Pre-defined metrics for adaptation generation
let adaptationGenerateRequests: Counter | null = null;
let adaptationGenerateFallbacks: Counter | null = null;
```

Add four new getter functions (after the existing `getOtelProxyErrorsCounter` function):

```typescript
/**
 * Counter for total frontier base-generate requests
 */
export function getFrontierGenerateRequestsCounter(): Counter {
    if (!frontierGenerateRequests) {
        frontierGenerateRequests = getMeter().createCounter('frontier_generate.requests', {
            description: 'Total number of frontier base-generate requests',
            unit: '1',
        });
    }
    return frontierGenerateRequests;
}

/**
 * Counter for frontier base-generate fallback outcomes by reason code
 */
export function getFrontierGenerateFallbacksCounter(): Counter {
    if (!frontierGenerateFallbacks) {
        frontierGenerateFallbacks = getMeter().createCounter('frontier_generate.fallbacks', {
            description: 'Total number of frontier base-generate fallback outcomes',
            unit: '1',
        });
    }
    return frontierGenerateFallbacks;
}

/**
 * Counter for total adaptation generate requests
 */
export function getAdaptationGenerateRequestsCounter(): Counter {
    if (!adaptationGenerateRequests) {
        adaptationGenerateRequests = getMeter().createCounter('adaptation_generate.requests', {
            description: 'Total number of adaptation generate requests',
            unit: '1',
        });
    }
    return adaptationGenerateRequests;
}

/**
 * Counter for adaptation generate fallback outcomes by reason code
 */
export function getAdaptationGenerateFallbacksCounter(): Counter {
    if (!adaptationGenerateFallbacks) {
        adaptationGenerateFallbacks = getMeter().createCounter('adaptation_generate.fallbacks', {
            description: 'Total number of adaptation generate fallback outcomes',
            unit: '1',
        });
    }
    return adaptationGenerateFallbacks;
}
```

No existing functions are changed. The `Counter` and `Histogram` types are already imported at the top of the file.

---

### 6. Create `agent-docs/api/adaptation-generate.md`

Create this contract document. Read `agent-docs/api/route-contract-template.md` and `agent-docs/api/frontier-base-generate.md` first for structural reference.

The adaptation route contract must cover:
- **Route**: `POST /api/adaptation/generate`
- **Purpose**: Stage 2 adaptation interaction — live model output per strategy when configured; deterministic strategy-specific fallback when not configured.
- **Ownership**: Backend implements, Frontend + Testing consume.
- **Request contract**: `{ "prompt": string (1–2000 chars), "strategy": "full-finetuning" | "lora-peft" | "prompt-prefix" }`
- **Response contracts** (live mode, fallback mode, and validation error — see route code for exact shapes).
- **Fallback reason codes**: same 8-value enum as frontier.
- **Status code matrix**: `200` for live and fallback; `400` for invalid JSON, invalid prompt, invalid strategy.
- **Environment contract**: `ADAPTATION_API_URL`, `FRONTIER_API_KEY`, `ADAPTATION_FULL_FINETUNE_MODEL_ID`, `ADAPTATION_LORA_MODEL_ID`, `ADAPTATION_PROMPT_PREFIX_MODEL_ID`, `FRONTIER_TIMEOUT_MS` (optional), `ADAPTATION_OUTPUT_MAX_CHARS` (optional).
- **Observability contract**: Span name `adaptation.generate`; span attributes include `adaptation.strategy`, `adaptation.configured`, `adaptation.model_id`, `adaptation.mode`, `adaptation.reason_code`; logs must not include `FRONTIER_API_KEY` or `ADAPTATION_SYSTEM_PROMPT` content.
- **Security notes**: `FRONTIER_API_KEY` is server-only; `ADAPTATION_SYSTEM_PROMPT` is server-only; neither appears in responses, logs, or span attributes.
- **Consumer notes**: Frontend branches on `mode` (`live` vs `fallback`); validation errors are explicit `400` with `error.code`.
- **Change log**: `2026-02-25`: Initial contract added for CR-018.

---

## Definition of Done

- [ ] `lib/server/generation/shared.ts` created; exports `FallbackReasonCode`, `parseTimeout`, `extractProviderErrorMessage`, `mapProviderFailure` (AC-2).
- [ ] `app/api/frontier/base-generate/route.ts` imports all four items from `@/lib/server/generation/shared`; no local definitions of those four items remain (AC-2).
- [ ] `app/api/adaptation/generate/route.ts` imports all four items from `@/lib/server/generation/shared`; no local definitions of those four items remain (AC-2).
- [ ] `middleware.ts` has entries for both `/api/frontier/base-generate` and `/api/adaptation/generate` with rate limit 20/min, body size 8192, contentLengthRequired false (AC-3).
- [ ] `lib/otel/metrics.ts` exports 4 new getter functions: `getFrontierGenerateRequestsCounter`, `getFrontierGenerateFallbacksCounter`, `getAdaptationGenerateRequestsCounter`, `getAdaptationGenerateFallbacksCounter` (AC-4).
- [ ] Both generation routes call request counter once per request entry and fallback counter at each of the 6 fallback return sites, all wrapped in `safeMetric()` (AC-4).
- [ ] `FRONTIER_API_KEY` is confirmed absent from all response payloads, log fields, and span attributes. `ADAPTATION_SYSTEM_PROMPT` is confirmed absent from all response payloads, log fields, and span attributes (AC-5).
- [ ] `agent-docs/api/adaptation-generate.md` created following contract template (AC-6).
- [ ] No route-path, `data-testid`, or accessibility-semantic contract changes made (AC-9).
- [ ] `pnpm lint` passes.
- [ ] `pnpm exec tsc --noEmit` passes.
- [ ] `pnpm test` passes — report total test count and confirm no regression vs 134 baseline (AC-8, scoped verification before Testing Agent runs full gates).

---

## Clarification Loop (Mandatory)

- Before implementation, Backend posts preflight concerns/questions in `agent-docs/conversations/backend-to-tech-lead.md`.
- Tech Lead responds in the same file.
- If any assumption is invalidated (e.g., a divergence found in the supposedly identical functions, an existing span attribute leaking a secret) — **stop and flag before proceeding**.

---

## Verification

Run in sequence. Report using the Command Evidence Standard format.

```
node -v
pnpm lint
pnpm exec tsc --noEmit
pnpm test
```

For each command:
- **Command**: `[exact command]`
- **Scope**: `[full suite | targeted files]`
- **Execution Mode**: `[sandboxed | local-equivalent/unsandboxed]`
- **Result**: `[PASS/FAIL + key counts or error summary]`

Include total test count from `pnpm test` output. Confirm no regression vs 134 baseline.

---

## Report Back

Write completion report to `agent-docs/conversations/backend-to-tech-lead.md` using `agent-docs/conversations/TEMPLATE-backend-to-tech-lead.md`.

Status vocabulary: `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`

Include in report:
- Summary of each file changed (what was added/removed/modified)
- AC-5 security confirmation (exact span attributes and log fields verified clean)
- Deviations from this spec (if any), classified per the Deviation Protocol
- Verification evidence in Command Evidence Standard format
