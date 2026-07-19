# Definition of Done — FH-1069

- Calculates a standardized inventory-pressure score for each verified pantry item.
- Uses expiration proximity, open/thawed state, storage, servings remaining, preferred serving frequency, and recorded waste risk.
- Treats expired inventory as a safety exception and does not elevate it as a consumption recommendation.
- Feeds inventory pressure into Chef's Recommendations and Forward Meal Planner ranking.
- Displays pressure status in forward-planner rows.
- Automated tests cover expiration, open/thawed priority, serving surplus, safety handling, and planner integration.
- Full test, release verification, and production build pass.
