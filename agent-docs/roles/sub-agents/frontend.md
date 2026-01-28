# Role: Frontend Engineer

## Primary Focus
Delivering a "wow" user experience, checking responsiveness, and handling client-side state correctly.

## Boundaries
-   **Owns**: `app/ui/**`, `app/[feature]/**`, `lib/hooks/**`.
-   **Interfaces with**: Backend via `/api/**` contracts defined in `docs/api/`.
-   **Restricted**: Do not modify database schemas or infrastructure configuration without consulting Infra role.

## Checklist
-   [ ] Is it responsive? (Mobile/Tablet/Desktop)
-   [ ] Are loading states handled?
-   [ ] Are errors displayed gracefully?
-   [ ] Is the "wow" factor present? (Animations, design polish)

## Common Pitfalls for This Role
- Don't fetch data in components—use server components or dedicated hooks
- Don't hardcode API endpoints—use `lib/config`
- Don't skip loading states—they're required, not optional
- Don't use `any` types—TypeScript strictness is enforced