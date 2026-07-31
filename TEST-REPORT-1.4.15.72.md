# Fizz Health v1.4.15.72 Test Report

## Scope

Systemic Recipe serving-basis corrective across Menu, Planner, Add Now, planned records, consumed records, nutrition scaling, and prepared Recipe inventory consumption.

## Results

- Project integrity: PASS
- Release metadata verification: PASS
- Targeted Recipe serving-basis regression tests: 5/5 PASS
- Production build: NOT EXECUTED in this environment because `npm ci` cannot retrieve `xlsx@0.18.5` from the configured package registry (HTTP 404), leaving Vite unavailable.
- Full legacy test suite: 540 passed / 222 failed. The failures are pre-existing brittle/static expectations and aggregate-fixture failures outside this corrective scope; the new targeted suite passes.

## Corrective verification

1. Canonical Recipe `serving_size`, `serving_unit`, and `servings_per_batch` now define the Planner serving basis.
2. Batch nutrition is divided by `servings_per_batch` before portion multipliers are applied.
3. A 994 g batch with a 100 g serving now presents 1 serving as 100 g and approximately one-tenth of the batch nutrition.
4. Planned and consumed records persist the actual logging quantity and unit rather than representing the full batch as one serving.
5. Existing gram-based planned records reopen with the correct portion multiplier.
6. Prepared Recipe inventory is consumed first and decremented by the actual serving quantity; raw ingredients are used only when no prepared inventory exists.

## Commands

- `npm run integrity:check`
- `node --test tests/v141572-recipe-serving-basis.test.js`
- `npm run verify:release`
