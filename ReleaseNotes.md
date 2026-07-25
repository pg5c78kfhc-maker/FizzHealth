# Fizz Health v1.4.11.40 — Project Integrity & Food Library Recovery

**Build:** 141140  
**Deployment:** FH-20260725-141140  
**Released:** July 25, 2026

This corrective release removes the duplicate nested application, restores the approved Ingredients / Recipes / Meals Food Library as the only active implementation, and makes source-tree repair an automatic prerequisite of development and production builds.

## Completed

- **FH-1170:** Added automatic project-integrity repair. A valid root app removes nested duplicate app trees; a single nested app is promoted when the root is missing; ambiguous layouts stop before code can be overwritten.
- **FH-1171:** Restored the approved Food Library mode selector, single + creation menu, pinned search/filter hierarchy, and unified cards while retaining v1.4.11.39 Classification, Usage, Meal Planner, Recipe Builder, AI defaults, and Data Enrichment changes.

## Source-tree result

- Exactly one `package.json`
- Exactly one root `src` application tree
- No nested `fizz37` application
- `predev` and `prebuild` automatically run integrity repair
- `pretest` verifies the repaired structure

---

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
