# Fizz Health v1.4.15.86 Release Notes

## Purpose

Reconcile the SQLite nutrition schema with the application's canonical 22-nutrient registry and remove the `no such column: magnesium` blocker from existing Prepared Recipe updates.

## Implemented

- Added schema migration 96 for the complete nutrient contract across `foods`, `meals`, `planned_meals`, `restaurant_meals`, `meal_definitions`, and `meal_components`.
- Made canonical schema reconciliation derive nutrition columns from `NUTRIENT_KEYS` rather than a separate partial list.
- Aligned the target schema, repair marker, release metadata, About metadata, package metadata, and release history at v1.4.15.86 / schema 96.
- Changed the existing Prepared Recipe food update to persist only nutrient columns confirmed by `PRAGMA table_info(foods)`.
- Preserved the v1.4.15.85 inventory deduction and form behavior without redesign.

## Important limitation

The supplied source ZIP does not contain the installed PWA's IndexedDB database. The exact live Daily Salad and Red Onion transaction could not be executed against the user's phone database in this environment.
