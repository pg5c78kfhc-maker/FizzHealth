# Fizz Health v1.4.15.68 — Test Report

## Release

- Version: 1.4.15.68
- Build: 141568
- Deployment: FH-20260730-141568
- Schema: 94
- Release: Recipe, Food Delete & Legacy UI Stabilization

## Implemented

- Unified Library rows now use separate, mutually exclusive swipe rails.
- Right swipe exposes Add only; left swipe exposes Archive, Category, and Delete.
- Foods and Recipes both expose permanent deletion.
- Permanent deletion is blocked while active Recipe/Meal references or positive Pantry inventory remain.
- Foods, Recipes, and Meals remain together in the unified Food Library.
- Food taps continue to open the modern General/Nutrition/Inventory/Shopping record.
- Recipe taps continue to open the modern General/Nutrition/Inventory/Ingredients record.
- The unused standalone Nutrition editor render route and state were removed.
- The obsolete Recipe migration failure wording was removed from production presentation.

## Targeted regression tests

Command:

`node --test tests/inventory-availability.test.js tests/v141565-recipe-form-availability-stabilization.test.js tests/v141566-availability-engine-stabilization.test.js tests/v141567-modern-record-recipe-stabilization.test.js tests/v141568-recipe-delete-legacy-ui-stabilization.test.js`

Result: **21 passed / 0 failed**.

## Release verification

- `npm run integrity:check`: **passed**.
- `npm run verify:release`: **passed**.

## Production build

`npm run build` could not start because the extracted source archive does not contain installed dependencies and the `vite` executable is unavailable in this environment (`vite: not found`). The targeted source and release checks completed successfully.
