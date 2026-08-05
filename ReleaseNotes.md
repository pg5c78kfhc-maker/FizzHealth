# Fizz Health v1.4.16.41 — Dynamic Playlist Episode Projection & Reorder Usability

## Scope delivered

- Added one registry-driven episode projection engine for every ordinary playlist, including custom and future playlists.
- Custom playlists now resolve member podcast IDs, collect all eligible unplayed episodes, apply playlist ordering and Enforce Variety, persist the resulting projection, and verify the final projected count.
- Playlist membership changes rebuild the affected playlist immediately.
- Startup recovery rebuilds playlists that have podcast members but no stored episode projection.
- Added projection diagnostics including playlist ID/name, member podcast count and IDs, candidate episode count, ordered count, final projected count, and verification result.
- Reworked the dedicated podcast reorder page for touch use: the drag handle is on the right, only the handle starts a drag, edge auto-scroll works in both directions, and a separate right-side scroll gutter supports safe vertical scrolling.
- Saving podcast order also rebuilds the playlist episode projection so visible order and playback order stay synchronized.

## Stories

- FH-1640.1-FH-1640.2

## Build note

The production build was attempted. The supplied archive does not include installed npm dependencies, so Vite may be unavailable in this environment. No production-build success is claimed unless documented in the test report.
