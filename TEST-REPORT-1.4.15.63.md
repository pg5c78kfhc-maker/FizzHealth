# Test Report — Fizz Health v1.4.15.63

## Scope
Recipe serving-to-gram conversion and live dependency propagation only.

## Targeted regression results
**6 passed / 0 failed**

Verified:
- Red Onion: `1 medium = 150 g`
- Imported and manually created Food records use the same conversion path
- Gram-, ounce-, and pound-based ingredients remain directly convertible
- Common-measure/count-based Recipe ingredients resolve through the Food definition
- Recipe nutrition recalculates from current Food values
- Repeated calculations after a Food edit do not use a stale cache
- Calculation helpers do not mutate Food or Pantry/inventory records

## Static and release checks
- `src/database.js`: syntax passed
- `src/nutrition/units.js`: syntax passed
- `src/nutrition/recipe.js`: syntax passed
- `src/nutrition/aggregate.js`: syntax passed
- Release metadata verification: passed for v1.4.15.63 / FH-1563.3
- Project integrity check: passed

## Full-suite attempt
The repository-wide test command executed 733 tests: 521 passed and 212 failed. The failures span unrelated historical assertions and release-specific source-text checks outside this stabilization scope. The new v1.4.15.63 regression file passed independently with no failures.

## Build attempt
A production build was attempted. Dependency installation could not complete because the configured package registry returned HTTP 404 for `xlsx-0.18.5.tgz`; therefore Vite was unavailable in this environment. No build success is claimed.

## Result
The approved Recipe conversion and dependency-propagation scope passed its targeted regression suite. Inventory logic was not changed.
