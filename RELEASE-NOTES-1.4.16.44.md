# Fizz Health v1.4.16.44 — Playlist Integrity & Synchronization

## Primary objective

Make playlist membership, checkbox state, stored projections, visible playlist contents, and renamed legacy playlists agree through one stable-ID source of truth.

## Implemented

- Added a shared membership reconciliation transaction keyed exclusively by `playlist_id` and `podcast_id`.
- Removing a podcast now deletes its stale projection and saved-order rows before rebuilding the affected playlist.
- The legacy `up-next` playlist can be renamed without changing its identity or behavior.
- The renamed Up Next/News playlist now renders from `podcast_playlist_items`, like every other ordinary playlist, rather than from legacy `podcast_up_next` rows.
- Legacy Up Next rows unsupported by an active `up-next` membership are removed during migration and startup reconciliation.
- Podcast-centric and playlist-centric membership editors read the committed membership table back after each change and replace their checkbox state with the verified result.
- Incremental projection rebuilding now supports membership removal without reinserting the removed podcast.
- Added startup reconciliation for stale projection rows and stale saved podcast-order rows.
- Added `podcast_playlist_reconciliation_audit` diagnostics with stable IDs, expected/stored membership, projection count, cleanup counts, reason, and verification result.
- Added database migration 132.

## Acceptance behavior

When a podcast is removed from News and added to Politics, it disappears from News, appears in Politics, shows the corresponding checkbox state, and remains correct after refresh, rename, rebuild, and restart.
