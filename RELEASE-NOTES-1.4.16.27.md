# Fizz Health v1.4.16.27 — Podcast Stability, Paging & Metadata Repair

## Implemented

- Added episode-level and playlist-level error containment so a malformed episode card or large playlist cannot take down the complete Podcasts module.
- Hardened episode-completion handling against duplicate or overlapping completion transitions and records trapped completion failures in podcast diagnostics.
- Added **Maximum per page episodes to display** to master Podcast Settings with immediately saved options of 50, 100, and 200; default 50.
- Up Next, Stories, and Drama now mount only the configured first page and provide an explicit **Load More** control in the same increment.
- Full playlist counts, remaining-time calculations, playback, auto-advance, filtering, and queue ordering continue to use the complete playlist.
- Episode artwork is lazy-loaded and asynchronously decoded only for mounted cards.
- Added canonical podcast-episode persistence during feed refresh.
- Up Next reconciliation now writes `published_at`; playlist queries fall back to canonical episode metadata.
- Added schema migration 124 to add and backfill Up Next publication dates and initialize the playlist page-size setting.
- Updated release, cache, decision-engine, package, and schema metadata to v1.4.16.27.

## Build status

The production build was attempted after integrity repair. It could not start because the supplied source archive omitted installed dependencies and the configured npm registry returned 404 for the locked `xlsx@0.18.5` package during dependency restoration. No successful production-build certification is claimed.
