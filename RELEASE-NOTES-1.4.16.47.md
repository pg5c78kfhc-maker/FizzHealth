# Fizz Health v1.4.16.47 — Master Playlist Order Projection Repair

## Objective

Make **Enforce Master Playlist Order** deterministically control both the visible episode sequence and the playback queue for built-in, renamed, custom, and future playlists.

## Implemented

- Reads the selected playlist's persisted podcast order from `podcast_playlist_podcast_order` using stable playlist and podcast IDs.
- Uses that playlist-specific order as the primary projection key instead of the global My Podcasts display order.
- Preserves each podcast's existing episode order within its group.
- When Enforce Variety is enabled, emits one episode per podcast per round while repeating the same saved podcast order on every round.
- Writes the resulting sequence back to the single persisted playlist projection used by both rendering and playback navigation.
- Verifies the projected podcast sequence against the saved order and fails with the first mismatch rather than silently falling back to date order.
- Emits projection-order diagnostics containing the saved order, projected order, queue order, settings state, verification result, and first mismatch.

## Stories

- FH-1647.1 — Playlist-specific stable-ID master order
- FH-1647.2 — Variety preserves master order on every pass
- FH-1647.3 — Unified display and playback projection
- FH-1647.4 — Post-rebuild order verification and diagnostics
