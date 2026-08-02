# Test Report — Fizz Health v1.4.15.105

## Focused release tests

Command: `node --test tests-release/release-1.4.15.105.test.js`

Result: **4 passed, 0 failed**.

Coverage:
- canonical restaurant-name resolution and rename propagation;
- fresh source identity for duplicated Food Log entries;
- footer/safe-area containment for the affected Nutrition workflows;
- barcode-matched Food `+1` inventory action.

## Static and integrity verification

- TypeScript JSX parser check for `src/main.jsx`: **Passed**.
- `node --check src/database.js`: **Passed**.
- `npm run integrity:check`: **Passed**.
- `node scripts/verify-release.mjs`: **Passed**.

## Existing full suite

Command: `npm test`

Result: **843 total — 599 passed, 244 failed**.

The failures are the existing legacy regression baseline and include aggregate-nutrition and source-pattern assertions unrelated to this release. The four v1.4.15.105 focused tests passed.

## Production build

A production build was attempted with `npm run build`.

Result: **Not completed in this environment**.

Exact failure:

```text
sh: 1: vite: not found
```

A clean dependency installation was also attempted. The configured package proxy returned HTTP 404 for `xlsx@0.18.5`, so Vite could not be installed locally. No successful production build is claimed. The source now passes a JSX parser check, including correction of the stray fragment inherited from the supplied v1.4.15.104 baseline.
