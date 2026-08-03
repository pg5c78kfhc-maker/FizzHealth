# Fizz Health v1.4.16.8 — Podcast Organization & Automation

This release adds persistent manual podcast ordering, per-podcast episode sort direction, and automatic Up Next population from selected podcasts.

## Changes
- Long-press or drag a podcast card on My Podcasts to reposition it.
- Manual order is stored in `podcasts.display_order` and survives restarts and feed refreshes.
- Added `Oldest episodes first`, unchecked by default.
- Added `Up Next`, unchecked by default.
- Auto-add inserts currently eligible episodes in visible order and adds newly discovered episodes during future refreshes.
- Played episodes are excluded; in-progress episodes remain eligible; duplicates are prevented.
- Latest-only mode continues to mean the literal newest feed episode only.

## Not included
Up Next reordering, repeat/shuffle, downloads, and multiple playlists.
