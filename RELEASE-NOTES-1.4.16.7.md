# Fizz Health v1.4.16.7 — Podcast Settings Hierarchy & Playback Recovery

## Included
- Added a top-level Podcasts gear for global player defaults.
- Converted each podcast gear to podcast-specific settings.
- Added nullable per-podcast playback-speed overrides; null means use the global speed.
- Added “Show only most recent episode,” defaulting to No.
- Latest-only mode shows the literal newest feed episode only when it is unplayed or in progress; it does not fall back to an older episode.
- Applied the effective local/global speed whenever an episode starts, including Up Next playback.
- Throttled progress persistence writes and added podcast-player error logging.
- Improved progress-label contrast as the green fill passes beneath the label.

## Out of scope
Drag-and-drop queue ordering, repeat/shuffle, downloads, multiple playlists, and external-player progress synchronization.
