# Fizz Health v1.4.17.1 — Workout Navigation & Responsive Foundation

## Implemented scope
- Replaced the Programs page hero-style heading with the standard Fizz Health X/title/plus header.
- The Programs X returns to Home; the plus opens New Program.
- Removed the duplicate create-program action from the empty state.
- Added a pencil action to every program card.
- Added a program-specific Workouts page with the standard X/title/plus header.
- Added create and edit workout forms scoped to the selected program.
- Added responsive containment rules across all workout pages, cards, headers, and forms.

## User-facing behavior
- Tap the Programs header plus to create a program.
- Tap a program pencil (or card) to open that program's workouts.
- Tap the Workouts header plus to create a workout.
- Tap an existing workout to edit its name, focus, or notes.
- Workout screens do not intentionally permit horizontal scrolling; narrow layouts wrap and collapse to one column.

## Migration notes
- Schema migration 138 adds `program_workouts` with stable workout and program IDs, display order, timestamps, and a cascading foreign key to `workout_programs`.
- Existing program data is preserved.

## Known limitations
- Exercises, sets, reps, scheduling, workout execution, and progress tracking remain outside this release.
- A production build could not be completed in this sandbox because the configured package registry returns 404 for pinned dependency `xlsx@0.18.5`; consequently Vite was unavailable.
