# Test Report — Fizz Health v1.4.16.40

## Passed

- Project integrity check: PASS
- Release metadata verification: PASS
- Database target schema: 129
- Focused v1.4.16.40 suite: 6 passed, 0 failed
- Full-source ZIP integrity: PASS
- Partial-source ZIP integrity: PASS

## Focused coverage

- Registry-driven episode projection for custom and future playlists
- Membership-driven collection of eligible unplayed episodes
- Playlist ordering and Enforce Variety applied through the shared projection path
- Immediate rebuild after podcast membership changes
- Startup recovery for playlists with members but no stored episode projection
- Projection verification and diagnostic payload
- Right-side-only drag handles
- Top and bottom edge auto-scroll during drag
- Dedicated right-side scrolling gutter
- Rebuild after saved podcast ordering

## Prior-release regression suite

The v1.4.16.39 and v1.4.16.40 source-oriented suites were run together: 11 passed and 1 failed. The only failure is the v1.4.16.39 metadata test, which is explicitly pinned to `VERSION='1.4.16.39'` and therefore fails after the intentional version change to 1.4.16.40. All non-version v1.4.16.39 behavior assertions passed.

## Production build

`npm run build` was attempted.

Result: NOT COMPLETED.

Reason: the supplied source archive does not include installed npm dependencies, and Vite was unavailable (`vite: not found`). No successful production build is claimed.

## Deployed-device checks still required

- Verify Top 20 automatically rebuilds and displays eligible episodes from all assigned podcasts.
- Create a new playlist, add podcasts, and verify its episodes appear without playlist-specific code.
- Drag one podcast from the bottom to the top and from the top to the bottom in one uninterrupted gesture on iPhone.
- Confirm the right-side gutter scrolls without moving a podcast.
