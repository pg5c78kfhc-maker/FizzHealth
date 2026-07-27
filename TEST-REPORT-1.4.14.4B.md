# Test Report — Fizz Health v1.4.14.4B

## Current-release acceptance suite
File: `tests/v14144b-menu-classification.test.js`

Result: **5 passed, 0 failed**

Coverage:
1. Current v1.4.14.4B release identity and unchanged schema 66.
2. Reclassification picker uses only canonical Fizz meal categories.
3. Restaurant source sections are preserved during Fizz reclassification.
4. Foods, recipes, Meals, and restaurant items support explicit unclassification.
5. Collapsible category controls have a stronger visual hierarchy.

## Inherited corrective assertions
The four non-version-specific tests in `tests/v14144a-menu-corrective.test.js` continue to pass:
- Information view footer-safe layout and user-facing values.
- Category editor viewport clamping.
- Compact, fully revealable swipe actions.
- Light Menu contrast, responsive width, rounded containers, and reachable filters.

The historical v1.4.14.4A identity assertion correctly fails against v1.4.14.4B because it hard-codes the superseded release number; it is not a current-release defect.

## Release verification
- `npm run integrity:check`: PASS
- `npm run verify:release`: PASS

## Build verification
- `npm run build`: NOT COMPLETED
- Reason: Vite executable absent from the supplied archive (`vite: not found`).
