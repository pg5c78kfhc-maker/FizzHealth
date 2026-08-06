# Test Report — Fizz Health v1.4.17.2

## Environment

- Date: 2026-08-06
- Platform: Linux sandbox
- Project baseline: Fizz Health v1.4.17.1 FULL-SOURCE
- Release target: Fizz Health v1.4.17.2
- Package manager: npm
- Database: sql.js migration source validation

## Commands run

```text
node scripts/project-integrity.mjs
node --test tests/v141702-nested-workout-hierarchy.test.js
node --check src/database.js
node --check tests/v141702-nested-workout-hierarchy.test.js
npm install --ignore-scripts
npm run build
unzip -t Fizz-Health-v1.4.17.2-FULL-SOURCE.zip
unzip -t Fizz-Health-v1.4.17.2-PARTIAL-SOURCE.zip
```

## Project-integrity result

PASS.

```text
Project integrity OK: one application root (.), one package.json, one src tree, one isolated Menu/Chef implementation.
```

## Focused release regression result

PASS: 5 tests, 5 passed, 0 failed.

Verified:

1. Programs and workouts render as nested collapsible cards.
2. Pencil actions edit metadata and plus actions add the next child level.
3. Migration 139 creates relational exercise persistence with cascade deletion.
4. Exercise create/edit captures name, sets, reps, and notes.
5. Workout editors use the visual viewport, prevent horizontal overflow, preserve 16px input sizing, and retain vertical keyboard-safe scrolling.

## JavaScript syntax validation

PASS for `src/database.js` and the focused test file via `node --check`.

JSX production parsing could not be independently run because Vite and the React toolchain were unavailable after dependency installation failed at the package registry.

## Migration result

PASS by focused source validation.

- Existing migration 138 remains intact.
- Target schema advanced to 139.
- Migration 139 creates `workout_exercises`.
- Foreign key: `workout_id` → `program_workouts(workout_id)` with `ON DELETE CASCADE`.
- Index: `idx_workout_exercises_workout_order`.
- Release metadata version, build ID, schema version, and title are consistent.

## Dependency installation result

FAIL — environmental registry limitation.

Exact error:

```text
npm error code E404
npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz
npm error 404  'xlsx@https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz' is not in this registry.
```

## Production-build result

BLOCKED / NOT SUCCESSFUL.

`npm run build` completed the project-integrity prebuild step, then failed because Vite was unavailable after the blocked dependency installation:

```text
> vite build
sh: 1: vite: not found
```

No successful production build is claimed, and no generated production output is included.

## Acceptance criteria verified

- Programs page retains the standard X/title/plus header.
- Program cards are collapsible.
- Expanded programs show workouts inline.
- Program pencil edits program metadata.
- Program plus creates a workout under the selected program.
- Workout cards are collapsible.
- Expanded workouts show exercises inline.
- Workout pencil edits workout metadata.
- Workout plus creates an exercise under the selected workout.
- Exercise create/edit stores name, sets, reps, and notes.
- Workout forms are constrained to the visual viewport.
- No workout form element intentionally uses a width greater than the viewport.
- Editor content scrolls vertically when the keyboard reduces the visual viewport.
- Version is consistent across package metadata, runtime constants, release history, migration metadata, reports, and artifact filenames.

## Packaging verification

Both ZIP archives were tested with `unzip -t` after creation. Transient caches, `node_modules`, build debris, and secrets were excluded.
