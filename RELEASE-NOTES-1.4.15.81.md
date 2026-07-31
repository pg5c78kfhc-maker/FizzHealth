# Fizz Health v1.4.15.81

## Focused corrective scope

### Recipe availability and Pantry deduction
- Fixed the live recipe-availability path so food-specific units use the Food record's serving definition.
- A recipe requirement of `1 onion` now resolves through Red Onion's `150 g` serving definition.
- The same food-aware calculation is used when checking availability and deducting Pantry inventory.
- Preparing a recipe that consumes one onion now removes exactly one onion from inventory.

### Nutrition product enrichment regression
- Fixed a render-time error in the existing-food enrichment request.
- The enrichment request now carries the selected Food record's barcode instead of referencing an undefined value.
- Opening **Enrich with AI** from the Nutrition workflow no longer collapses to a black screen for this error.
- The existing enrichment interface and behavior were preserved; no redesign was introduced.

## Release constraints honored
- No unrelated UI, wording, schema, or layout changes.
- No duplicate application or source-tree implementation was introduced.
