# Fizz Health v1.4.17.6 — Historical Workout Planning UI Infrastructure

## Implemented scope

This release connects the imported performed-workout history to the existing Program planning hierarchy without changing the historical records. The plus action on each Program card now opens a Historical Workouts selector rather than a blank-workout editor. Historical workouts are sorted descending by `performed_at`, so the newest performed workout appears first.

Selecting a historical workout shows its imported exercises and performed sets. Copying it into a Program creates a new editable `program_workouts` record and deep-copies its ordered exercises and sets. The copy carries the reusable exercise-library reference plus source workout/exercise/set identifiers for traceability.

A copied Program workout can be removed by swiping left and selecting Delete. A confirmation is required. The delete acts only on the planned copy and its planned child rows; `workout_sessions`, `workout_session_exercises`, `workout_session_sets`, and `exercise_library` are not modified.

## User-facing behavior

Program-card `+` → Historical Workouts → newest-first list → select a workout → inspect exercise/set preview → **Copy to Program**. The copied workout expands in the Program hierarchy and remains editable through the existing workout, exercise, and set pencil actions.

The preview and copied workout retain workout date/source context, exercise order, equipment, prescription text, target information, set order, weight, reps, and RIR. Negative weights remain valid for assisted movements.

## Migration notes

Schema migration **142** adds source-link and historical-copy metadata columns to `program_workouts`, `workout_exercises`, and `exercise_sets`. It adds no destructive statements and does not rewrite the imported historical tables.

Migration 142 was executed against a copy of the actual uploaded device database. The historical counts remained 138 workout sessions, 786 exercise occurrences, 2,848 performed sets, and 41 exercise-library definitions before and after the migration and a copy/delete cycle.

## Known limitations

Workout execution, progression analytics, exercise-library selection from the workout-level plus button, and drag-and-drop exercise reordering are not introduced in this release. The production build could not be completed in this environment because the configured package registry returns 404 for the pinned `xlsx@0.18.5`, leaving Vite unavailable.
