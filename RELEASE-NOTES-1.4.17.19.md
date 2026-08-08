# Fizz Health v1.4.17.19 — Audible Library Expansion & Cover Enrichment

## Implemented scope

- Imported the second supplied 50-title Audible Library capture, expanding the seeded owned Audible library from 50 to 100 titles.
- Preserved captured Audible metadata including ASIN, canonical product URL, author(s), narrator(s), series identity, series position, runtime when unambiguous, synopsis, ownership, and explicit listening-state observations.
- Added a live Audible Library summary showing the owned-title count and summed known runtime in hours/minutes.
- When Audible supplied remaining-time or `Finished` instead of total runtime, the title still counts as owned but does not inflate the audio-hours total; the UI reports runtime coverage.
- Added ASIN-derived cover-art candidates for all Audible books, including the first 50 previously imported titles, and retained the existing placeholder as an image-load fallback.
- Added idempotent Audible seed synchronization on database open so schema-147 installations receive newly supplied Audible batches without requiring a schema bump.
- Preserved the Audio landing page, Podcasts relocation, podcast behavior, Audible series/detail/library navigation, ownership semantics, and Open in Audible deep links.

## Schema / migration

Database schema remains **147**. No table/column/index change was required.

The release uses an idempotent data synchronization after schema reconciliation. Audible entities are inserted with `INSERT OR IGNORE`, preserving existing records and user-owned state. The release metadata row for v1.4.17.19 is recorded without changing the schema version.

## Seed results

- Owned Audible titles represented by seed: **100**
- Unique Audible ASINs: **100**
- Series represented: **20**
- Audiobook-author links: **107**
- Audiobook-narrator links: **106**
- Titles with captured total runtime: **85 / 100**
- Known total runtime represented: **53,019 minutes = 883h 39m**

## Known limitations

- The Audible Markdown capture does not expose cover-image URLs directly. This release uses a deterministic Amazon image endpoint derived from the ASIN. If a title does not resolve there, Fizz falls back to the existing placeholder rather than showing a broken image.
- The build environment cannot externally verify every cover endpoint, so cover coverage should be visually confirmed on-device after deployment.
- Some Audible library rows expose remaining time or `Finished` instead of total duration; those titles are excluded from the audio-hours sum until a total runtime is available.
- Automatic discovery/import of unowned books from complete series catalogs remains deferred.

Completed story range: **FH-17119.1–FH-17119.4**
