# Test Report — Fizz Health v1.4.16.45

## Results

- Focused v1.4.16.45 tests: **5 passed, 0 failed**.
- v1.4.16.44 behavioral reconciliation tests excluding the intentionally version-pinned assertion: **5 passed**.
- Complete `src/main.jsx` TypeScript JSX parse: **PASS**.
- `src/database.js` JavaScript syntax: **PASS**.
- Project integrity check: **PASS**.
- Release metadata verification: **PASS**.

## Focused coverage

1. Podcast reorder Save persists stable podcast IDs, reads the order back, verifies it, rebuilds the playlist projection, and emits a refresh event.
2. Episode long press is canceled after more than 10 CSS pixels of movement or when vertical movement indicates scrolling.
3. Mark-as-played requires a rightward swipe of at least 30% of card width with a 110 px minimum, and horizontal movement must dominate vertical movement.
4. Playlist filter changes are read back, verified, and followed by a full projection rebuild and ordering application.
5. Podcast name renders above episode title with equal bold visual hierarchy.

## Historical regression note

The v1.4.16.44 test file contains one release-pinned assertion requiring version `1.4.16.44`; it fails by design after advancing to v1.4.16.45. Its five behavioral tests pass.

## Production build

A production build was attempted after `npm clean-install`. Dependency installation could not complete because the configured package mirror returned HTTP 404 for the pinned `xlsx@0.18.5` tarball. No successful local Vite production build is claimed. Cloudflare’s clean dependency installation remains the deployment build gate.
