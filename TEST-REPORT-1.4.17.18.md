# Test Report — Fizz Health v1.4.17.18

## Release focus
Audio Hub & Audible Library Foundation: replace the Podcasts footer destination with Audio, nest the existing Podcasts module under Audio, add the first schema-147 Audible catalog/ownership model, seed the supplied 50-title Audible capture, and add Audible library/series/detail navigation with canonical Audible deep links.

## Focused release regression
Command:
`node --test tests-release/v141718-audio-audible-foundation.test.mjs`

Result: **5 passed / 0 failed**.

Covered:
- release metadata is v1.4.17.18 / schema 147;
- footer uses Audio with the headphones icon and Podcasts is nested under Audio;
- schema 147 includes audiobook, series, author, narrator, ownership, listening-state, artwork, and many-to-many creator structures;
- seed contains exactly 50 unique Audible ASINs and 12 captured series;
- source-fidelity handling keeps ambiguous `<1 min` separate from runtime and preserves explicit `8h 57m left` as remaining-time state;
- Audible Library, Series, Book Details, ownership badges, cover placeholders, and Open in Audible links are present.

## Migration / compatibility verification
Command:
Python `sqlite3` execution of the exact migration-147 SQL extracted from `src/database.js`, with `${AUDIBLE_SEED_SQL}` substituted from `src/audio/audibleSeed.js`, against a simulated schema-146 database containing existing podcast and health rows.

Result: **PASS**.

Verified after first migration:
- `audible_audiobooks`: **50** rows;
- `audible_series`: **12** rows;
- `audible_authors`: **12** rows;
- `audible_narrators`: **9** rows;
- `audible_audiobook_authors`: **50** rows;
- `audible_audiobook_narrators`: **54** rows;
- all 50 seeded titles have `ownership_status='owned'` and `owned_in_audible=1`;
- *The Missing* resolves to ASIN `B0FKBYGP5L`, series position 9, and its canonical Audible product URL;
- pre-existing podcast and health marker rows remained unchanged;
- release metadata became v1.4.17.18 / schema 147;
- rerunning the migration remained idempotent at **50** audiobook rows.

## JavaScript / JSX syntax checks
Commands:
- `node --check src/audio/audibleSeed.js`
- `node --check src/database.js`
- TypeScript parser check of `src/main.jsx` using `ScriptKind.JSX`.

Results:
- `audibleSeed.js`: **PASS**;
- `database.js`: **PASS**;
- `main.jsx`: **0 parse diagnostics**.

## Podcast adjacent regressions
Command:
`node --test --test-name-pattern='shuffle contributes|completed contributors|system and non-playlist|strict release gesture|master order groups|variety round robins|unchecked filters preserve' tests/v141649-shuffle-foundation.test.js tests/podcast-playlist-filters-1.4.16.12.test.js`

Result: **7 passed / 0 failed**.

This verifies core Shuffle and playlist-filter behavior after moving Podcasts under Audio.

A broader legacy podcast command was also run:
`node --test tests/v141658-playlist-refresh-crash-resilience.test.js tests/v141649-shuffle-foundation.test.js tests/v1416166-podcast-playback-stability.test.js`

Result: **16 passed / 5 failed / 21 total**. The failures are legacy release-pattern assertions pinned to v1.4.16.6 or v1.4.16.58 and are not runtime podcast behavior failures introduced by this release.

## Project integrity
Command:
`npm run integrity:check`

Result: **PASS** — one application root, one package.json, one src tree, one isolated Menu/Chef implementation.

## Release metadata
Command:
`npm run verify:release`

Result: **PASS** — v1.4.17.18 / FH-17118.1-FH-17118.5.

## Broad regression suite
Command:
`npm test`

Result: **833 passed / 351 failed / 1,184 total**.

The broad suite remains red because many older source-pattern tests assert superseded historical implementation shapes and release versions. The observed total is slightly different from v1.4.17.17 because current source metadata/navigation changed. No claim is made that those legacy failures are resolved.

## Production dependency/build gate
Command:
`npm ci --ignore-scripts`

Result: **BLOCKED BY REGISTRY** — HTTP 404 while retrieving pinned `xlsx@0.18.5` from the internal npm registry:
`.../xlsx/-/xlsx-0.18.5.tgz`.

Command:
`npm run build`

Result: **FAILED / NOT COMPLETED** — `vite: not found` because dependencies could not be installed after the registry blocker. No successful production build is claimed.

## Schema summary
Schema advances from **146 → 147**. Migration 147 is additive and does not alter existing health, nutrition, workout, or podcast tables. It creates the Audible catalog/relationship tables and inserts the initial 50-title seed snapshot with idempotent `INSERT OR IGNORE` behavior.
