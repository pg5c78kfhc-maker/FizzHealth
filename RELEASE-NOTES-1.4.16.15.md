# Fizz Health v1.4.16.15 — Podcast Refresh, Playlist Duration & Activity Status

## Implemented

- Renamed the per-podcast **Oldest episodes first** setting to **Series** while preserving oldest-to-newest behavior when enabled.
- Added pull-to-refresh to **My Podcasts**. A downward pull refreshes every active podcast feed, updates the newest-known episode date, and reconciles subscribed playlists.
- Added a silent bulk-refresh path so large libraries do not render each feed during the global refresh.
- Added a live **Time remaining** total to Up Next and Stories in `days:hours:minutes:seconds` format, including the active episode's current playback position.
- Added unknown-duration reporting for playlist entries without usable duration metadata.
- Split My Podcasts into collapsible **Active** and **Inactive** sections.
- Added the global, immediately persisted **Active Threshold** setting in months; default is 6 months.
- Preserved the existing master drag-and-drop priority within both Active and Inactive sections.

## Database

Schema 120 adds `last_episode_at` and `last_refreshed_at` to podcasts and the `active_threshold_months` global setting.
