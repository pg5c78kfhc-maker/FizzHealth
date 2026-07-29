# Fizz Health v1.4.15.32 Test Report

## Focused release verification

- `node --test tests/v141532-pantry-stabilization.test.js`: **5/5 passed**
- `npm run verify:release`: **passed**
- `npm run integrity:check`: **passed**

The focused tests verify:

- Completeness includes retailer and newly added package/product fields.
- Direct quantity-on-hand values are not overwritten by package calculations.
- Pantry cards prioritize product information and apply out-of-stock styling.
- Food and Recipe Promote to Meal remains present with duplicate-prevention state.
- Full Nutrition Record package fields use the responsive aligned grid.

## Full repository suite

- `npm test`: **484 passed / 160 failed**.
- The archive baseline already contains a substantial legacy failure set. The full-suite result is recorded rather than represented as a clean pass.

## Production build

- Not run: the supplied source archive contains no `node_modules`, and dependencies were not available offline in this environment.

## Packaging

- Full-source ZIP integrity: verified with `unzip -t`.
- Changed-source ZIP integrity: verified with `unzip -t`.
