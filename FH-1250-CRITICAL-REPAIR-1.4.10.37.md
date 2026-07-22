# Fizz Health v1.4.10.37 Critical Repair

## Scope

This release addresses two verified defects:

1. Existing current-day recipe meals did not receive complete nutrient snapshots after recipe aggregation was repaired.
2. Existing-food AI enrichment review did not commit approved changes.

## Root causes corrected

### Recipe nutrient backfill

A one-time startup backfill now finds current-day consumed recipe meals and active planned recipe meals, resolves each recipe through the current ingredient engine, recalculates every registered nutrient, updates the compact recipe snapshot, and records completion in `settings` under `recipe_nutrient_backfill_141037`.

### Enrichment approval

The approval transaction inserted an AI exchange session with `request_json` set to `NULL`, but the database schema requires `request_json TEXT NOT NULL`. That caused the entire all-or-nothing transaction to roll back. The transaction now stores the actual request JSON, response JSON, and approved payload JSON.

The review header also now shows an immediate `Saving changes…` state and keeps success or failure feedback outside the scrolling content area.

## Verification

- 214 automated tests passed.
- Release metadata verification passed.
- Production build was attempted but could not start because Vite is not installed in this runtime.
