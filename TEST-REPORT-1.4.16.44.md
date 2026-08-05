# Test Report — Fizz Health v1.4.16.44

## Focused release suite

`node --test tests/v141644-playlist-integrity-synchronization.test.js`

Result: **6 passed, 0 failed**.

Verified:

- v1.4.16.44 metadata and schema migration 132;
- stable playlist-ID and podcast-ID membership keys;
- stale projection and ordering deletion during removal;
- renamed Up Next rendering through the standard playlist projection;
- verified checkbox-state hydration after toggles;
- startup cleanup of projections without active memberships.

## Syntax and schema validation

- Complete `src/main.jsx` JSX parse using TypeScript: **PASS**.
- `src/database.js` JavaScript syntax: **PASS**.
- Migration 132 executed against an in-memory SQLite compatibility schema: **PASS**.
- Project integrity check: **PASS**.
- Release metadata verification: **PASS**.

## Historical test directory

`node --test tests/*.test.js`

Result: **759 passed, 320 failed** across 1,079 tests.

The failures are older release-pinned and superseded-contract tests, including tests that explicitly require prior version identifiers such as v1.4.16.43. They are not represented as a passing current regression gate.

## Production build attempt

`npm clean-install --progress=false`

Result: **BLOCKED BY PACKAGE MIRROR** before Vite could run. The configured package mirror returned HTTP 404 for the pinned `xlsx@0.18.5` tarball. No successful local production build is claimed.

Cloudflare or another clean npm environment with access to the pinned dependencies remains the production compiler verification point.
