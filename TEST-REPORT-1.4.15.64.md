# Fizz Health v1.4.15.64 Test Report

## Scope tested

- Library Recipe tap routing
- Search Recipe result routing
- Planner Recipe tap routing
- Exclusion of migrated Recipe duplicates from legacy Meal routing
- Preservation of Recipe serving-to-gram, batch-weight, and servings-per-batch calculation wiring
- Release metadata consistency
- Project source-tree integrity

## Results

### Passed

- `node --test tests/v141564-recipe-navigation-stabilization.test.js`
  - 3 tests passed
  - 0 tests failed
- `node scripts/project-integrity.mjs`
  - Passed: one application root, one package, one source tree, one Menu/Chef implementation
- `node scripts/verify-release.mjs`
  - Passed: v1.4.15.64 / FH-1564.3 metadata consistent

### Production build

The production build could not be executed in this environment because the source archive did not include `node_modules`, and the locked `xlsx@0.18.5` package was unavailable from the configured package registry (HTTP 404). The failure occurred during dependency restoration before application compilation; it was not a source-code compilation failure.

### Existing full-suite status

A broad test invocation exposed numerous pre-existing failures outside this release scope. The new v1.4.15.64 targeted regression suite passed completely. No unrelated failing tests were modified.

## Files changed

See `CHANGED-FILES-1.4.15.64.txt`.
