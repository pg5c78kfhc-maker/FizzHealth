# Tracked Consumption Runtime Audit — v1.4.15.90

## Failure location
`src/inventory/service.js` → `servingsForRequest()`.

Before this release, `consumeInventory(row, 1, 'serving')` called `scaleFoodQuantity()` even though the caller had already normalized the request to servings. For a Barebells record whose Food basis is `55 g` and common measure is `1 bar`, and for an Apple record whose basis is `150 g` and common measure is `1 apple`, `serving` could not be converted to the gram basis. `consumeInventory()` returned `ok: false`; the Library transaction threw and rolled back before inserting the Consumed row.

## Corrected contract
When `canonicalUnit(unit) === 'serving'`, the requested number is the required inventory-serving count. No second conversion through the Food gram basis is performed.

## Verified diagnostic models
- Barebells: 13 containers × 1 serving/container; consume 1 serving → 12 containers, `usedServings: 1`.
- Apple: 5 containers × 1 serving/container; consume 1 serving → 4 containers, `usedServings: 1`.
- Barebells consume 2 servings → 11 containers, `usedServings: 2`.

## Runtime callers preserved
Library hard swipe, standard food-log form, Proposed-to-Consumed, edit, delete, and Undo continue to route through the centralized inventory service and adjustment-history mechanism.

## Prepared Recipe inventory
The Inventory tab now allows explicit deletion of one selected prepared batch. The delete is constrained by both Pantry ID and the current Recipe food ID. It does not delete the Recipe and does not restore historical ingredients.

## Limitation
The uploaded source archive does not contain the live PWA database from the phone. Tests used production inventory-service code with records shaped to the reported Barebells and Apple configurations; literal execution against the device database could not be performed in this environment.
