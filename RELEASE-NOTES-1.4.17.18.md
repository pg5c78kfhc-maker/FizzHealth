# Fizz Health v1.4.17.18 — Audio Hub & Audible Library Foundation

## Scope
This release establishes Audio as the umbrella destination for Podcasts and Audible, moves the existing Podcasts module under Audio without changing podcast behavior, and introduces the first persistent Audible library/series data model and UI.

- Replaces the Podcasts footer destination with **Audio** using a headphones icon.
- Adds an Audio landing page with **Podcasts** (existing podcast icon) and **Audible** destinations.
- Existing podcast storage, playlists, playback, refresh, settings, and diagnostics are preserved; only the navigation entry point changes.
- Adds schema 147 tables for Audible audiobooks, series, authors, narrators, ownership state, series order, listening observations, and source metadata.
- Seeds 50 owned audiobooks from the supplied Audible Library capture.
- Imports only fields supported by the capture: ASIN, title, canonical Audible product URL, author, narrator(s), series and book number when present, runtime where unambiguous, synopsis, and explicit remaining-time observations.
- Adds Audible Library, Series, Series Detail, and Book Detail pages.
- Book records support `owned` and `not_owned` ownership states so future series-gap discovery can add catalog titles without treating them as owned.
- Adds **Open in Audible** using the canonical HTTPS Audible title URL/ASIN, matching the deep-link behavior verified on iPhone.
- Adds cover-image fields and placeholder artwork. The supplied Markdown does not contain cover-image URLs, so this release does not fabricate artwork URLs.
- Automatic discovery of missing/unowned series books, credit recommendations, full-account synchronization, and in-Fizz Audible playback are intentionally out of scope.

## Schema and migration
Database schema increments from **146 to 147**. Migration 147 is additive and idempotent: it creates new Audible tables/indexes and inserts the first seed snapshot with `INSERT OR IGNORE`, leaving health, nutrition, workout, and podcast data untouched.

Completed story range: FH-17118.1-FH-17118.5
