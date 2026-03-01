# Meta Findings: Frontend — CR-022

**Date:** 2026-02-27
**CR Reference:** CR-022
**Role:** Frontend
**Prior findings reviewed:** none

---

## Conflicting Instructions
- **Bridge Link Redundancy vs Requirement**: The Tech Lead handoff (CR-022, line 183) asked to flag redundant links to `/context/engineering` but also required the bridging callout (AC-3) in the same CR that already had a `JourneyContinuityLinks` footer pointing to the same place. This creates a minor conflict between "DRY" UI principles and "Stage Continuity" requirements.
- **Grounding**: CR-022 preflight flagging of footer link redundancy.

## Redundant Information
- **`toRecord()` Utility Duplication**: The same helper exists in `FrontierBaseChat.tsx` and `AdaptationChat.tsx`. The handoff (CR-022, line 187) explicitly restricted extraction. This confirms knowledge of the redundancy but prevents fixing it, which feels like a "broken window" in the codebase.
- **Grounding**: Execution of `AdaptationChat.tsx` edits where the helper was read but not extracted.

## Missing Information
- **Educational Content Grid Pattern**: Handoff asked for 4 points to be covered in "Why We Adapt". I chose a 2x2 grid with numbered circles. `design-tokens.md` lacks a standard pattern for "Bullet Point Groups" or "Feature Grids", leading to ad-hoc markup for every educational section.
- **Grounding**: Design of the `adaptation-why-adapt` section in `page.tsx`. `evolvability`.
- **JSX Character Escaping Policy**: Literal text in educational content often contains apostrophes and ampersands. Linting (`react/no-unescaped-entities`) failed on these. A "Common Pitfalls" entry or a boilerplate snippet about escaping characters would prevent a rework cycle.
- **Grounding**: Lint failure at Step 109 and subsequent fix in Step 115. `portability`.

## Unclear Instructions
- **none**

## Responsibility / Scope Concerns
- **Testing Contract Registry Desync**: The Tech Lead Plan (CR-022, line 69) acknowledged that `testing-contract-registry.md` was out of date. This creates friction for the Frontend agent who must ensure `data-testid` contracts are preserved but sees a registry that doesn't match the code. The registry should be a "Hard Invariant" updated at the Tech Lead/BA boundary.
- **Grounding**: Observation of "pre-existing discrepancy" in the Plan discovery findings. `collaboration`.

## Engineering Philosophy Concerns
- **none**

## Redundant Workflow Steps
- **none**

## Other Observations
- **none**

## Lens Coverage (Mandatory)
- **Portability Boundary**: JSX character escaping and standard content grids are highly portable patterns that benefit from being defined in general role docs (`frontend.md`) rather than project-specific ones.
- **Collaboration Throughput**: The out-of-sync Testing Registry is a collaboration bottleneck; Frontend and Testing agents must independently verify what "truth" is instead of relying on the doc.
- **Evolvability**: Standardizing content blocks and resolving deliberate utility duplication reduces the maintenance debt and "noise" for future agents reading the code.

## Top 5 Findings (Ranked)
1. F1 | JSX Character Escaping Lint friction | `frontend.md` / Common Pitfalls | `portability`
2. F2 | Testing Contract Registry out-of-sync | `testing-contract-registry.md` | `collaboration`
3. F3 | Educational Content Grid Pattern missing | `design-tokens.md` | `evolvability`
4. F4 | Bridge Link Redundancy Policy conflict | `project-principles.md` / Stage Continuity | `evolvability`
5. F5 | Small utility (`toRecord`) duplication tolerance | `frontend.md` / Component Guidelines | `evolvability`
