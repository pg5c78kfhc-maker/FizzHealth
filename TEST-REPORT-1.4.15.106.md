# Test Report — Fizz Health v1.4.15.106

## Focused release tests

Command: `node --test tests/release-1.4.15.106.test.js`

Result: **4 passed, 0 failed**.

Coverage:

- v1.4.15.106 metadata consistency.
- Canonical recipe resolution from legacy recipe-backed meal definitions.
- Live hydration of active Proposed recipe rows.
- Pantry preflight and explicit atomic failure messaging.

## Static and integrity checks

- `node --check src/database.js`: **Passed**.
- TypeScript JSX parser/transpile check of `src/main.jsx`: **Passed**.
- `npm run integrity:check`: **Passed**.
- `npm run verify:release`: **Passed**.

## Existing regression suite

Command: `npm test`

Result: **847 total — 601 passed, 246 failed**.

The repository's pre-existing broad suite continues to include many legacy expectation failures. The four new v1.4.15.106 focused tests all pass.

## Production build

A clean dependency installation and production build were attempted.

`npm clean-install --progress=false` failed before Vite could run because the configured package proxy returned HTTP 404 for:

`xlsx@0.18.5`

Therefore, `npm run build` could not be executed in this environment. **No successful production build is claimed.**
