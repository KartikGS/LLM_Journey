# Handoff: Senior Developer to Frontend Agent

## Objective
Implement a `BrowserGuard` component to detect WASM support and display a premium fallback UI for unsupported browsers.

## Context
The application relies on WASM and strict CSP. Some browsers (like Safari in certain modes) fail to initialize WASM. We need a guard to prevent the app from crashing and instead show a helpful guide.

## Tasks
1. **Detection Component**:
   - Create `components/ui/browser-support-fallback.tsx`.
   - Implement logic to check if WASM is supported and can be initialized (due to `wasm-unsafe-eval` CSP).
   - Use a `useEffect` to set a `supported` state.
2. **Fallback UI**:
   - Create a premium dark-themed UI.
   - Mention modern browser requirements: Chrome 95+, FF 102+, Safari 17.4+.
   - Use Lucide icons if available (check project dependencies) or clean CSS/SVG.
3. **Integration**:
   - Wrap the main content in `app/layout.tsx` with the `BrowserGuard`.

## Constraints
- Do not use `window` without checking for `undefined`.
- Maintain the project's premium aesthetic (dark mode, glassmorphism).
- Keep the detection logic lightweight.

## Definition of Done
- `BrowserGuard` correctly detects environment.
- Fallback UI is visually consistent with the app.
- No regression on supported browsers.
