# Prepared Recipe Runtime Audit — v1.4.15.85

## Confirmed root cause

The Prepared Recipe deduction loop previously did this when `consumeInventory()` failed for a matched Pantry row:

`if (!consumed.ok) continue;`

It then exited the ingredient loop without verifying that the remaining required quantity reached zero. This allowed a failed conversion/deduction to be silently ignored and made the final behavior dependent on the underlying Pantry row structure.

## Correction

The batch-preparation path now:

1. Loads candidate Pantry records with Food serving identity.
2. Computes availability through `inventoryAvailableQuantity()`.
3. Calls `consumeInventory()` with caller `Batch preparation` and the active Recipe ID.
4. Aborts immediately if a matched row cannot be consumed.
5. Requires a positive, finite `consumed.used` value.
6. Updates the Pantry record by stable `pantry_id`.
7. Subtracts the quantity actually reported as consumed—not the requested estimate.
8. Verifies the ingredient's remaining requirement is zero before continuing.
9. Creates the prepared Pantry record only after every tracked ingredient passes.

## Runtime callers involved

- Recipe availability: centralized inventory service.
- Prepared Recipe validation: centralized inventory service.
- Prepared Recipe deduction: centralized inventory service.
- Pantry persistence: transaction remains atomic; a thrown deduction error prevents prepared-batch creation.

## Red Onion diagnostic scenario

Input tested through the production inventory service:

- Food ID: `F-ONION`
- Inventory record ID: `P-ONION`
- Recipe ID: `R-DAILY-SALAD`
- Requested quantity/unit: `150 g`
- Serving size/unit: `150 g`
- Servings per container: `1`
- Containers in stock: `1`
- Open-container servings: `0`
- Computed available servings: `1`
- Computed available quantity: `150 g`
- Decision: Available
- Actual deducted amount: `150 g`
- Remaining inventory: `0 g` / `0 containers`
- Final Pantry status: Out of Stock

## Daily Salad result

The corrected path permits Daily Salad preparation when its live Red Onion row resolves to the values above. It deducts exactly one 150 g onion serving. If the installed database contains a conflicting field, the form now reports the exact ingredient, Pantry record, and remaining quantity instead of silently continuing.

## Form/runtime visibility corrections

- Save errors appear immediately below the sticky header.
- The form shell ends above the persistent footer and safe-area inset.
- The Save checkmark is green while available and gray only while saving.
- Repeated taps remain blocked by the existing `saving` guard.

## Live-database limitation

The installed PWA's SQLite database was not included in the uploaded source archive. Literal execution against the user's current Daily Salad and Red Onion rows was therefore unavailable in this environment. No claim of live-device database execution is made.
