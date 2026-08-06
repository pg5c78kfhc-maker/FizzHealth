# Test Report — Fizz Health v1.4.17.1

## Environment
- Date: 2026-08-06
- Node: system-provided runtime
- Package manager: npm
- Baseline: Fizz Health v1.4.17.0 full-source ZIP
- Target schema: 138

## Commands run
- `node scripts/project-integrity.mjs`
- `node --check src/database.js`
- `node --test tests/workout-navigation-responsive.test.js`
- `npm install --ignore-scripts`
- `npm test`
- `npm run build`
- ZIP extraction verification with `unzip -t`

## Focused release tests
PASS — 5/5 focused workout tests:
1. Programs uses standard close/title/add header.
2. Program cards expose a pencil and open a program-specific Workouts page.
3. Workouts can be created and edited per program.
4. Migration 138 creates `program_workouts` with program relationship.
5. Workout layout rules constrain width and block horizontal overflow.

## Integrity results
PASS — one application root, one package.json, one src tree, and one isolated Menu/Chef implementation.

## Syntax results
PASS — `src/database.js` passed Node syntax validation.
JSX production parsing could not be completed because dependencies could not be installed and Vite was unavailable.

## Migration results
PASS — focused migration assertions verify migration 138, table creation, index, and program foreign key. Existing migration numbering remains sequential after 137.

## Broad regression results
`npm test` executed the legacy suite and reached 892 tests before reporting an existing brittle source-pattern failure in `tests/v141616-podcast-metadata-playlist-consistency.test.js`. The failure concerns podcast source-text matching and is unrelated to the workout release. It is not represented as a passing suite.

## Production-build result
BLOCKED / NOT SUCCESSFUL.

Dependency installation failed exactly with:
`npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz`
`npm error 404 'xlsx@.../xlsx-0.18.5.tgz' is not in this registry.`

Because installation was blocked, `npm run build` reached the build command but failed exactly with:
`sh: 1: vite: not found`

No successful production build is claimed and no generated production output is included.

## Acceptance criteria verified
- Programs page has standard X/title/plus header.
- Programs X routes back to Home through the existing `onBack` navigation.
- Programs plus creates a new program.
- Duplicate body create button is removed.
- Every program card has a pencil action.
- Pencil opens the selected program's Workouts page.
- Workouts page has standard X/title/plus header.
- Workouts plus opens New Workout.
- New and existing workouts persist under stable program IDs.
- Workout pages, forms, cards, text, and controls use constrained responsive widths.
- 390px-and-below rules collapse form grids and prevent oversize controls.
- Version is consistent in package metadata, runtime constants, About release history, VERSION.json, reports, and filenames.
