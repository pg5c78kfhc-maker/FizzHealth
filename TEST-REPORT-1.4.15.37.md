# Fizz Health v1.4.15.37 Test Report

## Release

- Version: 1.4.15.37
- Build: 141537
- Deployment: FH-20260729-141537
- Schema: 82
- Title: Inventory Consumption and Shopping Image Corrective

## Implemented verification

### Pantry consumption integrity

- Planned Food → Consumed resolves Pantry by pantry ID, food ID, or exact product name.
- Direct Food logging as Consumed decrements linked Pantry inventory.
- Recipe consumption expands ingredients and decrements every linked Pantry item.
- Meal consumption expands Food and Recipe components and decrements every linked Pantry item.
- Pantry adjustments are recorded per consumed meal in `meal_pantry_adjustments`.
- Deleting a consumed meal restores all recorded Pantry adjustments.
- Undoing deletion reapplies and records the adjustments.
- Existing single-item `pantry_id` / `pantry_delta` behavior remains compatible.

### Shopping images

- Added Refresh Images.
- Attempts direct-image URLs and retailer page metadata (`og:image`, Twitter image, image source) when browser access permits.
- Persists image result, last check time, and failure detail.
- Shopping cards report loaded, not found, blocked, or not checked states.
- Retailer deep links remain functional when image discovery is blocked.

### Shopping retailer sections

- Retailer groups use collapsible `<details>` sections.
- Item counts remain visible when collapsed.

## Automated results

- Focused v1.4.15.37 tests: **7 passed / 0 failed**
- Project integrity: **passed**
- Release metadata verification: **passed**
- Full historical suite: **498 passed / 171 failed**

The historical failures predate this release and remain outside this corrective scope.

## Build status

A production Vite build was not run because the supplied archive did not include `node_modules` or installed dependencies.

## Device validation still required

- Move an apple from Proposed to Consumed and confirm 6 → 5 immediately.
- Consume another apple and confirm 5 → 4.
- Delete the consumed record and confirm inventory restores.
- Test one weight-based Food, one bottle/can item, one Recipe, and one multi-component Meal.
- Use Refresh Images on Amazon and Whole Foods links and confirm the displayed image status accurately reports retailer blocking or a discovered image.
