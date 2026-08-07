# Fizz Health v1.4.17.8 — Active Program Execution & Progressive Overload

## Implemented scope

This release adds the agreed active-program execution foundation without redesigning unrelated Fizz Health modules.

- Program cards no longer reserve space for the left dumbbell icon; program metadata uses the reclaimed width.
- Program cards include a wide **Run** control beneath Edit/Add. Running a program makes it the single active program, resets any previously active program to Planned, sets the active start date, and derives the active end date from program duration.
- Active programs persist one selected routine and one selected exercise.
- Active routine cards show a checkbox beneath the routine sequence number. Active exercises show a corresponding selection control beneath the exercise number.
- Routine exercise management now includes an Exercise Library selector, create-new-exercise path, replacement from the library, delete-from-routine behavior, and a dedicated reorder screen with drag handles and explicit Save.
- Routine-exercise configuration persists **Weight Unit**, **Increase By**, **Stable Workouts**, and **4th Set Target**.
- Weight unit is inherited by sets from the routine-exercise configuration rather than edited per set.
- Performed set logging is stored separately from historical workout imports and from the planned template.
- The performed-set editor places Reps, Weight, and RIR in one row, shows the prior comparable values as background placeholders, places **Save Set** immediately below, and keeps weight unit/notes below the primary action.
- Fourth-set progression tracks a stable-workout streak. When the configured fourth-set target is met for the configured number of Stable Workouts, future template weight is increased by Increase By.
- A progression event sets a one-time pending indicator. The up-arrow is shown only on Set 1 of the first workout at the new automatically increased weight and is acknowledged when that set is saved.

## User-facing behavior

Historical performed workouts remain immutable. Editing/reordering a routine affects that program template and future use of the routine, not historical sessions. Performed set results for active workouts are stored in new execution tables so prior workout-history data remains intact.

## Migration notes

Schema advances from 142 to **143**. Migration 143 adds active-program selection fields, routine-exercise progression fields, and separate workout execution session/set tables. It also backfills routine-exercise weight unit/current weight from existing planned sets where possible.

Migration validation was performed against a copy of the uploaded device database. The upgrade preserved all 138 imported historical workouts and 2,848 historical performed sets and returned `PRAGMA integrity_check = ok`.

## Known limitations

- The sandbox package registry does not provide the pinned `xlsx@0.18.5` tarball. Dependency installation therefore fails and Vite is unavailable, so a successful production build is **not** claimed.
- A JSX parser could not be installed from the same registry; non-JSX JavaScript syntax checks were completed, while JSX validation is limited to focused source regression tests because the normal Vite build gate could not run.
- The broad legacy source-pattern suite remains red from long-standing brittle assertions; exact totals are recorded in the Test Report.
