# Test Report — Fizz Health v1.4.15.102

## Focused release tests
Command:

`node --test tests-release/release-1.4.15.102.test.js`

Result: **4 passed, 0 failed**.

Verified:
1. Exact Labs threshold markers are rendered from stored lower and upper bounds.
2. Consumed and Proposed foods are excluded from recommendation candidates.
3. Category balancing, protein rotation, and recent-recommendation history are present.
4. Latest stored laboratory values influence ranking without blanket food exclusion.

## Project integrity
Command:

`npm run integrity:check`

Result: **Passed**. One application root, one package file, one source tree, and one isolated Menu/Chef implementation were detected.

## JavaScript syntax
`node --check src/database.js` passed.

The Node runtime does not directly syntax-check `.jsx` files without the project build tool. The focused tests loaded and inspected the updated JSX source, but this is not equivalent to a successful Vite compile.

## Existing full regression suite
Command:

`npm test`

Result:
- Total: 843
- Passed: 598
- Failed: 245

The broad failures include legacy expectations across unrelated historical releases. They were not represented as successful and remain documented by the test output.

## Production build
Command:

`npm run build`

Result: **Failed — environment/tooling unavailable**.

Exact failure:

`sh: 1: vite: not found`

The prebuild project-integrity repair completed successfully before the missing Vite executable stopped the build. No successful production build is claimed.
