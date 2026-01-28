# Common Prompt Anti-Patterns

## ❌ Vague Goals
Bad: "Make the UI better"
Good: "Add loading spinners to all async actions per docs/roles/frontend.md checklist"

## ❌ Missing Constraints
Bad: "Add user authentication"
Good: "Add user authentication. DO NOT use external auth providers. DO use session cookies. ASK IF unclear about password hashing strategy."

## ❌ No Verification
Bad: "Fix the bug"
Good: "Fix the bug. Verify with: `pnpm test`, manually test dark mode toggle, check console for errors."