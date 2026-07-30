# Fizz Health v1.4.15.58 — Recipe Consolidation Phase 1

Build: 141558  
Deployment: FH-20260730-141558

## Delivered

- **FH-1558.1:** Migrated legacy Recipe records into `meal_definitions` and `meal_components` without deleting legacy rows.
- **FH-1558.2:** Reserved Meal terminology for planning occasions and presented reusable compositions as Recipes.
- **FH-1558.3:** Routed Library Recipe taps into the modern detail shell.
- **FH-1558.4:** Added the Recipe General tab.
- **FH-1558.5:** Added serving configuration, per-serving nutrition, and calculated batch totals.
- **FH-1558.6:** Added prepared Recipe inventory display and batch creation.
- **FH-1558.7:** Added Food/Recipe components, removal, and reordering in Ingredients.
- **FH-1558.8:** Removed active routing to the legacy Recipe detail presentation.
- **FH-1558.9:** Added idempotent migration logging, ingredient-count validation, and malformed-record issue logging.

Baseline: **FH-1557.4**.

## Boundaries

- No physical database-table renames.
- No Meal Planner or consumed-log behavior changes.
- No recommendation changes or unrelated UI redesign.
