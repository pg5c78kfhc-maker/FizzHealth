# Test Report — Fizz Health v1.4.15.82

## Release-focused regression tests

**16/16 passed** across the inventory releases affected by this consolidation.

Coverage included:
- Blank open-container behavior
- Open-container plus sealed-container behavior
- Food-specific units
- Direct measured inventory
- Blueberries through the actual Fruit Bowl availability path
- Red Onion through the actual Daily Salad availability path
- Exact deduction behavior
- Single-service import verification

## Full test suite

- Tests executed: 798
- Passed: 573
- Failed: 225
- New failures compared with the uploaded v1.4.15.81 baseline: **0**
- The uploaded baseline produced the same 225 pre-existing failures across 794 tests.

## Integrity

Project integrity passed:
- One application root
- One package.json
- One active `src` tree
- One isolated Menu/Chef implementation

## Production build

`npm run build` could not complete because the uploaded source archive does not include installed dependencies and `vite` is unavailable in the execution environment.
