# Test Report — Fizz Health v1.4.16.11

## Focused release tests

Command:

`node --test tests/v141611-podcast-playlist-reconciliation.test.js`

Result: **9 passed / 0 failed**.

Coverage:

- Release and migration metadata.
- Literal newest-episode selection.
- Latest-only behavior when the newest episode is already played.
- Oldest-to-newest playlist ordering.
- Newest-to-oldest default playlist ordering.
- Played-episode exclusion.
- Replacement of one podcast's playlist block while preserving other podcasts' relative order.
- Append behavior for a newly subscribed podcast.
- Direct use of persisted preferences and subscriptions during feed refresh.

## Integrity and release checks

- `npm run integrity:check`
- `npm run verify:release`
- `node --check src/database.js`
- `node --check src/podcast/playlistReconciliation.js`

## Full inherited suite

Command: `node --test tests/*.test.js`

Result: **658 passed / 265 failed** across 923 tests. The failures are the inherited source-pattern baseline and are not failures of the new focused reconciliation suite.

## Production build

- Internal sandbox registry install: blocked because `xlsx@0.18.5` is unavailable (HTTP 404).
- Public npm registry retry: timed out before installation completed.
- `npm run build` could therefore not execute because Vite was not installed.

No production-build pass is claimed.
