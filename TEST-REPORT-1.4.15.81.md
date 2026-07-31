# Test Report — Fizz Health v1.4.15.81

## Passed
- Release-focused regression tests: **4/4 passed**.
- Live availability calculation: one 150 g Red Onion is available as `1 onion`.
- Live Pantry deduction: consuming `1 onion` reduces the item to zero and marks it Out of Stock.
- Recipe availability and deduction queries include the Food name, serving size, serving unit, and common measure.
- Existing-food enrichment request builds successfully and preserves the selected barcode.
- Project integrity audit passed: one application root, one `package.json`, one `src` tree, and one Menu/Chef implementation.

## Additional regression tests
- 15 of 16 selected existing regression tests passed.
- One older source-text assertion failed because it expects a retired exact `InventoryCard` implementation string. The failure is unrelated to this release's runtime behavior and was present as a brittle structural assertion.

## Build
- `npm run build` reached the Vite build step.
- The production bundle could not be generated because dependencies are not installed in the supplied source archive and `vite` is unavailable in this environment.
- No successful production build is claimed.
