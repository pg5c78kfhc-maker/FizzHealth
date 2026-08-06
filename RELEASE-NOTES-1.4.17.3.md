# Fizz Health v1.4.17.3 — Exercise Sets Foundation

## Implemented scope

- Made each exercise card collapsible within its parent workout.
- Added a pencil action to edit the current exercise's metadata.
- Added a plus action to add a set beneath the current exercise.
- Added nested set cards beneath expanded exercises.
- Added create/edit set forms for reps, optional weight, weight unit, and notes.
- Preserved the established hierarchy and control convention: pencil edits the current level; plus adds the next level.
- Reused the existing visual-viewport and keyboard-safe editor shell.

## User-facing behavior

The Programs page now presents the full hierarchy as Program → Workout → Exercise → Set. Expanding an exercise displays its sets. Tapping the exercise pencil edits the exercise. Tapping the exercise plus creates a new set. Existing sets can be opened and edited from their nested cards.

## Migration notes

Schema migration **140** creates `exercise_sets`, indexed by stable `exercise_id` and ordered by `set_number`. The migration idempotently backfills existing exercises by converting their legacy aggregate `sets` and `reps` values into individual set rows. Existing program, workout, and exercise IDs are preserved.

## Known limitations

- This release does not add workout execution, completion tracking, timers, history, progression, or analytics.
- Sets do not yet support drag-and-drop reordering or deletion.
- A production build could not be completed in this environment because the configured package registry returned 404 for pinned dependency `xlsx@0.18.5`.
