# Test Report — Fizz Health v1.4.15.107

## Focused release tests

Command: `node --test tests/release-1.4.15.107.test.js`

Result: **5 passed, 0 failed**.

Coverage:

- release metadata;
- canonical component consumption path;
- compatibility-row rebuild after edits;
- canonical availability inputs;
- stale legacy ingredient ignored in favor of Whole Foods Vanilla Almond Milk at 300 mL.

## Aggregate nutrition regression tests

Eight functional aggregate-nutrition tests passed. One existing source-shape assertion failed because it expects an older exact Menu mapping expression; the functional Recipe and Meal calculations passed.

## Project checks

- Project integrity: **Passed**.
- Release metadata verification: **Passed**.
- Focused canonical Recipe tests: **Passed**.

## Full existing test suite

Command: `node --test tests/*.test.js`

Result observed during this release run: **852 total; 604 passed; 248 failed**.

The repository already contains a substantial legacy set of source-shape and historical-version assertions. The focused v1.4.15.107 tests passed. No claim is made that the full legacy suite is green.

## Production build

Attempted dependency installation:

`npm clean-install --progress=false`

Result: **Failed before build**.

Exact blocking error:

`404 Not Found ... xlsx-0.18.5.tgz`

The configured package proxy did not provide `xlsx@0.18.5`. Since dependencies could not be installed, `vite build` could not be executed. **No successful production build is claimed.**
