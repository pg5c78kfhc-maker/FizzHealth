# Test Report — Fizz Health v1.4.15.95

## Focused release tests

**Passed: 5 / Failed: 0**

Validated:

- v1.4.15.95 release metadata.
- Standard single-title Health landing header and removal of `Morning check-in`.
- Labs card and stored-lab summary integration.
- `visualViewport`-driven Health editor sizing.
- Removal of form-level reading deletion.

Command:

`node --test tests-release/release-1.4.15.95.test.js`

## Release verification

**Passed.**

`npm run verify:release` confirmed v1.4.15.95, build `141595`, deployment `FH-20260801-141595`, About-screen bindings, package metadata, service-worker cache, engine version, and current release history.

## Full inherited test suite

- Passed: **593**
- Failed: **241**
- New failures attributable to this release: **0 identified**
- Pre-existing/stale failures: **241**

The inherited suite contains long-standing nutrition aggregation assertions, stale version-specific assertions, and source-pattern tests from prior releases. The focused v1.4.15.95 tests all passed.

## Production compilation

**Attempted; unsuccessful.**

`npm run build` completed the integrity repair, then stopped with:

`sh: 1: vite: not found`

The supplied source archive does not include installed dependencies. A successful production compilation is not claimed.

## Not testable here

- Physical iPhone keyboard animation and browser visual-viewport behavior.
- Live interaction with the user's persisted laboratory database.
- Touch-target behavior on the deployed PWA.

These require deployment/device validation.
