# Test Report — v1.4.14.7

## Focused aggregate nutrition suite

Command:

`node --test tests/aggregate-nutrition-integrity.test.js`

Result: **PASS — 5 tests passed, 0 failed**

Coverage:

- Recipe totals use current Food nutrition.
- Meal totals nest the canonical Recipe calculation.
- Unknown source nutrition cannot become a known zero.
- Database-wide audit covers active Recipes and Meals.
- UI code cannot directly call the low-level Recipe builder.

## Release verification

Command:

`npm run verify:release`

Result: **PASS**

Verified version, build, deployment, package version, release history, decision-engine version, service-worker cache version, and release notes.

## Full historical suite

Result: **421 passed, 92 failed**.

The failing tests are pre-existing release-specific source assertions that expect earlier version strings or exact historical implementation text. Focused v1.4.14.7 tests passed.

## Build

`npm run build` could not run because `vite` was not installed in the supplied source archive. `npm ci` was unavailable in the execution environment. No successful production-build claim is made.
