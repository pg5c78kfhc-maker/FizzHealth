# Fizz Health v1.4.15.90 — Test Report

## Focused tests
Passed: 3 / 3

- Barebells: explicit one-serving request reduces 13 to 12.
- Apple: explicit one-serving request reduces 5 to 4 despite a gram-based Food serving definition.
- Two Barebells servings reduce 13 to 11 exactly once.

## Release verification
Passed. Version, build identifier, deployment identifier, VERSION.json, package metadata, release history, service-worker cache version, About metadata, and release notes are consistent at v1.4.15.90.

## Full legacy suite
- Tests: 819
- Passed: 592
- Failed: 227
- New focused failures: 0
- The failing legacy set predates this change and includes stale source-pattern/version assertions and existing aggregate-nutrition failures. No unrelated failures were repaired in this release.

## Production build
Attempted with `npm run build`.

Result: failed before compilation because installed dependencies are absent from the supplied source archive. Exact error: `vite: not found`.

A successful production build is not claimed, and no compiled output was generated.

## Could not test
The phone's live SQLite/PWA database was not included, so the exact on-device Barebells and Apple records and post-restart persistence could not be executed here.
