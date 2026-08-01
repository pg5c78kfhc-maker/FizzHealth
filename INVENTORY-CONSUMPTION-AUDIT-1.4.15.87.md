# Inventory Consumption Audit — v1.4.15.87

## Confirmed root cause

The Library hard-swipe action called `quickConsume()`. In v1.4.15.86 that function inserted a row into `meals`, but it did not call `applySourceInventoryConsumption()` and did not create `meal_pantry_adjustments` history.

Therefore a food could appear in Consumed while its Pantry count remained unchanged. Undo also had no inventory adjustment to restore.

## Corrected path

The Library quick-consume path now:

1. Resolves the selected Food, Recipe, or Meal.
2. Calls the centralized `applySourceInventoryConsumption()` service.
3. Refuses to create a Consumed record when a tracked Food cannot be deducted.
4. Stores the Pantry ID and deduction amount on the meal snapshot.
5. Records all Pantry adjustments in `meal_pantry_adjustments`.
6. Dispatches an inventory-change event and refreshes the Library.
7. Uses the existing restoration path for Undo and deletion.

## Barebells acceptance scenario

Expected live behavior:

- Starting availability: 13 servings.
- Hard-swipe one Barebells Protein Bar to Consumed.
- Pantry deduction: 1 serving.
- Ending availability: 12 servings.
- Undo restores availability to 13.
- Deleting the consumed record restores availability to 13 when the recorded adjustment is still applicable.

## Prepared Recipe records

Individual prepared Pantry records are now listed even when their quantity is zero. Each record has an explicit delete control.

Deletion rules:

- Deletes only the selected Pantry record and its Pantry event history.
- Does not delete the Recipe.
- Does not alter other prepared batches.
- Does not restore ingredients for legacy records.
- Requires confirmation.

## Form containment

The Add Food / Recipe Contents, universal logging, Recipe creation, and Prepared Recipe overlays are constrained to the visual viewport above the persistent footer and safe-area inset.
