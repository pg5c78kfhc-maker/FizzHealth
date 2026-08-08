# Fizz Health v1.4.17.20 — Audible Catalog Metadata Enrichment & Library Expansion

## Implemented scope

- Imported the third supplied 50-title Audible Library capture, expanding the seeded owned Audible library from 100 to **150 unique titles**.
- Preserved source-faithful Audible metadata including ASIN/product link, authors, narrators, series identity and position, synopsis, explicit listening state, and total runtime only when the capture supplied an unambiguous total.
- Removed the failed deterministic Amazon/ASIN cover-image guess used by v1.4.17.19.
- Added client-side Audible Catalog API enrichment. When the Audible page opens, unresolved records are requested from Audible in batches of up to 50 ASINs. Real `product_images` URLs are persisted as `cover_image_source = audible-catalog-api`.
- Added runtime backfill from Audible catalog `runtime_length_min` for titles whose library capture exposed only remaining time, `<1 min`, or `Finished`.
- Retained placeholders when no real cover has yet been resolved; failed/unavailable catalog requests do not overwrite book metadata.
- Kept the live owned-title / known-audio-hours summary and made runtime incompleteness explicit as `Runtime captured for X of Y titles · Z missing.`
- Preserved Audio navigation, Podcast behavior, Audible series/detail navigation, ownership semantics, and Open in Audible deep links.

## Schema / migration

Database schema remains **147**. No table, column, or index change was needed.

The existing idempotent Audible seed synchronization now imports batches 1–3. On open it also clears only the obsolete `amazon-asin-derived` cover URLs from v1.4.17.19 so they can be replaced by verified Audible catalog URLs. Existing verified/enriched cover URLs are not cleared.

## Seed results before online metadata enrichment

- Owned Audible titles: **150**
- Unique Audible identifiers: **150**
- Series represented: **28**
- Titles with unambiguous total runtime in supplied captures: **101 / 150**
- Known runtime from supplied captures: **64,441 minutes = 1,074h 1m**

The runtime and cover coverage can improve automatically on-device after Audible catalog enrichment succeeds.

## Known limitations

- Cover/runtime enrichment requires network access from the installed PWA to `https://api.audible.com`. If the request is blocked or unavailable, unresolved titles retain placeholders/missing runtime and are retried on a future Audible visit.
- This environment cannot execute a browser request to Audible from the container, so actual network/CORS behavior must be confirmed on-device.
- Automatic discovery/import of not-owned books from complete series catalogs remains deferred.

Completed story range: **FH-17120.1–FH-17120.4**
