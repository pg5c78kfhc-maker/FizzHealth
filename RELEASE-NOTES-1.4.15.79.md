# Fizz Health v1.4.15.79

## Recipe unit conversion

- Food-specific recipe units now resolve through the Food serving definition.
- Examples: `1 onion` uses the Red Onion serving size; `2 apples`, `3 eggs`, and `1 sandwich` scale the same way.
- The shared conversion is used by recipe nutrition, batch preparation, prepared-recipe creation, and Pantry ingredient deductions.
- Existing gram-based and common-measure conversions are unchanged.

## Library barcode lookup

- Added a barcode scan button immediately to the right of the Library search field.
- Reuses the existing camera, photo, and manual barcode scanner.
- Known barcodes open the matching Food Detail record.
- Unknown barcodes open the existing New Food workflow with the scanned barcode prefilled.
- Existing barcode records are checked before creation to prevent duplicates.

## Constraints

- No database schema changes.
- No unrelated wording or layout changes.
