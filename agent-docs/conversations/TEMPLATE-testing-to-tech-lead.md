# Handoff Template: Testing Agent -> Tech Lead

## Subject
`[CR-ID] - [Testing Report Title]`

## Preflight

### Assumptions I'm making
- [Assumption 1]
- [Assumption 2]

### Risks not covered by current scope
- [Risk 1]
- [Risk 2]

### Questions for Tech Lead
- [Question or `None`]

## Preflight Status
- `clear-to-implement` | `blocked`

---

## [Status]
- `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`

## [Changes Made]
- [Test file changes + purpose]

## [Verification Results]
- Command: `[exact command]`
  - Scope: `[full suite | targeted spec/grep | impacted contracts]`
  - Execution Mode: `[sandboxed | local-equivalent/unsandboxed]`
  - Browser Scope (if E2E): `[chromium/firefox/webkit | narrowed scope]`
  - Result: `[PASS/FAIL + counts/summary]`

### Reproduction Matrix (Mandatory for E2E/runtime issues)
| command | mode | browsers | result | classification note |
|---|---|---|---|---|
| `[command]` | `[sandboxed/local-equivalent]` | `[matrix]` | `[pass/fail]` | `[short note]` |

## [Dependency Consumption]
- [Any dependency/config changes, or `none`]

## [Failure Classification]
- `CR-related`:
  - [Issue + evidence]
- `pre-existing`:
  - [Issue + evidence]
- `environmental`:
  - [Issue + evidence]
- `non-blocking warning`:
  - [Issue + evidence]

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
- [next steps for Tech Lead/owning role]
