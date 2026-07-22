# Fizz Health v1.4.10.40

## Pantry UX Refinement

- Restores **All** as the default unfiltered pantry location and removes **Home** from the browsing-location choices.
- Replaces missing-nutrition text with an aligned database icon and a lighter green planned-data treatment.
- Adds a Pencil action in Pantry Item Details that opens the shared Food Enrichment workflow with pantry context pre-populated.
- Moves pantry search into a dedicated full-screen experience so inventory filters remain focused on browsing.
- Makes Restock, Shopping, and Out of Stock results tappable entry points to Pantry Item Details.

Implementation slices: FH-1, FH-2, FH-3, FH-4, FH-5.

# Fizz Health v1.4.10.39

## Pantry finishing pass

- Missing-data pantry cards now use a database icon without text and a lighter incomplete-record treatment.
- Pantry Item Details now opens the existing AI enrichment workflow with the linked food record and known pantry context.
- Pantry search now has a dedicated screen.
- In Stock, Restock, Out of Stock, Shopping, and Attention results are actionable and open Pantry Item Details.

# Fizz Health v1.4.10.38

## Pantry Health Calculation Repair

- Fixes null `remaining_servings` values being interpreted as numeric zero and excluding valid in-stock pantry items from Pantry Health.
- Calculates Pantry Health from the same location-filtered, in-stock inventory displayed on the Pantry page.
- Produces a numeric score whenever at least one in-stock item exists.
- Adds data-coverage diagnostics for missing freshness and nutrition instead of falsely reporting no inventory.
- Adds behavioral tests for positive quantities with null remaining-servings data and unknown quantities explicitly marked on hand.

Implementation slice: FH-1250.25.

# Fizz Health v1.4.10.37

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
