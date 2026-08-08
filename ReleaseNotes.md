# Fizz Health v1.4.17.22 — Audible Library Reconciliation & Build-Time Enrichment

- Reconciles the 350 audiobook-only restart records against the existing Audible library using ASIN as the primary identity and imports only genuinely new titles.
- Enriches existing overlapping titles only where stored source metadata is missing; existing ownership and listening history are preserved.
- Moves cover-art and missing-runtime catalog resolution out of the installed PWA into an import/build-time Audible catalog snapshot pipeline.
- Keeps pull-to-refresh on Audible as a stored-metadata reload; it no longer performs a direct cross-origin Audible API request.
- Keeps runtime coverage visible and places metadata status on its own line.
- Database schema remains 147.
- Completed story range: FH-17122.1-FH-17122.4.

# Fizz Health v1.4.17.21 — Audible Refresh, Runtime Formatting & Library Expansion

- Imported the audiobook records present in the fourth Audible library capture; Audible podcast/episode rows in the same page were intentionally excluded from the audiobook library.
- Repaired Audible catalog enrichment by requesting the supported 570px cover size instead of the invalid 500px request that caused the entire metadata call to fail.
- Added pull-to-refresh on the Audible Library page to retry unresolved covers and total runtimes and refresh the visible cards/totals when metadata is persisted.
- Aggregate library audio time now expands adaptively through years, days, hours, and minutes while individual audiobook runtimes keep their compact format.
- Runtime coverage remains visible even when no titles are missing.
- Database schema remains 147.
- Completed story range: FH-17121.1-FH-17121.4.

# Fizz Health v1.4.17.20 — Audible Catalog Metadata Enrichment & Library Expansion

- Imported the third supplied 50-title Audible Library capture, bringing the seeded owned library to 150 unique titles.
- Replaced failed ASIN-derived image guesses with browser-side Audible Catalog API enrichment for real cover-image URLs.
- Backfills missing total runtimes from catalog metadata while preserving captured listening-progress text.
- Keeps the Audible header summary live and shows explicit runtime coverage and missing-runtime count.
- Database schema remains 147; no structural migration is required.

Completed story range: **FH-17120.1-FH-17120.4**

# Fizz Health v1.4.17.19 — Audible Library Expansion & Cover Enrichment

## Scope
This release expands the Audible foundation created in v1.4.17.18 without changing the database schema.

- Imports the second supplied 50-title Audible Library capture, bringing the seeded owned library to 100 titles.
- Preserves ASIN, canonical Audible product URL, author(s), narrator(s), series identity and book position, runtime where unambiguous, synopsis, ownership, and explicit listening-state observations from the capture.
- Adds live Audible Library summary metrics: owned title count and total known audio runtime. If some owned titles lack a captured total runtime, the UI reports how many titles contribute to the runtime total.
- Backfills cover artwork candidates for both previously imported and newly imported books using the stable Audible/Amazon ASIN. Broken/unavailable image endpoints fall back to the existing book placeholder rather than displaying a broken image.
- Makes Audible seed synchronization idempotent on database open so an existing schema-147 installation receives newly supplied library batches without requiring an unnecessary schema increment.
- Preserves the Audio landing page, Podcasts relocation, Audible deep links, library/detail/series navigation, and all existing health/workout/podcast behavior.

## Schema and migration
Database schema remains **147**. No structural schema change is required. The release performs an idempotent Audible data synchronization after schema reconciliation, using `INSERT OR IGNORE` so existing audiobook records and user-owned state are not rewritten.

## Known limitations
- Audible library captures sometimes expose remaining time or `Finished` instead of the title's total runtime. Those titles count toward owned titles but not toward total audio runtime until a total runtime is available.
- Cover art is resolved through an ASIN-derived Amazon image endpoint. If a title has no resolvable image at that endpoint, Fizz displays the existing placeholder.
- Automatic discovery/import of not-owned books from complete Audible series catalogs remains out of scope for this release.

Completed story range: FH-17119.1-FH-17119.4
