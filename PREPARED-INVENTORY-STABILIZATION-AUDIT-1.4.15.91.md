# Prepared Inventory Stabilization Audit — v1.4.15.91

## Fiber target contract

The live target loader reads `nutrition_targets` together with the latest applicable `target_history` record. Migration 97 updates both sources:

- target: 30 g
- maximum: 40 g
- derived: disabled
- override target: 30 g
- override maximum: 40 g
- formula: fixed daily target / maximum
- effective date: 2026-08-01

This prevents the former body-weight-derived 102 g target from reappearing through either current configuration or dated history. Consumers such as Nutrition, Decision Intelligence, Daily Brief, LDL guidance, Chef's Picks, and meal analysis already use the centralized `getTargets()` result.

## Prepared inventory deletion

Both modern Recipe inventory presentations expose deletion of the selected Pantry batch. The transaction:

1. asks for confirmation;
2. deletes event history tied to the selected `pantry_id`;
3. deletes only that Pantry row and verifies the Recipe-linked `food_id` where available;
4. leaves the Recipe, other batches, and ingredient inventory unchanged.

Legacy zero-weight rows are included because prepared batch queries do not filter out zero quantity.

## Invalid prepared-record prevention

Before any ingredient deduction or Pantry insert, the production save path now requires:

- actual prepared weight greater than zero;
- prepared batch count of at least one;
- a valid Recipe serving weight convertible to grams;
- calculated available servings greater than zero.

The existing database transaction continues to wrap ingredient deduction, prepared-food synchronization, Pantry insertion, verification, and event creation. A failed operation therefore does not commit a new prepared batch.

## Footer containment

The approved creation overlays now reserve the persistent bottom-navigation area and confine scrolling to their internal content panes:

- Add Food / Recipe Contents (`component-picker-backdrop`);
- Recipe creation/editing (`recipe-create-modal`);
- Prepared Recipe batch form (`recipe-pantry-batch`).

The selectors use the configured bottom-nav height and iPhone safe-area inset. No unrelated layout was changed.

## Verification

- v1.4.15.91 focused tests: 5 passed, 0 failed.
- v1.4.15.90 tracked-consumption regression tests: 3 passed, 0 failed.
- Release metadata verification: passed.
- Full inherited suite: 597 passed, 227 failed. The 227 failures are inherited/stale failures also present in the baseline family; no new failure was identified by the focused comparison.
- Production build attempted: failed before compilation because `vite` is not installed in the supplied source archive (`vite: not found`).
- Device-only visual behavior and the user's live PWA database could not be executed in this container.
