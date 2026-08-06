# Fizz Health v1.4.16.56 — Playback Completion State Synchronization

## Scope

This corrective release synchronizes the mini player, active episode cards, persisted playback state, completion detection, playlist rotation, queue advancement, and recovery snapshots.

## Changes

- The HTML audio element is the authoritative live playback clock.
- Shared episode cards subscribe to the live playback progress event for the active episode.
- Card progress and mini-player position now update from the same current-time and duration values.
- Completion can be triggered by the native `ended` event or a bounded near-end duration tolerance.
- Both completion signals converge on the same serialized, duplicate-guarded completion transaction.
- Completion persistence uses the episode snapshot captured when the transaction starts, preventing stale React closure state from completing the wrong episode.
- Played removal, Shuffle/variety rotation, refreshed queue selection, and autoplay remain awaited in the same completion flow.
- Live and persisted playback recovery snapshots are written to local storage for abnormal restart reconciliation and diagnostics.
- Added focused v1.4.16.56 regression coverage.

## Release metadata

- Version: 1.4.16.56
- Build: 141656
- Deployment ID: FH-20260806-141656
