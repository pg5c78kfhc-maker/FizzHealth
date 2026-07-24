# Build & Test Summary — Fizz Health v1.4.11.37

## Release
- Version: 1.4.11.37
- Build: 141137
- Deployment: FH-20260724-141137
- Theme: UI Stabilization & Archive Recovery

## Implemented
- Corrected the Food/Meals library grid from five declared rows to six, so the search field no longer receives the flexible list row.
- Fixed the library search control at 52 px high (50 px on narrow devices), with explicit min/max height and no vertical flex growth.
- Kept Status and Data filters compact and ensured the results list begins below search.
- Added Restore to Active to archived Food and Recipe detail screens.
- Preserved existing list-swipe restore behavior and Settings > Archived Items restore behavior.
- Updated centralized release metadata, decision engine version, service-worker cache, package metadata, release history, and release notes.

## Verification
- Focused v1.4.11.37 tests: 4 passed, 0 failed.
- Release metadata verification: passed.
- Full historical test suite: 354 passed, 42 failed. The failures are pre-existing historical/version assertions and were not introduced by this corrective scope.
- Production Vite build: not executed because node_modules were not present and dependency installation was unavailable in the sandbox.

## Files Changed
See `CHANGED-FILES-1.4.11.37.txt`.
