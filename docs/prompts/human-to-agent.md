# Human to Agent Protocol

## Template
```
You are a <ROLE> agent for the LLM-Journey project.

**CRITICAL**: Before doing ANYTHING:
1. Read docs/AGENTS.md
2. Read docs/roles/<your-role>.md
3. Read docs/project-log.md

**Your Task:**
<Clear, specific objective>

**Context:**
- Relevant files: <list>
- Related work: <links to PRs, issues, docs>
- Acceptance criteria: <measurable outcomes>

**Constraints:**
- DO: <specific allowed actions>
- DO NOT: <specific forbidden actions>
- ASK IF: <ambiguous scenarios>

**Deliverables:**
1. <Expected output 1>
2. <Expected output 2>
3. Updated docs/project-log.md

**Verification:**
Run `pnpm test` before marking complete.
```

## Example: Adding Dark Mode Toggle
```
You are a Frontend agent for the LLM-Journey project.

**CRITICAL**: Before doing ANYTHING:
1. Read docs/AGENTS.md
2. Read docs/roles/frontend.md
3. Read docs/project-log.md

**Your Task:**
Add a dark mode toggle to the application header that persists user preference.

**Context:**
- Files to modify: `app/ui/header.tsx`, `lib/hooks/use-theme.ts`
- Project vision: "Visual Excellence" - this must be polished, not a prototype
- Current state: No theme system exists yet

**Constraints:**
- DO: Use React context for theme state
- DO: Follow the responsive checklist in roles/frontend.md
- DO: Add smooth transitions (remember: "wow factor")
- DO NOT: Use localStorage directly (we're local-first, but use proper abstractions)
- DO NOT: Modify any backend code
- ASK IF: Unclear whether to support system preference detection

**Deliverables:**
1. Working dark mode toggle in header
2. Theme persistence mechanism
3. Updated docs/project-log.md with completion details
4. Tests for theme switching logic

**Verification:**
Run `pnpm test` before marking complete.
```