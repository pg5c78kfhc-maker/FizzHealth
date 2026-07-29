# Test Report — Fizz Health v1.4.15.39

## Scope
Critical Inventory Integrity Runtime Path Corrective.

## Source-path audit

- `index.html` imports `/src/main.jsx`.
- The archive contains one `src/main.jsx`, one `package.json`, and one application source tree.
- `scripts/project-integrity.mjs` reports one application root and one isolated Menu/Chef implementation.
- The active Food Log edit handler previously changed Pantry directly with `UPDATE pantry SET quantity=COALESCE(quantity,0)+?`; that bypass has been removed.
- Quick-consume Undo previously deleted the meal without reversing inventory; it now reverses the recorded transaction before deletion.

## Root cause verified

For a count-based Pantry record such as apples, the prior resolver converted `1 serving` using the food nutrition serving size. A 125 g nutrition serving therefore became a Pantry delta of 125 apples. The decrement clamped inventory to zero, but the stored delta remained 125. Deleting the meal replayed 125 into Pantry.

v1.4.15.39 now:

- Treats one serving as one unit for count-based inventory.
- Uses gram/milliliter serving conversion only for measured inventory.
- Stores only the quantity actually deducted.
- Stores before/after inventory snapshots.
- Prevents duplicate adjustment rows per meal and Pantry item.
- Caps malformed legacy reversals, including existing 125-apple adjustment records, to the quantity represented by the consumed meal.
- Routes edit, delete, Undo, quick-consume Undo, meal, recipe, and replay paths through the canonical inventory functions.

## Focused regression results

Passed: 5 of 5

- Single runtime entry point and source-tree audit.
- 5 apples → consume 1 serving → 4 apples.
- Requested deduction cannot exceed available inventory.
- Exact reversal restores the actual deduction.
- Legacy 125-apple reversal is capped to one count-based serving.
- Snapshot columns and duplicate-adjustment safeguard are present.
- Live edit path no longer directly increments Pantry.

Command:

`node --test tests/v141539-inventory-runtime-integrity.test.js`

## Release verification

Passed:

- `node scripts/project-integrity.mjs --repair`
- `node scripts/project-integrity.mjs`
- `node scripts/verify-release.mjs`

## Full legacy suite

`npm test` executed 674 tests:

- Passed: 501
- Failed: 173

The failures are pre-existing historical/static release tests that hard-code prior versions, schema targets, retired UI text, or prior source patterns. The new v1.4.15.39 focused tests passed. No failed full-suite assertion identified a regression in the corrected inventory paths.

## Build status

A production Vite build was not executed because the supplied source archive does not include `node_modules`, and dependency installation is unavailable in this sandbox for the pinned package set. This is reported as an environment limitation, not as a successful compilation.

## Live-data safety

No user Pantry database was used. Tests used isolated logic and source assertions. The user should correct the already-corrupted apple quantity manually after deployment; the release prevents future 125-unit replays and safely handles deletion of legacy malformed consumption adjustments.
