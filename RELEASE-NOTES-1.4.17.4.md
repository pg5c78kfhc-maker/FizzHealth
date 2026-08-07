# Fizz Health v1.4.17.4 — Workout History & Exercise Library Import

## Implemented scope
- Added a reusable `exercise_library` separate from performed workout history.
- Imported all 138 workout sessions represented in the supplied `2026_07_29 Workouts` PDF.
- Stored sessions oldest-to-newest for progression analysis, from 2025-07-19 through 2026-07-15.
- Preserved 786 ordered workout-exercise occurrences and 2,848 individual sets.
- Preserved workout name, program/standalone context, day/week metadata, performed date/time, source duration text and normalized duration minutes.
- Preserved exercise source name, equipment, target reps, target RIR when present, prescription text, notes, and exercise order.
- Preserved set number, weight, weight unit, reps, and RIR when present.
- Added deterministic stable IDs and an import audit row so the historical seed can be safely reapplied without duplicates.
- Added a nullable exercise-library reference to planned workout exercises for future library-backed workout creation.

## User-facing behavior
No new workout UI behavior is introduced in this release. This is a data-foundation release intended to preserve the supplied workout history before further workout UI changes.

## Migration notes
- Schema version: 141.
- New tables: `exercise_library`, `workout_sessions`, `workout_session_exercises`, `workout_session_sets`, `workout_history_import_audit`.
- Added `workout_exercises.exercise_definition_id` plus an index for future template/library linking.
- The historical import is deterministic and idempotent via stable primary keys, unique source keys, and `INSERT OR IGNORE`.
- Obvious PDF text-extraction artifact `Butter y` is normalized to `Butterfly` in the reusable library while the original source exercise label is retained on each historical occurrence.

## Known limitations
- The historical data is imported as completed workout history, separate from planned program/workout templates.
- No historical-workout browser, progression charting, exercise-library selector UI, or drag-and-drop UI is added in this release.
- Production build verification is blocked by the local package registry failure described in the Test Report.
