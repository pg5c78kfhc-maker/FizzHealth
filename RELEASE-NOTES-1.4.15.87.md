# Fizz Health v1.4.15.87 Release Notes

Issued: 2026-07-31  
Build: 141587  
Deployment: FH-20260731-141587

## Changes

- Restored Pantry deduction for the Library hard-swipe quick-consume path.
- Quick-consume now records Pantry adjustment history so delete and Undo can restore inventory correctly.
- Tracked Pantry foods now fail visibly instead of creating a Consumed record when inventory deduction cannot be completed.
- Added explicit deletion of individual Prepared Recipe inventory records, including legacy zero-weight records.
- Deleting a legacy prepared record does not restore ingredient inventory.
- Kept the Add Food / Recipe Contents and Prepared Recipe forms above the persistent footer.
- Preserved the existing positive-weight requirement for newly created prepared batches.

## Scope discipline

No barcode, shopping, nutrition, inventory-model, or unrelated UI changes were included.
