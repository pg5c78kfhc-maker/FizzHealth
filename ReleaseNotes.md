# Fizz Health v1.4.15.30 — Pantry Reconciliation Product Fields

Release ID: FH-20260728-141530  
Build: 141530  
Schema: 77  
Issued: 2026-07-28

## Delivered

- FH-1415.30A — Preferred Retailer field with editable suggestions from Pantry history.
- FH-1415.30B — Brand and Company / Manufacturer fields on the Full Nutrition Record.
- FH-1415.30C — Package size and servings-per-package persistence.
- FH-1415.30D — Multiple barcode links per canonical food without overwriting prior barcodes.

## Preservation

Historical food, meal, Pantry, and barcode records remain intact.

---

# Fizz Health v1.4.15.29 — iPhone Barcode Camera Corrective

## Completed scope

- **FH-1415.29A** — The barcode scanner now requests iPhone camera permission and attaches the live rear-camera stream to the scanner preview.
- **FH-1415.29B** — Added an in-app UPC-A/EAN-13 decoder for iPhone Safari when the browser BarcodeDetector API is unavailable.
- **FH-1415.29C** — Added visible camera startup, permission-denied, unavailable-camera, and retry states instead of leaving a silent black scanner panel.

## Scope controls

No changes were made to barcode matching, food creation, Pantry reconciliation logic, Shopping, Menu, Meals, Chef, or unrelated UI.
