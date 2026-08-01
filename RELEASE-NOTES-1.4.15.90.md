# Fizz Health v1.4.15.90 — Release Notes

## Purpose
Repair tracked-food consumption from the Library and complete the approved prepared-inventory deletion control.

## Confirmed root cause
The hard-swipe path correctly sent `1 serving`, but the centralized inventory service attempted to convert the literal unit `serving` through each Food's stored serving basis. Foods such as Barebells and Apple store a gram basis (for example, 55 g or 150 g) with a common measure such as `1 bar` or `1 apple`. That conversion returned unresolved, causing tracked consumption to abort before the meal row was inserted. Coffee succeeded because it did not enter the tracked Pantry deduction branch.

## Changes
- An explicit `serving` request is now treated as an already normalized inventory-serving count.
- Container inventory deducts one unit for one requested serving, even when the Food nutrition basis is grams.
- Existing atomic transaction behavior, adjustment history, delete, and Undo paths are preserved.
- Added deletion of an individual prepared Recipe inventory record, including legacy zero-weight rows, with confirmation and without ingredient restoration.
- Retained the existing prevention of new zero-weight prepared batches and footer containment rules.
