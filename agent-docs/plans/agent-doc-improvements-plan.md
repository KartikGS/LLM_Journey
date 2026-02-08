# Implementation Plan: Agent Doc Improvements (Meta-Analysis)

## Goal
Improve agent documentation based on CR-003 execution learnings to prevent future delegation bypasses and clarify role boundaries.

## Key Changes

### 1. Rename "Senior Developer" → "Tech Lead"
**Rationale**: "Senior Developer" implies hands-on coding, which conflicts with the delegation invariant. "Tech Lead" emphasizes coordination and review.

### 2. Harden Delegation Boundaries
**Rationale**: The current exception language ("project-wide configuration or simple documentation") is too easy to misinterpret.

### 3. Add Mandatory Self-Check Before Implementation
**Rationale**: Missing verification step allowed me to bypass delegation.

### 4. Add Visual Quality Invariant to Frontend Role
**Rationale**: "Functionally correct but plain" outcomes indicate missing quality expectations.

---

## Proposed Changes

### Component 1: Role Rename & Strengthening

#### [DELETE] [senior.md](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/roles/senior.md)
Delete after creating replacement.

#### [NEW] [tech-lead.md](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/roles/tech-lead.md)
Key changes from original:
- Rename all instances of "Senior Developer" → "Tech Lead"
- Replace soft delegation exception with **hard rule + exhaustive permitted list**:
  ```markdown
  ## 🛑 HARD RULE: The Tech Lead Does Not Write Feature Code
  
  "Feature Code" includes ANY file under:
  - `components/`
  - `app/` (except route-level config)
  - `hooks/`
  - `lib/` (except shared infra)
  - Feature test files in `__tests__/`
  
  **Permitted direct changes (exhaustive list):**
  - Project config: `tsconfig.json`, `next.config.js`, `.env.*` templates
  - Documentation: `README.md`, `agent-docs/*.md`
  - CI/CD: `.github/workflows/*`
  - Shared infra: `lib/config/*`, `lib/utils/*` (non-feature)
  
  **Everything else → DELEGATE.**
  ```
- Add **Self-Check Protocol** before any implementation

---

### Component 2: Workflow Updates

#### [MODIFY] [workflow.md](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/workflow.md)
- Rename "Senior Developer" → "Tech Lead" throughout
- Add new section after "Execution Start" (line 26):
  ```markdown
  ### 🛑 Pre-Implementation Self-Check (Tech Lead)
  Before writing code or making changes directly:
  1. **List the files you will modify.**
  2. **For each file, ask: "Is this feature code?"**
     - Feature code = `components/`, `app/*/`, `hooks/`, feature tests
  3. **If YES to any** → STOP. Create handoff in `conversations/tech-lead-to-<role>.md`.
  4. **If NO to all** → Proceed with direct implementation.
  
  *Skipping this checklist is a protocol violation.*
  ```

---

### Component 3: AGENTS.md Updates

#### [MODIFY] [AGENTS.md](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/AGENTS.md)
- Line 20: Change `Senior Developer → [roles/senior.md]` to `Tech Lead → [roles/tech-lead.md]`
- Lines 43-44: Update authority references

---

### Component 4: Frontend Role Enhancement

#### [MODIFY] [frontend.md](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/roles/sub-agents/frontend.md)
- Rename "Senior Developer" → "Tech Lead" (lines 24-25)
- Add new section after "Checklist":
  ```markdown
  ## Visual Quality Invariant
  
  > **"Functionally correct but plain" is a failure.**
  
  All user-facing changes must meet premium aesthetic standards:
  - Use design tokens from the style guide
  - Apply appropriate animations/transitions
  - Ensure visual hierarchy is clear
  - Follow the "wow factor" requirement in the checklist
  
  If the handoff lacks visual specifications, request clarification from Tech Lead 
  before implementing a minimal version.
  ```

---

### Component 5: Other Role Updates (Cross-References)

#### [MODIFY] [ba.md](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/roles/ba.md)
Rename all "Senior Developer" → "Tech Lead" (~15 instances)

#### [MODIFY] [testing.md](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/roles/sub-agents/testing.md)
Rename all "Senior Developer" → "Tech Lead"

#### [MODIFY] [backend.md](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/roles/sub-agents/backend.md)
Rename all "Senior Developer" → "Tech Lead"

#### [MODIFY] [infra.md](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/roles/sub-agents/infra.md)
Rename all "Senior Developer" → "Tech Lead"

---

### Component 6: Conversation File Renames

The following conversation template files should be renamed:
- `ba-to-senior.md` → `ba-to-tech-lead.md`
- `senior-to-ba.md` → `tech-lead-to-ba.md`
- `senior-to-frontend.md` → `tech-lead-to-frontend.md`
- `frontend-to-senior.md` → `frontend-to-tech-lead.md`
- (similar for testing, backend, infra)

> [!IMPORTANT]
> **User Decision Required**: Should I rename all conversation files now, or leave them as-is since they contain CR-003 content? We could:
> - Option A: Rename files and update content to use new terminology
> - Option B: Keep existing files, only rename template references for future CRs

---

### Component 7: Other Doc Updates

#### [MODIFY] [technical-context.md](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/technical-context.md)
Line 21: "Senior Developer" → "Tech Lead"

#### [MODIFY] [testing-strategy.md](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/testing-strategy.md)
Update references (~2 instances)

#### [MODIFY] [CR-template.md](file:///home/kartik/Metamorphosis/LLM-Journey/agent-docs/requirements/CR-template.md)
Line 38: "Senior Dev" → "Tech Lead"

---

## Verification Plan

### Manual Review
Since these are documentation changes, verification is manual:

1. **Consistency Check**: After changes, run:
   ```bash
   grep -ri "senior" agent-docs/ --include="*.md"
   ```
   Expected: 0 results (except historical references in project-log.md if preserved)

2. **Link Validation**: Verify all internal links resolve correctly
   - Check that `[roles/tech-lead.md]` exists
   - Check that renamed conversation files are linked correctly

3. **User Walkthrough**: Read through the new `tech-lead.md` and confirm:
   - The delegation hard rule is clear
   - The self-check protocol is actionable
   - No ambiguity remains about when direct implementation is permitted

---

## Summary of Files to Change

| File | Action |
|------|--------|
| `roles/senior.md` | DELETE (after creating replacement) |
| `roles/tech-lead.md` | NEW |
| `workflow.md` | MODIFY |
| `AGENTS.md` | MODIFY |
| `roles/ba.md` | MODIFY |
| `roles/sub-agents/frontend.md` | MODIFY |
| `roles/sub-agents/testing.md` | MODIFY |
| `roles/sub-agents/backend.md` | MODIFY |
| `roles/sub-agents/infra.md` | MODIFY |
| `technical-context.md` | MODIFY |
| `testing-strategy.md` | MODIFY |
| `requirements/CR-template.md` | MODIFY |
| `conversations/*` | RENAME (pending user decision) |
