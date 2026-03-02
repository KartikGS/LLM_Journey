# Investigation Report: Pipeline Regression After Latest CR

**Date**: 2026-02-12
**Status**: For Review
**Linked CR**: CR-007

---

## Executive Summary
The delivery pipeline is not releasable because `pnpm test` and `pnpm build` fail. `pnpm lint` currently passes. Failures appear to be caused by stale route/file references after route restructuring and a TypeScript/framer-motion typing mismatch.

## Observed Symptoms
- `pnpm test` fails with module resolution error:
  - `Cannot find module '../../app/transformer/components/BaseLLMChat' from '__tests__/components/BaseLLMChat.test.tsx'`
- `pnpm build` fails after type-checking phase (build worker exits with code `1`).
- Direct type-check (`pnpm exec tsc --noEmit`) reports:
  - `__tests__/components/BaseLLMChat.test.tsx(5,25): error TS2307: Cannot find module '@/app/transformer/components/BaseLLMChat'`
  - `app/ui/navbar.tsx(163,15): error TS2322 ... Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'`
- `pnpm lint` succeeds with no lint errors.

## Investigated Areas
- **Test imports**: `BaseLLMChat` tests still reference `/app/transformer/...`, but current project path is `/app/foundations/transformers/...`.
- **Build/typecheck path**: Next build output truncates specific type errors, but direct TypeScript check confirms same root failures.
- **Warnings vs blockers**: OpenTelemetry `require-in-the-middle` warnings appear during build but are non-blocking compared to the hard TypeScript failure.

## Root Cause Analysis (RCA)
1. **Stale import paths after route/file migration**
   - A prior CR moved Transformer assets to `/foundations/transformers`.
   - Test files retained old module paths, breaking Jest and TypeScript.
2. **Framer Motion variant typing drift**
   - `app/ui/navbar.tsx` contains a variant object where transition `type` is inferred as generic `string` in one branch.
   - Framer Motion expects a narrower literal union (`AnimationGeneratorType`), causing TS2322 in strict mode and failing build.

## Suggested Strategies
- **Strategy A (Recommended): Fast stabilization patch**
  - Update stale test imports to current path.
  - Normalize or explicitly type motion variants in `app/ui/navbar.tsx` so `transition.type` resolves to valid Framer Motion literal types.
  - Re-run `pnpm test && pnpm lint && pnpm build`.
- **Strategy B: Compatibility adapter**
  - Add a temporary re-export shim at old module path for backward compatibility.
  - Fix navbar type issue in parallel.
  - Remove shim in follow-up cleanup CR.

## Verification Plan
- `pnpm test` returns exit code `0`.
- `pnpm lint` returns exit code `0`.
- `pnpm build` returns exit code `0`.
- Confirm no remaining TypeScript errors with `pnpm exec tsc --noEmit`.
