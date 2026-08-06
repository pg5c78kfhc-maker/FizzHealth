# Test Report — Fizz Health v1.4.16.56

## Result summary

- Project integrity: PASS
- Focused v1.4.16.56 regression suite: 6/6 PASS
- Production Vite build: NOT EXECUTED — sandbox dependency registry limitation

## Focused coverage

1. Release metadata reports v1.4.16.56.
2. Live audio progress is broadcast and consumed by shared episode cards.
3. Near-end duration tolerance invokes the shared completion transaction.
4. Completion persistence uses the captured active playback snapshot rather than a stale component closure.
5. Live and persisted playback recovery snapshots are recorded.
6. Native `ended` and duration-tolerance completion signals converge on `completeCurrent` and its duplicate guard.

## Commands

```text
npm run integrity:check
node --test tests/v141656-playback-state-synchronization.test.js
```

## Focused test result

```text
Tests: 6
Passed: 6
Failed: 0
```

## Production-build limitation

`npm clean-install` could not install the locked dependencies from the sandbox package mirror. The mirror returned HTTP 404 for `xlsx@0.18.5`; a secondary attempt also returned HTTP 404 for `@vitejs/plugin-react@6.0.3`. Because dependencies were unavailable, `vite build` could not be run locally. Cloudflare or another environment with access to the package lock must perform final production compilation.

## Legacy test note

Several older release tests assert their historical version number directly and therefore fail when run against a later release. Those version-locked failures are not functional regressions and were excluded from the focused v1.4.16.56 result.
