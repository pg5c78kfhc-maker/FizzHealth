# Fizz Health v1.4.17.28 Test Report

## Release scope

Audible existing-record enrichment batch size only: reduce `enrich_existing` clipboard exchange batches from 50 records to 10 while retaining 50-record `add_new` batches and all strict JSON/import protections from v1.4.17.27.

## Focused regression tests

Command:

`node --test tests-release/v141728-audible-enrichment-batch-size.test.mjs`

Result: **PASS — 4/4 tests**.

Verified:

- release metadata advances to v1.4.17.28 with database schema 147 unchanged;
- enrichment batch constant is 10;
- add-new batch constant remains 50;
- generated full enrichment requests emit `batch_size: 10` and `expected_record_count: 10`;
- a final partial enrichment batch uses the actual submitted record count for response completeness;
- UI caps enrichment selection at 10 and labels the workflow `Enrich 10 incomplete`;
- new-book UI remains `New 50-book batch`.

## Project integrity

Command: `npm run integrity:check`

Result: **PASS** — one application root, one package.json, one src tree, one isolated Menu/Chef implementation.

## Release metadata verification

Command: `npm run verify:release`

Result: **PASS** — v1.4.17.28 / FH-17128.1-FH-17128.4.

## Production build

`npm run build` reached the Vite invocation but Vite is not installed in the extracted source environment (`vite: not found`). An attempted `npm ci` could not install dependencies because the sandbox package mirror returns HTTP 404 for the pinned `xlsx@0.18.5` tarball. This is an environment/package-registry limitation, not a source-code test failure. No dependency versions were changed in this release.

## Existing broad-suite status

The baseline v1.4.17.27 full source already contains a broad historical test suite with numerous stale version/UI assertions; a baseline run produced 852 passes and 366 failures. Those pre-existing failures are outside this narrowly scoped release. The new v1.4.17.28 focused tests, integrity check, and release metadata verification all pass.
