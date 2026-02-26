# TL Session State — Handover Artifact

> **Purpose:** Written by the Tech Lead at the end of Session A to enable a clean Session B start.
> Session B reads this file as primary context — do NOT rely on session compressor summaries for verification decisions.
> Overwrite this file at the start of the next CR.

---

## CR

**CR ID:** [CR-XXX — Title]
**Date (Session A):** [YYYY-MM-DD]

---

## Exact Artifact Paths

- Requirement: `agent-docs/requirements/CR-XXX-[slug].md`
- Plan: `agent-docs/plans/CR-XXX-plan.md`
- BA handoff in: `agent-docs/conversations/ba-to-tech-lead.md`
- Sub-agent handoff out: `agent-docs/conversations/tech-lead-to-[role].md`
- Sub-agent report in: `agent-docs/conversations/[role]-to-tech-lead.md`

---

## Pre-Replacement Check (Conversation Freshness)

- Prior outgoing BA handoff context: `[prior CR-ID]`
- Evidence 1 (plan artifact exists): `agent-docs/plans/[prior CR-ID]-plan.md`
- Evidence 2 (prior CR closed): `agent-docs/requirements/[prior CR-ID]-[slug].md` status is `Done`
- Result: replacement allowed for new CR context.

---

## Session A: Execution Checklist

- [ ] Context loaded per `tech-lead.md` required readings (Layer 1 + Layer 2 + role-specific).
- [ ] BA handoff reviewed: `ba-to-tech-lead.md` subject confirms active CR.
- [ ] Technical plan created: `agent-docs/plans/CR-XXX-plan.md`.
- [ ] Pre-Implementation Self-Check completed (all target files classified as permitted or delegated).
- [ ] Go/No-Go submitted to user; approval received.
- [ ] Tech Lead direct changes completed (list each file below).
- [ ] Sub-agent handoff(s) written and issued.
- [ ] This session-state file written.

## Session A: Tech Lead Direct Changes

- `[file-path]` — **[created|updated]**: [one-line summary].

---

## Delegation Outcome — [Role] Agent

**Status:** [issued | completed | blocked]
**Handoff file:** `agent-docs/conversations/tech-lead-to-[role].md`
**Completion report:** `agent-docs/conversations/[role]-to-tech-lead.md`

**Summary of what [Role] delivered:**
- `[file-path]`: [change summary].

**Environmental note:** [Runtime/env caveats, or "none".]

---

## Gap Items / Known Risks (Session B Adversarial Review Focus)

Use this list as the primary focus when conducting Session B adversarial review.
Each item should be a specific verification check — not a generic reminder.

- [ ] [Specific thing to verify, e.g. "Confirm X constant is fully removed, not just unused"]
- [ ] [Another specific check, e.g. "Confirm Y is imported from config, not re-declared locally"]

---

## Session B: Tasks

- [ ] **[Role] adversarial review** — [PASS/FAIL]. [Brief findings.]
- [ ] **[Next role] handoff** — issued to `agent-docs/conversations/tech-lead-to-[role].md`.
- [ ] **[Next role] adversarial review** — [PASS/FAIL]. [Brief findings.]
- [ ] **Quality gates** — `pnpm test` [PASS/count], `pnpm lint` [PASS], `pnpm exec tsc --noEmit` [PASS], `pnpm build` [PASS].
- [ ] **BA handoff** — written to `agent-docs/conversations/tech-lead-to-ba.md`. All ACs evidenced.

---

## Context Notes for Session B

- [Key facts Session B needs that are not captured in the structured sections above.]
