# Workflow Stability Audit — v1.4.15.105

## Restaurant rename defect

Root cause: `restaurant_meals.restaurant_name` was used as a presentation/grouping value even after the canonical `restaurants.name` changed.

Correction:
- Menu and recommendation queries join `restaurants` by `restaurant_id` and prefer the canonical name.
- Profile save updates retained denormalized restaurant names and active future Proposed rows.
- Migration 104 repairs existing stale rows without changing restaurant IDs or historical nutrition records.

## Food Log duplicate defect

Root cause: “Log again” copied the original `source` and `source_record_id`, violating the unique source index.

Correction:
- each duplicate receives `source='user-duplicate'` and a new event-specific `source_record_id`;
- food, amount, nutrition snapshot, meal service, notes, and inventory behavior remain intact;
- database errors are no longer shown directly to the user.

## Footer/safe-area containment

Affected workflows now use the visible viewport above the persistent footer. Their content uses a bounded scroll container with bottom scroll padding, preventing final actions and list rows from sliding under navigation.

## Barcode inventory quick add

Known-barcode Food detail shows `+1` before the pencil when a Pantry record exists. Count-based inventory increases by one and records an `inventory_add` event. Weight/volume-based records open the Inventory editor rather than guessing a quantity.
