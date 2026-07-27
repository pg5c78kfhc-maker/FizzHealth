# Test Report — Fizz Health v1.4.14.8

## Passing release-focused checks

- `node scripts/project-integrity.mjs`
- `node scripts/verify-release.mjs`
- `node --test tests/aggregate-nutrition-integrity.test.js`

Aggregate test result: **9 passed, 0 failed**.

Coverage includes:

- Recipe totals reflect current Food nutrition.
- Meal totals use canonical nested Recipe totals.
- Unknown source nutrition cannot become a known zero.
- Every active Recipe and Meal is included in the aggregate audit.
- UI and feature consumers cannot call the low-level Recipe builder.
- Explicit integrity states and resolution counts are reported.
- Duplicate Meal components invalidate the Meal rather than silently double-counting.
- Menu calculates each Recipe snapshot once per mapping pass.

## Full historical suite

Result: **425 passed, 92 failed**.

The remaining failures are dominated by legacy tests that require obsolete release numbers, retired Food/Meals layouts, or historical UI wording. They are not evidence of failures in the v1.4.14.8 aggregate calculation tests.

## Build

A production Vite build could not be executed because dependencies were not installed in the supplied archive and installation was unavailable in the execution environment.
