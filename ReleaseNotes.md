# Fizz Health v1.4.16.38 — Dynamic Playlist Usability & Podcast Navigation

- Added a playlist-aware **+ → Add Podcasts** checklist populated from current subscriptions.
- Added podcast long-press **Playlists** membership editing with multiple-playlist support.
- Normalized Up Next to the standard playlist registry/settings model.
- Added podcast-level information buttons and an expanded podcast information page with description, available/played/remaining counts, and oldest/newest episode rows.
- Expanded episode details with bounded artwork and retained episode notes.
- Added episode long-press **Go to Podcast** navigation.
- Played episodes are excluded immediately from listening playlist projections and remaining-time totals.
- Unassigned now means a podcast has no ordinary playlist memberships.


Stories: FH-1638.1-FH-1638.10

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


# Fizz Health v1.4.16.36 — Main Settings Navigation Hotfix

Release ID: FH-20260804-141636  
Completed story: FH-1636.1-FH-1636.3

## Fixed

- Restored the main Settings component that was accidentally removed by a truncated source merge in v1.4.16.35.
- Restored the complete Podcasts render switch that had been cut off after the playback helper.
- Wrapped the Settings route in an application error boundary so future Settings render failures cannot produce an uncontained black screen.
- Preserved all v1.4.16.35 podcast interaction and persistence repairs.
