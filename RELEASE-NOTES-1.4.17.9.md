# Fizz Health v1.4.17.9 — Weekly Workout Execution, Rest Timing & Health Timeline

## Implemented scope

This release implements the agreed active-program execution lifecycle without changing imported historical workout records.

- Active programs execute week by week using a persisted `current_week` value.
- Selecting an available routine creates or reopens that week-specific workout execution and records its `started_at` timestamp exactly once.
- Every performed set remains stored separately from immutable imported history.
- Saving the final required set completes the workout occurrence, records `completed_at`, and calculates `duration_minutes` from the persisted start/end timestamps.
- When every routine for the current week is complete, the active program advances to the next week. Completing every routine in the final configured week marks the program Completed.
- Workout metadata now includes **Rest Between Exercises**.
- Routine-exercise metadata now includes **Rest Between Sets**.
- Saving a non-final set starts the configured between-set countdown; saving the final set of an exercise starts the configured between-exercise countdown unless the workout itself has completed.
- Rest state is persisted in `workout_rest_timers` and rendered as a draining progress bar with remaining time.
- Starting the next set or selecting the next exercise dismisses the corresponding rest indicator.
- Completed workouts appear in the Health & meal timeline using the workout completion timestamp, workout name, and calculated duration.
- Completed workout cards show the completion date/time and duration for the current program week.

## User-facing behavior

A routine becomes an in-progress workout when selected, which establishes the workout start time. Sets can then be recorded from the existing execution flow. Rest progress appears after completed sets and exercises according to the configured intervals. When the final set of the final exercise is saved, the workout is completed automatically and its actual duration is persisted. The Health timeline then shows that completed workout as a workout event.

Weekly progression is automatic: all routines remain part of each program week; after every routine in the week is completed, the program advances to the next week. After the last routine in the last week is completed, the program becomes Completed.

## Migration notes

Schema version advances from **143 to 144**.

Migration 144 adds:

- `workout_programs.current_week`
- `workout_programs.completed_at`
- `workout_programs.terminated_at`
- `program_workouts.rest_between_exercises_seconds`
- `workout_exercises.rest_between_sets_seconds`
- `workout_execution_sessions.week_number`
- `workout_execution_sessions.duration_minutes`
- `workout_rest_timers`

The migration was executed against a copy of the uploaded device database starting at schema 141 and was verified through migrations 142, 143, and 144. The 138 imported historical workout sessions and 2,848 historical sets remained intact and SQLite `PRAGMA integrity_check` returned `ok`.

## Known limitations

The production build could not be completed in this environment because the configured package registry returns HTTP 404 for the pinned dependency `xlsx@0.18.5`. Consequently Vite is not installed and `npm run build` terminates with `vite: not found`. No successful production build is claimed.

The broad legacy regression suite continues to contain pre-existing brittle source-pattern failures; see the Test Report for exact counts.
