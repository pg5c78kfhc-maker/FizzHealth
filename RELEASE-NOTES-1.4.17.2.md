# Fizz Health v1.4.17.2 — Nested Workout Hierarchy & Exercises Foundation

## Implemented scope

- Replaced the separate program-to-workouts drill-down with a nested hierarchy on the Programs page.
- Program cards now expand and collapse to show their workouts.
- Workout cards now expand and collapse to show their exercises.
- Program pencil actions edit program metadata.
- Program plus actions create workouts beneath that program.
- Workout pencil actions edit workout metadata.
- Workout plus actions create exercises beneath that workout.
- Added exercise create/edit persistence for name, sets, reps, and notes.
- Added schema migration 139 for `workout_exercises` with cascade deletion from workouts.
- Kept the standard X/title/plus Programs header.
- Constrained workout editors to the visual viewport and made their body the vertical scroll region when the keyboard is open.

## User-facing behavior

The Programs page is now the primary workout builder. A user can expand a program to see workouts, then expand a workout to see exercises. Metadata edits use pencil buttons; plus buttons add the next child level. Exercise rows can be tapped to edit their metadata.

## Migration notes

- Added migration 139: `Nested Workout Hierarchy and Exercises Foundation`.
- Added `workout_exercises` with stable text IDs, workout foreign keys, sets, reps, notes, display order, timestamps, and an index on workout/order.
- Existing programs and workouts are preserved.
- No migration numbers were renumbered or skipped.

## Known limitations

- Exercise execution logging, weights, per-set completion, rest timers, supersets, and workout history are intentionally outside this release.
- The production build could not be completed in this sandbox because the configured package registry returned HTTP 404 for the pinned `xlsx@0.18.5` package. See the Test Report for the exact error.
