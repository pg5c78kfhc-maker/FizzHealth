# Fizz Health v1.4.17.21 — Audible Refresh, Runtime Formatting & Library Expansion

## Implemented scope

- Imported the audiobook records present in the fourth supplied Audible Library capture.
- The supplied capture contained **22 audiobook product records** plus Audible podcast/show/episode records. Only `/pd/` audiobook product records were added to the Audible audiobook library; podcast rows were intentionally excluded so the audiobook model remains clean.
- Expanded the seeded owned Audible audiobook library from **150 to 172 unique titles**.
- Preserved source-supported ASIN/product links, authors, narrators, series identity and scalar book position, synopsis, explicit listening state, remaining-time text, and total runtime only when the capture supplied an unambiguous total.
- Repaired the Audible catalog metadata request used for cover/runtime enrichment. v1.4.17.20 requested `image_sizes=500`; Audible's catalog endpoint accepts a constrained set of image sizes and that request prevented the metadata call from succeeding. v1.4.17.21 requests the supported **570px** cover size and normalizes 570/558/900/1215 image responses.
- Added **pull-to-refresh** to the Audible Library page. Pulling down retries unresolved cover art and missing total runtimes, persists successful metadata, and rerenders the visible library/totals.
- Kept the automatic initial metadata attempt when the Audible page opens; pull-to-refresh provides an explicit retry path after network/API failure.
- Kept the runtime data-quality line visible at all times: `Runtime captured for X of Y titles · Z missing.`
- Changed aggregate library audio duration from an unbounded hour count to adaptive **years / days / hours / minutes**. Zero/unwarranted leading units are omitted. Individual audiobook runtimes remain in normal hour/minute format.
- Preserved Audio navigation, Podcast behavior, Audible series/detail navigation, ownership semantics, and Open in Audible deep links.

## Schema / migration

Database schema remains **147**. No table, column, or index change was required.

The existing idempotent Audible seed synchronization now imports batches 1–4. Existing health, nutrition, workout, podcast, and Audible records are not rewritten. Newly seeded audiobook rows use ASIN-based stable IDs and `INSERT OR IGNORE` semantics.

## Seed results before online metadata enrichment

- Owned Audible audiobooks: **172**
- Unique Audible identifiers: **172**
- Series represented: **32**
- Titles with unambiguous source-captured total runtime: **105 / 172**
- Missing source-captured total runtime: **67**
- Known runtime from supplied captures: **69,227 minutes = 48d 1h 47m**

Cover/runtime coverage can improve when Audible catalog enrichment succeeds on-device.

## Known limitations

- Live cover/runtime enrichment still requires network access from the installed PWA to `https://api.audible.com`. This container cannot resolve the Audible host, so actual on-device network/CORS behavior remains a deployment verification item.
- Pull-to-refresh retries unresolved metadata but deliberately does not invent artwork or runtime when Audible cannot return metadata.
- Non-scalar series positions on box sets such as `Books 1-3` or `Parts 1-8` are not coerced into a false numeric position; the title preserves that source information while `series_position` remains unset.
- Automatic discovery/import of not-owned books from complete series catalogs remains deferred.

Completed story range: **FH-17121.1–FH-17121.4**
