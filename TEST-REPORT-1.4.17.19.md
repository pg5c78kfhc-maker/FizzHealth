# Test Report — Fizz Health v1.4.17.19

## Environment

- Baseline: Fizz Health v1.4.17.18 FULL-SOURCE
- Target: v1.4.17.19
- Database schema: 147 (unchanged)
- Date: 2026-08-08

## Focused release tests

Command:

`node --test tests/release-1.4.17.19.test.js`

Result: **PASS — 5 passed / 0 failed**.

Validated:
- schema remains 147 while Audible seed synchronization runs independently;
- 100 unique ASIN seed records;
- live owned-title/runtime summary logic;
- cover-art backfill and image-load fallback;
- multi-author Audible imports.

## Audible seed SQL validation

The generated `AUDIBLE_SEED_SQL` was executed twice against an in-memory SQLite schema compatible with the Audible tables.

Results after first execution:
- `audible_audiobooks`: 100 rows
- unique ASINs: 100
- `audible_series`: 20 rows
- audiobook-author links: 107
- audiobook-narrator links: 106
- known runtime total: 53,019 minutes
- titles with total runtime: 85
- Jack Reacher / `Exit Strategy` author links: 2 (Lee Child + Andrew Child)

Result after second execution: **100 audiobook rows**, confirming idempotent seed behavior.

## Syntax checks

Commands:

- `node --check src/audio/audibleSeed.js`
- `node --check src/database.js`
- `node --check src/decision/engine.js`

Result: **PASS** for all non-JSX modules checked.

## Project integrity

Command: `npm run integrity:check`

Result: **PASS**.

Reported: one application root, one package.json, one src tree, one isolated Menu/Chef implementation.

## Release metadata verification

Command: `npm run verify:release`

Result: **PASS**.

Reported: `v1.4.17.19 / FH-17119.1-FH-17119.4`.

## Adjacent Podcast regression sample

Command:

`node --test tests/v141628-podcast-integrity.test.js tests/v141634-podcast-playback-reliability.test.js tests/v141645-podcast-interaction-ordering.test.js`

Result: **13 passed / 3 failed**.

The three failures are legacy release-version assertions expecting historical v1.4.16.x version strings in `src/main.jsx`; functional podcast integrity/order tests in the selected set passed.

## Broad regression suite

Command: `npm test`

Result: **837 passed / 352 failed / 1,189 total**.

The suite remains broadly red due to accumulated historical source-pattern and stale release-version assertions. This release added five focused passing tests; the broad-suite result is reported without representing it as green.

## Dependency installation / production build

Command: `npm ci`

Result: **BLOCKED by environment**.

Exact blocker: registry returned HTTP 404 for pinned `xlsx@0.18.5` from the environment's npm proxy.

Command: `npm run build`

Result: **FAILED because Vite is unavailable after the dependency installation failure** (`vite: not found`).

The production build is therefore **not claimed successful**.

## Cover-art verification limitation

The implementation assigns ASIN-derived Amazon image endpoints and falls back to the placeholder on image load failure. The execution environment could not directly verify external image resolution for all titles, so visual cover coverage remains an on-device deployment check.
