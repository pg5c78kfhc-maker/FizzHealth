# Fizz Health v1.4.15.103 — Menu Copy Planning

## Baseline

`Fizz-Health-v1.4.15.102-FULL-SOURCE.zip`

## Delivered

- Added an extensible ellipsis action menu to the Nutrition Menu header.
- Added **Copy Proposed Meals** as the first Menu action.
- Added copy scopes for the entire day, Breakfast, Lunch, Dinner, Snacks, or selected proposed items.
- Added a direct calendar date picker for choosing one or more future destination dates.
- Past dates and the source date are not selectable; the source date is visibly marked.
- Added a review-and-confirm step before database changes are made.
- Copied entries retain Proposed status, meal service, servings, notes, nutrition snapshots, source references, and lock state.
- Consumed state, consumption timestamps, and inventory adjustments are not copied.
- Exact duplicate proposed entries on a destination date are skipped.
- Preserved and verified the category-aware, laboratory-aware, rotation-based recommendation engine delivered in v1.4.15.102.

## Out of Scope

No redesign of the Nutrition dashboard, Pantry, Shopping, Recipes, Health editors, or Labs visualization.

## Build Status

A production build was attempted. It did not complete because the supplied environment does not contain the Vite executable (`sh: 1: vite: not found`). No successful production build is claimed.
