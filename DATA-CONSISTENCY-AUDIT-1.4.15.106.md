# Data Consistency Audit — v1.4.15.106

## Root cause confirmed

Fizz Health retained multiple representations of a recipe:

1. `recipes` — current recipe ingredients.
2. `meal_components` — compatibility representation.
3. `planned_meals` — Proposed display/nutrition snapshot.
4. `meals` — consumed historical snapshot.

A Proposed Protein Smoothie created through a legacy `meal` path could consume from `meal_components`, retaining the former almond milk after the canonical `recipes` rows had been edited.

## Resolution

- Added canonical recipe-ID resolution across `food_id`, `meal_definition_id`, `recipe_id`, and recipe-backed `meal_definitions`.
- Recipe-backed `meal` consumption delegates to the canonical recipe consumption path.
- Active Proposed rows are hydrated for display and consumption from the latest recipe name, serving definition, and calculated nutrition.
- Deferred repair normalizes existing Proposed recipe rows to canonical identifiers and refreshes their stored nutrition/name for compatibility consumers.
- Consumed records are not rewritten.

## Transaction handling

All tracked recipe ingredients are preflighted with the inventory service before the mutation pass. Database transactions remain the final atomicity boundary, so a failure rolls back the meal insert and any Pantry changes.

## Retained v1.4.15.105 fixes

- Canonical restaurant name propagation.
- Independent source identity for duplicated Food Log entries.
- Footer/safe-area containment for affected Nutrition workflows.
- Barcode-matched Food `+1` inventory action.
