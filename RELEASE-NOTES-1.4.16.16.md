# Fizz Health v1.4.16.16 — Podcast Metadata, Playback Controls & Playlist Consistency

Completed stories: **FH-1616.1-FH-1616.6**.

- Backfills podcast artwork, publisher, canonical title, website, latest episode date, and feed health during feed refresh.
- Replaces numeric library refresh status with a high-contrast progress bar.
- Replaces the mini-player speed shortcut with a sleep timer: end of episode, 15 minutes, or 30 minutes.
- Uses one episode-card component for Up Next and Stories, with no visible X action.
- Swiping a playlist episode right marks it played, advances its stored position to completion, and removes it from eligible playlists.
- Pulling down on a playlist refreshes only the podcasts represented in that playlist and reconciles that playlist only.
