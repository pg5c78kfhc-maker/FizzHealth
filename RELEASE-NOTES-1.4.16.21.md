# Fizz Health v1.4.16.21 Release Notes

## Podcast startup repair

- Restored the missing `formatPlaylistRemaining` helper that was referenced unconditionally by the Podcasts page.
- Moved playlist-duration calculation into `src/podcast/playlistDuration.js` as an independently testable utility.
- Prevented My Podcasts from throwing `ReferenceError: formatPlaylistRemaining is not defined` during its first render.
- Remaining time now:
  - subtracts saved playback position;
  - uses the live player position for the currently playing episode;
  - ignores episodes already marked played;
  - counts episodes with unknown duration separately;
  - formats totals as minutes, hours, or days without producing invalid values.
- Retained the recovery page introduced in v1.4.16.20 for unrelated podcast failures.

## Release identity

- Version: 1.4.16.21
- Release date: August 3, 2026
- Build ID: 141621
- Deployment ID: FH-20260803-141621
