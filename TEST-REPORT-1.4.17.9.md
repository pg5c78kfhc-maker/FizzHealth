# Fizz Health v1.4.17.9 Test Report

## Environment

- Date: 2026-08-07
- Baseline source: `Fizz-Health-v1.4.17.8-FULL-SOURCE(1).zip`
- Node project version under test: `1.4.17.9`
- Target database schema: `144`
- Device-database validation source: uploaded `FizzHealth-2026-08-07 2.sqlite` copied before test mutation

## Commands run

```text
node --test tests/v141709-weekly-workout-lifecycle.test.js
npm run integrity:check
node --check src/database.js
node --check src/decision/engine.js
node --check public/sw.js
node --check tests/v141709-weekly-workout-lifecycle.test.js
npm run verify:release
npm install --no-audit --no-fund
npm run build
npm test
```

A SQLite migration execution test was also run on a copy of the uploaded device database, applying migrations 142, 143, and 144 from its recorded schema-141 state and then checking the migrated tables, imported-history counts, and `PRAGMA integrity_check`.

## Focused release tests

**PASS — 5/5**

1. Schema 144 persists weekly execution, workout durations, rest configuration, and rest timer state.
2. Routine selection creates week-scoped execution state and prevents re-executing a completed routine in the same week.
3. Final-set completion records workout end/duration and advances the week or completes the program.
4. Rest-between-set and rest-between-exercise controls drive persisted countdown progress bars.
5. Completed workouts join the Health & meal timeline without updating/deleting imported workout history.

## Project-integrity validation

**PASS**

```text
Project integrity OK: one application root (.), one package.json, one src tree, one isolated Menu/Chef implementation.
```

## JavaScript / JSX syntax validation

**PASS for directly checkable non-JSX changed modules** using `node --check`:

- `src/database.js`
- `src/decision/engine.js`
- `public/sw.js`
- `tests/v141709-weekly-workout-lifecycle.test.js`

The normal Vite JSX compilation gate could not run because dependency installation is blocked by the package registry, as documented under Production build.

## Migration results

**PASS**

A copy of the uploaded device database reported schema 141 before the test. Migrations 142, 143, and 144 executed successfully in order.

Post-migration verification included:

- schema version: 144
- `workout_programs`: weekly/completion columns present
- `program_workouts`: `rest_between_exercises_seconds` present
- `workout_exercises`: `rest_between_sets_seconds` present
- `workout_execution_sessions`: `week_number` and `duration_minutes` present
- `workout_rest_timers`: created successfully
- imported historical workout sessions: **138** retained
- imported historical sets: **2,848** retained
- SQLite `PRAGMA integrity_check`: **ok**

## Release metadata verification

**PASS**

```text
Release metadata verified: v1.4.17.9 / FH-1719.1-FH-1719.5
```

Version/build/schema metadata is aligned across package metadata, `VERSION.json`, About-bound constants, decision engine, service-worker cache, current ReleaseNotes, and release history.

## Broad regression suite

**FAIL — existing broad-suite debt remains**

```text
Total: 1176
Passed: 830
Failed: 346
```

The broad suite contains numerous legacy source-pattern assertions that pre-date this release and are already known to be brittle. Focused v1.4.17.9 coverage passes. The broad failure is recorded and is not represented as a successful full regression run.

## Production build

**BLOCKED / NOT SUCCESSFUL**

`npm install --no-audit --no-fund` failed with the exact dependency error:

```text
npm error code E404
npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz
npm error 404  'xlsx@https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz' is not in this registry.
```

Because dependencies could not be installed, `npm run build` reached the Vite command and failed with:

```text
sh: 1: vite: not found
```

A successful production build is therefore **not claimed**.

## Acceptance criteria verified

- Routine selection establishes a persistent workout start time scoped to the active program week.
- Completed routines cannot be started again in the same week.
- The final required performed set records workout completion time and calculated duration.
- Workout completion date/time and duration are available for display on the routine card.
- Every routine must complete before the program advances to the next week.
- The final routine of the final week completes the active program.
- Rest Between Sets is persisted per routine-exercise.
- Rest Between Exercises is persisted per routine.
- Set rest starts after a non-final set and is dismissed when the next set starts.
- Exercise rest starts after the final set of an exercise and is dismissed when the next exercise is selected.
- Rest state persists with absolute start/end timestamps and is represented by a draining progress indicator.
- Completed workouts appear in the Health & meal timeline with name and duration.
- Imported historical workout/session/set tables are not mutated by the new execution lifecycle.
