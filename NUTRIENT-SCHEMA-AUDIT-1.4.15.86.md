# Nutrient Schema Audit — v1.4.15.86

## Canonical contract

The authoritative registry is `src/nutrition/registry.js` and contains 22 nutrients:

calories, protein, carbs, fiber, fat, saturated_fat, trans_fat, cholesterol, sodium, potassium, total_sugar, added_sugar, monounsaturated_fat, polyunsaturated_fat, omega_3, calcium, iron, magnesium, vitamin_d, vitamin_c, alcohol, caffeine.

## Table decisions

- `foods`: authoritative food and prepared-food nutrition; full contract stored.
- `meals`: consumed nutrition snapshot; full contract stored.
- `planned_meals`: planned nutrition snapshot; full contract stored.
- `restaurant_meals`: authoritative saved restaurant estimate; full contract stored.
- `meal_definitions`: cached aggregate for a reusable meal or recipe definition; full contract stored and recalculated from components.
- `meal_components`: component nutrition snapshot used by existing runtime aggregation and migration paths; full contract stored.
- `recipes`: ingredient relationships only; nutrition remains derived and no nutrient columns were added.
- `pantry`: inventory state only; nutrition remains linked through `food_id` and no nutrient columns were added.

## Root cause repaired

The nutrient registry included `magnesium`, but `foods` and several nutrition snapshot tables did not. Existing Prepared Recipe updates generated SQL from the full registry and therefore referenced a missing column. New-record insertion masked the defect because `insertRecord()` filters against existing columns.

## Migration and reconciliation

- Added migration 96: `canonical_nutrient_schema_reconciliation`.
- Updated `TARGET_SCHEMA_VERSION` from 94 to 96.
- Added all missing canonical nutrient columns idempotently. Duplicate-column errors remain safely treated as already applied.
- Canonical reconciliation now builds nutrient column requirements directly from `NUTRIENT_KEYS`.
- Release metadata and release register now report schema 96.

## Prepared Recipe path

The existing-record update now checks `PRAGMA table_info(foods)` and writes only confirmed nutrient columns. After migration 96, all 22 are expected to be present; the guard also prevents a schema mismatch from producing another raw SQLite missing-column failure.

## Runtime validation status

Static and focused source-path verification passed. Literal execution against the phone's IndexedDB database was not possible because that database is not included in the source archive.
