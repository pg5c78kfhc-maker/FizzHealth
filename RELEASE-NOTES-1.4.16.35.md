# Fizz Health v1.4.16.35 — Podcast Interaction & Episode Persistence Repair

## Scope

This corrective release repairs episode tap-to-play, isolates episode-information failures, and fixes cross-podcast episode identity collisions that caused Old Time Radio Westerns to report 12 phantom inserts.

## Implemented

### Native tap-to-play path

- The podcast audio element remains mounted even when no episode is currently selected.
- Episode-card taps synchronously dispatch a playback request to that existing element.
- Source assignment, `load()`, and `play()` occur in the original user-activation call stack rather than a later React effect.
- The `play()` promise records resolved, rejected, and thrown outcomes, including user activation, source, ready state, network state, exception name, and media error details.
- Up Next and saved-playlist episode taps use the same path.

### Episode information repair

- Replaced the invalid out-of-scope `Head` reference with the global `PodcastPageHeader` component.
- Added a local episode-details error boundary so malformed data cannot collapse the full Podcasts section.
- The boundary records the episode, podcast, source screen, exception, and component stack.
- Playback remains available if an individual detail page fails.

### Episode persistence and collision repair

- Episode identity resolution first reuses an existing record belonging to the same podcast or matching enclosure URL.
- If a raw GUID/episode key is already owned by another podcast, the incoming episode receives a stable podcast-scoped key.
- This prevents `ON CONFLICT(episode_id)` from silently updating another podcast's row while leaving the current podcast short.
- Every selected record is checked after commit under the intended podcast ID.
- Insert counters are replaced with verified insert counts; missing records trigger a record-level verification failure.
- Missing-record diagnostics include raw key, resolved key, title, GUID, enclosure URL, intended podcast ID, and collision podcast ID.

## Expected Old Time Radio Westerns result

- Repair refresh: 12 verified inserts, 88 unchanged, 100 stored.
- Following refresh: 100 unchanged, 100 stored.
- No repeated phantom inserts.
