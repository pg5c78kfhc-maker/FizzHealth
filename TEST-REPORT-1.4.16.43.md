# Fizz Health v1.4.16.43 Test Report

## Result summary

| Check | Result |
|---|---|
| Full `src/main.jsx` JSX parse with TypeScript parser | PASS |
| `src/database.js` JavaScript syntax | PASS |
| Project integrity check | PASS |
| Release metadata verification | PASS |
| v1.4.16.42 + v1.4.16.43 focused podcast tests | 13 passed, 0 failed |
| Complete historical test directory | 757 passed, 316 failed |
| Local production build | BLOCKED BY PACKAGE MIRROR |

## Focused regression coverage

The combined v1.4.16.42/v1.4.16.43 suite verifies:

1. Played episodes are removed from queue and playlist projections.
2. Playlist projection supports incremental podcast updates.
3. Latest-only cleanup retains resolved episode identities.
4. Podcast orphan cleanup covers dependent tables.
5. Podcast Information exposes storage statistics.
6. Reorder overlay cannot render visibly.
7. Version/build/schema metadata is current.
8. Podcast Settings places Reorder Playlists below Create Playlist.
9. Carousel order writes, reads back, verifies, and publishes a registry refresh.
10. Universal completion filtering includes status, completion timestamp, and 95% progress.
11. Membership changes verify and publish live reconciliation.
12. Reorder pages use normal document scrolling rather than the former overlay shell.
13. Refresh timestamps use local human-readable formatting.

## Complete historical suite note

The repository contains tests accumulated across many historical releases. Running all `tests/*.test.js` produced:

- 1,073 tests discovered
- 757 passed
- 316 failed

The failures are predominantly old release-pinned assertions and superseded UI contracts, including tests that explicitly require earlier version numbers or removed interfaces. They are not represented as a passing current regression gate. The current focused podcast suite passes completely.

## Production build limitation

`npm ci` was attempted. Dependency installation could not complete because the configured package mirror returned 404 responses for pinned packages, including `xlsx@0.18.5` and `@vitejs/plugin-react@6.0.3`.

Because Vite could not be installed in this runtime, a local production bundle was not generated. The complete JSX source was parsed successfully with TypeScript’s JSX parser, and the database module passed Node syntax validation. A clean Cloudflare/npm environment remains required for definitive `vite build` execution.
