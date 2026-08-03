# Fizz Health v1.4.16.6 — Podcast Playback Stability & Queue Reliability

Completed stories: FH-1606.1-FH-1606.6

- Stabilized automatic advancement through the Up Next queue.
- Reset elapsed time, duration, slider state, and media source between episodes.
- Resume position is applied only to the same in-progress episode.
- Episode completion is processed only from the media ended event and only once.
- Completing an episode removes only that queue entry and preserves remaining order.
- Added manual Previous and Next queue controls compatible with future queue reordering.
