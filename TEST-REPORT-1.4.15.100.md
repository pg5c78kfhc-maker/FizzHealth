# Test Report — Fizz Health v1.4.15.100

## Focused release tests
Command: `node --test tests/v1415100-health-editor-labs.test.js`

Result: **4 passed, 0 failed**

Verified:
- One shared Health editor implementation remains.
- Editor uses full-height flex structure and one bounded scroll container.
- Visual Viewport updates CSS height/top variables for keyboard-safe sizing.
- Legacy Health modal/form class names and React viewport geometry are absent.
- Blood Pressure retains separate systolic and diastolic numeric fields.
- Timeline deletion and Undo cover Health metrics.
- Delete remains absent from the Health editor.
- Labs value, unit, and reference range render inside one right-aligned card.
- Unavailable/Not reported uses gray rather than red.

## Project integrity
Command: `npm run integrity:check`

Result: **Passed** — one application root, one package.json, one src tree, and one isolated Menu/Chef implementation.

## Database syntax
Command: `node --check src/database.js`

Result: **Passed**.

## Full existing test suite
Command: `npm test`

Result: **839 tests total: 596 passed, 243 failed**.

The failures include broad pre-existing aggregate-nutrition and legacy source-pattern tests outside this Health/Labs-only release. One prior v1.4.15.98 Labs pattern test also expects the superseded pill/unit/range markup and therefore fails after the approved v1.4.15.100 redesign. The focused v1.4.15.100 tests pass.

## Production build
Command: `npm run build`

Result: **Not completed** — `vite: not found`.

Dependency restoration was attempted with `npm ci`, but the configured registry returned HTTP 404 for `xlsx@0.18.5`. Therefore dependencies could not be restored and no successful production build is claimed.
