# Project Principles (LLM Journey)

These principles are specific to LLM Journey as an educational product.

## 1) Educational Clarity First
- Prefer explanations that a learner can follow.
- Do not introduce specialized terms without either:
  - a short explanation, or
  - a direct reference link.

## 2) Product End User Orientation
- Define who the page is for (Product End User) and what they should learn.
- Narrative and content should optimize learner progression, not only technical correctness.

## 3) Stage Continuity
- Preserve journey flow between stages.
- Continuity links and stage transitions are part of the product contract.
- **Bridging callout vs. footer link policy**: Every stage page includes a `JourneyContinuityLinks` footer that links to the adjacent stages. A bridging callout (e.g., an inline section at the bottom of a content block) should add a link to the next stage only when the callout's purpose is explicitly to *explain why the next stage exists* and the link reinforces that narrative. When the footer already provides the navigation and the callout is purely structural (e.g., a limitations summary), omit the duplicate `<Link>` from the callout. Rule: one navigable link to each destination per page is the default; a second link requires a narrative justification in the CR plan.

## 4) Honest Model Framing
- Clearly distinguish tiny demos, base models, and adapted/assistant behavior.
- Fallback/error states must be explicit in text, not color-only hints.

## 5) Premium-but-Readable UX
- Keep dual-theme quality high while prioritizing readability and instructional clarity.
- Visual polish should support learning, not distract from it.

## 6) Resource-Rich Learning
- Where possible, include references (papers, docs, notebooks, walkthroughs) for deeper exploration.
- Resource links should map to the concept introduced on the page.

## 7) Legal / Trust Signals
Pages that surface AI-generated output must include an AI disclaimer visible to the learner-user. The following rules apply uniformly:

- **Trigger:** Any UI surface where the application returns AI-generated content to the user (chat output windows, streamed text, generated summaries). Static educational text authored by the team does not require a disclaimer.
- **Standard wording:** "AI can make mistakes. Check important information." Variations are permitted for length constraints; the semantic content (AI may err, verify important info) must be preserved.
- **Placement:** Below or adjacent to the AI output surface, not in a page footer. The disclaimer must be visually associated with the output it applies to.
- **Accessibility:** The disclaimer must be rendered as visible text (not color-only or icon-only). No special ARIA role is required beyond what visible text provides; do not suppress it from screen readers.
- **Theme:** Must be visible in both light and dark themes at WCAG AA contrast.
- **Reuse:** If two or more pages require disclaimers, propose a shared `<AiDisclaimer />` component in `app/ui/` rather than duplicating inline `<p>` tags. Document the component in this section when created.
