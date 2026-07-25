# Fizz Health v1.4.11.39 — Food Classification & Planning Intelligence

**Build:** 141139  
**Deployment:** FH-20260725-141139  
**Released:** July 25, 2026

This release gives every reusable food object an explicit classification and usage designation so the Food Library, Recipe Builder, Meal Builder, Meal Planner, and future recommendation systems use the same rules.

## Completed

- **FH-1158:** Continued the Food Library redesign around Ingredients, Recipes, and Meals.
- **FH-1159:** Added Settings → Data Enrichment for rapid classification and usage review.
- **FH-1164:** Added required Classification values: Ingredient, Recipe, and Meal.
- **FH-1165:** Added required Usage values: Component only, Standalone only, and Both.
- **FH-1166:** Meal Planner now includes ingredients and recipes marked Standalone or Both, in addition to saved Meals.
- **FH-1167:** Recipe and Meal builders now offer records whose usage includes Component.
- **FH-1168:** AI-created foods use conservative classification and usage defaults.
- **FH-1169:** Existing Ingredients default to Component only; Recipes and Meals default to Standalone only.

## Acceptance behavior

1. Open any Ingredient, Recipe, or Meal editor and change Classification and Usage.
2. Mark salmon or oatmeal as Ingredient + Both; it remains in Ingredients and becomes available in Meal Planner.
3. Mark olive oil as Ingredient + Component only; it remains available to builders but does not appear in Meal Planner.
4. Open Settings → Data Enrichment and update classifications without opening each full editor.
