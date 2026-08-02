# Fizz Health v1.4.15.107 — Canonical Recipe Composition

Baseline: v1.4.15.106.

## Completed

- Made `meal_components` the authoritative ingredient source for active Recipes.
- Changed Recipe consumption and Pantry deduction to read the current canonical component list instead of stale rows in `recipes`.
- Changed canonical Recipe nutrition calculation and availability checks to use `meal_components`.
- Updated Recipe detail ingredient display to use the same canonical component list.
- Added `syncRecipeCompatibility()` so retained legacy `recipes` rows are fully rebuilt after ingredient add, delete, reorder, or Recipe metadata edits.
- Added a database migration that removes stale/duplicate compatibility rows and rebuilds them from `meal_definitions` plus `meal_components`.
- Normalized active Proposed Recipe references to canonical `recipe:` IDs.
- Preserved consumed Meal history as snapshots.
- Preserved Pantry transaction rollback and explicit “No changes were saved” failure behavior.

## Primary acceptance scenario

After replacing Unsweetened Almond Milk with Whole Foods Vanilla Almond Milk at 300 mL in Protein Smoothie, active Recipe display, nutrition, availability, and consumption now resolve the Whole Foods ingredient from the same canonical source.

## Build status

A production dependency installation and build were attempted. Installation failed because the configured package proxy returned HTTP 404 for `xlsx@0.18.5`; therefore Vite could not be executed and no successful production build is claimed.
