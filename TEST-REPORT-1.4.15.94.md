# Test Report — Fizz Health v1.4.15.94

## Focused release tests

**6 passed / 0 failed**

Verified:

- v1.4.15.94 release metadata.
- Dismissible Health metric popover and removal of the inline panel.
- Independent card and information-button interactions.
- Standard X/checkmark editor header actions.
- Viewport, safe-area, footer, and keyboard-aware editor styling.
- Reading-specific Delete behavior remains present and scoped.

## Release verification

**Passed.** Centralized version, build, deployment, About bindings, service-worker cache, decision-engine version, release history, and release notes are consistent.

## Project integrity

**Passed.** One application root, one package manifest, one source tree, and one isolated Menu/Chef implementation.

## Full inherited test suite

- Passed: **594**
- Failed: **240**
- New failures attributable to v1.4.15.94: **0 identified**
- Pre-existing/stale failures: **240**

The inherited suite already contains unrelated aggregate-nutrition expectations and stale source-shape/version assertions. The focused v1.4.15.94 tests passed.

## Production build

The normal production command `npm run build` was attempted.

Result: **not completed**.

- `npm install` was attempted first but the configured package registry returned `404 Not Found` for `xlsx-0.18.5.tgz`.
- The build then stopped with `vite: not found` because dependencies were not installed in the supplied source archive.

A successful production build is not claimed.

## Runtime limitations

The iPhone keyboard and visual popover placement could not be physically exercised in this container. The release was verified through source-level focused tests, existing project tests, release verification, and viewport/safe-area CSS inspection.
