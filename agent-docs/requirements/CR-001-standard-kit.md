# CR-001: Establish Standard Kit v1.0 (Status: Completed)

## 1. Problem Statement
Currently, library selection is ad-hoc ("figure it out as we go"), leading to potential hallucinations, inconsistent UI implementations, and unmanaged dependency bloat. Agents lack a "menu" of available tools, causing them to either request impossible installs or reinvent the wheel.

## 2. Business Value
- **Consistency**: All UI components and logic patterns will share a common DNA.
- **Agent Efficiency**: Sub-agents stop guessing "what can I use?" and focus on "how do I use it?".
- **Stability**: Prevents dependency conflict and bloat by centralizing control.

## 3. Scope & Requirements

### 3.1 The Standard Kit (v1.0)
The Tech Lead must install and configure the following libraries as the **immutable baseline**:

| Category | Library | Purpose |
| :--- | :--- | :--- |
| **Logic & Validation** | `zod` | Runtime schema validation and type safety. |
| **State Management** | `zustand` | Global client-state management. |
| **UI Primitives** | `@radix-ui/react-*` | Unstyled, accessible component primitives (Dialog, Popover, etc.). |
| **Styling Utils** | `clsx`, `tailwind-merge` | Conditional class merging. |
| **Animations** | `framer-motion` | Complex, premium UI animations. |
| **Icons** | `lucide-react` | Standard icon set. |
| **Content** | `react-markdown`, `remark-gfm` | Rendering educational markdown content. |
| **Syntax Highlighting** | `shiki` | Code block highlighting (server-side preferred). |

### 3.2 Documentation Updates
- Update `agent-docs/technical-context.md` with a new section **"Standard Kit (Version 1.0)"**.
- This section must explicitly list the allowed libraries.

### 3.3 Governance Process
- **Invariant**: Sub-agents (Frontend, Backend, etc.) are **FORBIDDEN** from installing packages.
- **Proposal Flow**: A sub-agent may propose a new library in their plan.
- **Approval**: Only the **Tech Lead** may approve and run the install command.
- **Version Control**: Every addition increments the "Standard Kit Version" in the technical context.

## 4. Acceptance Criteria
- [x] All listed dependencies are present in `package.json`.
- [x] `agent-docs/technical-context.md` reflects the "Standard Kit v1.0" list.
- [x] A brief "governance warning" is added to `technical-context.md` stating dependencies are locked.
- [x] Example usage (e.g., a simple `cn` utility using clsx+tailwind-merge) is created in `lib/utils.ts` (optional but recommended for verification).

## 5. Constraints
- **Strict Versions**: Stick to stable versions compatible with Next.js 15 (React 19).
- **No duplicates**: Ensure no overlapping libraries (e.g., do not add another icon set).
