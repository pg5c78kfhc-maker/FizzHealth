# Test Report — Fizz Health v1.4.16.27

## Passed

- Project integrity repair: passed.
- Project integrity check: passed.
- Exactly one application root, one `package.json`, and one `src` tree: confirmed.
- Release metadata verification: passed.
- TypeScript JSX transpilation/syntax validation for `src/main.jsx`: passed with zero diagnostics.
- TypeScript JavaScript transpilation/syntax validation for `src/database.js`: passed with zero diagnostics.
- Focused v1.4.16.27 regression tests: 10/10 passed.
- Existing v1.4.16.26 startup-optimization tests included in the focused run: passed.

Focused coverage included:

- Configurable 50/100/200 page sizes and default 50.
- First-page-only rendering for Up Next, Stories, and Drama.
- Explicit Load More behavior.
- Lazy and asynchronous episode-artwork loading.
- Episode-card error isolation.
- Idempotent/trapped playback completion.
- Canonical publication-date fallback.
- Canonical episode persistence during feed refresh.
- Publication metadata propagation to Up Next.
- Schema migration and backfill behavior.

## Complete historical suite

- Tests executed: 1,000
- Passed: 712
- Failed: 288

The failures are primarily historical source-text assertions tied to superseded implementation shapes and release metadata. The focused v1.4.16.27 tests passed. This report does not claim that the complete historical suite is green.

## Production build

`npm run build` was attempted after integrity repair and failed before compilation because `vite` was not installed in the supplied archive.

Dependency restoration was also attempted and failed because the configured registry returned HTTP 404 for the locked `xlsx@0.18.5` package. Therefore, a genuine production build could not be completed in this environment.
