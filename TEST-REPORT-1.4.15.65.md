# Fizz Health v1.4.15.65 — Test Report

## Scope verified

- Recipes with `Track in inventory = No` are planner/consumption eligible when all required tracked ingredients are sufficient, without requiring a prepared batch.
- Recipes with `Track in inventory = Yes` still require positive prepared Recipe inventory.
- Recipe General availability messaging follows the same tracking rule.
- Recipe prepared-batch editor has a dedicated iPhone-safe vertical scroll host.
- General and Shopping edit rows use stable shared React component types, preventing controlled inputs from remounting and losing focus during typing.
- Toggle-row checkboxes use one consistent compact Fizz Health switch rendering.
- Release/About metadata is synchronized for v1.4.15.65 / schema 91.

## Passing validation

- `node --test tests/inventory-availability.test.js tests/v141565-recipe-form-availability-stabilization.test.js` — **8/8 passed**.
- `node scripts/verify-release.mjs` — passed.
- `node scripts/project-integrity.mjs` — passed.
- `node --check src/database.js` — passed.
- `node --check src/inventory/availability.js` — passed.

## Environment limitations and broader suite

- A production Vite build could not be run locally because dependency restoration is blocked by the environment registry returning HTTP 404 for the locked `xlsx@0.18.5` tarball.
- The complete historical test suite was executed. It reported 526 passes and 213 failures. The failures are broad pre-existing expectation drift across older tests (nutrition aggregation, decision wording, historical static assertions, and other unrelated releases), not failures in the targeted v1.4.15.65 tests. No unrelated historical tests were rewritten except the authoritative inventory-availability test whose old prepared-batch-only expectation was intentionally superseded by this release’s approved rule.
