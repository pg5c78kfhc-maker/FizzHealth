# Fizz Health v1.4.11.38 — Meals Library Architecture

**Build:** 141138  
**Deployment:** FH-20260724-141138  
**Completed through:** FH-1364

## Changed

- Rebuilt the Meals library around three consistent modes: Ingredients, Recipes, and Meals.
- Added one top-right Create menu for Log Once, New Ingredient, New Recipe, and New Meal.
- Replaced the crowded filter controls with icon-only All, Recent, and Favorites filters.
- Moved search directly below the filter icons and kept the results list independently scrollable.
- Standardized Ingredients, Recipes, and Meals on one card layout with edit and favorite controls in a fixed right-side vertical rail.
- Preserved existing tap, swipe-left, swipe-right, quick-log, archive, and detail behaviors.
- Removed the What Should I Eat page and entry point.
- Moved status, archive, and data-quality filters to Settings → Data Enrichment.
- Added persistent Meal favorites.

## Stories

FH-1360, FH-1361, FH-1362, FH-1363, FH-1364
