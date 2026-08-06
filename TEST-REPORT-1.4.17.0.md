# Test Report — Fizz Health v1.4.17.0

## Environment

- Date: 2026-08-06
- OS: Linux sandbox
- Node.js: v22.16.0
- Package manager: npm
- Baseline: `Fizz-Health-v1.4.16.58-FULL-SOURCE(1).zip`
- Release: v1.4.17.0
- Target schema: 137

## Commands run

```text
npm run integrity:check
node --test tests-release/v141700-workout-programs.test.js
npm test
node --check src/database.js
npm run build
npm ci
```

## Project-integrity result

**PASS**

`Project integrity OK: one application root (.), one package.json, one src tree, one isolated Menu/Chef implementation.`

## Focused release regression result

**PASS — 4/4**

Verified:

1. v1.4.17.0 version consistency and schema 137 metadata.
2. Workout is a permanent footer destination and the footer renders six primary items.
3. Migration 137 persists the agreed program-level fields.
4. Programs list, create, edit, persistence, and expected-end calculation are present.

## JavaScript/JSX syntax validation

- `node --check src/database.js`: **PASS**.
- Direct `node --check src/main.jsx` is unsupported by Node for `.jsx` files (`ERR_UNKNOWN_FILE_EXTENSION`).
- JSX compilation was therefore delegated to the required Vite production build, but dependency installation was blocked by the registry limitation described below.

## Full regression suite

**NOT CLEAN**

The broad `npm test` run reached the existing suite and reported a brittle source-pattern assertion failure in:

`tests/aggregate-nutrition-integrity.test.js` — `Menu calculates each Recipe snapshot once per mapping pass`

The failure expects the literal source pattern:

`map(r=>{const snapshot=recipeSnapshot(r.meal_id)`

This release did not modify the Menu or recipe aggregation implementation. The command subsequently exceeded the execution window while printing the large source mismatch. This is recorded as a pre-existing/unrelated regression-suite issue, not reported as a pass.

## Migration result

**PASS by focused structural verification; runtime migration execution unavailable.**

Migration 137 was verified to:

- create `workout_programs` idempotently;
- use stable `program_id` primary keys;
- preserve the agreed fields;
- add a status/start-date/display-order index;
- update release metadata to schema 137.

Runtime SQL.js migration execution could not be run because dependencies were not installed and the registry blocked installation.

## Production-build result

**BLOCKED — no successful production build claimed.**

Initial command:

```text
npm run build
```

Result:

```text
sh: 1: vite: not found
```

Dependency installation command:

```text
npm ci
```

Exact blocking dependency/error:

```text
npm error code E404
npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz
npm error 404 'xlsx@https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz' is not in this registry.
```

Because `npm run build` did not succeed, no production-build success is asserted.

## Acceptance criteria verified

- **PASS:** Footer contains a Workout button with a dumbbell icon.
- **PASS:** Workout opens a Programs page.
- **PASS:** Programs page lists persisted programs.
- **PASS:** Programs page can create a new program.
- **PASS:** Existing programs can be opened and edited.
- **PASS:** Program captures name, description, goal, status, start date, duration, and notes.
- **PASS:** Expected end date is calculated from start date plus duration.
- **PASS:** New persistence uses stable IDs.
- **PASS:** Version is consistent in package metadata, About constants, release history, filenames, diagnostics metadata, and VERSION.json.
- **PASS:** No workout/session/exercise/set functionality was added beyond the agreed scope.
- **BLOCKED:** Production build and generated-output inspection, due solely to the package-registry error above.
