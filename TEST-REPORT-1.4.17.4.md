# Test Report — Fizz Health v1.4.17.4

## Environment
- Linux sandbox
- Node/npm available
- Project dependencies were not present in `node_modules` at baseline.
- Source baseline: Fizz Health v1.4.17.3 FULL-SOURCE.
- Import source: supplied `2026_07_29 Workouts` PDF.

## Commands and results
### Focused release regression
`node --test tests/v141704-workout-history-import.test.js`
- PASS: 4/4 tests.
- Verified schema 141 and all new workout-history tables.
- Verified seed contains exactly 138 sessions, 786 exercise occurrences, and 2,848 sets.
- Verified chronological boundaries and weight/reps/RIR persistence fields.
- Verified reusable canonical exercise definition plus preservation of the original source label.

### Project integrity
`npm run integrity:check`
- PASS.
- Output: one application root, one package.json, one src tree, one isolated Menu/Chef implementation.

### Release metadata
`npm run verify:release`
- PASS.
- Verified v1.4.17.4 / FH-1714.1-FH-1714.5 consistency.

### JavaScript syntax checks
`node --check src/database.js`
`node --check src/workouts/historyImportSql.js`
`node --check src/decision/engine.js`
- PASS.
- JSX build-time syntax validation could not be completed because the production dependency installation/build gate is blocked below.

### Data import / migration validation
The generated historical SQL was executed against an isolated SQLite database twice.
- First execution: 41 exercise-library rows; 138 workout sessions; 786 session-exercise rows; 2,848 set rows.
- Second execution: identical counts, confirming idempotency.
- Oldest session: 2025-07-19T19:27:00, chronological order 0.
- Newest session: 2026-07-15T11:00:00, chronological order 137.
- PASS.

### Full legacy regression suite
`npm test`
- FAIL: 814 passed / 343 failed / 1,157 total.
- The failures are broad legacy source-pattern assertions, including the pre-existing `Menu calculates each Recipe snapshot once per mapping pass` brittle source-text assertion and related pattern-based checks. They are not specific failures of the workout-history import path.
- This result is recorded as a failure; it is not represented as a passing suite.

### Dependency installation
`npm install`
- BLOCKED by package registry.
- Exact dependency/error: `xlsx@0.18.5` returned HTTP 404 from the sandbox npm registry (`.../xlsx/-/xlsx-0.18.5.tgz`).

### Production build
`npm run build`
- NOT SUCCESSFUL / BLOCKED.
- Prebuild integrity repair passed.
- Build then failed with `sh: 1: vite: not found` because dependencies could not be installed after the registry 404 above.
- No successful production build is claimed.

## Acceptance criteria verified
- All 138 source workouts imported and ordered oldest-to-newest.
- All 786 workout exercise occurrences retained in workout-specific order.
- All 2,848 individual sets retained with weight, reps, and RIR when present.
- Reusable exercise definitions are separated from performed workout occurrences.
- Source workout/exercise text is retained for traceability.
- Import is deterministic and safe to run repeatedly without duplication.
- Existing UI scope was not expanded.
- Schema migration number advanced sequentially from 140 to 141.
