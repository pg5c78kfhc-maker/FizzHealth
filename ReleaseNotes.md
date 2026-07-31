# Fizz Health v1.4.15.72

Recipe Serving Basis Corrective.

Completed story: FH-1572.1

- Recipes in Menu and Planner now use the saved serving size rather than the full batch as one serving.
- Recipe nutrition is normalized to the saved serving basis before portion multipliers are applied.
- Planned and consumed records store the actual quantity and unit, such as 100 g, while preserving portion multipliers.
- Prepared Recipe inventory is decremented by the actual logged serving quantity.
- All Recipe logging paths share the same serving-basis calculation.

# Fizz Health v1.4.15.71

Recipe, Inventory & Enrichment Corrective.

Completed story: FH-1571.5

- Editable Recipe quantity units, including grams where supported.
- Keyboard-safe scrollable editor shell.
- Prepared Recipe inventory takes precedence over ingredient shortages.
- Simplified packaged inventory entry with serving size in Inventory.
- Replaced obsolete Promote to Meal action with Enrich with AI.

# Fizz Health v1.4.15.69

**Recipe Library, Migration & Editor Recovery**  
Build `141569` · Deployment `FH-20260730-141569` · Issued July 30, 2026

## Delivered

- **FH-1569.1** migrates remaining valid legacy Meal definitions into canonical Recipes while preserving historical log snapshots and active planning references.
- **FH-1569.2** rebuilds the Recipe content picker as a keyboard-safe, full-height, internally scrollable form with fixed header and actions.
- **FH-1569.3** enables direct gram entry when a Food serving definition or common measure resolves to weight.
- **FH-1569.4** displays Recipe availability in Library cards and sorts available items before unavailable items within each category.
- **FH-1569.5** adds Ingredient as a first-class Change Category choice and persists component-only behavior.

Historical Food Log entries remain preserved during deletion and migration.
