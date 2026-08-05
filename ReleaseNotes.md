# Fizz Health v1.4.16.43 — Playlist Ordering & Live Reconciliation Repair

## Scope delivered

- Adds **Reorder Playlists** directly below **Create Playlist** in Podcast Settings.
- Persists playlist carousel order by stable playlist ID and verifies the saved order before closing.
- Keeps My Podcasts fixed first while allowing every ordinary and future custom playlist to move.
- Refreshes affected playlist projections, counts, Unassigned enrollment, and visible UI immediately after membership changes.
- Excludes episodes marked played, completed, or at least 95% complete from every ordinary and future playlist.
- Replaces the internal reorder overlay/scroll-shell architecture with normal document scrolling and pointer-coordinate edge auto-scroll.
- Formats podcast refresh and cleanup timestamps in the device's local, human-readable date/time format.

## Stories

- FH-1643.1-FH-1643.6
