# Test Report — Fizz Health v1.4.16.49

## Focused regression suite

**Result: PASS — 9 passed, 0 failed**

Commands:

```text
node --test --test-name-pattern='reorder page|episode gestures|pull to refresh|played filtering' tests/v141648-playlist-refresh-gesture-boundary.test.js
node --test tests/v141649-shuffle-foundation.test.js
```

Validated:
- bounded reorder viewport and clamped drop boundaries
- gesture reset across navigation and episode details
- pull-to-refresh final full projection and stored filter reapplication
- played filtering with duration fallbacks
- one current Shuffle contribution per selected stable playlist ID
- duplicate suppression with retained contributor IDs
- source rotation after completion
- exclusion of Shuffle, My Podcasts, and Unassigned from source selection
- strict swipe cancellation for diagonal motion, scrolling, and reversal
- release source contains Shuffle settings, diagnostics, and schema migration

## Repository-wide historical suite

The repository-wide test command contains many historical release tests that intentionally assert obsolete version numbers and superseded UI strings. It was executed for visibility but is not a valid release gate for v1.4.16.49. The new focused suite and the applicable v1.4.16.48 behavioral regressions pass.

## Production build

**Result: BLOCKED BY PACKAGE REGISTRY — compilation did not start.**

`npm run build` reached the Vite invocation, but dependencies were not installed in the supplied source archive. `npm ci` then failed because the configured sandbox registry returned HTTP 404 for the pinned package:

```text
xlsx-0.18.5.tgz
```

This is an environment/dependency-fetch failure, not a reported compiler failure. A production build must still be run in the normal Fizz Health build environment with the lockfile dependencies available before deployment.
