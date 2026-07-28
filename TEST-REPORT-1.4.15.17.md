# Fizz Health v1.4.15.17 Test Report

## Approved scope
- Repair active Food and Recipe classification drift using `ingredient_only` as the canonical source.
- Make Menu eligibility read the canonical `ingredient_only` field.
- Synchronize legacy classification fields whenever Food or Recipe classification is saved.

## Results
- Focused regression tests: **3 passed / 3 total**.
- Project integrity check: **passed** (one application root, one package, one source tree, one Menu/Chef implementation).
- Release metadata verification: **passed** for v1.4.15.17 / build 141517 / deployment FH-20260728-141517 / schema 72.
- Full legacy suite: **458 passed / 134 failed / 592 total**. The archive baseline contains numerous pre-existing historical/static expectation failures, including tests tied to obsolete versions and UI strings. The focused v1.4.15.17 tests pass.
- Production Vite build: **not run** because the supplied archive does not include `node_modules`, and package installation is unavailable in this environment.
- ZIP integrity: verified after packaging.

## Focused verification
1. Migration 72 repairs every active Food and Recipe where `usage_designation`, `consumption_role`, `classification`, or Ingredient-category state disagrees with `ingredient_only`.
2. Menu queries include active Foods and Recipes when `ingredient_only = 0`, regardless of stale legacy usage values.
3. Food nutrient saves, Recipe saves, and category edits write synchronized planning-classification values.
