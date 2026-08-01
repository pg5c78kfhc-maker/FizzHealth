# Test Report — Fizz Health v1.4.15.97

## Focused release tests

**Passed: 6 / Failed: 0**

Verified:

- v1.4.15.97 metadata and build identifiers.
- Exactly one `.health-editor-backdrop`, `.health-editor`, and `.health-editor-scroll` definition remains.
- The authoritative editor shell uses the live visual viewport and one internal vertical scroller.
- Legacy Health editor sizing variables, 220/260 px keyboard padding, and Health-path `touch-action: none` are absent.
- Labs renders year tabs, draw-date tabs, aligned result rows, and range-state evaluation.
- Green/black, red/white, and gray value treatments are present.
- Partial panels omit absent tests rather than inventing values.

## Full inherited test suite

- Passed: **593**
- Failed: **241**
- New failures attributable to this release: **0 identified**
- Pre-existing/stale failures: **241**

The inherited failures were already present in the v1.4.15.96 baseline and include stale source-pattern assertions and aggregate-nutrition expectations unrelated to this release.

## Release verification

**Passed.** `npm run verify:release` confirmed package, UI, decision-engine, service-worker, About-screen, `VERSION.json`, and release-history metadata alignment.

## Production compilation

A normal production build was attempted with `npm run build`.

**Result: not completed.** The build stopped at `vite: not found` because dependencies are not installed. An installation attempt was also made, but the configured package registry returned HTTP 404 for `xlsx-0.18.5.tgz`.

No successful production build is claimed.

## Could not be tested

A real iPhone Safari keyboard session is not available in this environment. The exact live keyboard geometry therefore requires deployment verification. Static acceptance proves that the previously competing rules were deleted and only one bounded viewport implementation remains; it does not substitute for physical-device confirmation.
