# Fizz Health v1.4.16.53 — Live Playback Queue Rotation Repair

## Scope

This corrective release connects Shuffle completion directly to the mini player's live playback transaction.

## Implemented

- Automatic Shuffle completion now waits for rotation and projection rebuilding before selecting the next episode.
- Completed contributing playlist IDs move to the end of the persisted Shuffle rotation.
- Each contributing source playlist is rebuilt so its next eligible episode is available immediately.
- The mini player loads the first episode from the freshly rebuilt Shuffle projection rather than a stale pre-completion snapshot.
- The visible Shuffle list, count, remaining time, and player Up Next sequence refresh from the same queue update event.
- The previous page-mounted completion listener was removed so rotation also works when the Podcasts page is not open.
- Added diagnostics for the before/after rotation, refreshed queue order, next episode, and verification result.

## Files changed

See `CHANGED-FILES-1.4.16.53.txt`.
