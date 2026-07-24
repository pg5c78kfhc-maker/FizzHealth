# Fizz Health v1.4.11.32 — Promotion Uniqueness & Meal Deletion

Released: July 24, 2026

Completed story: FH-1328 through FH-1330

- FH-1328: Promotion now records a durable Food/Recipe source link and blocks a second active Meal from the same source, including rapid double taps and stale screens.
- FH-1329: Swipe-left Delete on the Meals list now archives the selected Meal, removes it from Meals and the Meal Planner, and refreshes the list immediately.
- FH-1330: Removing the promoted Meal restores Promote to Meal on the original Food or Recipe.
- Existing duplicate Meals are not deleted automatically; remove the unwanted copy with the repaired Delete action.

# Fizz Health v1.4.11.31 — Classified Meal Promotion Activation

Released July 24, 2026. Build 141131. Deployment FH-20260724-141131.

## Completed

Completed story set: FH-1325 through FH-1327 and FH-1334.

- FH-1325 — Food Consumption Role classification remains available and persistent.
- FH-1326 — Food promotion opens the shared classified Meal editor.
- FH-1327 — Recipe promotion opens the same shared classified Meal editor.
- FH-1334 — Corrected the promotion editor stacking layer so it renders above Food and Recipe information pages rather than invisibly beneath them.

## Promotion behavior

The shared editor opens with the source name prefilled, category set to Any, and no autofocus. Confirmation creates a categorized Meal definition and source component without logging consumption, planning an occurrence, or changing Pantry.
