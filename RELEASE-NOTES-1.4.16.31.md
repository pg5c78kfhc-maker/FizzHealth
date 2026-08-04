# Fizz Health v1.4.16.31 — Podcast Finalization Completion & Library UI Polish

## Scope completed

- Added the **General Interest** podcast playlist as a first-class persisted playlist.
- Added General Interest to per-podcast subscription settings.
- Reused the Stories playlist ordering and variety-filter pipeline for General Interest.
- Added General Interest refresh reconciliation, paging, counts, empty state, duration reporting, and navigation.
- Expanded the podcast folder strip to two horizontally scrollable rows.
- Widened folder tabs and prevented title wrapping, including **General Interest**.
- Added explicit playlist-rebuild stage and verification values to transaction diagnostics.
- Updated release and schema metadata to v1.4.16.31 / schema 125.

## Compatibility

The migration inserts the General Interest playlist without changing existing Up Next, Stories, or Drama rows or subscriptions.
