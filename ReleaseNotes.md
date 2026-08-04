# Fizz Health v1.4.16.27 — Podcast Stability, Paging & Metadata Repair

Completed stories: **FH-1627.1-FH-1627.4**.

- Contains episode-card, playlist-page, playback-completion, and module-level failures inside Podcasts.
- Adds saved playlist paging with 50, 100, or 200 episodes per page; default 50.
- Adds explicit Load More controls while full counts, playback, and remaining-time calculations continue to use the complete playlist.
- Lazy-loads and asynchronously decodes artwork only for mounted episode cards.
- Persists canonical podcast episode metadata and restores publication date/time across Up Next, Stories, and Drama.
- Adds schema migration 124 to backfill publication metadata and initialize the page-size preference.
