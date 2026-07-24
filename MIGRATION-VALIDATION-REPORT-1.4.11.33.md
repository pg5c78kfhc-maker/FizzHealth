# Migration Validation Report — v1.4.11.33

## Failure reproduced conceptually

The previous Migration 56 attempted to assign identical `(source_type, source_id)` values to multiple promoted Meal records. On databases where duplicate promotions already existed, SQLite rejected the operation under source uniqueness and startup stopped.

## Corrective sequence

1. Add source-link columns when missing.
2. Identify the earliest Meal row for each one-component promoted Food or Recipe source.
3. Backfill the source link only onto that canonical Meal.
4. Clear source links from any later active duplicates that may have been written by an earlier or interrupted build.
5. Create a partial unique index for active, non-null source links.
6. Record Migration 56, then Migration 57 for the corrective release.

## Tested scenarios

- Two promoted Meals linked to one Food.
- Two promoted Meals linked to one Recipe.
- Three already-linked duplicate Meals.
- One clean promoted Meal.
- Re-running the corrected migration logic.

All scenarios retained exactly one canonical link, preserved all Meal rows, created the unique index, and remained stable on repeat execution.
