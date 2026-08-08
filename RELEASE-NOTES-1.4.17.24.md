# Fizz Health v1.4.17.24 — Audible Dynamic Cover Cache

## Implemented scope

- Changed Audible artwork delivery from deploy-only local cover files to a hybrid **validated remote URL + persistent local cache** model.
- When an audiobook has a validated remote `cover_image_url`, the Audible card/detail artwork loads that remote cover first. Successfully loaded Amazon-hosted Audible covers are cached in a dedicated service-worker/browser cache (`fizz-audible-covers-v1`) and reused on later views.
- The dedicated Audible cover cache is intentionally preserved when the application service-worker shell cache rolls to a new release, so healthy artwork is not discarded on every deployment.
- Pull-to-refresh now warms/retries known remote artwork and skips URLs already present in the dedicated cache rather than blindly downloading healthy covers again.
- Existing v1.4.17.23 packaged cover assets remain usable as fallback artwork for validated snapshot entries. If both remote and packaged artwork fail or are unavailable, the existing placeholder remains.
- Existing validated catalog snapshot records now seed the remote source URL into `cover_image_url` with provenance `audible-validated-remote`; no guessed ASIN image endpoint was reintroduced.
- No browser-side Audible catalog scraping/API lookup was restored. This release only downloads a cover after Fizz already has a validated direct image URL.
- Podcasts and unrelated Health/Nutrition/Workout functionality were not intentionally changed.

## Audiobook import status

The agreed scope also included importing the next 50 audiobook-only records. The supplied capture is present in the conversation/File Library, beginning with *Cross the Line*, but during implementation it was exposed to the build environment only as search/reference chunks rather than as complete raw source content. fileciteturn20file0

To avoid inventing, truncating, or partially importing audiobook metadata, **no portion of that 50-title batch was committed in this release**. The owned seed therefore remains **450 unique audiobooks**, not 500. This is an explicit incomplete-scope item, not a claimed success.

## Data results

- Owned audiobook seed: **450**
- Unique Audible ASINs: **450**
- Source-captured runtimes: **276 / 450**
- Missing runtimes: **174**
- Known runtime: **196,087 minutes = 136d 4h 7m**
- Validated remote cover URLs currently represented by the checked-in catalog snapshot: **12**
- Remaining titles continue to use their existing fallback/placeholder until a validated remote URL is supplied.

## Schema / migration

Database schema remains **147**. No table, column, or index change was required. Existing `cover_image_url` / `cover_image_source` fields are reused, so schema-147 installations upgrade through the normal idempotent seed synchronization.

## Known limitations

- The next 50-title audiobook import is **not delivered** in this release because the complete capture was not materialized as raw build input. The library remains 450 titles.
- Fizz does not discover a cover URL from Audible at runtime. Dynamic caching works only for books that already have a validated direct remote image URL.
- Only 12 validated remote URLs are currently present in the checked-in catalog snapshot. Other covers remain placeholders until enriched.
- Production build remains subject to the environment's pinned `xlsx@0.18.5` registry blocker; see the test report.

Completed story range: **FH-17124.1-FH-17124.4**
