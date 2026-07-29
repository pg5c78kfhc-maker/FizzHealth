# Fizz Health v1.4.15.39 — Inventory Integrity Runtime Path Corrective

## Stories

- FH-1415.39A — Correct count-based serving decrements so one apple subtracts one apple, never the food’s 125 g serving size.
- FH-1415.39B — Route live add, edit, delete, undo, redo, quick-consume, meal, and recipe inventory changes through the canonical transaction functions.
- FH-1415.39C — Record actual deducted quantities plus before/after inventory snapshots and prevent duplicate adjustment rows.
- FH-1415.39D — Verify the deployed entry point is `/src/main.jsx` and that the archive contains one active source tree and one active main page.

## Critical correction

The prior release changed helper code but left active Food Log handlers that directly modified Pantry. This release removes that bypass and tests the exact 5 apples → consume 1 → 4 → delete → 5 workflow.
