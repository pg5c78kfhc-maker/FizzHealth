# Fizz Health v1.4.16.8 — Podcast Organization & Automation

## Included
- Added persistent manual ordering of podcasts on My Podcasts using drag-and-drop and long-press touch reordering.
- Added the podcast-specific “Oldest episodes first” setting. It is off by default, preserving newest-to-oldest order.
- Added the podcast-specific “Up Next” automation setting. It is off by default.
- When Up Next automation is enabled, qualifying unplayed and in-progress episodes are added in the podcast’s displayed order.
- Feed refreshes add newly discovered qualifying episodes without duplicating existing queue entries or removing other podcasts’ queue entries.
- Auto-add respects “Show only most recent episode” and never falls back to an older episode when the latest episode is already played.
- New podcasts are appended to the bottom of the manually ordered library.
- Podcast order persists independently from episode sort order and Up Next queue order.
- Preserved the v1.4.16.7 global/local playback settings hierarchy and playback stability protections.

## Stories
FH-1608.1-FH-1608.4

## Out of scope
Up Next drag-and-drop reordering, repeat/shuffle, downloads, multiple playlists, and external-player progress synchronization.
