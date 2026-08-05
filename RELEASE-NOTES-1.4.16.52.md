# Fizz Health v1.4.16.52 — Variety Rotation Unification

## Scope

This release unifies Shuffle and every ordinary podcast playlist with **Enforce Variety** enabled behind the same persistent round-robin behavior.

## Implemented

- Added a persisted per-playlist podcast rotation keyed by stable playlist ID and podcast ID.
- Master Playlist Order seeds the initial round only.
- Natural episode completion moves that podcast to the end of the active rotation.
- Manual Mark Played uses the same rotation transaction.
- Pull-to-refresh and full projection rebuilds reconcile episode availability without resetting the live rotation.
- Newly eligible podcasts are appended after the surviving rotation.
- Removed podcasts and podcasts without eligible projected episodes are removed during reconciliation.
- Each podcast's oldest-first or newest-first setting continues to determine which episode it contributes.
- Added variety-rotation diagnostics and schema migration 134.

## Version

- Version: 1.4.16.52
- Build: 141652
- Schema: 134
