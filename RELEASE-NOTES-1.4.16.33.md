# Fizz Health v1.4.16.33 — Playlist Assignment Integrity & UI Synchronization

## Purpose

Correct playlist-assignment state and immediately synchronize the Podcast Library after membership changes.

## Changes

- Repaired the General Interest toggle so it reads and writes its own `generalInterest` React state instead of falling through to Drama.
- Kept Stories, Drama, General Interest, and Up Next persistence independent.
- Triggered the Podcast Library and playlist counts to refresh immediately after the subscription row is committed, before feed reconciliation completes.
- Added a playlist-assignment event containing podcast ID, playlist ID, previous membership, requested state, update time, and UI-refresh status.
- Added General Interest to the My Podcasts grouped library so assigned podcasts no longer remain under Unassigned.
- Included General Interest in playlist ordering/filter reconciliation and remaining-duration reporting.
- Added additional vertical separation below the Podcasts header so the selected carousel ring no longer crowds the divider.
- Updated release, build, service-worker, decision-engine, and About metadata to v1.4.16.33.

## Compatibility

No database schema migration was required. Existing playlist subscription and playlist-item rows remain compatible.
