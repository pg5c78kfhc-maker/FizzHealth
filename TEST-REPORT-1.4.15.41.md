# Fizz Health v1.4.15.41 Test Report

## Scope verified

- Primary navigation is rendered through a document-level portal and fixed to the viewport bottom with iPhone safe-area padding.
- Menu Chef’s Picks excludes current-day Consumed and Proposed items using canonical IDs and normalized names before Decision Intelligence ranking.
- Proposed-item removal writes a `planned_meal_removed` event, refreshes planner state, and is surfaced newest-first in the Daily Brief with recalculated projected nutrition and re-ranked guidance.
- Daily Brief ranks up to five out-of-stock Pantry purchase recommendations using fiber and protein gaps, calorie room, saturated fat, sodium, restock priority, Restaurant Day context, and current availability.
- Release metadata, service-worker cache identity, database release metadata, and Decision Engine version were updated to v1.4.15.41.

## Automated results

- Focused v1.4.15.41 checks: **10/10 passed**.
- Project source-tree integrity: **passed**.
- Release metadata verification: **passed**.
- Existing full regression suite: **504 passed / 176 failed**. The failures are pre-existing historical expectations and legacy assertions outside the approved v1.4.15.41 scope; no attempt was made to rewrite unrelated tests.

## Build limitation

A production Vite build could not be executed because the sandbox package registry does not provide the pinned `xlsx@0.18.5` dependency. `npm install` returned registry error 404. This is an environment dependency limitation, not a reported application test pass.

## Required live iPhone verification

1. Scroll the Menu from top to bottom and confirm the primary navigation never leaves the viewport bottom and no final content is hidden.
2. Confirm Daily Salad disappears from Chef’s Picks when already Consumed today.
3. Add a Chef’s Pick to Proposed and confirm it disappears immediately; remove it and confirm recommendations re-rank.
4. Open the Daily Brief after removing a Proposed item and confirm the removal acknowledgement, revised projected totals, and updated highest-impact action.
5. Confirm the Shopping Priorities section displays no more than five out-of-stock items, ranked with an explanation for each.
