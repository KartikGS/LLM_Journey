# CR-003: Formalize Browser Support and Documentation Fixes

## Status
Clarified

## Business Context
**User Need:** Clarify browser support limitations due to CSP/WASM and fix broken documentation links in the README.
**Expected Value:** Reduce developer and user confusion regarding failing tests and broken links.

## Functional Requirements
1. Document browser support (Chrome 95+, FF 102+, Safari 17.4+).
2. Explain technical reason (CSP `wasm-unsafe-eval` requirement).
3. Update README.md with correct paths for `agent-docs/` (was `docs/`).

## Non-Functional Requirements
- **Consistency**: Documentation must be updated across all relevant technical files.
- **Accuracy**: Browser versions must match the actual support for `wasm-unsafe-eval`.

## Acceptance Criteria
- [x] ~~`agent-docs/AGENTS.md` contains browser support section~~ (Removed per user request).
- [x] `README.md` contains browser support section and links to `agent-docs/` instead of `docs/`.
- [x] `agent-docs/technical-context.md` mentions browser constraints.
- [x] `agent-docs/tooling-standard.md` mentions browser support.

## Dependencies
- Blocks: None
- Blocked by: None

## Notes
The BA agent initially added a browser support section to `AGENTS.md`. However, per user feedback, this section was deemed inappropriate for the entry-point file and was removed. Technical constraints remain documented in `tooling-standard.md` and `technical-context.md`.

## Technical Analysis (filled by Senior Dev)
**Complexity:** [Low | Medium | High]
**Estimated Effort:** [S | M | L]
**Affected Systems:**
**Implementation Approach:**
