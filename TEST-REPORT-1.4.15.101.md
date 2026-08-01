# Test Report — Fizz Health v1.4.15.101

## Focused release tests

Command:

`node --test tests-release/release-1.4.15.101.test.js`

Result: **4 passed, 0 failed**.

Verified:

- v1.4.15.101 release metadata.
- Missing one-sided bounds are checked before numeric conversion and are not coerced to zero.
- One-sided `<` and `>`/`>=` comparison paths are present.
- Scaled progress-bar renderer, segments, and measured-value marker are connected to Labs rows.
- Health landing Labs card no longer renders “32 biomarkers”.

## Static and integrity checks

- `node --check src/database.js`: passed.
- `node --check src/decision/engine.js`: passed.
- `npm run integrity:check`: passed.
- Integrity result: one application root, one package.json, one src tree, one isolated Menu/Chef implementation.

## Existing full test suite

Command:

`node --test tests/*.test.js`

Result:

- Total: 843
- Passed: 599
- Failed: 244

The full suite contains broad pre-existing regression expectations across earlier releases. The failures are not represented as passing and were not silently excluded.

## Production build

Command:

`npm run build`

Result: **failed**.

The prebuild integrity repair completed successfully. The build then stopped with:

`sh: 1: vite: not found`

A successful production build is not claimed.

## Device validation limitation

The environment does not provide an iPhone Safari runtime. Final visual confirmation of progress-bar spacing, marker clipping, and safe-area behavior should be performed on the deployed iPhone PWA.
