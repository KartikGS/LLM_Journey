# CR-013: Hugging Face Inference API Provider Support

## Status
Done

## Business Context
**User Need:** Enable the frontier base-generate endpoint to use Meta-Llama-3-8B via Hugging Face's free Inference API, expanding provider options beyond OpenAI-compatible endpoints.

**Expected Value:**
- Product End Users can experience a real frontier-scale base model (8B parameters) to contrast with the tiny local model (~0.2M parameters)
- Demonstrates the behavioral differences of pretrained models without assistant fine-tuning at scale
- Reduces dependency on a single provider format

## Functional Requirements
1. Extend `/api/frontier/base-generate` to support Hugging Face Inference API request/response format
2. Implement provider auto-detection or configuration-based switching between OpenAI-compatible and HF formats
3. Preserve existing OpenAI-compatible functionality (dual-provider support)
4. Support `meta-llama/Meta-Llama-3-8B` model identifier on HF

## Non-Functional Requirements
- **Performance:** Maintain existing timeout bounds (1-20 seconds, default 8s)
- **Security:** HF API token must remain server-side only (same pattern as existing `FRONTIER_API_KEY`)
- **License Compliance:** Implementation must not violate Meta's Llama 3 Community License (no redistribution of weights, proper attribution)

## System Constraints & Invariants
- **Constraint Mapping:**
  - `architecture.md`: Telemetry must never block/crash UI; fallback pattern must be preserved
  - `technical-context.md`: Existing fallback mechanism and reason codes must remain functional
  - Existing observability (OpenTelemetry spans/attributes) must cover HF provider path
- **Design Intent:** Standard feature extension—adding a second provider format while preserving the existing contract

## Acceptance Criteria
- [x] HF Inference API format supported: `POST https://api-inference.huggingface.co/models/{model_id}` with `{ inputs: "prompt" }` request and `[{ generated_text: "..." }]` response — Verified: `route.ts:168-208` (`buildProviderRequestBody`, `extractProviderOutput`); test: `frontier-base-generate.test.ts:130`
- [x] Provider selection via configuration (new env var or detection logic) — Verified: `route.ts:100-114` (`FRONTIER_PROVIDER` env var, `'openai'` default); tests: `frontier-base-generate.test.ts:111,223`
- [x] Existing OpenAI-compatible flow continues to work unchanged — Verified: `pnpm test` → 111/111 passed; 3 pre-existing OpenAI tests pass unchanged
- [x] Fallback mechanism triggers appropriately for HF-specific errors (401, 429, 5xx, timeout) — Verified: `mapProviderFailure()` is format-agnostic; tests: `frontier-base-generate.test.ts:153,169,185`
- [x] Span attributes include provider type (`openai` | `huggingface`) — Verified: `route.ts:326` (`frontier.provider` attribute set before all branching paths)
- [x] `pnpm lint` passes — Verified: `pnpm lint` → `✔ No ESLint warnings or errors`
- [x] `pnpm build` passes — Verified: `pnpm build` → all 6 routes compiled; `/api/frontier/base-generate` present
- [x] Unit tests updated/added for HF response parsing — Verified: 7 new tests in `describe('HF Provider Path')` at `frontier-base-generate.test.ts:99-237`

## Verification Mapping
- **Development Proof:**
  - Existing unit tests pass + new HF-specific tests (mocked HF responses)
  - Build and lint gates pass
  - **Manual HF token test:** Handled by Human User (token is sensitive)
- **AC Evidence Format (for closure):**
  - `[x] <AC text> — Verified: <file-or-command>, <result>`
- **User Validation:** Configure HF provider, send a prompt via the Transformers page, observe live response from LLaMA-3

## Dependencies
- Blocks: None
- Blocked by: User must have accepted Meta's Llama 3 license on HF (confirmed)

## Notes
- **Hugging Face Inference API format:**
  - URL: `https://api-inference.huggingface.co/models/{model_id}`
  - Auth header: `Authorization: Bearer {HF_TOKEN}`
  - Request body: `{ "inputs": "prompt text", "parameters": { "max_new_tokens": N, "temperature": T } }`
  - Response: `[{ "generated_text": "..." }]`
- Current endpoint expects OpenAI format (`{ choices: [{ message: { content } }] }`), which is incompatible
- Meta-Llama-3-8B is a gated model; user has confirmed license acceptance
- Educational goal: Show frontier base model behavior (scale + no assistant tuning)

## Technical Analysis (filled by Tech Lead)
**Complexity:** [Low | Medium | High]
**Estimated Effort:** [S | M | L]
**Affected Systems:**
**Implementation Approach:**

## Deviations Accepted (filled at closure by BA)
- None. The `return_full_text: false` omission is not a deviation — no AC required it. Tracked as a follow-up CR (see project-log.md Next Priorities).
