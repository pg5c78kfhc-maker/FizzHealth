# Test Report — Fizz Health v1.4.15.73

## Result

- Targeted Recipe serving propagation tests: **3/3 passed**
- Project integrity check: **passed**
- Release metadata verification: **passed**

## Covered

- Canonical Recipe batch nutrition is divided by the calculated servings per batch.
- The same per-serving values feed projected nutrition, planned records, and consumed records.
- Active planned Recipe rows created with full-batch nutrition are repaired once.
- Historical consumed rows are not automatically rewritten.

## Full regression suite

The repository-wide suite was executed. It contains pre-existing failures unrelated to this change; 544 of 767 tests passed. The new targeted tests all passed.

## Production build

The local production build could not be executed because the configured package registry returns HTTP 404 for `xlsx@0.18.5`, preventing dependency installation. Release metadata and source integrity checks completed successfully.
