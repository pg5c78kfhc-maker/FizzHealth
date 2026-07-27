# Test Report — Fizz Health v1.4.15.0

## Passing focused coverage

Eight focused tests verify:

1. Current release, build, and schema identity.
2. Ingredient only defaults off in the schema.
3. Existing component-only records migrate to Ingredient only.
4. Category controls read active categories from food_categories.
5. The Meals header replaces the object-type icon row.
6. Foods, Recipes, and Meals share unified category groups.
7. Swipe Category is wired for all three item types.
8. One shared database category picker persists all item types.

Result: **8 passed, 0 failed**.

## Additional verification

- `npm run integrity:check`: passed.
- `npm run verify:release`: passed.
- Full historical suite: **427 passed, 106 failed** out of 533. Existing failures are dominated by tests expecting superseded release metadata or the removed Classification/Usage and separate Ingredients/Recipes/Meals navigation.

## Build limitation

A production build could not be executed because no local Vite executable or installed dependency tree was included in the supplied source archive, and dependency installation was unavailable.
