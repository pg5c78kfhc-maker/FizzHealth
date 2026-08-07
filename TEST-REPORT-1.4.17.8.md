# Fizz Health v1.4.17.8 Test Report

## Environment

- Date: 2026-08-07
- Source baseline: `Fizz-Health-v1.4.17.7-FULL-SOURCE(1).zip`
- Node project version after release update: 1.4.17.8
- Database migration target: 143
- Device database used for upgrade validation: uploaded `FizzHealth-2026-08-07 2.sqlite`

## Commands and checks run

### Project integrity

`npm run integrity:check`

Result: **PASS**

> Project integrity OK: one application root (.), one package.json, one src tree, one isolated Menu/Chef implementation.

### Focused release regressions

`node --test tests/v141708-active-program-execution.test.js tests/v141706-historical-workout-planning-ui.test.js`

Result: **PASS — 10/10**

Verified:

- schema 143 active-program and progression persistence;
- only-one-active-program update path;
- persisted routine selection;
- Exercise Library selector;
- persistent routine exercise reorder;
- exercise replacement and delete-from-routine path;
- performed-set results stored separately from immutable historical tables;
- prior comparable set values supplied as reference placeholders;
- fourth-set / Stable Workouts / Increase By progression rule;
- one-time Set 1 auto-increase marker;
- pre-existing historical-workout copy/remove behavior remains covered.

### Database migration tests

A copy of the uploaded device database was upgraded through migrations 142 and 143 using SQLite.

Result: **PASS**

- schema after upgrade: 143;
- imported workout sessions after upgrade: 138;
- imported historical sets after upgrade: 2,848;
- progression columns present;
- `PRAGMA integrity_check`: `ok`.

A separate execution/progression simulation used the upgraded device database copy.

Result: **PASS**

- program changed to Active and persisted selected routine/exercise;
- qualifying fourth-set result advanced a 130 lb working weight to 140 lb using Increase By = 10;
- stable streak reset after progression;
- progression pending marker set for the next first set;
- historical counts remained 138 workouts / 2,848 sets;
- SQLite integrity remained `ok`.

### Release metadata

`npm run verify:release`

Result: **PASS**

> Release metadata verified: v1.4.17.8 / FH-1718.1-FH-1718.5

### JavaScript syntax

`node --check src/database.js`

`node --check src/decision/engine.js`

Result: **PASS** for changed non-JSX JavaScript.

An additional attempt was made to install `@babel/parser` for standalone JSX parsing. The internal package registry returned 404, so JSX parser installation was unavailable. The normal Vite production build would provide JSX parsing, but Vite could not be installed for the dependency reason below.

### Broad regression suite

`npm test`

Result: **FAIL — 825 passed / 346 failed / 1,171 total**.

The failures are dominated by pre-existing brittle source-pattern assertions across legacy tests. The focused v1.4.17.8 tests pass. This report does not treat the broad suite as green.

### Dependency installation

`npm install --ignore-scripts`

Result: **BLOCKED BY ENVIRONMENT**

Exact blocking dependency/error:

`npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz`

`'xlsx@.../xlsx-0.18.5.tgz' is not in this registry.`

An attempted standalone `@babel/parser` install also returned registry 404.

### Production build

`npm run build`

Result: **NOT SUCCESSFUL / ENVIRONMENT BLOCKED**

Prebuild project-integrity repair passed, then build stopped with:

`sh: 1: vite: not found`

Vite is unavailable because dependencies cannot be installed after the registry 404 above. No successful production build is claimed and generated production output could not be inspected.

## Acceptance criteria verified

- Program icon space removed/reclaimed by program metadata.
- Run control activates a program for its configured duration and enforces one active program.
- Routine selection persists on active program.
- Exercise selection enters active exercise execution flow.
- Exercise Library is used when adding an existing exercise to a routine.
- New Exercise path remains available from Exercise Library.
- Routine exercises can be reordered with a drag handle and explicit Save; order persists via `display_order`.
- Exercise can be replaced from the library or removed from the routine without modifying historical workout tables.
- Weight Unit, Increase By, Stable Workouts, and 4th Set Target persist at routine-exercise level.
- Set editor no longer exposes editable per-set weight unit.
- Performed set screen shows Reps / Weight / RIR across one row with prior values as background references and Save Set directly below.
- Performed data is written to execution tables, not historical imported set tables.
- Qualifying fourth-set streak triggers Increase By after Stable Workouts is reached.
- Automatic increase indicator is limited to first set of the first workout at the new weight and is acknowledged on save.
- Imported historical workout data remains intact in the device-database upgrade and progression simulations.
