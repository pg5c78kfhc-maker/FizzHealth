# Fizz Health v1.4.16.37 — Dynamic Playlist Registry & Management

Completed story: FH-1637.1-FH-1637.4

## Scope
This release replaces hardcoded podcast playlist definitions with a database-backed registry. It adds dynamic playlist creation and renaming while preserving stable playlist identifiers and existing memberships.

## Changes
- Added schema migration 126 with playlist type, color/tone, enabled, system, rename, and delete capabilities.
- Migrated My Podcasts, Up Next, Stories, Drama, and General Interest into the registry idempotently.
- My Podcasts remains unique, non-renameable, and non-deletable.
- The podcast carousel now renders from registry rows and automatically includes new playlists.
- Podcast assignment controls now render from registry rows rather than hardcoded checkbox fields.
- Added Create Playlist to Podcast Settings with case-insensitive duplicate-name protection.
- Added Rename Playlist to the shared playlist gear settings for every renameable playlist.
- Playlist names are display data; filtering, membership, queue construction, and persistence continue to use stable playlist IDs.
- Existing membership rows in `podcast_playlist_subscriptions` and `podcast_playlist_items` remain intact.
