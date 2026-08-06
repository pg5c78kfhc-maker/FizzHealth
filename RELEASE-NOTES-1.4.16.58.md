# Fizz Health v1.4.16.58 — Playlist Refresh Crash Resilience

## Scope

This corrective release hardens playlist pull-to-refresh, especially News playlists containing multiple large podcast feeds.

## Implemented

- Added one playlist-refresh coordinator so only one refresh/rebuild pipeline can run at a time.
- Duplicate pull gestures are merged into the active refresh instead of launching overlapping work.
- Podcast feeds refresh serially with per-podcast failure isolation.
- Per-podcast refreshes defer playlist projection work.
- Playlist projection rebuild, stored preference application, and playback-queue notification occur once after all feeds settle.
- Successful feed and metadata commits remain preserved when another podcast fails.
- Added a persisted interruption marker with playlist ID, operation ID, stage, current podcast, last completed podcast, counts, and pending-rebuild state.
- On restart, unfinished playlist refresh work is detected and safely restarted without reusing abandoned transactions.
- Large-feed mode uses concurrency 1 and a reduced import batch size of 75.
- Added playlist-level refresh diagnostics for duplicate suppression, stages, recovery, rebuild count, verification, and final result.

## Version

- Application version: 1.4.16.58
- Build ID: 141658
- Deployment ID: FH-20260806-141658
