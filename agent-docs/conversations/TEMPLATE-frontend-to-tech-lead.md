# Template: Frontend -> Tech Lead Report

## Subject
`[CR-ID] - [Frontend Task Title]`

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
- `completed` | `blocked` | `partial`

## [Scope Check]
- Handoff source: `agent-docs/conversations/tech-lead-to-frontend.md`
- Files modified:
  - `path/to/file.tsx`
- Scope compliance:
  - [ ] All modified files are in Frontend ownership or explicitly delegated.
  - [ ] No test files modified unless explicitly delegated.

## [Changes Made]
- Concise list of implemented changes.

## [Verification Results]
1. `pnpm lint` -> `PASS|FAIL` (+ short evidence)
2. `pnpm exec tsc --noEmit` -> `PASS|FAIL` (+ short evidence)

## [Contract Evidence]
- Route contracts:
  - `preserved|changed` - `path:line` - [note]
- Selector/accessibility contracts:
  - `preserved|changed` - `path:line` - [note]
- Continuity/navigation href contracts:
  - `preserved|changed` - `path:line` - [note]
- Shared-component blast-radius checks (required if `app/ui/**` changed):
  - `[route]` - `preserved|changed` - [evidence]

## [Behavioral Sanity Check]
- [DoD behavior 1 + evidence]
- [DoD behavior 2 + evidence]

## [Failure Classification]
- CR-related failures:
- Pre-existing failures:
- Environmental failures:
- Non-blocking warnings:

## [Scope Extension]
- `none` OR `scope extension requested` (+ reason and decision owner)

## [Deviations]
- `none` OR list deviations with rationale.

## [Ready for Next Agent]
- `yes` | `no`
