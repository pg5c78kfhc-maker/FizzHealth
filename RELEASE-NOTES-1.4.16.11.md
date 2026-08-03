# Fizz Health v1.4.16.11 — Podcast Playlist Reconciliation

## Summary

This corrective release makes subscribed podcast playlists reconcile to the podcast's current feed, playback status, latest-only preference, and episode sort order whenever the feed refreshes.

## Changes

- When **Show only most recent episode** is enabled, each subscribed playlist keeps no more than the literal newest feed episode for that podcast.
- If that newest episode is already played, the podcast contributes no episodes to the subscribed playlist.
- Older episodes from a latest-only podcast are removed during refresh.
- When all available episodes are enabled, playlist membership is rebuilt in the podcast's configured order:
  - **Oldest episodes first** checked: oldest to newest.
  - Unchecked: newest to oldest.
- Played episodes and episodes no longer qualifying are removed.
- Episodes from other podcasts retain their relative playlist order.
- Existing playback progress remains stored in the separate playback record.
- Persisted podcast preferences and playlist subscriptions are read directly during refresh, avoiding stale UI-state reconciliation.

## Completed stories

- FH-1611.1 — Reconcile latest-only podcast playlist membership.
- FH-1611.2 — Order subscribed podcast episodes by podcast sort preference.
- FH-1611.3 — Preserve other podcast playlist order during refresh.
- FH-1611.4 — Remove played and obsolete podcast playlist entries.

Completed story range: FH-1611.1-FH-1611.4
