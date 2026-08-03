# Test Report — Fizz Health v1.4.16.15

## Focused regression tests

Command:

`node --test tests/podcast-refresh-duration-activity-1.4.16.15.test.js tests/podcast-playlist-filters-1.4.16.12.test.js`

Result: **8 passed / 0 failed**.

Coverage includes:

- Series label and chronological behavior contract
- Whole-library pull-to-refresh wiring
- Silent large-library refresh path
- Playlist duration format and live active-position subtraction
- Active/Inactive classification and master ordering
- Immediate Active Threshold persistence
- Schema 120 activity metadata
- Existing playlist master-order and variety filters

## Project checks

- `node --check src/database.js`: passed
- `node scripts/project-integrity.mjs --repair`: passed
- `node scripts/verify-release.mjs`: passed

## Full inherited suite

Command: `node --test tests/*.test.js`

Result: **668 passed / 268 failed** across 936 tests. The failures are inherited source-pattern expectations from earlier releases; the focused v1.4.16.15 tests passed.

## Production build

The exact `npm clean-install` / `npm run build` path could not complete in this sandbox. Its configured npm mirror returned 404 responses for locked packages, including `xlsx@0.18.5` and `@vitejs/plugin-react@6.0.3`. No local Vite production-build success is claimed.
