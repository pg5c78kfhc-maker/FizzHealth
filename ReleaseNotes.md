# Fizz Health v1.4.14.1 — Menu Navigation Foundation

## Delivered stories

### FH-1414.1 — Swipe Navigation Framework
- Partial right swipe stops and exposes the Add button.
- Hard right swipe opens the same Add to Meals workflow.
- Left swipe continues to expose Favorite.
- Only one Menu item can remain swiped open at a time.
- Vertical scrolling remains independent from horizontal gestures.

### FH-1414.2 — Add to Meals Workflow
- Adds a focused full-screen multi-select workflow.
- Available containers: Breakfast, Lunch, Dinner, Snack, and Beverage.
- Existing assignments are preselected.
- X closes without saving.
- Checkmark saves the final set of assignments.
- Items can be assigned to one or multiple containers.

### FH-1414.9 — Favorite Synchronization
- The card star and swipe star use the same persisted preference state.
- Updating either star updates the other immediately.
- Restaurant Menu favorites use the same preference source.

### FH-1414.10 — Chef's Picks Default State
- Chef's Picks now starts collapsed.

## Preserved behavior
- Restaurant Day
- Chef and Decision Intelligence ranking
- Menu presentation established in v1.4.13.9A
- Planned-meal containers and existing removal/lock controls
