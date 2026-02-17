# Template: Backend -> Tech Lead Report

## Subject
`[CR-ID] - [Backend Report Title]`

## [Preflight: Assumptions]
- [Assumption 1]
- [Assumption 2]

## [Preflight: Adjacent Risks]
- [Risk 1]
- [Risk 2]

## [Preflight: Open Questions]
- [Question or `none`]

## [Preflight Status]
- `clear-to-implement` | `blocked`

## [Status]
- `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`

## [Scope Check]
- Handoff source: `agent-docs/conversations/tech-lead-to-backend.md`
- Files modified:
  - `path/to/file.ext`
- Scope compliance:
  - [ ] All modified files are in Backend ownership or explicitly delegated.
  - [ ] No test files were created/modified unless explicitly delegated.

## [Changes Made]
- Concise list of implemented backend changes.

## [Verification Results]
- `pnpm lint`: `pass|fail` (+ short evidence)
- `pnpm exec tsc --noEmit`: `pass|fail` (+ short evidence)
- If order differs by explicit handoff instruction, note the reason.
- Behavioral evidence mapped to handoff DoD:
  - Allowed-path evidence:
  - Blocked/error-path evidence:

## [Out-of-Scope Requests Detected]
- `none` OR list any request/file outside backend authority.

## [Blockers]
- `none` OR describe blocker and why work was halted.
- If blocker exists, include required next handoff role (for example `Testing`, `Infra`, `Frontend`).

## [Failure Classification]
- `CR-related`:
- `pre-existing`:
- `environmental`:
- `non-blocking warning`:

## [Deviations]
- `none` OR list deviations with rationale per `agent-docs/coordination/reasoning-principles.md`.

## [Ready for Next Agent]
- `yes` | `no`

## [Follow-up Recommendations]
- Optional, role-appropriate follow-ups for Tech Lead.
