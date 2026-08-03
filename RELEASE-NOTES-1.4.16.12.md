# Fizz Health v1.4.16.12 — Playlist Filters & Automatic Reconciliation

## Summary

This release adds playlist-specific filtering and makes playlist membership reconcile immediately when filters, podcast subscriptions, podcast ordering, episode visibility rules, or refreshed feeds change.

## Changes

- Added **Enforce master playlist order** to Up Next and Stories settings.
- Added **Enforce variety** to Stories settings.
- Master-order enforcement groups playlist episodes according to the current My Podcasts order.
- Variety enforcement uses round-robin ordering so each podcast contributes one episode before any podcast contributes a second.
- Checking a filter immediately rebuilds the affected playlist.
- Unchecking a filter stops future enforcement while leaving the current order in place.
- Subscribing a podcast immediately adds all currently eligible episodes.
- Unsubscribing immediately removes that podcast's episodes from only the selected playlist.
- Feed refreshes reconcile every subscribed playlist and reapply active filters.
- Changes to latest-only, oldest-first, and My Podcasts order trigger affected playlist reconciliation.
- Added persistent playlist filter fields to the podcast playlist schema.

## Out of scope

- Drag-and-drop ordering inside playlists
- User-created playlists
- Playlist folders, search, or artwork
- Additional playback features

## Completed stories

FH-1612.1-FH-1612.7
