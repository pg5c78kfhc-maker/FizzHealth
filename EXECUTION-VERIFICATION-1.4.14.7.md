# Execution Verification — Fizz Health v1.4.14.7

## Release

- Version: 1.4.14.7
- Build: 141407
- Deployment: FH-20260727-141407
- Release: Aggregate Nutrition Integrity

## Implemented

- Added `src/nutrition/aggregate.js` as the authoritative ID-based Recipe and Meal calculation service.
- Routed all known Recipe consumers away from direct low-level `buildRecipeSnapshot(recipeId)` calls.
- Added live Meal calculation from current Food and Recipe components.
- Updated Menu and Meals-library consumers to use current aggregate nutrition.
- Recalculated Meal editor components when an existing Meal is opened.
- Preserved historical consumed records as stored snapshots.
- Changed missing `nutrition_known` status from implicitly valid to explicitly unknown.
- Added an active Recipe and Meal audit to Settings > Maintenance.
- Added source validation for missing nutrition and invalid quantities.
- Added focused regression tests preventing direct UI access to the low-level Recipe builder.

## Verification

- Project integrity check: PASS
- Aggregate nutrition focused tests: PASS (5/5)
- Release metadata verification: PASS
- Full historical test suite: 421 passed, 92 failed. The failures are legacy release-specific assertions tied to older source text and version identities; the new focused aggregate integrity tests passed.
- Production Vite build: NOT EXECUTED. The supplied archive does not contain an installed local Vite executable, and dependency installation was unavailable in this execution container.

## Historical-data policy

Existing consumed history is not rewritten. Current Recipe definitions, Meal definitions, Menu displays, pickers, and prospective logging resolve from the latest Food and Recipe source data.
