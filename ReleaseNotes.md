# Fizz Health v1.4.10.9

FH-1259 introduces **Log Once**, a direct one-time food and meal capture path. Entries save only to Meal Log history with a durable `one_time` source, appear automatically in the unified Health Timeline, contribute to nutrition totals, and support normal delete and Undo behavior without creating Food Database, Recipe, or Pantry records. FH-1259 remains open for AI/photo capture, promotion, conversion, and expanded enrichment workflows.

# Fizz Health v1.4.10.8

FH-1262 begins the Unified Event Architecture reconciliation. The Health timeline now renders meals and measurements through the canonical federated timeline contract. Meal entries support swipe-left Delete, swipe-right Log Again, accessible action buttons, synchronized refresh, and complete Undo restoration. FH-1262 remains open because the universal event contract, immutable audit semantics, filtering, and future event types are deferred.

# Fizz Health v1.4.10.7

This hotfix completes FH-1225 shared keyboard-safe modal behavior and repairs Universal Capture Confirm and save. Save progress and failures are now visible, meal commits are atomic, retries do not create duplicate meals, and FH-1238 meal-date reliability remains included.
