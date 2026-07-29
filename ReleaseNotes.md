# Fizz Health v1.4.15.37 — Inventory Consumption and Shopping Image Corrective

## Stories

- FH-1415.37A — Resolve Pantry records and decrement linked inventory whenever a Food becomes Consumed.
- FH-1415.37B — Persist Pantry adjustment identifiers and deltas so delete and undo restore inventory correctly.
- FH-1415.37C — Add observable product-image discovery, saved fetch status, and Refresh Images to Shopping.
- FH-1415.37D — Make Shopping retailer groups collapsible.

## Image retrieval note

Retailer sites may block browser-side metadata access. The Shopping page now reports whether an image loaded, was not found, or was blocked, while preserving the working retailer deep link.
