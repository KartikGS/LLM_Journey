## BLOCKER / FEEDBACK

### Missing Selector for Browser Support Fallback (CR-004)
- **Status**: HALTED
- **Details**: The handoff (senior-to-testing.md) specifies using `#browser-support-fallback` to verify the fallback UI. However, this ID is missing from `components/ui/browser-support-fallback.tsx`.
- **Impact**: Unable to proceed with robust testing of the fallback UI without violating the "No Brittle Selectors" policy.
- **Request**: Please add `id="browser-support-fallback"` to the root container of the fallback UI in `components/ui/browser-support-fallback.tsx`.
