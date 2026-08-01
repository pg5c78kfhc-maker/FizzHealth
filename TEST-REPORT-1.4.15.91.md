# Test Report — Fizz Health v1.4.15.91

## Focused release tests

Command:

`node --test tests/release-1.4.15.91.test.js`

Result: **5 passed / 0 failed**

Covered:

- fixed 30 g fiber target and 40 g maximum;
- dated target-history migration and derived-target disablement;
- zero/invalid prepared-serving prevention;
- selected prepared-batch deletion and event cleanup;
- footer containment selectors;
- release, build, deployment, and schema metadata.

## Consumption regression

Command:

`node --test tests/v141590-tracked-consumption-repair.test.js`

Result: **3 passed / 0 failed**

Covered Barebells, Apple, and multi-serving centralized inventory consumption.

## Full inherited test suite

Command:

`npm test`

Result: **597 passed / 227 failed** across 824 tests.

The baseline release already reported 227 inherited or stale failures. Five new focused tests were added and passed. No new failure attributable to v1.4.15.91 was identified. Examples of inherited failures include obsolete exact-version assertions and long-standing aggregate-nutrition fixture expectations.

## Release verification

Command:

`npm run verify:release`

Result: **Passed** — v1.4.15.91 / FH-1591.5.

## Production compilation

Command:

`npm run build`

Result: **Failed before compilation started**.

Exact error: `vite: not found`

The uploaded source archive does not contain installed dependencies. No successful production build is claimed, and no compiled output was added.

## Could not be tested here

- visual behavior on the user's installed iPhone PWA;
- the user's live SQLite records, including deletion of the specific legacy 0 g batch;
- browser interaction with the persistent footer and keyboard on the physical device.
