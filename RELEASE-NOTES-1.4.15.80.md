# Fizz Health v1.4.15.80

## Unknown Barcode Resolution

- Unknown Library barcodes no longer open New Food automatically.
- Added a focused Barcode Not Found resolver.
- Users can search current Food records and attach the scanned barcode to the selected food.
- Existing barcode assignments are protected from accidental reassignment.
- Users can explicitly continue to New Food with the scanned barcode preserved.
- Cancel returns to the Library without saving the barcode.
- Reuses the existing Library scanner and existing barcode match presentation.

## Release constraints

- No unrelated UI changes.
- No inventory changes.
- No AI Exchange changes beyond passing the scanned barcode into New Food.
