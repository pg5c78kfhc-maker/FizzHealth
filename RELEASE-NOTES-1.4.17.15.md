# Fizz Health v1.4.17.15 — Compact Workout Cards

## Scope
This focused UI correction applies the previously established compact expandable-card pattern to workout/routine cards.

- Workout/routine text and metadata use the available horizontal width instead of reserving a narrow content column.
- Completed and incomplete workout cards wrap less and consume less vertical space.
- The expand/collapse chevron is centered on the bottom edge of every workout card, pointing down when collapsed and up when expanded.
- Existing edit, reorder, add-exercise, completion, End Workout, Export/Import calorie-estimate, swipe-delete, and nested exercise behavior is unchanged.
- No database changes. Schema remains 146.

## Stories
- FH-17115.1 — Full-width workout-card copy
- FH-17115.2 — Compact workout-card vertical layout
- FH-17115.3 — Bottom-edge workout disclosure chevrons
- FH-17115.4 — Preserve workout behavior while changing presentation only
