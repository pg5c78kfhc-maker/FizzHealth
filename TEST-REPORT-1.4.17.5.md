# Test Report — Fizz Health v1.4.17.5

## Environment
- Linux sandbox
- Node.js v22.16.0
- npm project without installed `node_modules`
- Baseline: Fizz Health v1.4.17.4 FULL-SOURCE
- Corrective target schema: 141

## Commands and checks run
1. `node --test tests/v141704-workout-history-import.test.js tests/v141705-workout-migration-repair.test.js`
2. `node --check src/database.js`
3. `node --check src/workouts/historyImportSql.js`
4. `node scripts/project-integrity.mjs`
5. `node scripts/verify-release.mjs`
6. Real migration simulation using Node `node:sqlite` against the legacy migration-40 `workout_sessions` shape, including a preserved pre-existing row and a second idempotency pass.
7. `node --test tests/*.test.js`
8. `npm run build`
9. `npm install --ignore-scripts`
10. ZIP extraction verification for FULL-SOURCE and PARTIAL-SOURCE packages.

## Focused release results
**PASS — 8/8 focused tests.**

Verified:
- migration 141 adds `performed_at`, `source_key`, and the other workout-history fields to the existing workout table;
- legacy workout row survives the upgrade;
- PDF import produces exactly 138 workout sessions;
- exercise library contains exactly 41 definitions;
- workout history contains exactly 786 exercise occurrences;
- workout history contains exactly 2,848 sets;
- rerunning the import leaves counts unchanged at 138 / 786 / 2,848;
- historical session seed populates legacy required columns as well as new history fields;
- release metadata is v1.4.17.5 / build 141705 / schema 141.

## Syntax validation
**PASS.** `src/database.js` and `src/workouts/historyImportSql.js` both pass Node syntax validation.

## Project integrity
**PASS.** One application root, one package manifest, one `src` tree, and one isolated Menu/Chef implementation.

## Release metadata verification
**PASS.** Release metadata verifier reports v1.4.17.5 / FH-1715.1-FH-1715.3.

## Migration results
**PASS.** A schema-140-style database containing the legacy `workout_sessions` table upgrades successfully. Existing data is retained, all imported workout-history records load, and a second import is idempotent.

This specifically reproduces and fixes the v1.4.17.4 startup failure `no such column: performed_at`.

## Broad regression suite
**FAILED — 817 passed / 343 failed / 1,160 total.**

These failures are the existing broad legacy/source-pattern suite failures seen in the preceding workout releases; the focused migration-repair tests pass. This release does not claim the broad suite is green.

## Production build
**NOT SUCCESSFUL / ENVIRONMENT BLOCKED.**

`npm run build` reaches the build command after the integrity prebuild but fails because Vite is not installed:

`sh: 1: vite: not found`

Attempting to install dependencies fails at the configured package registry with:

`npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz`

`'xlsx@.../xlsx-0.18.5.tgz' is not in this registry.`

Therefore this report does **not** claim a successful production build or production-output inspection.

## Acceptance criteria verified
- [x] Migration 141 no longer assumes a new `workout_sessions` table shape.
- [x] Upgrade works against the established legacy workout table.
- [x] Existing workout-session data is preserved.
- [x] `performed_at` exists before the chronological index is created.
- [x] Imported PDF workout history remains complete at validated counts.
- [x] Import is safe to retry without duplicates.
- [x] Target schema remains 141 for recovery from the failed v1.4.17.4 migration.
- [x] Version/build metadata is consistent at v1.4.17.5 / 141705.
- [ ] Production build succeeds — blocked by package-registry dependency availability, documented above.
