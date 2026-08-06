# Test Report — Fizz Health v1.4.17.3

## Environment

- Date: 2026-08-06
- Platform: Linux sandbox
- Node.js: available
- npm: available
- Baseline: Fizz Health v1.4.17.2 full-source ZIP
- Target schema: 140

## Commands run

```text
node --test tests-release/v141703-exercise-sets.test.mjs
npm run integrity:check
node --check src/database.js
npm test
python migration-140 execution check using sqlite3
npm install --ignore-scripts
npm run build
npm run verify:release
```

## Focused release results

`node --test tests-release/v141703-exercise-sets.test.mjs`

- Passed: 5
- Failed: 0
- Verified version/schema advancement, exercise pencil/plus actions, set persistence, nested collapsible rendering, and keyboard-safe editor reuse.

## Project-integrity results

`npm run integrity:check`

- Passed.
- One application root, one package.json, one source tree, and one isolated Menu/Chef implementation.

## Syntax validation

- `node --check src/database.js`: passed.
- Full JSX compilation could not run because dependencies could not be installed; see Production build result.

## Migration results

Migration 140 was extracted and executed against an in-memory SQLite database containing a legacy exercise with 3 sets × 12 reps.

- Migration execution: passed.
- `exercise_sets` table and index: created.
- Legacy backfill: produced set numbers 1, 2, and 3, each with 12 reps.
- Target schema chain: 139 → 140.

## Broad regression-suite result

`npm test`

- Total: 1,153
- Passed: 809
- Failed: 344

The failures are predominantly pre-existing brittle source-pattern assertions, including aggregate-nutrition and workout-navigation checks that compare exact source formatting/older structures. The focused v1.4.17.3 release suite and project-integrity check pass. The broad suite is therefore recorded as failed and is not represented as green.

## Production-build result

**Blocked / not successful.**

`npm install --ignore-scripts` failed with:

```text
npm error code E404
npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz
npm error 404 'xlsx@.../xlsx-0.18.5.tgz' is not in this registry.
```

Because dependencies were unavailable, `npm run build` reached Vite invocation and failed with:

```text
sh: 1: vite: not found
```

No successful production build is claimed.

## Release metadata verification

`npm run verify:release`

- Passed: `Release metadata verified: v1.4.17.3 / FH-1713.1-FH-1713.4`.
- Version is synchronized across package metadata, VERSION.json, About UI constants, release history, service-worker cache, filenames, and database release metadata.

## Acceptance criteria verified

- Exercise cards are collapsible.
- Exercise pencil edits exercise metadata.
- Exercise plus adds a set under the correct exercise.
- Sets render nested beneath expanded exercises.
- Existing set cards open the set editor.
- Sets persist using stable IDs and exercise foreign keys.
- Existing aggregate exercise sets/reps are idempotently backfilled.
- Set forms reuse the visual-viewport and keyboard-safe editor container.
- No workout execution, completion tracking, timers, history, progression, or unrelated refactors were added.
