# Fizz Health v1.4.17.5 — Workout History Migration Compatibility Repair

Release ID: FH-20260807-141705  
Stories: FH-1715.1-FH-1715.3

- Corrected migration 141 so it upgrades the existing workout_sessions table created by migration 40 instead of assuming a new table shape.
- Adds the workout-history columns in place while preserving all existing workout session rows.
- Historical PDF workout imports now populate both the legacy required columns and the new history columns.
- Added a filtered unique source-key index for deterministic, idempotent imports.
- Added regression coverage for a real schema-140 upgrade path and migration retry behavior.
- No user-facing workout features were added in this corrective release.
