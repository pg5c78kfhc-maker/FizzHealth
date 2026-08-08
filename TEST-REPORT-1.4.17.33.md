# Test Report — Fizz Health v1.4.17.33

## Focused release tests

`node --test tests-release/v141733-audible-add-new-reconciliation.test.mjs`

Result: PASS — 5/5 tests.

Covered:
- version/build metadata and unchanged schema 147;
- 50-record add-new acceptance with intentionally empty `requested_asins`;
- `expected_record_count` completeness enforcement;
- invalid/duplicate Audible ASIN rejection;
- 25-record targeted exact-ASIN/order regression protection.

## Real encoded-response acceptance

The previously generated 50-record `audible_response_transport.txt` was passed through `parseAudibleUniversalResponse` and `validateAudibleBatchResponse` in the modified source.

Result: PASS.

Observed: encoded transport, SHA-256 verified, mode `add_new`, 50 records, 50 unique ASINs, expected count 50.

## Integrity and release metadata

- `node --check src/audio/audibleExchange.js`: PASS.
- `npm run integrity:check`: PASS.
- `npm run verify:release`: PASS.

## Historical regression suite

Modified source: 1,218 tests; 852 pass / 366 fail.
Baseline v1.4.17.32 source: 1,218 tests; 852 pass / 366 fail.

The aggregate counts match the supplied baseline exactly. The historical suite already contains pre-existing failures unrelated to this release.

## Production build

`npm run build` was attempted. Prebuild project-integrity repair passed, but Vite could not run because dependencies are not installed in the supplied source archive (`vite: not found`). An attempted `npm ci --ignore-scripts` could not restore dependencies because the sandbox package registry returned 404 for `xlsx@0.18.5`.

No schema migration is required by this release.
