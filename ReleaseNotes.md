# Fizz Health v1.4.11.16 — Robust JSON Exchange

**FH-1482 through FH-1486**

- Generates stricter ASCII-only, raw-JSON instructions and prefilled machine templates.
- Accepts arrays and objects directly for `*_json` fields and serializes them safely for storage.
- Repairs smart quotes, code fences, clipboard wrapping, BOMs, line endings, and trailing commas.
- Separates JSON syntax parsing from exchange-schema validation with field-aware diagnostics.
- Preserves the validated import preview and explicit approval step before database writes.

# Fizz Health v1.4.11.15

## Restaurant-Aware Meal Planning Prototype

Version: 1.4.11.15  
Build: 141250  
Deployment: FH-20260723-141250  
Date: July 23, 2026

### Completed

- FH-1478 — Added an independent Beverage occasion before Snack while retaining beverages as optional components of breakfast, lunch, and dinner.
- FH-1479 — Added the complete saved Meal catalog below the planning slots so any eligible saved Meal can be assigned to a date and occasion.
- FH-1480 — Added a persistent, date-specific Restaurant toggle shared with the Home screen, automatic restaurant-capacity reservation, and restaurant-day indicators on calendar dates.
- FH-1481 — Added starred restaurant-meal choices and support for multiple restaurant meals, multiple restaurant occasions, and different restaurants on the same date. Specific selections replace estimated restaurant capacity instead of being added on top of it.

### Planning behavior

Turning Restaurant on creates an 800-calorie provisional restaurant reservation for the selected date. The separate Reserve Capacity button has been removed. Selecting starred restaurant meals replaces available provisional capacity one reservation at a time, while additional restaurant selections remain supported after the reservation is exhausted.

Completed story: FH-1478 through FH-1481
