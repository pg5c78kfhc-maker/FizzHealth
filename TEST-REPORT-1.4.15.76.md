# Fizz Health v1.4.15.76 Test Report

## Release verification

- `npm run integrity:check` — PASS
- `npm run verify:release` — PASS
- Focused v1.4.15.76 regression suite — PASS (5/5)

Focused coverage verifies:

- approved Inventory wording and order on Information and Edit pages
- removal of package-type and explicit open-container controls
- optional blank open-container remainder
- open state inferred from remaining servings
- one shared source for popover definitions
- outside-tap popover dismissal behavior

## Full regression suite

- `npm test` executed.
- Result: 553 passed, 225 failed.
- The failures are pre-existing broad-suite expectation drift unrelated to this release, including aggregate-nutrition and historical source-pattern assertions.
- The new v1.4.15.76 tests all passed.

## Production build

- `npm run build` could not execute because Vite is not installed in the extracted environment.
- Dependency installation was attempted with `npm install --ignore-scripts`.
- Installation was blocked by the configured package registry returning 404 for `xlsx@0.18.5`.
- No claim of a successful production bundle is made.

## Metadata

- Version: 1.4.15.76
- Build: 141576
- Deployment: FH-20260731-141576
- Schema version: 96
