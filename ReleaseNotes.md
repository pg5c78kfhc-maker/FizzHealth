# Fizz Health v1.4.10.36

## Critical Recipe and Enrichment Repair

- Resolves recipe ingredients by Food ID first and rejects ambiguous name-only matches.
- Converts compatible recipe units before scaling all registered nutrients, including caffeine.
- Stores compact recipe meal snapshots and prevents blank-screen failures when a recipe cannot be resolved.
- Serializes structured enrichment values before SQLite binding so reviewed updates can commit atomically.
- Synchronizes version, build, release, and schema metadata.
- Adds behavioral regression coverage for brewed coffee recipes and structured enrichment data.

Implementation slice: FH-1250.25.

# Fizz Health v1.4.10.35

## Corrective implementation release

- Renames the meal workspace to **Meals**.
- Removes What Should I Eat, Eat Next, Chef’s Recommendations, and Waste Risk from Pantry so Pantry is inventory control only.
- Keeps What Should I Eat as a standalone Food Intelligence screen reached from Meals.
- Repairs recipe nutrition aggregation to carry every registered nutrient, including caffeine, into consumed and planned recipe snapshots.
- Recalculates current linked recipe meals when an ingredient is enriched.
- Repairs food enrichment approval feedback with an immediate saving state, sticky success/error feedback, and readable evidence formatting.
- Preserves all-or-nothing import behavior and linked current-day meal recalculation.

Implementation slice: FH-1250.25.
