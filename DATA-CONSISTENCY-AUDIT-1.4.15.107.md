# Data Consistency Audit — v1.4.15.107

## Root cause

Fizz Health retained two independently mutable Recipe ingredient collections:

1. `meal_components`, used by the current Recipe editor.
2. `recipes`, still read by several consumption, availability, and presentation paths.

Editing Protein Smoothie updated the visible `meal_components` row to Whole Foods Vanilla Almond Milk at 300 mL, while an obsolete `recipes` row continued to identify Unsweetened Almond Milk at 300 g. Consumption followed the obsolete row.

## Corrective architecture

- `meal_definitions` owns Recipe identity and metadata.
- `meal_components` owns the current active Recipe composition.
- Active nutrition, availability, ingredient presentation, and Pantry deduction resolve those canonical records.
- `recipes` remains only as a compatibility/import structure and is rebuilt from canonical data; it is no longer authoritative for active consumption.
- Historical consumed rows retain their stored snapshots.

## Migration

The v1.4.15.107 migration:

- deletes compatibility rows for canonical Recipe IDs;
- rebuilds them from `meal_definitions` joined to `meal_components`;
- removes stale and duplicate ingredient rows as a consequence of the rebuild;
- normalizes active Proposed Recipe references to canonical `recipe:` identifiers.

## Regression protections

- Recipe edit operations rebuild compatibility rows transactionally.
- Recipe consumption queries `meal_components` directly.
- Recipe nutrition uses the canonical Meal definition/component graph.
- Availability receives canonical component rows.
- Focused tests prove a stale `recipes` row is ignored when a current canonical component exists.
