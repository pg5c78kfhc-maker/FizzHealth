# Fizz Health v1.4.15.68 — Recipe, Food Delete & Legacy UI Stabilization

- Restores the unified Library gesture contract: right swipe exposes Add only; left swipe exposes management actions only.
- Adds permanent Delete to both Food and Recipe rows with safeguards for active Recipe/Meal dependencies and Pantry inventory.
- Keeps Foods, Recipes, and Meals together in the Food Library while routing Foods and Recipes to their modern record pages.
- Removes the unused standalone legacy Nutrition editor route from the production render tree.
- Replaces the legacy Recipe migration failure wording with an actionable incomplete-record message.
