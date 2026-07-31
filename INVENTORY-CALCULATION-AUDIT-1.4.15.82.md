# Inventory Calculation Audit — v1.4.15.82

## Authoritative implementation

`src/inventory/service.js` is now the only active implementation for:
- Inventory normalization
- Available servings
- Available quantity in a requested unit
- Ingredient sufficiency
- Inventory deduction

## Redirected callers

- `src/inventory/availability.js`
  - Food availability
  - Recipe ingredient sufficiency
  - Recipe availability
  - Meal availability
- `src/main.jsx`
  - Recipe readiness
  - Prepared-recipe ingredient deduction
  - Library availability counts
  - Menu availability counts
  - Shared consumption path
- `src/inventory/quantity.js`
  - Compatibility exports only; no formulas remain

## Defect identified

Some legacy Pantry rows contained `package_count` and `servings_per_package` but did not contain `package_type`. The previous implementation treated those rows as directly measured inventory. A Blueberries record with one container could therefore be interpreted as `1 g` instead of one 100 g serving and rounded to zero servings.

The centralized service now treats an explicit `package_count` as authoritative container inventory even when the legacy `package_type` field is blank.

## Verified scenarios

- One Blueberries container × one serving/container = one 100 g serving available.
- Fruit Bowl availability accepts that Blueberries inventory.
- One Red Onion container × one serving/container = one onion available.
- Daily Salad availability accepts `1 onion` against a 150 g serving definition.
- Deduction of one onion sets the container count to zero.
- Legacy measured packages continue to include open contents and sealed containers.
- Ordinary measured inventory continues to convert directly.
