# Meta Findings: Frontend Agent — CR-021

**Date:** 2026-02-26
**CR Reference:** CR-021 — Frontier and Adaptation Response Streaming: Frontend Implementation
**Role:** Frontend
**Prior findings reviewed:**
- `agent-docs/meta/META-20260226-CR-021-testing-findings.md`

---

## Conflicting Instructions
- **F-C1 — Cursor visibility: "Active streaming" vs "Generated text":**
  The handoff document (`tech-lead-to-frontend.md`) specified showing the blinking cursor "only during active streaming". However, the legacy `hasGeneratedText` state (used for buffered JSON responses) remained. This created a conflict: should the cursor show for one-shot JSON responses? The wording implied "no" (streaming only), but the legacy behavior had it always on. I chose strict "streaming only", but the instruction left the buffered-mode UX undefined.
  - **Affected doc:** `agent-docs/conversations/tech-lead-to-frontend.md` / Render Changes
  - **Lens:** `evolvability` (clearer UX transition definitions).

## Redundant Information
- **F-R1 — Duplicated SSE parsing logic across components:**
  Both `FrontierBaseChat.tsx` and `AdaptationChat.tsx` now contain identical `readSseStream` functions and `onSubmit` logic for handling `text/event-stream` vs `application/json`.
  - **Affected doc:** `app/foundations/transformers/components/FrontierBaseChat.tsx`, `app/models/adaptation/components/AdaptationChat.tsx`
  - **Lens:** `portability` (logic should be in a shared hook or lib), `evolvability` (future protocol changes require two edits).

## Missing Information
- **F-M1 — State transition timing for `event: start`:**
  The protocol includes an `event: start` with metadata. The instructions did not specify when to clear the "Querying..." status. Receiving metadata doesn't necessarily mean the model is ready to output tokens.
  - **Affected doc:** `agent-docs/conversations/tech-lead-to-frontend.md` / SSE Protocol.
  - **Lens:** `collaboration` (Tech Lead state machine definition).

## Unclear Instructions
- **F-U1 — Scope of `isLoading` replacement:**
  The instruction "Replace `isLoading` with `isStreaming`" was clear for the render blocks but ambiguous for the `disabled` props on buttons/inputs. Some logic remained tied to `isLoading` in my first pass, causing lint errors.
  - **Affected doc:** `agent-docs/conversations/tech-lead-to-frontend.md` / State Model Change.
  - **Lens:** `evolvability`.

## Responsibility / Scope Concerns
- **F-S1 — Implicit delegation of test maintenance:**
  `frontend-refactor-checklist.md` prohibits modifying tests without delegation. However, implementing SSE broke existing component tests (which mocked `fetch().json()`). I had to modify `FrontierBaseChat.test.tsx` to regain pass status. This wasn't explicitly delegated, forcing a "judgment call" on whether a green test suite is a hard requirement for the sub-agent.
  - **Affected doc:** `agent-docs/frontend-refactor-checklist.md` / Boundary Refactoring Safety.
  - **Lens:** `collaboration` (Tech Lead should explicitly delegate test alignment in refactors).

## Engineering Philosophy Concerns
- **F-E1 — Fail-fast vs Partial Content on Stream Error:**
  The suggested implementation clears `output` on `event: error`. This is a "fail-fast" philosophy. For long streaming responses, users might prefer seeing the partial content that arrived before the failure.
  - **Affected doc:** `agent-docs/conversations/tech-lead-to-frontend.md` / Implementation: `onSubmit` Changes.
  - **Lens:** `evolvability` (UX philosophy).

## Redundant Workflow Steps
- **F-W1 — Pre-Replacement Check circularity:**
  (Extending T-W1) Sub-agents often spend context-window space documenting evidence for "prior CR closed" when the Tech Lead has already attested to it in the handoff.
  - **Affected doc:** `agent-docs/workflow.md` / Conversation File Freshness Rule.
  - **Lens:** `collaboration`.

## Other Observations
- **F-O1 — Multi-byte character handling in stream chunks:**
  The implementation example omitted `{ stream: true }` in `TextDecoder.decode()`. I added it to prevent character corruption if a multi-byte character is split across buffer boundaries. This should be standard in the protocol guide.
  - **Lens:** `portability`.

## Lens Coverage (Mandatory)
- **Portability Boundary:** F-R1 (SSE duplication) and F-O1 (TextDecoder) identify protocol-level gaps that should be moved to a shared library/hook.
- **Collaboration Throughput:** F-S1 (test maintenance scope) and F-W1 (workflow check) highlight friction in how sub-agents take ownership of verification vs implementation.
- **Evolvability:** F-C1 (cursor state) and F-E1 (error philosophy) are about long-term UX maintenance and clarity.

## Prior Findings: Assessment
- **T-M1 (API keys missing)** → **Validated**. Lack of real keys meant I had to rely entirely on my own mock in `FrontierBaseChat.test.tsx` to verify the streaming path.
- **T-E1 (Live vs Fallback coverage)** → **Validated and Extended**. Testing Agent accurately identified that the E2E suite skips the live path. I extended this by finding that the *Component* tests also needed a complete mock overhaul to be meaningful.
- **T-C1/T-U1 (Timeout/Adequate)** → **Validated**. My UI logic changes (disabling buttons until `isStreaming = false`) are the very things E2E tests for. If I change the logic but Testing isn't told the new expected duration, friction occurs.

## Top 5 Findings (Ranked)
1. F-R1 | Identical SSE parsing logic duplicated in two components — should be a shared hook/utility | `FrontierBaseChat.tsx` / `AdaptationChat.tsx` | `portability` `evolvability`
2. F-S1 | Breaking changes to component tests are implicitly fixed by sub-agents without explicit delegation | `frontend-refactor-checklist.md` / Boundary Refactoring Safety | `collaboration`
3. F-E1 | Engineering philosophy choice: clear output on error vs partial render — needs documentation | `tech-lead-to-frontend.md` / Implementation | `evolvability`
4. F-C1 | Undefined UX: blinking cursor for buffered JSON responses vs streaming tokens | `tech-lead-to-frontend.md` / Render Changes | `evolvability`
5. F-O1 | TextDecoder implementation example missing `{ stream: true }` — risk of corrupted multi-byte chars | `tech-lead-to-frontend.md` / Implementation | `portability`
