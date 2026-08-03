# Fizz Health v1.4.16.6 — Podcast Playback Stability & Queue Reliability

## Scope completed

- Rebuilt queue advancement so a genuinely completed episode removes only itself and automatically loads the next queued episode.
- Removed percentage-based early completion. Completion is now processed only from the media element's genuine `ended` event.
- Added a per-episode completion guard to prevent duplicate end processing.
- Fully releases the previous audio source before loading another episode.
- Resets elapsed time, duration, slider state, playing state, save timers, and completion state on every episode transition.
- Applies a saved position only when the same episode is stored as `in_progress`; otherwise playback starts at 0:00.
- Preserves queue order and selects adjacent entries by `queue_position`, maintaining compatibility with future drag reordering.
- Added manual Previous and Next queue controls without deleting skipped entries.
- Waits for the new source's `canplay` event before attempting sequential autoplay.

## Out of scope

Drag-and-drop ordering, repeat, shuffle, speed enhancements, playlist redesign, podcast discovery changes, subscriptions, and downloads.
