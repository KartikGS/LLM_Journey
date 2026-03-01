# Template: Infra -> Tech Lead Report

## Subject
`[CR-ID] - [Infra Report Title]`

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
- Handoff source: `agent-docs/conversations/tech-lead-to-infra.md`
- Files modified:
  - `path/to/file.ext`
- Scope compliance:
  - [ ] All modified files are in Infra ownership or explicitly delegated.
  - [ ] No route-level API logic was modified unless explicitly delegated.

## [Changes Made]
- Concise list of implemented infra/security/runtime changes.

## [Verification Results]
- `pnpm lint`: `pass|fail` (+ short evidence)
- `pnpm exec tsc --noEmit`: `pass|fail` (+ short evidence)
- Additional infra/security checks:
  - [check + result]

## [Dependency Consumption]
- [Any dependency/config changes, or `none`]

## [Failure Classification]
- `CR-related`:
- `pre-existing`:
- `environmental`:
- `non-blocking warning`:

## [BLOCKER / FEEDBACK]
- decision needed: [what needs decision]
- expected: [what handoff/contract expected]
- found: [what was observed]
- impact: [effect on DoD/verification]

## [Ready for Next Agent]
- `yes` | `no`

## [New Artifacts]
- [files/artifacts produced]

## [Follow-up Recommendations]
- Optional, role-appropriate follow-ups for Tech Lead.
