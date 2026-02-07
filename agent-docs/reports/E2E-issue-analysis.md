# E2E Test Failure Analysis Report

**Contact**: BA Agent
**Date**: 2026-02-01
**Status**: For Review by User / Senior Developer

---

## 1. Executive Summary

This report documents the root causes for the recent failures and inconsistencies observed in the Playwright E2E test suite. The primary issues identified are **resource contention** leading to flakiness and a **security directive conflict** causing Webkit to fail with a "white screen."

---

## 2. Issue 1: Inconsistent Results (Flakiness)

### Symptom
Running `pnpm test:e2e` (all tests) results in failures that disappear when running tests individually. Specifically, `navigation.spec.ts` fails in the full run but passes in isolation.

### Root Cause Analysis
1.  **Next.js Dev Server Overload**: `playwright.config.ts` has `fullyParallel: true` enabled and `workers` set to the default (CPU count). When all browser projects (Chromium, Firefox, Webkit) run together, up to 12+ tests compete for the single-threaded Next.js dev server. The server must compile pages on-demand, leading to high latency and timeouts in the first few tests.
2.  **Resource Hotspots (ONNX/WASM)**: `transformer.spec.ts` loads a heavy ONNX model and performs CPU-intensive WASM tasks. Running this in parallel with lightweight navigation tests increases the likelihood of race conditions and missing UI elements due to execution lag.
3.  **Concurrent Test Suites**: Active terminal sessions show multiple instances of `pnpm test:e2e` running simultaneously. This causes port conflicts and severe resource exhaustion.
4.  **Middleware Rate Limiting**: The in-memory rate limiter in `middleware.ts` has a cap of 30 requests per minute for `/api/otel/trace`. A parallel run of all tests likely exceeds this threshold, causing telemetry-dependent tests to fail or act unpredictably.

### Suggested Solutions
-   **Lower Worker Count**: Set `workers: 1` or `2` for local development in `playwright.config.ts` to reduce load on the dev server.
-   **Sequence-Critical Tests**: Use `test.describe.configure({ mode: 'serial' })` for heavy tests like `transformer.spec.ts`.
-   **Increase Timeouts**: Bump global `expect` and `action` timeouts given the weight of the Next.js dev environment.
-   **Server Warm-up**: Ensure the dev server has a few seconds to stabilize before Playwright begins navigation attempts.

---

## 3. Issue 2: Webkit failures (White Screen)

### Symptom
Webkit-based tests fail consistently with a white screen in videos and screenshots.

### Root Cause Analysis
1.  **CSP `upgrade-insecure-requests`**: `middleware.ts` (line 68) includes the `upgrade-insecure-requests` directive. Webkit strictly obeys this by upgrading `http://localhost:3001` to `https://localhost:3001`. Since the local dev server is not served over SSL, the connection fails immediately.
2.  **BrowserGuard Loading State**: The `BrowserGuard` component (our WASM/security wrapper) returns a blank loading div (`bg-[#fcfcfc]`) while performing its environment audit. If the JS execution is blocked by the CSP issue above, the app never progresses beyond this initial empty state, appearing as a "white screen."
3.  **HMR Connection Blocks**: The `connect-src` directive in CSP might be blocking Webkit's connection to the Next.js development websocket, preventing the client from ever reaching a "ready" state.

### Suggested Solutions
-   **Conditional CSP**: Remove `upgrade-insecure-requests` and `Strict-Transport-Security` when `process.env.NODE_ENV === 'development'`.
-   **Enhanced BrowserGuard Visibility**: Add a subtle "Environment Audit..." label to the `BrowserGuard` loading state so failures are distinguishable from a broken load.
-   **Dev-Specific OTel Bypass**: Relax rate limiting specifically for the IP `127.0.0.1` and `::1` in the middleware to allow full-suite E2E testing without rejection.

---

## 4. Next Steps
1.  Establish `CR-004: E2E Suite Stabilization`.
2.  Hand off the technical implementation of the suggested fixes to the **Senior Developer Agent**.
