# Recommendation Engine & Menu Copy Audit — v1.4.15.103

## Recommendation Engine

The v1.4.15.102 baseline already contains the scoped recommendation-engine enhancements. They were preserved and audited in this release:

- Excludes foods consumed today and foods already proposed today.
- Builds a category-diverse set rather than simply returning identical top-scoring items.
- Uses current stored laboratory results as ranking signals.
- Applies recommendation and consumption rotation penalties.
- Uses frequency rather than permanent prohibition for less-supportive foods.
- Includes lab fit, variety, and rotation context in explanations.

No recommendation-engine regression was intentionally introduced by the Menu copy work.

## Menu Action Architecture

- The Menu header now exposes an ellipsis action menu rather than a single-purpose plus or copy button.
- The menu is intentionally extensible for future actions.
- The first action is **Copy Proposed Meals**.

## Copy Workflow

The workflow supports:

- Entire day.
- Breakfast.
- Lunch.
- Dinner.
- Snacks.
- Selected proposed items.

Destination selection uses a calendar only. There are no “all future dates” or quick-add date shortcuts.

## Calendar Rules

- Multiple future dates can be toggled.
- Past dates are disabled.
- The source date is marked and disabled.
- A selected-date count is displayed.
- A review step lists the destination dates before copying.

## Database Integrity

Copied rows preserve the original planned-meal data supported by the current schema, including nutrition snapshots, servings, source references, notes, meal service, and lock state.

The copy operation deliberately resets:

- Primary key.
- Planned date and local date.
- Created and updated timestamps.
- Consumed timestamp.
- Status to `planned`.

Inventory is not decremented during copy. Exact duplicates already proposed on a destination date are skipped.
