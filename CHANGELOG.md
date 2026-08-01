## v1.4.15.57 — Inventory Editor Focus Corrective

- Kept all Inventory editor fields mounted and focused during entry.
- Preserved On hand edits while switching package type.
- Retained existing validation and persistence behavior.

## v1.4.15.26 — Menu and Pantry Usability Polish

- Replaced Pantry search navigation with inline filtering.
- Corrected Menu calendar width.
- Improved and reordered Menu category headings.
- Added Meals inventory-state color and tracking indicators.

## 1.4.14.3 — Menu Calendar and Restaurant Organization

- Added live calendar synchronization and midnight rollover refresh.
- Grouped restaurant menus by database category.
- Added immediate restaurant category editing.

## 1.4.14.2B — Production Build Syntax Corrective

- Corrected a missing JSX expression-closing brace in the Restaurant Day switch handler.
- Restored successful production compilation.
- No functional scope changes.

## 1.4.14.2A — Restaurant Day Toggle and Synchronization Corrective

- Restaurant Day now creates and removes the 800 kcal reservation atomically with the saved preference.
- Home and Menu refresh planned meals, projections, calendar state, and totals immediately after the toggle changes.
- Disabling Restaurant Day removes a placeholder reservation but remains blocked by an actual planned or consumed restaurant meal.
- Restaurant Day switches now use definitive fully-left and fully-right resting positions.

# Changelog

## 1.4.13.2 — 2026-07-25

- Made the Menu calendar sticky beneath the standard Nutrition header.
- Replaced capacity summaries with a six-metric 2×3 nutrition grid.
- Reorganized saved meals into restaurant-style Today’s Menu sections.
- Collapsed empty menu sections and corrected the header checkmark artifact.

## 1.4.13.1 — 2026-07-25

### Changed
- Replaced the Menu prototype header with the standard Nutrition header layout.
- Added the right-side completion checkmark while preserving the existing close behavior.

### Removed
- “Meal Planning Prototype.”
- “Plan by date, not time.”
- Explanatory prototype messaging.

### Preserved
- All Menu functionality, navigation, calendar behavior, meal containers, nutrition summary, browsing, database, JSON, and settings behavior.

## 1.4.12.1 — 2026-07-25

### Changed
- Renamed Eat to Nutrition in the primary navigation and landing page.
- Added Eating and Manage cards with equal-size icon-and-label buttons.
- Renamed Meal Planner to Menu at its entry point and header without changing its destination.
- Renamed Chef’s Recommendations to The Chef at its entry point and header without changing its destination.
- Added Shopping to the Manage card while preserving its current destination.
- Moved Log Once from the Meals create menu to the Nutrition landing page while reusing its current exchange workflow.

### Removed
- Nutrition landing-page plus button.
- Upcoming Meals landing card, route, and standalone page component.
- Redundant Recommendations landing card.

## v1.4.15.25 — Food Discontinue and Toggle Controls

- Replaced the Food Detail Ingredient Only checkbox with an iOS-style switch.
- Added a confirmed Discontinued switch directly beneath Ingredient Only.
- Reused the established archival lifecycle to remove discontinued foods from active surfaces while retaining historical records.
- Synchronized linked Pantry records and source-linked Meal definitions with discontinuation and restoration.

## 1.4.15.94 — Health Check-in Polish

- Completed Health metric card borders.
- Replaced inline metric history with a dismissible popover.
- Standardized Health metric editors on X/checkmark header actions.
- Added viewport, keyboard, footer, and safe-area containment for all Health metric editors.
- Audited selected-reading deletion without changing its behavior.
