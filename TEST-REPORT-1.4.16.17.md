# Test Report — Fizz Health v1.4.16.17

## Focused release tests

Command:

`node --test tests/v141617-podcast-subscription-metadata-repair.test.js`

Result: **6 passed / 0 failed**.

Covered:

- Active Subscribe/Unsubscribe toggle on Find Podcasts.
- Unsubscribe removes playlist entries without deleting playback history or preferences.
- Resubscribe restores an existing record and immediately invokes feed refresh.
- Metadata completeness and retry state persistence.
- Incomplete metadata prioritization during library refresh.
- Schema 122 migration fields and release metadata.

## Integrity and release verification

- `npm run integrity:check`: passed.
- `npm run verify:release`: passed.
- `node --check src/database.js`: passed.
- `node --check functions/api/podcast-feed.js`: passed.

## Full inherited suite

Result: **674 passed / 269 failed**.

The failures are the established inherited source-pattern baseline and are not represented as passing. The new focused v1.4.16.17 tests pass independently.

## Production build

The exact dependency installation command was attempted:

`npm clean-install --progress=false`

It failed before Vite could run because the sandbox npm registry returned HTTP 404 for the locked dependency `xlsx@0.18.5`. No production-build pass is claimed.
