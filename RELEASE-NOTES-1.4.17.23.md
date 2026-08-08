# Fizz Health v1.4.17.23 — Audible Artwork & Metadata Enrichment

## Exact implemented scope

This release continues from the authoritative v1.4.17.22 / schema-147 baseline and is limited to Audible audiobook artwork and metadata enrichment.

- Preserves the reconciled library at **450 unique owned audiobooks**. Audible podcasts are not imported.
- Keeps the Audible ASIN as the authoritative identity for enrichment and deduplication.
- Changes the artwork strategy from runtime/browser retrieval to **build/import-time resolution with locally packaged cover assets**.
- Adds an enrichment snapshot that records a local packaged cover path plus the validated Amazon/Audible source image URL for provenance.
- Packages **12 real covers validated against their matching Audible product pages**. These include the first visible alphabetic library cards: `16th Seduction`, `1st Case`, and `21st Birthday`.
- Leaves unresolved titles on the existing cover placeholder; no guessed or title-only artwork is accepted.
- Updates seed synchronization so missing cover fields can be filled from the build snapshot while existing user data/history is preserved.
- Keeps pull-to-refresh as a reload of stored metadata; the installed iPhone PWA does not scrape Audible or call the Audible catalog API.
- Adds a dynamic artwork-coverage status to the Audible header based on stored cover URLs.
- Preserves the existing aggregate y/d/h/m audio-duration formatter and runtime-quality indicator.
- Preserves the existing missing-runtime enrichment pipeline. Source-known runtime coverage remains **276 of 450 titles**, totaling **136d 4h 7m**, with **174 missing** in this release.

## Artwork enrichment result

The release attempted the automated bulk Audible catalog enrichment path for the full 450-title library. The Node/container environment cannot resolve `api.audible.com`, so that automated pass fails before returning catalog data. Independent Internet lookup through the available web path did resolve and validate 12 covers, which were downloaded and packaged as local assets.

- Artwork packaged: **12 / 450**
- Artwork unresolved: **438 / 450**
- Runtime captured: **276 / 450**
- Runtime missing: **174 / 450**

The unresolved count is an environment limitation, not represented as successful enrichment. The implemented enrichment script is capable of caching all resolved covers locally when run in an environment where the Audible catalog endpoint is reachable.

## Schema / migration

- Database schema remains **147**.
- No structural schema migration is required.
- Existing schema-147 databases receive the enriched local cover paths through the existing idempotent Audible seed synchronization.
- Cover updates use fill-only semantics and do not overwrite established ownership/listening history.

## Known limitations

1. Bulk catalog enrichment could not complete in this environment because Node `fetch` cannot resolve `api.audible.com`.
2. Consequently, this release packages 12 verified covers rather than all 450.
3. The production Vite build could not be executed because `npm ci` is blocked by the environment registry returning 404 for pinned `xlsx@0.18.5`; Vite therefore remains unavailable.
4. The broad historical regression suite contains long-standing source-pattern/version assertions and remains red; exact counts are in the test report.

## Completed stories

- FH-17123.1 — Process the 450-title Audible library through build-time metadata enrichment without browser-side Audible scraping.
- FH-17123.2 — Validate real Audible cover artwork by ASIN/product page and package resolved covers as local app assets.
- FH-17123.3 — Preserve the runtime backfill pipeline and existing runtime coverage indicator.
- FH-17123.4 — Keep pull-to-refresh as a stored metadata reload while reporting packaged artwork coverage.
