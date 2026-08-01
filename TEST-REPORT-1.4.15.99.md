# Test Report — Fizz Health v1.4.15.99

## Passed
- Focused release tests: 4/4 passed.
  - Verified 27 numeric Quest results plus one non-reported calculation.
  - Verified exact stored ranges and separate eGFR methods.
  - Verified Labs uses stored ranges rather than generic fallback guesses.
  - Verified Labs icon and result-column alignment rules.
- `node --check src/database.js`: passed.
- `node scripts/project-integrity.mjs`: passed.

## Existing full test suite
`npm test` executed 839 tests: 598 passed and 241 failed. The failures are pre-existing broad-suite regressions outside this release's Labs-only scope, including aggregate nutrition and historical source-pattern assertions. The focused v1.4.15.99 tests passed.

## Production build
A production build was attempted with `npm run build`.

Result: **not completed**.

Reason: `vite` is not installed in the supplied source environment (`sh: 1: vite: not found`). An attempt to restore dependencies with `npm ci` also failed because the configured package registry returned 404 for `xlsx@0.18.5`.

No successful production build is claimed.
