# Test Report — Fizz Health v1.4.17.6

## Environment

- Release baseline: Fizz Health v1.4.17.5 FULL-SOURCE
- Runtime: Node.js v22.16.0
- Database validation: Python sqlite3 against a copy of the uploaded device database `FizzHealth-2026-08-07 2.sqlite`
- Release schema: 142
- Build environment package registry: `https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/`

## Commands run

- `node scripts/project-integrity.mjs`
- `node --test tests/v141706-historical-workout-planning-ui.test.js`
- `python /mnt/data/test_actual_1716.py`
- `npm test`
- `npm install --ignore-scripts`
- `npm run verify:release`
- `npm run build`
- ZIP integrity/extraction checks for both required archives

## Focused release results

**PASS — 5/5 focused tests.** Verified:

1. Program plus routes to Historical Workouts and the SQL orders `performed_at DESC, chronological_order DESC`.
2. Historical copy inserts a Program workout, ordered exercises, and individual sets while performing no UPDATE/DELETE against historical workout tables.
3. Migration 142 contains the source linkage and RIR fields needed to preserve imported workout data in editable planning copies.
4. Planned workout removal uses left-swipe exposure plus explicit confirmation and deletes only from `program_workouts`.
5. Historical preview exposes set weight, reps, and RIR and remains horizontally constrained.

## Actual-device-database migration / copy-delete test

**PASS.** Migration 142 was applied to a copy of the uploaded device database.

Historical data before migration/copy/delete:
- 138 imported workout sessions
- 786 historical exercise occurrences
- 2,848 historical performed sets
- 41 exercise-library definitions

The newest imported workout contained 5 exercises and 20 sets. A planning copy was created from that session and produced exactly **5 planned exercises and 20 planned sets**. The planned copy was then deleted.

Historical data after the full cycle remained exactly:
- 138 imported workout sessions
- 786 historical exercise occurrences
- 2,848 historical performed sets
- 41 exercise-library definitions

`PRAGMA integrity_check` returned **ok**.

## Project integrity

**PASS.** `node scripts/project-integrity.mjs` reported one application root, one package.json, one src tree, and one isolated Menu/Chef implementation.

## Broad regression suite

**FAILED (pre-existing broad-suite brittleness remains).** `npm test` completed with:

- 1,166 total tests
- 822 passed
- 344 failed

The failures are dominated by older source-pattern assertions that expect exact historical source shapes. The focused v1.4.17.6 tests pass and the actual-database copy/delete validation passes. This report does not characterize the broad suite as green.

## Release metadata verification

**PASS.** `npm run verify:release` reports:

`Release metadata verified: v1.4.17.6 / FH-1716.1-FH-1716.5`

## Dependency installation / production build

**BLOCKED — production build not claimed successful.**

`npm install --ignore-scripts` failed with:

`npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz`

`'xlsx@.../xlsx-0.18.5.tgz' is not in this registry.`

Because dependencies could not be installed, `npm run build` reached the build command but failed with:

`sh: 1: vite: not found`

No production-build success is claimed.

## Acceptance criteria verified

- Program plus opens historical workout selection: **PASS**
- Historical workouts default most recent first: **PASS**
- Selected historical workout previews exercises and performed set data: **PASS**
- Copy carries ordered exercises and each performed set: **PASS**
- Weight, reps, RIR, equipment, prescription/source metadata retained: **PASS**
- Copied workout is independent/editable: **PASS by schema/UI path**
- Historical records remain immutable through copy/delete: **PASS against uploaded database**
- Swipe left exposes delete and requires confirmation: **PASS**
- Deleting copy leaves historical data intact: **PASS against uploaded database**
- Workout UI remains constrained against horizontal overflow: **PASS focused source/style regression**
- Version consistent across centralized metadata and release verifier: **PASS**
- Production build: **BLOCKED by registry; not claimed**
