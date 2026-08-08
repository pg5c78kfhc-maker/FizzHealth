# Fizz Health v1.4.17.22 — Audible Library Reconciliation & Build-Time Enrichment

## Implemented scope

- Reconciled the newly supplied **350 audiobook-only Audible Library records** against the v1.4.17.21 seeded library.
- Uses the Audible ASIN as the primary stable identity. The 350-record restart set contained **72 ASINs already represented in Fizz** and **278 genuinely new audiobooks**. Only the 278 new titles are added, bringing the seeded owned audiobook library from **172 to 450 unique titles**.
- Existing overlapping books are not duplicated. Newly supplied metadata is used only to fill fields that were previously missing, including total runtime, series relationship/position, description, progress/remaining-time text, and listening state when the existing value is unknown. Existing ownership and already-persisted user/history values are preserved.
- Kept the Audible model audiobook-only. No Audible podcast/show/episode rows are intentionally introduced by this release.
- Moved Audible cover/runtime catalog resolution out of the installed browser/PWA path and into an explicit **import/build-time catalog snapshot pipeline** (`npm run audible:enrich`). The generated snapshot is data-only and can persist resolved real Audible cover URLs and missing total runtimes into the normal seed synchronization.
- The installed PWA no longer calls `api.audible.com` directly when Audible opens or when pull-to-refresh is used. This avoids the cross-origin/network behavior that failed on the iPhone in v1.4.17.20-v1.4.17.21.
- Preserved Audible pull-to-refresh as a local stored-metadata reload and immediate rerender mechanism.
- Kept the visible runtime coverage line and moved metadata/enrichment status onto its own subdued line rather than concatenating the two messages.
- Preserved adaptive aggregate audio duration formatting (years/days/hours/minutes), Audible deep links, Library/Series/Detail navigation, Podcasts, and unrelated Fizz functionality.

## Data results

After reconciliation, before any live catalog snapshot is available:

- Owned audiobooks: **450**
- Unique Audible ASINs: **450**
- New audiobooks added by this release: **278**
- Restart-set overlaps deduplicated: **72**
- Series represented: **94**
- Titles with source-captured total runtime: **276 / 450**
- Titles still missing total runtime: **174**
- Known source-captured runtime: **196,087 minutes = 136d 4h 7m**

## Schema / migration

Database schema remains **147**. No table, column, or index change was required.

The existing idempotent Audible seed synchronization is extended so a schema-147 installation upgrades in place. New ASINs use stable ASIN-derived IDs and `INSERT OR IGNORE`; overlapping rows receive guarded missing-field updates only. Seed SQL was verified by applying it twice to both a fresh Audible schema and a simulated v1.4.17.21 Audible database.

## Cover-art / runtime enrichment status

The new build/import-time pipeline is implemented, but the current build environment could not resolve `api.audible.com`. The release-preparation command therefore could not populate the catalog snapshot with live cover URLs. No fake or guessed cover URLs were inserted. Existing persisted real cover URLs are preserved, and unresolved books continue to use the normal placeholder until the catalog snapshot can be generated in an environment with working Audible network access.

## Known limitations

- **Actual cover-art backfill is not complete in this artifact** because the release environment could not reach Audible's catalog host. The architectural browser/CORS failure is removed, but the build-time snapshot still needs successful external network access to populate covers.
- Some Audible library rows expose `Finished` or remaining time instead of total runtime. Those books remain counted as owned while excluded from the aggregate runtime until a reliable total is captured or catalog enrichment succeeds.
- Automatic discovery of not-owned books from full Audible series catalogs remains outside this release.

Completed story range: **FH-17122.1-FH-17122.4**
