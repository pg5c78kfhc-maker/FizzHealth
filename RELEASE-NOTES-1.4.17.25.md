# Fizz Health v1.4.17.25 — Audible JSON Library Exchange

## Implemented scope

- Added a versioned, reusable **Audible JSON Library Exchange** directly to the Audible Library page.
- Added **New 50-book batch** request generation. The request is designed to be copied into ChatGPT together with an Audible library capture; ChatGPT returns one audiobook-only response JSON that can be pasted back into Fizz.
- Added **Enrich 50 incomplete** request generation. Fizz selects up to 50 existing Audible records that are missing a validated remote cover URL and/or total runtime and includes their existing metadata so ChatGPT can enrich them without creating duplicates.
- The exchange carries Audible ASIN, title/display title, Audible product URL, authors, narrators, primary series/position, total runtime, description, ownership/listening state, progress/remaining time, and a validated direct `cover_image_url` when available.
- Import validation requires the v1 exchange contract, `audible_library_batch_response`, `upsert_audiobooks`, audiobook media type, valid 10-character Audible ASINs, unique ASINs within the batch, valid positive runtimes when supplied, supported ownership/listening states, and HTTPS product/artwork URLs.
- Podcast shows/episodes and other non-audiobook media are rejected rather than imported into the audiobook library.
- The complete payload is validated before database mutation. The batch is then committed through one database transaction so a failed import does not intentionally retain a partially imported batch.
- Audible ASIN is the authoritative reconciliation key. Existing books are enriched only where stored metadata is missing; existing owned state and explicit `finished` listening state are protected. New ASINs create new audiobook records.
- Authors, narrators, series metadata, and relationship rows are created/reused during import without rewriting historical audiobook identity.
- Validated remote artwork is stored in `cover_image_url` with source `chatgpt-json-exchange`. Immediately after a successful import, Fizz warms the existing v1.4.17.24 cover cache for the imported records. The phone therefore can render/cache new cover art without another application deployment.
- Added a post-import reconciliation result with records processed, new titles, existing titles enriched, cover URLs accepted, runtimes supplied, and current owned-library total.
- Existing pull-to-refresh, packaged artwork fallbacks, Audible deep links, Library/Series views, runtime totals, and podcast exclusion remain intact.

## Intended ongoing workflow

1. Open Audible → **JSON Library Exchange**.
2. Choose **New 50-book batch** or **Enrich 50 incomplete**.
3. Copy the request JSON and paste it into ChatGPT together with the Audible capture.
4. Paste ChatGPT's completed JSON response back into Fizz.
5. Validate/review the reconciliation summary, then import.
6. Fizz deduplicates by ASIN, persists validated cover URLs/runtimes, and warms the artwork cache.

This makes future audiobook additions and metadata/cover enrichment a data exchange rather than a source-code deployment.

## Library / seed status

- Authoritative source seed remains **450 unique owned audiobooks**.
- v1.4.17.25 does not source-seed another batch. Future growth toward 500 and the remaining library is expected to occur through the new JSON exchange on the installed application.
- Existing source-captured runtime and artwork coverage are preserved until the user imports enriched JSON batches.

## Schema / migration

Database schema remains **147**. No structural database change was required. The exchange reuses the existing Audible tables and `cover_image_url` / `cover_image_source` fields. No migration was added.

## Known limitations

- Fizz still does not scrape Audible or discover artwork URLs itself at runtime. ChatGPT/the exchange supplies validated direct cover URLs; Fizz stores, downloads, and caches them.
- A cover URL may still fail at render/cache time if the remote host later removes or blocks that asset; the existing placeholder/fallback behavior remains.
- The current browser/service-worker artwork path is optimized for the validated Amazon-hosted artwork used by the existing cover pipeline. Other HTTPS image URLs can be imported and attempted, but Amazon/Audible catalog artwork remains the preferred source.
- Production Vite build could not be executed in this environment because `npm ci` is still blocked by the registry 404 for pinned `xlsx@0.18.5`; see the test report.

Completed story range: **FH-17125.1-FH-17125.4**
