# Fizz Health v1.4.17.5 — Workout History Migration Compatibility Repair

## Release title
Workout History Migration Compatibility Repair

## Implemented scope
- Corrected migration 141 so it upgrades the `workout_sessions` table that already exists from migration 40 rather than assuming a second incompatible table definition.
- Added the workout-history columns in place and retained the existing legacy workout-session columns and rows.
- Updated historical PDF session inserts to satisfy the legacy table's required `local_date`, `created_at`, and `updated_at` fields while also populating the new chronological-history fields.
- Added a filtered unique `source_key` index so imported PDF sessions remain deterministic and idempotent.
- Added focused regression coverage that creates a schema-140-style legacy table, preserves a pre-existing workout row, imports all history, and reruns the import safely.

## User-facing behavior
- Fixes the startup blocker reporting `Database migration 141 failed: no such column: performed_at`.
- Existing on-device workout-session data is preserved during the corrected upgrade path.
- No new workout UI behavior is included.

## Migration notes
- Target schema remains **141** because the prior v1.4.17.4 migration 141 could not complete on the established database schema.
- Migration 141 now adds compatibility columns to the existing `workout_sessions` table before creating indexes or importing history.
- Historical import remains 138 sessions, 786 exercise occurrences, 2,848 sets, and 41 reusable exercise definitions.
- Import retry is idempotent and leaves row counts unchanged.

## Known limitations
- Production build could not be completed in this sandbox because the configured package registry returns HTTP 404 for pinned dependency `xlsx@0.18.5`; Vite is therefore unavailable locally.
- The broad legacy source-pattern test suite still contains 343 pre-existing failures unrelated to this migration repair.
