# Fizz Health v1.4.10.12 — FH-1250.2 Interactive Meal Planning

Released: July 20, 2026

## Added
- Tap any Chef recommendation to see why it was selected.
- Swipe right, or tap **Use**, to choose **Eat now**, **Add to today’s plan**, or **Schedule for later**.
- Swipe left, or tap **Not today**, to dismiss a recommendation for the current day and promote the next candidate.
- Planned recommendations contribute to the existing projected macro runway on Home.
- Removed planned meals are recorded as a distinct “not today” signal and are suppressed from immediate re-recommendation.
- Recommendation ranking now favors recipes, familiar foods, prior meal timing, and realistic meal context while blocking common meal components from appearing as standalone meals.

## Changed
- Home now shows only a compact next-meal/day-plan link; full planning remains under Food.
- Chef’s Recommendations now calculates remaining runway after both consumed and planned foods.

## Deferred
- Full multi-item meal composition and side selection.
- Full FH-1261 adaptive-learning controls and long-term model tuning.
- AI/photo nutrition acquisition, JSON meal import, and barcode support.

---

# Fizz Health v1.4.10.11

FH-1250.1 stabilizes Meal Planning 2.0 and relocates full planning and Chef’s Recommendations from Home into the Food workspace. Home retains macros, goal impact, planned nutrition, and the Food Log, with a compact Food Plan summary linking into Food. FH-1250 remains open for composite meals, unified search, Eat Now versus Schedule, and JSON/AI nutrition acquisition.

# Fizz Health v1.4.10.9

FH-1259 introduces **Log Once**, a direct one-time food and meal capture path. Entries save only to Meal Log history with a durable `one_time` source, appear automatically in the unified Health Timeline, contribute to nutrition totals, and support normal delete and Undo behavior without creating Food Database, Recipe, or Pantry records. FH-1259 remains open for AI/photo capture, promotion, conversion, and expanded enrichment workflows.

# Fizz Health v1.4.10.8

FH-1262 begins the Unified Event Architecture reconciliation. The Health timeline now renders meals and measurements through the canonical federated timeline contract. Meal entries support swipe-left Delete, swipe-right Log Again, accessible action buttons, synchronized refresh, and complete Undo restoration. FH-1262 remains open because the universal event contract, immutable audit semantics, filtering, and future event types are deferred.

# Fizz Health v1.4.10.7

This hotfix completes FH-1225 shared keyboard-safe modal behavior and repairs Universal Capture Confirm and save. Save progress and failures are now visible, meal commits are atomic, retries do not create duplicate meals, and FH-1238 meal-date reliability remains included.

## v1.4.10.10
The Food screen now has a clear **Log food** entry point for Food Database items, Recipes, and **Log Once** meals. Pantry inventory creation is now labeled **Add to pantry** to prevent confusion.
