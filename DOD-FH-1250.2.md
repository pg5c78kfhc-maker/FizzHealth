# Definition of Done — FH-1250.2 Interactive Meal Planning

## Delivered

- Chef recommendations support tap-to-explain.
- Swipe left dismisses a recommendation for the current day.
- Swipe right opens the recommendation action flow.
- Visible **Not today**, **Why?**, and **Use** buttons provide non-swipe alternatives.
- Accepted recommendations can be reviewed for immediate consumption, added to today’s plan, or scheduled later.
- Planned recommendations are stored in `planned_meals` and therefore contribute to the existing projected macro bars and remaining runway.
- Removing a planned meal records `planned_meal_removed`; dismissing a suggestion records `recommendation_dismissed`.
- Removed and dismissed candidates are suppressed for the rest of the day without deleting the underlying food, recipe, or recommendation knowledge.
- Recommendation ranking favors recipes, historical use, and matching meal time.
- Common components such as psyllium, creamer, dressings, sauces, seasonings, and supplements are blocked as standalone meal recommendations.
- Home planning UI is reduced to a compact next-meal/day-plan link.

## Testing

- Existing automated regression suite passes.
- FH-1250.2 regression tests cover interaction vocabulary, lifecycle states, recommendation guardrails, and Home placement.
- Release verification succeeds.
- Production build succeeds.

## Deferred

- Full multi-item meal composition.
- Side-dish and ingredient-level meal builder.
- Complete FH-1261 adaptive-learning controls and long-term weighting.
- AI/photo nutrition acquisition.
- JSON meal import.
- Barcode support.
- Final Food workspace redesign.

FH-1250 remains **OPEN** until deferred scope is completed.
