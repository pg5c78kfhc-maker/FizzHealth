# Fizz Health v1.4.16.55 — Variety Rotation Schema Migration Repair

## Scope

Corrects the deployed database failure `no such table: podcast_playlist_variety_rotation` encountered during podcast refresh and playlist projection rebuild.

## Changes

- Added schema migration 135, which idempotently creates the variety-rotation table and its ordering index.
- Added an unconditional database-open invariant that repairs the table even when migration 134 was previously recorded without the physical table.
- Backfills rotation rows for existing variety-enabled playlists from stable podcast master order.
- Verifies the table exists before database startup completes.
- Isolates playlist projection rebuild failures from already-committed feed and metadata refresh work; a rebuild failure is deferred and diagnosed rather than turning a successful feed import into a failed refresh.
- Updated application, package, lockfile, release metadata, and schema version identifiers to v1.4.16.55 / schema 135.

## Expected result

Existing databases upgrade safely, podcast refresh no longer fails at playlist rebuild because of a missing rotation table, and existing variety playlists retain their stable podcast order.
