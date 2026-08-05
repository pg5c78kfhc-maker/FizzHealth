# Fizz Health v1.4.16.44 — Playlist Integrity & Synchronization

## Scope delivered

- Keys playlist membership, projection, and ordering reconciliation exclusively by stable playlist IDs and podcast IDs.
- Reconciles the renamed `up-next` playlist with its current registry name without using the display name as an identifier.
- Removes stale playlist projection and ordering rows immediately when a podcast membership is removed.
- Stops the renamed Up Next/News playlist from rendering legacy `podcast_up_next` rows that are not supported by current membership.
- Reloads both playlist-centric and podcast-centric membership checklists from verified database state after every change.
- Adds startup cleanup for stale projection rows and legacy queue rows.
- Adds reconciliation diagnostics and schema migration 132.

## Stories

- FH-1644.1-FH-1644.5

## Acceptance result

Membership table, checklist state, playlist projection, visible playlist, and persisted restart state now share the same stable-ID source of truth.
