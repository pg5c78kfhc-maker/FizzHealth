# Fizz Health v1.4.17.10 — Test Report

## Environment

- Release baseline: Fizz Health v1.4.17.9 FULL-SOURCE
- Release: v1.4.17.10 — Program Lifecycle Tabs Hotfix
- Target schema: 145
- Runtime: containerized Linux / Node.js project environment
- Database compatibility input: uploaded `FizzHealth-2026-08-07 2.sqlite` used as a real historical-data upgrade fixture

## Commands and checks run

### Project integrity

Command:

`npm run integrity:check`

Result: **PASS** — one application root, one package.json, one src tree, and one isolated Menu/Chef implementation.

### Focused lifecycle and workout regression tests

Command:

`node --test tests/v141709-weekly-workout-lifecycle.test.js tests/v141710-program-lifecycle-tabs-hotfix.test.js tests/workout-navigation-responsive.test.js tests/v141706-historical-workout-planning-ui.test.js`

Result: **PASS — 19/19 tests**.

Verified specifically:

- Programs exposes Active / Completed / Set Up lifecycle tabs.
- Set Up templates are rendered as Inactive and date-free.
- Run creates a separate Active program instance linked to the Set Up template.
- Existing weekly execution, historical workout copy behavior, and responsive containment remain covered.
- Migration 145 contains repair logic for programs previously activated in place.

### Migration 145 functional SQL test

A schema-144-compatible SQLite fixture containing an Active program, routine, exercise, and set was upgraded with migration 145.

Result: **PASS**.

Verified:

- Active program preserved.
- `template_program_id` populated on Active instance.
- Date-free Planned/Set Up template created exactly once.
- Routine, exercise, and set hierarchy cloned into the recovered template.
- `PRAGMA integrity_check` returned `ok`.

### Real database upgrade-path validation

A copy of the uploaded device database was upgraded through migrations 142, 143, and 144, placed into the v1.4.17.9 in-place Active state, then upgraded through migration 145.

Result: **PASS**.

Historical data before and after migration 145:

- Historical workout sessions: **138 → 138**
- Historical exercise occurrences: **786 → 786**
- Historical performed sets: **2,848 → 2,848**
- Exercise Library definitions: **41 → 41**

The Active program remained Active. A separate Set Up template was reconstructed with its copied planning hierarchy. The recovered template's start date is NULL. SQLite integrity returned `ok`.

### Release metadata verification

Command:

`npm run verify:release`

Result: **PASS** — v1.4.17.10 metadata is consistent across package metadata, VERSION.json, UI constants, service worker, decision engine, release history, and ReleaseNotes.md.

### JavaScript syntax validation

Command:

`node --check src/database.js`

Result: **PASS**.

JSX compiler validation would normally occur through Vite during `npm run build`; that gate could not run because dependency installation is blocked by the registry issue documented below.

### Broad legacy test suite

Command:

`npm test`

Result: **FAIL — 835 passed / 345 failed / 1,180 total**.

The failures are the project's existing broad legacy/source-pattern failures, including stale historical release-identification assertions and older Nutrition/Planner/Podcast implementation-shape expectations. Representative failures include `release identification is v1.4.15.25`, older Food planner source-shape checks, and older podcast gesture/source-pattern assertions. The focused hotfix suite above passes completely.

### Dependency installation

Command:

`npm install`

Result: **BLOCKED BY ENVIRONMENT**.

Exact blocking dependency/error:

`npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz`

`npm error 404 'xlsx@.../xlsx-0.18.5.tgz' is not in this registry.`

### Production build

Command:

`npm run build`

Result: **NOT SUCCESSFUL / ENVIRONMENT BLOCKED**.

Prebuild project-integrity repair passed, then the build stopped with:

`sh: 1: vite: not found`

Vite is unavailable because `npm install` cannot complete due to the pinned `xlsx@0.18.5` registry 404. No successful production build is claimed and no production output inspection is claimed.

## Acceptance criteria verified

- Active / Completed / Set Up tabs appear on the Programs page.
- Active tab contains Active program instances only.
- Completed tab contains Completed and Terminated instances.
- Set Up contains Planned reusable templates only.
- Set Up templates are Inactive and have no start/end dates.
- Run creates an independent Active program instance rather than mutating the template.
- The original template remains available for future runs.
- Existing in-place Active programs from v1.4.17.8/v1.4.17.9 recover a reusable Set Up template during migration 145.
- Recovered templates retain routine/exercise/set planning structure.
- Imported historical workout data remains unchanged.
- Version/build/schema metadata is consistent at v1.4.17.10 / build 141710 / schema 145.

## Known limitations

- Production build could not be executed because the local package registry does not serve `xlsx@0.18.5`.
- The broad legacy suite remains red due to pre-existing stale implementation/source-pattern assertions; focused release coverage is green.
