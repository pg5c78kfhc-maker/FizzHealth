# FH-1250 — Unified Meal Planning & Food Workspace

**Release:** v1.4.10.11, build 14110  
**Implementation status:** Partial — FH-1250.1 delivered; FH remains open

## Implemented scope — FH-1250.1

- Stabilized the existing Meal Planning 2.0 component with guarded optional queries, candidate normalization, safe result defaults, explicit empty state, recoverable error state, and Retry.
- Moved the full Meal Planner from Home to a dedicated Food workspace page.
- Moved the full Chef’s Recommendations experience from Home to a dedicated Food workspace page.
- Added Upcoming Meals to Food for reviewing planned meals and restaurant commitments.
- Expanded the Food hub with Plan a meal, Recommendations, and Upcoming meals destinations while preserving Log food, Pantry, Shopping, and Restaurants.
- Kept Home focused on daily state: nutrition/macros, goal impact, planned meals, and Food Log remain present.
- Replaced the full planning surfaces on Home with a compact Food Plan summary linking to Planner and Recommendations.
- Reused the existing planning engine, recommendation engine, planned-meal records, and restaurant commitments. No duplicate planner or data migration was introduced.
- Added explicit Back controls and bottom-navigation-safe page spacing.

## Behavioral impact

Home is shorter and remains the place to understand today. Food is now the place to decide what to eat and manage future meals. Planner failures no longer throw the full planning surface; users receive a recoverable message and Retry action. Empty inventory produces guidance rather than an exception.

## Presentation impact

- Home: compact Food Plan card instead of full recommendation grid and multi-day planner.
- Food: new primary destinations for Plan a meal, Recommendations, and Upcoming meals.
- Planner and Recommendations: focused pages with visible Back navigation.

## Test proof

- FH-1250 source-contract regression tests cover relocation, Home retention, retry/empty states, and escape paths.
- Full automated test suite, release verification, and Vite production build must pass before packaging.

## Deferred scope — FH-1250 remains open

- Composite parent meal containing multiple foods, recipes, sides, restaurant items, and one-time items.
- Unified search across Food Database, Recipes, Pantry, previous meals, favorites, and restaurants.
- Complete Eat Now versus Schedule workflow for composed meals.
- Edit, move, reschedule, consume, and delete behavior for composite meals.
- JSON exchange ingestion into a meal plan.
- AI/photo, nutrition-label, barcode, and menu nutrition acquisition.
- Full Food workspace completion, including detailed Recipes and Food Database destinations.
- Detailed Pantry, Shopping, Recipe Library, and Food Database redesigns remain governed by their respective FH stories.

## Product-owner acceptance checklist

- [ ] Home still displays macros/nutrition and Today’s Food Log.
- [ ] Full Chef’s Recommendations no longer appears on Home.
- [ ] Full multi-day Meal Planner no longer appears on Home.
- [ ] Home displays a compact Food Plan card with working Planner and Recommendations links.
- [ ] Food shows Plan a meal, Log food, Recommendations, Upcoming meals, Pantry, Shopping, and Restaurants.
- [ ] Meal Planner opens without the prior production error.
- [ ] Planner horizons work and existing recommendations/plans remain visible.
- [ ] Empty/incomplete planner data shows useful guidance instead of a crash.
- [ ] Planner failure displays Retry and does not affect the rest of Fizz Health.
- [ ] Back controls and bottom navigation remain usable.
- [ ] Log Food and Log Once still work.
