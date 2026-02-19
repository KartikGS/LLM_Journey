# Meta Report: Frontend Agent Doc Feedback (CR-012 Session)

Date: 2026-02-16
Role Perspective: Frontend sub-agent
Scope: Documentation/process clarity for frontend execution quality

## Observed Issues

1. Broken reference to contribution standards in workflow:
   - `agent-docs/workflow.md:96` points to root `CONTRIBUTING.md`.
   - Actual file is `agent-docs/development/contribution-guidelines.md`.
   - Impact: Agents cannot reliably locate the required standard.

2. Outdated folder map:
   - `agent-docs/folder-structure.md:15` says docs live in `/docs`.
   - Repository currently uses `agent-docs/` (no `/docs` directory).
   - Impact: Confusing onboarding and incorrect path assumptions.

3. Potential policy tension on scope changes:
   - `agent-docs/workflow.md:120` allows user/Tech Lead feedback to introduce out-of-scope changes with approval.
   - `agent-docs/workflow.md:188` says pause until `scope extension approved` is explicitly recorded.
   - Impact: No explicit rule for whether direct user instruction in active session counts as immediate approval or needs handoff-file update first.

4. Visual-quality instruction precedence is unclear:
   - Frontend doc enforces premium polish (`agent-docs/roles/sub-agents/frontend.md:85`).
   - Architecture-only mode freezes copy/visual behavior (`agent-docs/roles/sub-agents/frontend.md:35`).
   - Impact: In low-spec handoffs, agents can be unsure whether to improve visuals by default or freeze strictly.

5. Educational copy ownership is under-defined:
   - BA owns scope/intent (`agent-docs/AGENTS.md:51`).
   - Frontend owns feature-page implementation (`agent-docs/roles/sub-agents/frontend.md:9`).
   - Impact: For pedagogy-heavy pages, copy decisions are often made during implementation without a crisp ownership handshake.

6. Shared component blast-radius expectations are qualitative but not operational:
   - Requires impacted-route sanity checks (`agent-docs/workflow.md:190`, `agent-docs/frontend-refactor-checklist.md:22`).
   - Impact: Evidence quality can vary because no minimum command/proof standard is defined.

## Conflict/Redundancy Analysis

### Conflicts or near-conflicts

1. Broken path conflict:
   - Workflow requires following a document that does not exist at the specified location.

2. Soft conflict in execution behavior:
   - “Ask for clarification/pause on scope extension” vs “direct user feedback can introduce changes” lacks explicit ordering.

3. Soft conflict in UX behavior:
   - “Never ship plain UI” vs “freeze visual behavior in architecture-only mode” needs a precedence rule.

### Redundancies

1. Repeated visual doctrine:
   - “Wow yet professional,” glow limits, and motion discipline appear in both:
     - `agent-docs/roles/sub-agents/frontend.md`
     - `agent-docs/design-tokens.md`
   - Recommendation: keep principles in frontend role doc, keep concrete tokens/examples in design tokens doc.

2. Repeated environment constraints:
   - Browser/theme/version constraints repeat across:
     - `agent-docs/tooling-standard.md`
     - `agent-docs/technical-context.md`
     - `agent-docs/roles/sub-agents/frontend.md`
   - Recommendation: designate one canonical source and cross-link from the others.

3. Repeated verification command order:
   - `pnpm exec tsc --noEmit` then `pnpm lint` appears in both:
     - `agent-docs/roles/sub-agents/frontend.md`
     - `agent-docs/frontend-refactor-checklist.md`
   - Recommendation: keep sequence in one place and reference it.

## Proposed Changes

1. Fix hard path mismatches:
   - Update `agent-docs/workflow.md:96` to point to `agent-docs/development/contribution-guidelines.md`.
   - Update `agent-docs/folder-structure.md` docs path from `/docs` to `/agent-docs`.

2. Add explicit scope-extension precedence rule (sub-agent section):
   - “If user gives direct scope-changing instruction in active session, treat as provisional approval, implement, and record `scope extension approved by user` in role report + conversation artifact.”

3. Add architecture-only precedence clause in frontend role doc:
   - “When handoff mode is architecture-only, freeze behavior/copy/visuals takes precedence over premium-default enhancements unless explicit exception is granted.”

4. Add copy-ownership handshake for pedagogy-heavy pages:
   - New clause in workflow/frontend doc:
   - “Frontend may propose and implement copy only within accepted intent boundaries; semantic or instructional intent changes require BA/Tech Lead confirmation.”

5. Normalize shared-component blast-radius evidence:
   - Require minimum evidence format:
     - impacted route list,
     - one render/interaction proof per route (manual note or test command),
     - selector/semantic contract status.

6. Reduce duplication by introducing “source-of-truth tags”:
   - Mark canonical owners:
     - Visual values: `design-tokens.md`
     - Process flow: `workflow.md`
     - Environment/tooling: `tooling-standard.md`
   - Other docs should summarize + link, not restate.

## Decision Needed

1. Optional follow-up: Should the project introduce a dedicated Product/Content role, or keep content-intent ownership under BA for now?

## Approved Actions

- Approved by Human User in-session (2026-02-16):
  1. Direct Human User instructions during sub-agent execution are immediate scope-extension approval.
  2. Tech Lead remains focused on technical feasibility/correctness; BA owns product/content intent for Product End Users.
  3. Separate cross-project principles from project-specific principles.
- Implemented doc updates:
  - `agent-docs/AGENTS.md`
  - `agent-docs/workflow.md`
  - `agent-docs/roles/ba.md`
  - `agent-docs/roles/tech-lead.md`
  - `agent-docs/roles/sub-agents/frontend.md`
  - `agent-docs/coordination/general-principles.md` (new)
  - `agent-docs/project-principles.md` (new)
  - `agent-docs/coordination/reasoning-principles.md`
  - `agent-docs/folder-structure.md`
