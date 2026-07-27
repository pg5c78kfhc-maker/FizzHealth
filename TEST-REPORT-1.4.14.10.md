# Test Report — Fizz Health v1.4.14.10

## Focused release tests

Command:

`node --test tests/v141410-stability-ux.test.js`

Result: **4 passed, 0 failed**.

Coverage:

- Whole-number nutrition display formatting without source-value mutation.
- Startup timeout rejection for a stalled initialization promise.
- Meals category swipe action wired to the canonical Menu category editor.
- Chef's Picks full-width alignment and zero section gap.

## Release verification

`npm run verify:release` passed for v1.4.14.10 / FH-1414.16.

## Full historical suite

`npm test` completed with **426 passed and 95 failed**. Failures are primarily older release-specific source and layout assertions that expect superseded versions or UI structures.

## Build

`npm run build` could not start because dependencies were not installed in the supplied source archive and the Vite executable was unavailable.
