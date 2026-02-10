# Handoff: Tech Lead → [Sub-Agent Role]

## Subject: [CR-ID] - [Title]

## Objective
[What the sub-agent needs to accomplish. Be specific and outcome-oriented.]

## Rationale (Why)
[Why this change matters. Sub-agents who understand intent make better decisions when facing ambiguity.]

---

## Constraints

### Technical
- [Framework/library constraints]
- [Performance requirements]
- [Dependency restrictions — e.g., "Standard Kit only, no new packages"]

### Accessibility
- [Relevant accessibility requirements — e.g., `prefers-reduced-motion`, ARIA labels]

### Theme / Cross-Cutting
- [Theme support requirements — e.g., "Light AND Dark mode"]
- [Browser support requirements]

---

## Design Intent (Frontend-Facing Handoffs)

> [!IMPORTANT]
> For any handoff that involves UI changes, this section is **mandatory**.
> Describe the **feel**, not just the features. The sub-agent needs to understand the target aesthetic.

**Target Aesthetic:** [1-2 sentence description of how the result should feel. Be specific about mood, not just mechanics.]
- *Example:* "Professional SaaS landing page. Think Linear.app — sophisticated, restrained, premium. Not a gaming dashboard."

**Animation Guidance:** [State the animation budget clearly.]
- *Example:* "One hero animation on page load. Card hovers use shadow+border only — no scale or translate."

**What NOT to do:** [Explicitly state what would overshoot the brief.]
- *Example:* "Do not add gradient glow borders to every card. Reserve glow for the primary CTA only."

---

## Scope

### Files to Modify
[List every file the sub-agent is expected to touch, with a brief description of what changes.]

#### `path/to/file.ext`
[Description of changes for this file.]

---

## Reference Patterns

> [!WARNING]
> **Code snippets below are an _optional starting palette_, NOT requirements.**
> The sub-agent should use these as inspiration, not as a copy-paste checklist.
> If following a snippet would conflict with the Design Intent above, the Design Intent wins.

[Point to existing code, components, or docs that demonstrate the desired approach. Include code snippets or pattern tables when helpful.]

---

## Definition of Done
- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] `pnpm dev` runs without errors
- [ ] `pnpm lint` passes without warnings

## Verification
[Steps the sub-agent should take after implementation to verify their work before reporting back.]

## Report Back
Write completion report to `/agent-docs/conversations/<role>-to-tech-lead.md` including:
- Summary of changes made
- Any deviations from plan (per Deviation Protocol in `reasoning-principles.md`)
- Verification results

---

*Handoff created: [DATE]*
*Tech Lead Agent*
