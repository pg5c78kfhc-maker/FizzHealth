# Fizz Health v1.4.17.0 — Workout Programs Foundation

## Implemented scope

- Added **Workout** as a permanent primary-footer destination between Health and Podcasts.
- Added a Programs page that lists all workout programs.
- Added an empty state and **New Program** action.
- Added create and edit workflows for workout programs.
- Added persistent program fields: name, description, goal, status, start date, duration in weeks, notes, display order, and audit timestamps.
- Added a calculated expected end date derived from start date plus duration; it is not redundantly stored.
- Added release history and About/version metadata for v1.4.17.0.

## User-facing behavior

Selecting **Workout** in the footer opens the Programs page. Program cards show the program name, goal, status, start date, duration, and calculated expected end date. Selecting a card opens the editor. The program name is required, and duration must be a whole number from 1 through 260 weeks.

## Migration notes

- Added schema migration **137 — Workout Programs Foundation**.
- Added `workout_programs` with stable `program_id` persistence and an index supporting status/start-date ordering.
- Existing health, nutrition, podcast, and settings records are unchanged.
- Expected end date is calculated in the application and is not stored.

## Known limitations

- Workouts within programs, exercises, sets, repetitions, progression, completion percentage, and program deletion are intentionally outside this release.
- A production bundle could not be generated in this environment because dependency installation was blocked by the local package registry for `xlsx@0.18.5`. See the Test Report for the exact error.
