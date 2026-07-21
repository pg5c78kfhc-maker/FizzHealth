# Fizz Health v1.4.10.21 Reconciliation

## Release
Unified AI Food Exchange & Restaurant Stability

## Implemented scope

### Add Food actions
- Replaced the oversized Log Once launcher with compact **+ New Food** and **⚡ Log Once** actions.
- Existing foods remain the primary content of the Add Food screen.

### One AI Exchange workspace
- Added one user-facing AI Exchange workspace shared by new-food creation and one-time meal estimation.
- New Food supports package photos, a food photo, or a text description.
- Log Once creates only a consumed meal event and never creates a reusable Food, Recipe, Pantry item, or restaurant menu item.
- Existing-food enrichment continues through the same clipboard/request/review pattern.
- ChatGPT responses are read from the clipboard and routed to an all-or-nothing review.

### Photo-estimated nutrition and provenance
- Visual and restaurant estimates are clearly distinguished from verified label evidence.
- Accepted records retain lightweight source, confidence, completeness, evidence-quality, and portion-assumption context.
- Original photos are not stored.
- Outbound and inbound exchange JSON are not retained for newly created foods or one-time meals.
- Existing-food audit sessions no longer retain outbound or inbound JSON payloads.

### Restaurant stability
- Restaurant detail selection now uses resilient optional queries for profiles, menu meals, visits, and daily totals.
- Restaurant ranking failures degrade to an empty ranked list rather than crashing the page.
- The entire Restaurants route is protected by an error boundary.
- Restaurant back navigation returns to Food rather than creating a dead end.

## Validation
- 209 automated tests passed.
- Release metadata verification passed.
- Production build completed successfully.
- Database schema remains v44.

## Deferred
- Specialized restaurant AI creation/import approval screens remain the next release area.
- JavaScript bundle code-splitting remains a non-blocking performance improvement.
