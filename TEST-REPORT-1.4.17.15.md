# Test Report — Fizz Health v1.4.17.15

## Focused release verification
- `node --test tests-release/v141715-workout-card-compaction.test.mjs`
- Result: **6 passed / 0 failed**
- Covers:
  - removal of permanent right-side content reservation on workout cards
  - full-width workout copy with title-only action clearance
  - bottom-edge centered disclosure chevrons
  - preservation of workout edit/reorder/add and calorie exchange controls
  - preservation of the compact program-card disclosure pattern
  - schema compatibility at 146

## Adjacent workout exchange / execution regression
- `node --test tests-release/v141715-workout-card-compaction.test.mjs tests-release/v141713-calorie-import-parser-hotfix.test.mjs tests-release/v141712-workout-end-calorie-exchange.test.mjs`
- Result before the final metadata-only test addition: **14 passed / 0 failed**
- No functional changes were made after that run other than adding one v1.4.17.15 layout assertion and updating package-lock version metadata.

## Project integrity
- `node scripts/project-integrity.mjs`
- Result: **PASS**

## Release metadata
- `node scripts/verify-release.mjs`
- Result: **PASS**
- Verified version: **1.4.17.15**
- Schema: **146**

## Broad legacy suite
- `npm test`
- Result: **832 passed / 352 failed / 1,184 total**
- The broad suite remains red from pre-existing legacy/stale assertions outside this focused presentation release.

## Production build
- `npm run build`
- Result: **NOT SUCCESSFUL / environment blocked**
- Prebuild integrity repair passed.
- Build could not start because the local environment does not have the `vite` executable installed (`sh: 1: vite: not found`).
- No successful production build is claimed.

## Database
- No schema or migration changes in this release.
- Schema remains **146**.
- Workout history, execution, completion, calorie estimate, and program lifecycle data paths were not modified.
