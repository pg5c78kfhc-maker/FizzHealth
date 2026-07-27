# Fizz Health v1.4.15.11 Test Report

## Release-specific verification

**PASS — 5/5 tests**

Command:

`node --test tests/v141511-pantry-serving-decrement-corrective.test.js`

Verified:

- Logged servings are converted through the canonical enriched serving size and serving unit before Pantry decrement.
- Package count, unopened-package count, and open-package remainder stay synchronized.
- Discontinued records remain hidden by default but can be included, edited, and restored.
- Product-enrichment requests preserve serving size and servings-per-container context.
- Central release identifiers and schema version are current.

## Project integrity

**PASS**

`npm run integrity:check`

One application root, one package file, and one source tree were confirmed.

## Centralized release verification

**PASS**

`npm run verify:release`

Verified v1.4.15.11, build 141511, deployment FH-20260727-141511, completed story FH-1415.53, and schema 72.

## Repository test suite

**456 passed; 125 failed; 581 total**

The failures are pre-existing or historical assertions covering superseded release identities and retired behavior. The new v1.4.15.11 release-specific tests pass. The complete console output was reviewed and no failure was represented as a pass.

## Production build

**NOT EXECUTED — dependency unavailable**

The supplied source archive contains no installed `node_modules`, and `vite` is not available in the execution environment. `npm run build` reached the Vite invocation and stopped with `vite: not found`.
