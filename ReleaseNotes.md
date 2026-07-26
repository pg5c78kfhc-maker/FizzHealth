# Fizz Health v1.4.14.2 — Planner and Proposed Synchronization

- **FH-1414.3** — Planner assignments are the single source for Food Log Proposed entries. Consuming a proposed item removes it from both the planner and Proposed and creates one timestamped Consumed record.
- **FH-1414.4** — Future plans automatically become today's Proposed entries at local midnight or the next time the app opens.
- **FH-1414.5** — Restaurant Day creates an 800 kcal Dinner reservation placeholder, keeps it in Proposed, and replaces it when an actual restaurant meal is planned or consumed.
- **FH-1414.6** — Menu calendar indicators are derived directly from current planned rows and disappear when the last planned item is removed.
- **FH-1414.3A** — Consumed records preserve the original meal occasion and planned-record lineage for future analytics without remaining visible in the planner.
- Saving the Add to Meals screen with no destinations now removes all existing assignments for that item.
- Restaurant reservation placeholders cannot be consumed as though they were actual meals.

Schema remains version 65; no database migration is required.

# Fizz Health v1.4.14.1A — Add to Meals Navigation Corrective

- Keeps the Add to Meals workflow in place over the Menu instead of routing back to the Nutrition landing page.
- Places the modal X and checkmark above the Menu header so those controls receive the tap.
- Clamps the destination buttons below the fixed calendar.
- Keeps Breakfast, Lunch, Dinner, Snack, and Beverage available.
- Saves selected assignments before returning to the same Menu position.
- X cancels without changing assignments and returns to the same Menu position.

# Fizz Health v1.4.13.8A — Menu UX Corrective Rebuild

## Completed scope

- **FH-1413.8A1** — Renamed Chef Recommendations to **Chef's Picks** and added **Powered by AI**.
- **FH-1413.8A2** — Standardized serif collapsible headings and moved item counts to the right beside the chevron.
- **FH-1413.8A3** — Removed priority and navigation arrows, widened menu copy, narrowed the nutrition column, and stacked calories and protein.
- **FH-1413.8A4** — Anchored bottom navigation while preserving calendar, Restaurant Day, planning, tap-to-add, swipe, Chef, and Decision Intelligence behavior.

Schema remains version 64; no database migration is required.
