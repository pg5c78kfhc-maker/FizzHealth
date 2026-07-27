# Fizz Health v1.4.14.4B

## Canonical Menu Classification Corrective

Completed stories: FH-1414.11B / FH-1414.12B

### FH-1414.11B
- Reclassification now offers only the canonical Fizz meal classifications defined by the application database model.
- Restaurant-specific menu sections remain unchanged and continue to organize the source restaurant menu.
- Restaurant reclassification writes the normalized Fizz classification to `primary_category` rather than overwriting the restaurant's original `category` section.
- Added **No Classification** so an incorrect normalized classification can be removed deliberately.
- Removed restaurant-derived, free-text, singular/plural duplicate, and “New category” choices from the Menu classification picker.

### FH-1414.12B
- Strengthened Fizz and restaurant category headers with heavier type, higher contrast, dedicated header backgrounds, counts, and visible chevrons.
- Expanded and collapsed states now read clearly as interactive section controls rather than food cards.

Schema remains version 66; no database structure change was required.
