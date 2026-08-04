# Fizz Health v1.4.16.39 — Podcast Information, Context Menus & Playlist Reordering

## Scope delivered

- Completed podcast-level information with a visible show description, publisher, categories, language, explicit status, playlist memberships, available/played/remaining counts, separate newest and oldest episode rows, refresh information, and tappable Website, Feed, and Apple Podcasts URLs.
- Kept episode-level details separate and made episode URL fields tappable while retaining bounded artwork and show notes.
- Prevented native iOS text selection and touch callouts on podcast and episode long-press targets and cleared any accidental selection before opening the app menu.
- Preserved playlist-aware Add Podcasts and podcast Playlists membership workflows with stable playlist IDs, multiple memberships, and Unassigned reconciliation.
- Continued filtering played episodes from ordinary listening playlists and updating queue projections.
- Added a reorder icon beside each ordinary playlist header and a dedicated drag-and-drop reorder page with Save and Cancel behavior.
- Persisted podcast ordering per playlist in the new `podcast_playlist_podcast_order` table using stable playlist and podcast IDs.

## Database

- Schema migration: 128
- New table: `podcast_playlist_podcast_order`

## Build note

The production build was attempted. It could not start because the supplied source archive did not contain installed npm dependencies and `vite` was unavailable.
